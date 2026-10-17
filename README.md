# Alaminn.info

Alaminn.info is Al Aminn's public authority platform and private operations Command Center. It combines the personal site, Higher Study and English Learning resource areas, first-party CRM workflows, governed AI intake, transactional booking, and audited administration in one Next.js application.

## Authoritative architecture

| Layer | Current implementation |
|---|---|
| Runtime | Node.js 22+, npm 10.9.8 |
| Web application | Next.js 16.4.2 App Router, React 19, TypeScript, Tailwind CSS |
| Data | Prisma 6.12 query-compiler client with libSQL adapter; SQLite is the only authoritative provider |
| Authentication | Signed HTTP-only sessions, database-backed RBAC, optional encrypted TOTP 2FA and one-time recovery codes |
| Email | SMTP or Resend adapters with durable `EmailDelivery` states and authenticated retry processing |
| WhatsApp | Official Meta Cloud API boundary only; deterministic verified-rules web assistant remains usable without provider credentials |
| Deployment | Next.js standalone output, versioned SSH releases or Docker; live infrastructure is not asserted without deployment evidence |

`package-lock.json` is authoritative. The retired Bun lock and unused in-memory mini-services were removed so the production boundary is one application and one durable database.

## Local setup

```bash
npm ci
cp .env.example .env.local
# Set a unique AUTH_SECRET (at least 32 bytes) and ADMIN_BOOTSTRAP_PASSWORD.
DATABASE_URL=file:./db/custom.db npm run db:migrate:deploy
DATABASE_URL=file:./db/custom.db npm run db:seed
npm run dev
```

Open `http://localhost:3000`. Never commit `.env*`, database files, credentials, keys, provider tokens, backups, or production exports.

## Quality gates

```bash
npm run typecheck
npm run lint
npm run test:unit
npm run test:integration
npm run test:api
npm run test:auth
SECURITY_TEST_BASE=http://127.0.0.1:3000 npm run test:security
BOOKING_TEST_BASE=http://127.0.0.1:3000 npm run test:booking
npm test
npm run build
npm audit --omit=dev
```

The live suites require an application server and an ephemeral or preview SQLite database. They must never target production data.

## Database safety

- `npm run db:migrate:deploy` applies only checked-in additive SQLite migrations.
- The runner refuses an unknown partial schema and performs integrity and foreign-key checks.
- `npm run db:reset` is intentionally disabled.
- Back up and restore-test the real database before a production migration.
- MySQL/MariaDB migration drafts are forensic history only and must not be substituted for the SQLite schema.

See `prisma/migrations/README.md` for the migration and rollback policy.

## Truthful integration status

A rendered control or configured environment variable is not evidence of an external exchange. Gmail, Google Calendar, WhatsApp Business, Facebook, Instagram, LinkedIn, generative AI, and delivery providers remain **BLOCKED** or **NOT VERIFIED** until official credentials, required app permissions, and provider-side acceptance evidence are available. Sensitive AI-assisted communication always requires human approval.

The public assistant identifies itself as **Al-Amin's AI Assistant**. With no approved generative provider it uses deterministic, database-backed verified rules and reports `usedLlm: false`; it does not impersonate Al Aminn or claim unavailable capabilities.

## Current evidence

- `FINAL_PRODUCTION_AUDIT.md` — reproduced checks, exact status matrix, blockers, rollback, and handoff.
- `ROUTE_INVENTORY.md` — every public, private, API, and metadata route.
- `REFERENCE_SOURCE_AUDIT.md` — deduplicated third-party repository/profile/site review and licensing disposition.
- `docs/security-report.md` — latest 22-test runtime security report.

Older audit and deployment documents retained in repository history are not acceptance evidence; the three files above and current source are authoritative for this release.

## Production release

The manual GitHub deployment workflow requires a successful CI check, protected `production` environment approval, pinned SSH host keys, server-side secrets, a verified backup, additive migration status, a versioned release, health checks, and rollback symlink. Docker uses a persistent `/app/db` volume and runs the same non-destructive migration gate before startup.

Production deployment, browser/device behavior on the live domain, provider connectivity, and production database migration are not proven by source or preview tests. Follow the blockers and acceptance steps in `FINAL_PRODUCTION_AUDIT.md` before go-live.

## License

No top-level open-source license is currently granted by this repository. Treat the code and content as all rights reserved unless the owner adds an explicit license. Third-party package licenses remain governed by their own terms.
