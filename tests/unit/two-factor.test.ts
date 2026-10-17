import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { _resetEnv } from "@/lib/env";
import {
  base32Decode,
  base32Encode,
  consumeRecoveryCode,
  decryptTotpSecret,
  encryptTotpSecret,
  generateRecoveryCodes,
  totpCode,
  totpUri,
  verifyTotpCode,
} from "@/lib/two-factor";

const originalSecret = process.env.AUTH_SECRET;

beforeAll(() => {
  process.env.AUTH_SECRET = "unit-test-auth-secret-with-more-than-32-bytes";
  _resetEnv();
});

afterAll(() => {
  if (originalSecret === undefined) delete process.env.AUTH_SECRET;
  else process.env.AUTH_SECRET = originalSecret;
  _resetEnv();
});

describe("TOTP two-factor security", () => {
  it("round-trips base32 without padding", () => {
    const input = Buffer.from("12345678901234567890", "ascii");
    expect(base32Decode(base32Encode(input))).toEqual(input);
  });

  it("matches the RFC 6238 SHA1 vector truncated to six digits", () => {
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(totpCode(secret, 59_000)).toBe("287082");
  });

  it("encrypts the stored secret and decrypts it with the application key", () => {
    const encrypted = encryptTotpSecret("JBSWY3DPEHPK3PXP");
    expect(encrypted).not.toContain("JBSWY3DPEHPK3PXP");
    expect(decryptTotpSecret(encrypted)).toBe("JBSWY3DPEHPK3PXP");
  });

  it("rejects tampered encrypted secrets", () => {
    const parts = encryptTotpSecret("JBSWY3DPEHPK3PXP").split(".");
    parts[2] = `${parts[2][0] === "A" ? "B" : "A"}${parts[2].slice(1)}`;
    expect(() => decryptTotpSecret(parts.join("."))).toThrow();
  });

  it("accepts only the current TOTP window and one adjacent window", () => {
    const encrypted = encryptTotpSecret("JBSWY3DPEHPK3PXP");
    const time = 1_700_000_000_000;
    expect(verifyTotpCode(totpCode("JBSWY3DPEHPK3PXP", time), encrypted, time)).toBe(true);
    expect(verifyTotpCode(totpCode("JBSWY3DPEHPK3PXP", time - 30_000), encrypted, time)).toBe(true);
    expect(verifyTotpCode(totpCode("JBSWY3DPEHPK3PXP", time - 90_000), encrypted, time)).toBe(false);
    expect(verifyTotpCode("not-code", encrypted, time)).toBe(false);
  });

  it("generates hashed one-time recovery codes", () => {
    const recovery = generateRecoveryCodes(4);
    expect(recovery.codes).toHaveLength(4);
    for (const code of recovery.codes) expect(recovery.stored).not.toContain(code);

    const first = consumeRecoveryCode(recovery.codes[0], recovery.stored);
    expect(first.valid).toBe(true);
    expect(consumeRecoveryCode(recovery.codes[0], first.remaining).valid).toBe(false);
    expect(consumeRecoveryCode(recovery.codes[1].toLowerCase(), first.remaining).valid).toBe(true);
  });

  it("does not consume invalid recovery codes", () => {
    const recovery = generateRecoveryCodes(2);
    expect(consumeRecoveryCode("AAAA-BBBB-CCCC-DDDD", recovery.stored)).toEqual({
      valid: false,
      remaining: recovery.stored,
    });
  });

  it("creates a standards-compatible provisioning URI without exposing a password", () => {
    const uri = totpUri("JBSWY3DPEHPK3PXP", "admin@alaminn.info");
    expect(uri).toContain("otpauth://totp/");
    expect(uri).toContain("secret=JBSWY3DPEHPK3PXP");
    expect(uri).toContain("issuer=Alaminn.info");
    expect(uri).not.toContain("password");
  });
});
