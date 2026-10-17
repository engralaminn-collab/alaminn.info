import { NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { fail, ok, writeAudit } from "@/lib/admin-api";
import { db } from "@/lib/db";
import {
  consumeRecoveryCode,
  encryptTotpSecret,
  generateRecoveryCodes,
  generateTotpSecret,
  totpUri,
  verifyTotpCode,
} from "@/lib/two-factor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const guard = await requirePermission(req, "security_settings.update");
  if (guard.denied) return guard.response;

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return fail("Invalid request body.", ["invalid_body"], 400);
  const action = String((body as Record<string, unknown>).action || "");
  const code = String((body as Record<string, unknown>).code || "").trim();
  if (code.length > 128) return fail("Invalid verification code.", ["input_too_long"], 422);

  const user = await db.user.findUnique({
    where: { id: guard.session.userId },
    select: {
      id: true,
      email: true,
      twoFactorEnabled: true,
      twoFactorSecret: true,
      twoFactorPendingSecret: true,
      twoFactorRecoveryCodes: true,
    },
  });
  if (!user) return fail("Account not found.", ["account_not_found"], 404);

  if (action === "setup") {
    if (user.twoFactorEnabled) {
      return fail("Two-factor authentication is already enabled.", ["already_enabled"], 409);
    }
    const secret = generateTotpSecret();
    await db.user.update({
      where: { id: user.id },
      data: { twoFactorPendingSecret: encryptTotpSecret(secret) },
    });
    await writeAudit(guard.session, "auth.two_factor_setup_started", "user", user.id);
    return ok(
      { secret, otpauthUri: totpUri(secret, user.email) },
      "Add the key to an authenticator app, then verify a current six-digit code. The key is shown only during setup.",
    );
  }

  if (action === "verify") {
    if (user.twoFactorEnabled) {
      return fail("Two-factor authentication is already enabled.", ["already_enabled"], 409);
    }
    if (!user.twoFactorPendingSecret) {
      return fail("Start two-factor setup first.", ["setup_required"], 409);
    }
    if (!verifyTotpCode(code, user.twoFactorPendingSecret)) {
      return fail("The authenticator code is invalid or expired.", ["code_invalid"], 422);
    }
    const recovery = generateRecoveryCodes();
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: user.twoFactorPendingSecret,
        twoFactorPendingSecret: null,
        twoFactorRecoveryCodes: recovery.stored,
      },
    });
    await writeAudit(guard.session, "auth.two_factor_enabled", "user", user.id, {
      recoveryCodeCount: recovery.codes.length,
    });
    return ok(
      { enabled: true, recoveryCodes: recovery.codes },
      "Two-factor authentication enabled. Store these one-time recovery codes securely; they will not be shown again.",
    );
  }

  if (action === "disable") {
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return fail("Two-factor authentication is not enabled.", ["not_enabled"], 409);
    }
    const totpValid = verifyTotpCode(code, user.twoFactorSecret);
    const recovery = totpValid
      ? { valid: false, remaining: user.twoFactorRecoveryCodes }
      : consumeRecoveryCode(code, user.twoFactorRecoveryCodes);
    if (!totpValid && !recovery.valid) {
      return fail("The authenticator or recovery code is invalid.", ["code_invalid"], 422);
    }
    await db.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorPendingSecret: null,
        twoFactorRecoveryCodes: null,
      },
    });
    await writeAudit(guard.session, "auth.two_factor_disabled", "user", user.id, {
      verification: totpValid ? "totp" : "recovery_code",
    });
    return ok({ enabled: false }, "Two-factor authentication disabled.");
  }

  if (action === "cancel_setup") {
    await db.user.update({ where: { id: user.id }, data: { twoFactorPendingSecret: null } });
    await writeAudit(guard.session, "auth.two_factor_setup_cancelled", "user", user.id);
    return ok({ enabled: user.twoFactorEnabled }, "Two-factor setup cancelled.");
  }

  return fail("Unsupported two-factor action.", ["action_invalid"], 422);
}
