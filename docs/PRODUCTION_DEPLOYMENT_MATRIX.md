# Alaminn.info — Production Deployment Matrix

**Generated:** 2026-09-30 (machine-verified)
**Working copy:** `/home/z/my-project/alaminn/`
**Repo root:** `/home/z/my-project`

## Repository

| Item | Actual value | Status |
|---|---|---|
| Repository | Local git repo (no GitHub remote configured) | BLOCKED — see Blockers |
| Owner | N/A — `git remote -v` is empty | BLOCKED |
| Branch | `main` | Verified |
| Latest commit | `de9cf5f` | Verified |
| Framework | Next.js 16.1.3 (App Router, standalone output) | Verified |
| Runtime | Bun 1.3.14 (dev) / Node.js >=20 (prod) | Verified |
| Package manager | Bun (primary, bun.lock) — npm also works (package-lock.json present) | Verified |

## Build

| Item | Actual command | Status |
|---|---|---|
| Install | `bun install` (or `npm ci`) | PASS |
| Build | `bun run build` (`next build && cp -r .next/static .next/standalone/.next/ && cp -r public .next/standalone/`) | PASS — 223 routes |
| Start | `node .next/standalone/server.js` | PASS — Ready in 79ms |
| Test | `bun run test` (vitest) | PASS — 234 pass, 7 skip |
| Typecheck | `bun run typecheck` (`tsc --noEmit`) | PASS — 0 errors |
| Lint | `bun run lint` (`eslint .`) | PASS — 0 errors, 0 warnings |

## Database

| Item | Actual value | Status |
|---|---|---|
| Database | SQLite (dev) / MariaDB (production target) | Dev verified; prod BLOCKED on connection |
| ORM | Prisma 6.19.2 | Verified |
| Provider | `sqlite` (dev); production must switch to `mysql` for MariaDB | Verified |
| Migration system | Prisma Migrate | Verified |
| Migration status | 2 migrations present (initial + mysql_initial); pending apply in dev | Verified |
| Schema | 55 models, valid (`prisma validate` PASS) | Verified |
| Seed | `prisma/seed.ts` (idempotent upsert) | Verified |

## Environment

| Variable | Secret? | Required? | Source | Host configuration |
|---|---|---|---|---|
| DATABASE_URL | Yes | Yes | `src/lib/env.ts`, Prisma datasource | Hosting Environment Variables |
| AUTH_SECRET | Yes | Yes (≥32 chars) | `src/lib/env.ts` | Hosting Environment Variables |
| NEXTAUTH_URL | No | Yes | `src/lib/env.ts` | Hosting Environment Variables |
| NEXT_PUBLIC_SITE_URL | No | Yes | `src/lib/env.ts` | Hosting Environment Variables |
| EMAIL_FROM | No | Yes | `src/lib/env.ts` | Hosting Environment Variables |
| EMAIL_REPLY_TO | No | Optional | `src/lib/env.ts` | Hosting Environment Variables |
| SMTP_HOST | Yes | Optional (or RESEND) | `src/lib/email/transport.ts` | Hosting Environment Variables |
| SMTP_PORT | No | Optional | `src/lib/email/transport.ts` | Hosting Environment Variables |
| SMTP_USER | Yes | Optional | `src/lib/email/transport.ts` | Hosting Environment Variables |
| SMTP_PASS | Yes | Optional | `src/lib/email/transport.ts` | Hosting Environment Variables |
| SMTP_SECURE | No | Optional | `src/lib/email/transport.ts` | Hosting Environment Variables |
| RESEND_API_KEY | Yes | Optional (or SMTP) | `src/lib/email/transport.ts` | Hosting Environment Variables |
| CRON_SECRET | Yes | Yes (cron routes) | `src/lib/cron-auth.ts` | Hosting Environment Variables |
| WHATSAPP_NUMBER | No | Yes (display) | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_INTERNATIONAL_NUMBER | No | Yes | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_DISPLAY_NUMBER | No | Yes | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_BUSINESS_NAME | No | Yes | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_WEBHOOK_VERIFY_TOKEN | Yes | Yes (webhook) | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_API_PHONE_NUMBER_ID | Yes | Yes (live WA send) | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_API_TOKEN | Yes | Yes (live WA send) | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_AI_MODE | No | Optional (dev/live) | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_AI_PROVIDER | No | Optional | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| WHATSAPP_AI_MODEL | No | Optional | `src/lib/whatsapp/config.ts` | Hosting Environment Variables |
| HIGHER_STUDY_REFERRAL_SECRET | Yes | Yes (HMAC signing) | `src/lib/higher-study/` | Hosting Environment Variables |
| ENGLISH_LEARNING_REFERRAL_SECRET | Yes | Yes (HMAC signing) | `src/lib/english-learning/` | Hosting Environment Variables |
| ADMIN_BOOTSTRAP_EMAIL | No | Optional (seed) | `prisma/seed.ts` | Hosting Environment Variables |
| ADMIN_BOOTSTRAP_PASSWORD | Yes | Yes (first seed) | `prisma/seed.ts` | Hosting Environment Variables (one-time) |
| LOG_LEVEL | No | Optional | `src/lib/logger.ts` | Hosting Environment Variables |
| BACKUP_RETENTION_COUNT | No | Optional | `scripts/backup-db.ts` | Hosting Environment Variables |
| AUDIT_WORKER_DATABASE_URL | Yes | Optional (mini-service) | `mini-services/audit-worker/` | Hosting Environment Variables |

## Authentication

| Component | Location | Status |
|---|---|---|
| Login | `src/app/api/v1/auth/login/route.ts` (POST) | Verified — 200 on success |
| Logout | `src/app/api/v1/auth/logout/route.ts` (POST) | Verified |
| Session | `src/lib/auth.ts` — HMAC-SHA256 session cookies | Verified — Secure+HttpOnly+SameSite=Lax |
| RBAC | `src/lib/rbac.ts` — 11 roles, 60+ permissions | Verified — anon → 401 on all admin routes |
| Admin | `src/app/admin/*` (46 pages, all RBAC-guarded) | Verified |
| Password reset | `src/app/api/v1/auth/reset-password/route.ts` | Verified |
| Password hashing | scrypt + `timingSafeEqual` + per-IP lockout | Verified |
| CSRF | SameSite=Lax cookie + Origin/Referer check on POST | Verified |

## External Services

| Service | Credential required | Production configuration | Status |
|---|---|---|---|
| Email (SMTP) | SMTP_HOST/USER/PASS or RESEND_API_KEY | Hosting env vars | NOT CONFIGURED (env warning at startup) |
| WhatsApp Cloud API | WHATSAPP_API_PHONE_NUMBER_ID + WHATSAPP_API_TOKEN | Hosting env vars | NOT CONFIGURED (dev mode) |
| AI (z-ai-web-dev-sdk) | ZAI_API_KEY (in SDK) | Hosting env vars | NOT VERIFIED LIVE |
| ALO Education referral | None (HMAC-signed tokens only) | Internal | Verified (no external creds needed) |

## Deployment

| Component | Required configuration | Status |
|---|---|---|
| Git repository | GitHub repo + remote configured | BLOCKED — no remote |
| Production branch | `main` (when remote configured) | Verified (local) |
| Node.js | >=20 (engines field) | Verified |
| Install | `bun install` or `npm ci` | PASS |
| Build | `bun run build` | PASS |
| Start | `node .next/standalone/server.js` | PASS |
| Environment variables | See Environment table above | BLOCKED — requires hosting provider |
| Database (MariaDB) | Production `DATABASE_URL=mysql://...` + Prisma provider switch | BLOCKED — requires hosting DB creds |
| Domain | `https://alaminn.info` | LIVE (DNS resolves, Cloudflare in front) |
| HTTPS | Cloudflare edge + origin cert | LIVE |

## Blockers

| Severity | File/Area | Problem | Fix | External dependency |
|---|---|---|---|---|
| P0 | Git remote | No GitHub remote configured (`git remote -v` empty) | `git remote add origin <URL>` + `git push -u origin main` | Owner must create GitHub repo |
| P1 | Prisma provider | Schema is `sqlite`; production needs `mysql` for MariaDB | Create `prisma/schema.mysql.prisma` OR set `provider` via env-driven approach | None (repo-side fix) |
| P1 | Migration history | 2 migrations unapplied in current dev DB | `prisma migrate deploy` against production MariaDB | Requires prod DB creds |
| P2 | Email transport | SMTP/RESEND not configured | Set SMTP_* or RESEND_API_KEY in hosting env | Owner must provide SMTP creds |
| P2 | WhatsApp Cloud API | Dev mode only | Set WHATSAPP_API_PHONE_NUMBER_ID + WHATSAPP_API_TOKEN | Owner must provide Meta Cloud API creds |
| P2 | Admin bootstrap password | `ADMIN_BOOTSTRAP_PASSWORD` env required for seed | Set in hosting env, then `bun run db:seed` once | Owner action |
| P3 | `.gitignore` location | Lives at repo root `/home/z/my-project/.gitignore`, not `alaminn/.gitignore` | Owner decision — keep at root or move to `alaminn/` | None |

## Security

| Item | Status |
|---|---|
| Secrets committed to git | CLEAN — only `.env.example` tracked; no real secrets in `git ls-files` |
| Authentication bypass | NONE FOUND — 22/22 security tests pass |
| Hardcoded credentials | NONE — `prisma/seed.ts` requires env var (no hardcoded fallback) |
| Production debug | NONE — `NODE_ENV=production` enforced via env.ts validation |
| CORS | Same-origin only (no cross-origin fetch from browser) |
| CSP | IMPLEMENTED in `src/proxy.ts` (verified present on every response) |
| HSTS | IMPLEMENTED (production only) |
| Rate limiting | Per-route in-memory (rate-limit tests pass) |
