# Alaminn.info — Environment Variable Matrix

**Source:** Machine-scanned from `src/`, `scripts/`, `mini-services/`, `prisma/` (no values exposed).

| Variable | File(s) | Purpose | Secret? | Required? | Production source | Host configuration required? | Status |
|---|---|---|---|---|---|---|---|
| `NODE_ENV` | `src/lib/env.ts` | Runtime env (production/development) | No | Yes | Hosting env | Yes | Set to `production` |
| `DATABASE_URL` | `prisma/schema.prisma`, `src/lib/db.ts` | DB connection | Yes | Yes | Hosting env | Yes | Set to production MariaDB URL |
| `AUTH_SECRET` | `src/lib/auth.ts`, `src/lib/env.ts` | HMAC session signing | Yes | Yes (≥32 chars) | Hosting env | Yes | `openssl rand -hex 32` |
| `NEXTAUTH_URL` | `src/lib/env.ts` | Canonical app URL | No | Yes | Hosting env | Yes | `https://alaminn.info` |
| `NEXT_PUBLIC_SITE_URL` | `src/lib/env.ts` | Public site URL (client) | No | Yes | Hosting env | Yes | `https://alaminn.info` |
| `EMAIL_FROM` | `src/lib/email/transport.ts` | Default From address | No | Yes | Hosting env | Yes | `noreply@alaminn.info` |
| `EMAIL_REPLY_TO` | `src/lib/email/transport.ts` | Reply-To address | No | Optional | Hosting env | Yes | `hello@alaminn.info` |
| `SMTP_HOST` | `src/lib/email/transport.ts` | SMTP server | Yes | Yes (or RESEND) | Hosting env | Yes | Your SMTP host |
| `SMTP_PORT` | `src/lib/email/transport.ts` | SMTP port | No | Yes (or RESEND) | Hosting env | Yes | 587 / 465 |
| `SMTP_USER` | `src/lib/email/transport.ts` | SMTP username | Yes | Yes (or RESEND) | Hosting env | Yes | Your SMTP user |
| `SMTP_PASS` | `src/lib/email/transport.ts` | SMTP password | Yes | Yes (or RESEND) | Hosting env | Yes | Your SMTP password |
| `SMTP_SECURE` | `src/lib/email/transport.ts` | TLS toggle | No | Optional | Hosting env | Yes | `true` for port 465 |
| `RESEND_API_KEY` | `src/lib/email/transport.ts` | Resend API key (alternative) | Yes | Optional | Hosting env | Yes | Resend dashboard |
| `CRON_SECRET` | `src/lib/cron-auth.ts` | Cron route auth | Yes | Yes | Hosting env | Yes | `openssl rand -hex 32` |
| `WHATSAPP_NUMBER` | `src/lib/whatsapp/config.ts` | Local WA number | No | Yes | Hosting env | Yes | `01716609554` |
| `WHATSAPP_INTERNATIONAL_NUMBER` | `src/lib/whatsapp/config.ts` | Intl WA number | No | Yes | Hosting env | Yes | `8801716609554` |
| `WHATSAPP_DISPLAY_NUMBER` | `src/lib/whatsapp/config.ts` | Display format | No | Yes | Hosting env | Yes | `01716 609 554` |
| `WHATSAPP_BUSINESS_NAME` | `src/lib/whatsapp/config.ts` | Business name | No | Yes | Hosting env | Yes | `Al Aminn` |
| `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | `src/lib/whatsapp/config.ts` | Webhook verify | Yes | Yes | Hosting env | Yes | Random string |
| `WHATSAPP_API_PHONE_NUMBER_ID` | `src/lib/whatsapp/config.ts` | Meta Cloud API | Yes | Yes (live WA) | Hosting env | Yes | Meta Business |
| `WHATSAPP_API_TOKEN` | `src/lib/whatsapp/config.ts` | Meta Cloud API token | Yes | Yes (live WA) | Hosting env | Yes | Meta Business |
| `WHATSAPP_AI_MODE` | `src/lib/whatsapp/config.ts` | AI mode | No | Optional | Hosting env | No | `dev` or `live` |
| `WHATSAPP_AI_PROVIDER` | `src/lib/whatsapp/config.ts` | AI provider | No | Optional | Hosting env | No | `zai` |
| `WHATSAPP_AI_MODEL` | `src/lib/whatsapp/config.ts` | AI model | No | Optional | Hosting env | No | `glm-4.6` |
| `HIGHER_STUDY_REFERRAL_SECRET` | `src/lib/higher-study/` | HMAC signing | Yes | Yes | Hosting env | Yes | `openssl rand -hex 32` |
| `ENGLISH_LEARNING_REFERRAL_SECRET` | `src/lib/english-learning/` | HMAC signing | Yes | Yes | Hosting env | Yes | `openssl rand -hex 32` |
| `ADMIN_BOOTSTRAP_EMAIL` | `prisma/seed.ts` | Seed admin email | No | Optional | Hosting env | No | `admin@alaminn.info` |
| `ADMIN_BOOTSTRAP_PASSWORD` | `prisma/seed.ts` | Seed admin password | Yes | Yes (one-time) | Hosting env | Yes (one-time) | Strong password ≥12 chars |
| `LOG_LEVEL` | `src/lib/logger.ts` | Log verbosity | No | Optional | Hosting env | No | `info` |
| `BACKUP_RETENTION_COUNT` | `scripts/backup-db.ts` | Backup retention | No | Optional | Hosting env | No | `14` |
| `AUDIT_WORKER_DATABASE_URL` | `mini-services/audit-worker/` | Audit worker DB | Yes | Optional | Hosting env | Yes | Same as DATABASE_URL |
