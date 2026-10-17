-- Add optional password-reset fields required by the authoritative SQLite schema.
-- This migration is additive and does not modify existing authentication data.
ALTER TABLE "User" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "User" ADD COLUMN "passwordResetExpiresAt" DATETIME;
CREATE INDEX "User_passwordResetToken_idx" ON "User"("passwordResetToken");
