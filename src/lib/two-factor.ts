import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { env } from "@/lib/env";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;

function encryptionKey(): Buffer {
  return createHash("sha256")
    .update(`alaminn.info:two-factor:v1:${env().twoFactorEncryptionKey}`)
    .digest();
}

export function base32Encode(input: Buffer): string {
  let bits = "";
  for (const byte of input) bits += byte.toString(2).padStart(8, "0");
  let output = "";
  for (let index = 0; index < bits.length; index += 5) {
    output += BASE32[Number.parseInt(bits.slice(index, index + 5).padEnd(5, "0"), 2)];
  }
  return output;
}

export function base32Decode(value: string): Buffer {
  const normalized = value.toUpperCase().replace(/=+$/g, "").replace(/[^A-Z2-7]/g, "");
  let bits = "";
  for (const character of normalized) {
    const index = BASE32.indexOf(character);
    if (index < 0) throw new Error("Invalid base32 secret.");
    bits += index.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function encryptTotpSecret(secret: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptTotpSecret(value: string): string {
  const [version, ivValue, tagValue, ciphertextValue] = value.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) {
    throw new Error("Invalid encrypted two-factor secret.");
  }
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextValue, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

export function totpCode(secret: string, timeMs = Date.now()): string {
  const counter = Math.floor(timeMs / 1000 / TOTP_STEP_SECONDS);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** TOTP_DIGITS).padStart(TOTP_DIGITS, "0");
}

export function verifyTotpCode(code: string, encryptedSecret: string, timeMs = Date.now()): boolean {
  const normalized = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(normalized)) return false;
  let secret: string;
  try {
    secret = decryptTotpSecret(encryptedSecret);
  } catch {
    return false;
  }
  for (const offset of [-1, 0, 1]) {
    const expected = totpCode(secret, timeMs + offset * TOTP_STEP_SECONDS * 1000);
    if (timingSafeEqual(Buffer.from(normalized), Buffer.from(expected))) return true;
  }
  return false;
}

export function totpUri(secret: string, email: string): string {
  const issuer = "Alaminn.info";
  const label = `${issuer}:${email}`;
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: "SHA1",
    digits: String(TOTP_DIGITS),
    period: String(TOTP_STEP_SECONDS),
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

function normalizeRecoveryCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z2-7]/g, "");
}

function recoveryHash(code: string): string {
  return createHmac("sha256", encryptionKey()).update(normalizeRecoveryCode(code)).digest("hex");
}

export function generateRecoveryCodes(count = 8): { codes: string[]; stored: string } {
  const codes = Array.from({ length: count }, () => {
    const raw = base32Encode(randomBytes(10)).slice(0, 16);
    return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}`;
  });
  return { codes, stored: JSON.stringify(codes.map(recoveryHash)) };
}

export function consumeRecoveryCode(
  code: string,
  stored: string | null | undefined,
): { valid: boolean; remaining: string | null } {
  const normalized = normalizeRecoveryCode(code);
  if (normalized.length !== 16 || !stored) return { valid: false, remaining: stored || null };
  let hashes: string[];
  try {
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      return { valid: false, remaining: stored };
    }
    hashes = parsed;
  } catch {
    return { valid: false, remaining: stored };
  }
  const candidate = recoveryHash(normalized);
  const match = hashes.findIndex((hash) => {
    const left = Buffer.from(hash, "hex");
    const right = Buffer.from(candidate, "hex");
    return left.length === right.length && timingSafeEqual(left, right);
  });
  if (match < 0) return { valid: false, remaining: stored };
  hashes.splice(match, 1);
  return { valid: true, remaining: JSON.stringify(hashes) };
}
