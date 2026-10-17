-- Optional TOTP two-factor authentication. Secrets are encrypted by the
-- application before persistence; recovery codes are stored as keyed hashes.
ALTER TABLE "User" ADD COLUMN "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "twoFactorSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "twoFactorPendingSecret" TEXT;
ALTER TABLE "User" ADD COLUMN "twoFactorRecoveryCodes" TEXT;
