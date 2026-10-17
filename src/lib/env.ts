/**
 * Environment configuration — validated at startup.
 * ----------------------------------------------
 * Centralized, typed access to all environment variables. In production,
 * required secrets MUST be present or the app refuses to start. In
 * development, missing secrets fall back to safe dev values with a clear
 * console warning so local work isn't blocked.
 *
 * SECURITY: Never access `process.env` directly outside this file.
 * Import from here so every access is validated and typed.
 */

export type AppEnv = {
  /** Node environment — "development" | "production" | "test" */
  nodeEnv: string;
  isProd: boolean;
  isDev: boolean;
  /** Public site URL (no trailing slash) — used for emails, OG tags, sitemap */
  siteUrl: string;
  /** SQLite database file path */
  databaseUrl: string;
  /** HMAC secret for signing session cookies (>= 32 bytes in production) */
  authSecret: string;
  /** Whether AUTH_SECRET was explicitly supplied (not the development fallback) */
  authSecretConfigured: boolean;
  /** Encryption key for TOTP secrets; falls back to AUTH_SECRET for compatibility */
  twoFactorEncryptionKey: string;
  /** Shared secret for scheduler-only cron endpoints */
  cronSecret: string | null;
  /** SMTP host (e.g. smtp.gmail.com) — leave empty to use dev console transport */
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  /** Default From: address for outgoing email */
  emailFrom: string;
  /** Reply-To address for outgoing email */
  emailReplyTo: string;
  /** Resend API key (alternative to SMTP) — leave empty to use SMTP */
  resendApiKey: string | null;
  /** True when email sending is configured (SMTP or Resend) */
  emailConfigured: boolean;
  /** HMAC secrets for anonymous referral/session identifiers */
  higherStudyReferralSecret: string;
  englishLearningReferralSecret: string;
  // ─── WhatsApp AI Agent ─────────────────────────────────────────────
  /** Official WhatsApp number in local format (e.g. "01716609554") */
  whatsappNumber: string;
  /** International format without "+" (e.g. "8801716609554") — used in wa.me URLs */
  whatsappInternationalNumber: string;
  /** Display format (e.g. "01716 609 554") — used in UI text */
  whatsappDisplayNumber: string;
  /** Business name shown to WhatsApp users */
  whatsappBusinessName: string;
  /** Webhook verify token for Meta Cloud API (echoes back on GET verification) */
  whatsappWebhookVerifyToken: string | null;
  /** Meta app secret used to verify X-Hub-Signature-256 on webhook POSTs */
  whatsappAppSecret: string | null;
  /** Meta Cloud API Phone Number ID — blank = no outbound sends */
  whatsappApiPhoneNumberId: string | null;
  /** Meta Cloud API access token — blank = no outbound sends */
  whatsappApiToken: string | null;
  /** True when WhatsApp Cloud API is fully configured for outbound sending */
  whatsappApiConfigured: boolean;
  /** AI mode: "ACTIVE" | "HUMAN_ONLY" | "APPROVAL_REQUIRED" | "PAUSED" */
  whatsappAiMode: "ACTIVE" | "HUMAN_ONLY" | "APPROVAL_REQUIRED" | "PAUSED";
};

const DEV_SITE_URL = "http://localhost:3000";
const DEV_FALLBACK_SECRET =
  "dev-fallback-secret-please-set-AUTH_SECRET-to-a-32+-byte-random-string";

function parsePort(v: string | undefined, def: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 && n < 65536 ? n : def;
}

function buildEnv(): AppEnv {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProd = nodeEnv === "production";
  const isDev = nodeEnv === "development";

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || DEV_SITE_URL).replace(/\/$/, "");

  const databaseUrl = process.env.DATABASE_URL || "file:./dev.db";
  if (!databaseUrl.startsWith("file:")) {
    throw new Error(
      "[env] FATAL: DATABASE_URL must use file: because the authoritative Prisma schema is SQLite. " +
        "A mysql:// production value is incompatible; migrate the complete schema and data under a reviewed runbook before changing providers.",
    );
  }
  const cronSecret = process.env.CRON_SECRET || null;

  // AUTH_SECRET — required in production, dev-fallback in development
  const authSecret = process.env.AUTH_SECRET || "";
  if (!authSecret) {
    if (isProd) {
      throw new Error(
        "[env] FATAL: AUTH_SECRET is missing in production. " +
          "Generate one with `openssl rand -hex 32` and set it in your environment."
      );
    }
    console.warn(
      "[env] WARNING: AUTH_SECRET not set. Using insecure dev fallback. DO NOT use in production."
    );
  }
  if (authSecret && authSecret.length < 32 && isProd) {
    throw new Error(
      "[env] FATAL: AUTH_SECRET must be at least 32 bytes in production."
    );
  }
  const twoFactorEncryptionKey = process.env.TWO_FACTOR_ENCRYPTION_KEY || authSecret || DEV_FALLBACK_SECRET;
  if (isProd && twoFactorEncryptionKey.length < 32) {
    throw new Error("[env] FATAL: TWO_FACTOR_ENCRYPTION_KEY must be at least 32 bytes when set.");
  }

  // SMTP / Resend — at least one must be configured in production for emails
  const smtpHost = process.env.SMTP_HOST || null;
  const smtpPort = parsePort(process.env.SMTP_PORT, 587);
  const smtpUser = process.env.SMTP_USER || null;
  const smtpPass = process.env.SMTP_PASS || null;
  const resendApiKey = process.env.RESEND_API_KEY || null;

  const emailFrom =
    process.env.EMAIL_FROM || (isProd ? "" : "Al Aminn <hello@alaminn.info>");
  const emailReplyTo =
    process.env.EMAIL_REPLY_TO || emailFrom;

  const smtpConfigured = !!(smtpHost && smtpPort && smtpUser && smtpPass);
  const emailConfigured = smtpConfigured || !!resendApiKey;

  if (isProd && !emailConfigured) {
    console.error(
      "[env] WARNING: No email transport configured (SMTP or RESEND_API_KEY). " +
        "Emails will not be sent in production. Set SMTP_* or RESEND_API_KEY."
    );
  }

  if (isProd && !emailFrom) {
    throw new Error(
      "[env] FATAL: EMAIL_FROM is missing in production."
    );
  }

  const higherStudyReferralSecret = process.env.HIGHER_STUDY_REFERRAL_SECRET || "";
  const englishLearningReferralSecret = process.env.ENGLISH_LEARNING_REFERRAL_SECRET || "";
  if (isProd && (higherStudyReferralSecret.length < 32 || englishLearningReferralSecret.length < 32)) {
    throw new Error(
      "[env] FATAL: HIGHER_STUDY_REFERRAL_SECRET and ENGLISH_LEARNING_REFERRAL_SECRET must each be at least 32 bytes in production."
    );
  }

  // ─── WhatsApp AI Agent ────────────────────────────────────────────────
  // OFFICIAL WHATSAPP NUMBER: 01716609554 (Bangladesh)
  // International format: 8801716609554 (used in wa.me deep links)
  // These can be overridden via env, but the defaults are the official numbers.
  const DEFAULT_WHATSAPP_NUMBER = "01716609554";
  const DEFAULT_WHATSAPP_INTL = "8801716609554";
  const DEFAULT_WHATSAPP_DISPLAY = "01716 609 554";

  const whatsappNumber = process.env.WHATSAPP_NUMBER || DEFAULT_WHATSAPP_NUMBER;
  const whatsappInternationalNumber =
    process.env.WHATSAPP_INTERNATIONAL_NUMBER || DEFAULT_WHATSAPP_INTL;
  const whatsappDisplayNumber =
    process.env.WHATSAPP_DISPLAY_NUMBER || DEFAULT_WHATSAPP_DISPLAY;
  const whatsappBusinessName =
    process.env.WHATSAPP_BUSINESS_NAME || "Al Aminn Info";

  const whatsappWebhookVerifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || null;
  const whatsappAppSecret = process.env.WHATSAPP_APP_SECRET || null;
  const whatsappApiPhoneNumberId =
    process.env.WHATSAPP_API_PHONE_NUMBER_ID || null;
  const whatsappApiToken = process.env.WHATSAPP_API_TOKEN || null;
  const whatsappApiConfigured = !!(whatsappApiPhoneNumberId && whatsappApiToken);

  // Safe default: an omitted or unrecognized mode never enables autonomous
  // sending. ACTIVE must be selected explicitly after provider verification.
  const rawAiMode = (process.env.WHATSAPP_AI_MODE || "APPROVAL_REQUIRED").toUpperCase();
  const whatsappAiMode: AppEnv["whatsappAiMode"] =
    rawAiMode === "ACTIVE" ||
    rawAiMode === "HUMAN_ONLY" ||
    rawAiMode === "APPROVAL_REQUIRED" ||
    rawAiMode === "PAUSED"
      ? rawAiMode
      : "APPROVAL_REQUIRED";

  if (isProd && (!whatsappApiConfigured || !whatsappAppSecret || !whatsappWebhookVerifyToken)) {
    console.warn(
      "[env] WARNING: WhatsApp Cloud API is incomplete. Outbound needs WHATSAPP_API_PHONE_NUMBER_ID + WHATSAPP_API_TOKEN; " +
        "webhooks also require WHATSAPP_APP_SECRET + WHATSAPP_WEBHOOK_VERIFY_TOKEN. No unverified webhook payload will be processed."
    );
  }

  return {
    nodeEnv,
    isProd,
    isDev,
    siteUrl,
    databaseUrl,
    authSecret: authSecret || DEV_FALLBACK_SECRET,
    authSecretConfigured: Boolean(authSecret && authSecret.length >= 32),
    twoFactorEncryptionKey,
    cronSecret,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    emailFrom,
    emailReplyTo,
    resendApiKey,
    emailConfigured,
    higherStudyReferralSecret: higherStudyReferralSecret || "alaminn-hs-development-only-referral-secret",
    englishLearningReferralSecret: englishLearningReferralSecret || "alaminn-el-development-only-referral-secret",
    whatsappNumber,
    whatsappInternationalNumber,
    whatsappDisplayNumber,
    whatsappBusinessName,
    whatsappWebhookVerifyToken,
    whatsappAppSecret,
    whatsappApiPhoneNumberId,
    whatsappApiToken,
    whatsappApiConfigured,
    whatsappAiMode,
  };
}

let _env: AppEnv | null = null;

/**
 * Get the validated environment. Throws on first access if production
 * secrets are missing. Cached after first call.
 */
export function env(): AppEnv {
  if (!_env) _env = buildEnv();
  return _env;
}

/**
 * Force re-evaluation (useful for tests).
 * @internal
 */
export function _resetEnv() {
  _env = null;
}
