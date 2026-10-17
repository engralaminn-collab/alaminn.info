# Final Production Audit and Handoff

**Project:** `engralaminn-collab/alaminn.info`
**Audit date:** 2026-10-18 (Asia/Dhaka)
**Audited branch:** `arena/d6c9102d-alaminn-info`
**Production target branch:** `upload-local-project` through reviewed PR #5
**Authority:** checked-in source, reproduced commands, preview SQLite evidence, and official-provider evidence only

## 1. Decision

### Source release candidate: PASS

The checked-in application installs reproducibly with npm 10, generates its portable Prisma client, applies non-destructive SQLite migrations, typechecks, lints without warnings, passes the reproduced unit/integration/API/auth/security/booking suites, builds a Next.js standalone production artifact, starts, rejects anonymous admin access, and completes authenticated preview workflows.

### Production go-live: BLOCKED

This audit does **not** declare the live site production-complete. There is no authorized production host/session, production database, DNS/TLS console, restore rehearsal, real browser/device session on the live domain, or official provider credential set in this environment. Email delivery, Google Calendar, Gmail, WhatsApp Cloud API exchange, Facebook, Instagram, LinkedIn, generative AI, CI execution, deployment, and live observability cannot be marked PASS without those acceptance tests.

### Overall status: PARTIAL

All work possible from the authoritative repository and local preview is implemented and reproduced. Remaining work is external acceptance or provider implementation that requires owner credentials/permissions. Those items are enumerated in Section 12 and are not simulated.

## 2. Status definitions

- **PASS** — the stated test was executed successfully in this audit.
- **PARTIAL** — a real implementation exists and local evidence passed, but a required external or browser acceptance step remains.
- **BLOCKED** — required credentials, permissions, infrastructure, or network access were unavailable.
- **FAIL** — an executed acceptance test failed and was not corrected.
- **NOT VERIFIED** — no adequate acceptance test was executed; existence or HTTP 200 is not substituted for proof.

## 3. Authoritative architecture

| Area | Audited result | Evidence/status |
|---|---|---|
| Runtime | Node.js 22+, npm 10.9.8 | `package.json`, `package-lock.json`, CI and Docker definitions; PASS locally |
| Application | Next.js 16.4.2 App Router, React 19, TypeScript | Production build PASS |
| Package manager | npm only | `packageManager: npm@10.9.8`; stale root Bun lock removed |
| Data provider | SQLite only | Prisma 6.12 query-compiler client + libSQL adapter; provider mismatch fails closed |
| Deployment artifact | Next.js standalone | Build PASS; live deployment NOT VERIFIED |
| Authentication | Signed HTTP-only session cookie, database revalidation, 11-role RBAC | Unit/runtime security PASS |
| Optional 2FA | TOTP, AES-256-GCM encrypted secret, hashed one-time recovery codes | Unit and full enable/login/disable preview flow PASS |
| Email | SMTP or Resend adapter plus durable `EmailDelivery` queue | Persistence/retry behavior PASS; provider delivery BLOCKED |
| AI assistant | Deterministic, database-backed verified rules | Runtime PASS; no generative provider call exists in this release |
| External channels | Official APIs/OAuth only | Honest status views; uncredentialed providers BLOCKED |
| License | No top-level project license found | Treat repository code/content as all rights reserved until owner chooses a license |

The unused in-memory/Bun mini-service mesh and unreferenced generative SDK were removed. The production boundary is one application and one durable database. Scheduler routes now inspect owned database/provider state instead of pinging nonexistent sidecars.

## 4. Route and surface inventory

`ROUTE_INVENTORY.md` is the exhaustive source inventory:

- **61** admin pages
- **73** non-admin/public pages
- **174** API route handlers
- **5** metadata/system routes
- **134** total page routes

Build output generated 238 static/SSG route instances and compiled all dynamic routes. Every `/admin/*` page source is named and classified. Anonymous runtime checks returned:

| Request | Observed result |
|---|---:|
| `/admin` | 307 to `/admin/login?next=%2Fadmin` |
| `/admin/security` | 307 to login |
| `/admin/login` | 200 public auth page |
| `/api/v1/admin/dashboard` | 401 |
| `/api/v1/admin/email-operations` | 401 |

An authenticated OWNER preview session returned 200 for the Command Center, Email Operations, dashboard API, and email-operations API; logout invalidated access and `/admin` again redirected to login.

## 5. Public experience and navigation

| Acceptance area | Status | Reproduced evidence |
|---|---|---|
| Homepage source hierarchy | PASS | One rendered `header`, `nav`, `main`, and `h1`; primary CTA and internal links present |
| Higher Study architecture | PASS | One dedicated Higher Study header system; desktop/mobile nav representations are responsive variants, not stacked site headers |
| English Learning | PASS | Production route returned 200 and rendered structural landmarks |
| Public CTAs/forms | PARTIAL | Source/integration tests passed; real browser keyboard/mobile interaction remains NOT VERIFIED |
| Homepage duplication cleanup | PASS | Structural tests prevent restored redundant homepage blocks/navigation regressions |
| Real browser console/mobile acceptance | NOT VERIFIED | No Chromium/Firefox/WebKit binary was available in the sandbox |
| Live `alaminn.info` behavior | BLOCKED | Live-domain access/deployment authority unavailable |

HTTP-rendered DOM checks covered `/`, `/higher-study`, `/english-learning`, and `/work-with-me`. They prove server rendering and structure, not visual layout, focus order, touch behavior, or absence of browser-only console errors.

## 6. Public AI defect diagnosis and repair

### Root causes found

1. The chat UI and “AI advisor” CTA did not consistently open the same working flow.
2. Responses could fall into a nominal AI path without proven provider exchange.
3. The public assistant needed an explicit non-human identity and truthful provider evidence.
4. Intent priority allowed a query such as “Which countries can I study in for a masters degree?” to be misclassified as a course query because “masters” matched before the explicit country question.
5. Provider-facing language could imply capabilities unavailable without official credentials.

### Implemented repair

- Global CTA/widget integration opens the actual chat interface.
- Every response identifies itself as **“Al-Amin's AI Assistant.”**
- The assistant cannot impersonate Al Aminn.
- The generative SDK and unused worker were removed; no hidden provider call is attempted.
- Responses use deterministic intent rules and verified database retrieval.
- Explicit destination questions take precedence over generic study-level keywords.
- The API returns `responseMode: "verified_rules"` and `usedLlm: false` truthfully.
- Sensitive handoff uses an opaque reference and remains human-controlled.
- Admission, visa, scholarship, employment, legal, and immigration guarantees are guarded.
- Lead creation requires explicit privacy and communication consent.

### Reproduced runtime acceptance

The final destination query returned HTTP 200 with:

- intent `STUDY_DESTINATION`
- `identified: true`
- explicit assistant identity in `reply`
- `responseMode: "verified_rules"`
- `usedLlm: false`
- six verified records found
- an opaque 16-hex-character WhatsApp handoff reference

**Status:** deterministic verified assistant PASS; generative AI BLOCKED/NOT IMPLEMENTED until an approved provider, server-side credentials, persisted output, and human approval acceptance test exist.

## 7. Transactional booking, CRM, calendar, and email

### Booking implementation

A valid booking transaction creates or links:

- `MeetingRequest`
- CRM `Contact`
- linked `Inquiry`
- follow-up `Task`
- admin `Notification`
- first-party analytics event
- booking audit event

Slot conflicts are checked inside the transaction. External delivery occurs only after durable booking commit, so provider failure does not erase the booking.

### Reproduced booking suite

`npm run test:booking` returned PASS for reference `ALM-MTG-2026-A419978E11` and verified the meeting, contact, inquiry, follow-up task, two notifications, two audit rows, and two linked `EmailDelivery` rows. The test cleans its own records after assertions.

Because no real email provider is configured, both deliveries correctly remained `PENDING`, provider `none`, attempts `1`; the API returned `emailStatus: "pending"` rather than claiming delivery. Calendar returned `calendarStatus: "not_configured"` rather than fabricating an event.

A persistent earlier preview booking, `ALM-MTG-2026-E1122EF48A`, also demonstrated two linked durable deliveries in the seeded preview database. Preview evidence is not production evidence.

### Email operations

- Configurable setting key: `booking.notificationEmail`
- Default internal recipient: `engr.alaminn@gmail.com`
- Required internal subject: `NEW MEETING BOOKED - {student name}`
- Durable states: `PENDING`, `RETRYING`, `SENT`, `FAILED`
- `SENT` requires SMTP/Resend acceptance; console/no-provider output cannot become SENT
- Authenticated retry processor: `/api/cron/email-queue`
- Admin evidence is redacted and count labels match API states

### Calendar and providers

Google Calendar event creation is intentionally not simulated. It remains BLOCKED until official Google OAuth authorization, encrypted token storage, refresh/revocation, calendar selection, event creation, provider event ID persistence, and production acceptance evidence exist.

## 8. Command Center and security

### Implemented and preview-verified

- Server-side proxy redirect protects private admin page routes before render.
- Every admin API uses session/RBAC checks.
- Signed cookies are HTTP-only, SameSite=Lax, Secure in production, and expire after eight hours.
- Active users and current roles are revalidated against the database for privileged actions.
- Cross-site mutation checks use Origin/Fetch-Metadata defense in depth.
- Login throttling and lockout exist.
- Audit events record login, 2FA, booking, provider, and administrative actions without raw IP storage.
- Production CSP removes `unsafe-eval`; HSTS, frame denial, content-type, referrer, and permissions policies are emitted.

### TOTP 2FA acceptance

The full preview workflow passed:

1. authenticated setup produced a 32-character base32 secret;
2. the stored secret did not contain plaintext and the pending secret was cleared after verification;
3. eight recovery codes were returned once and stored only as keyed hashes;
4. password-only login returned `two_factor_required`;
5. an invalid code returned `two_factor_invalid`;
6. a current TOTP issued an OWNER session;
7. disabling required a current TOTP and cleared all 2FA fields.

A separate `TWO_FACTOR_ENCRYPTION_KEY` is supported and recommended so session-secret rotation need not invalidate TOTP secrets.

### Known security limitations

- Rate-limit state is process-local, not shared across replicas.
- CSP still permits inline scripts/styles required by the current Next.js output; nonce-based CSP remains future hardening.
- Server-to-server mutations may omit Origin and still require their endpoint's authentication/validation controls; this is deliberate but must be preserved carefully.
- Recovery-code and TOTP state is database-resident; production backup access must be tightly controlled.
- Five high-severity findings remain in the development-only ESLint dependency chain (`braces`/`micromatch`/`fast-glob` via `eslint-config-next`). `npm audit --omit=dev` reported zero production vulnerabilities. Upgrading the lint chain requires a compatibility-tested Next.js/ESLint release.
- Clean install emitted deprecation notices for development/transitive packages and Recharts 2.15; production audit remained clean, but a tested Recharts 3 migration should be planned.

## 9. Database and migration safety

Active provider-consistent SQLite migrations:

1. `00000000000000_initial`
2. `20261017193000_add_password_reset_fields`
3. `20261017200000_add_email_delivery_queue`
4. `20261017203000_add_two_factor_auth`

The historical MySQL draft is quarantined at `prisma/legacy-migrations/mysql_initial.sql` and cannot be applied as active history.

The custom migration runner:

- requires a `file:` SQLite URL;
- never resets, drops tables, or deletes application rows;
- refuses an unknown partial baseline;
- applies each additive field/table idempotently;
- records `_alaminn_migrations` history;
- runs `PRAGMA integrity_check` and `foreign_key_check`;
- supports `--check` status mode.

`npm run db:reset` intentionally exits with failure. Fresh migration and repeated/idempotent migration tests passed. Preview verification reported 56 application tables, four migration records, integrity `ok`, no foreign-key violations, and zero anomalies.

**Production migration:** BLOCKED until the real database location, owner/group/mode, available disk space, pre-migration backup, off-host copy, and restore rehearsal are verified.

## 10. Deployment and rollback

### Source readiness

- CI uses Node 22, `npm ci`, portable Prisma generation, additive migration, ephemeral seed, all tests, security suite, booking workflow, build, and standalone smoke checks.
- Manual deployment is restricted to the production target branch and requires a successful complete CI check plus protected production-environment approval.
- SSH host keys are pinned; required secrets are preflighted.
- Releases are versioned worktrees with shared persistent `db` and `storage` directories.
- Existing SQLite data is backed up before migration.
- Traffic switches through a `current` symlink only after build/migration gates.
- Failure restores the previous release symlink.
- Docker runs as a non-root user, preserves `/app/db`, and executes the same additive migration before accepting traffic.
- MySQL deployment paths and schema swapping were retired.

### Not verified

- GitHub Actions could not execute because the account reported a payment/spending-limit failure before steps.
- Docker/Compose could not be built because Docker is unavailable in this sandbox.
- No production SSH, process manager, reverse proxy, DNS, TLS, disk, or database access was supplied.
- No post-deploy readiness, smoke, log, backup, or rollback exercise ran on the live host.

### Required rollback procedure

1. Stop or quiesce writes.
2. Retain the failed release and logs for forensics.
3. Point `current` back to the previous versioned release.
4. Reload the service and run `/api/health` plus critical route checks.
5. Because current migrations are additive, prefer rolling back application code without deleting new columns/tables.
6. Restore the verified pre-deploy SQLite backup only if data/schema integrity requires it and only after preserving the failed database.
7. Re-run integrity and foreign-key checks and record the incident in audit/operations notes.

## 11. Reproduced validation matrix

| Command or acceptance test | Result |
|---|---|
| `npm ci --no-audit --no-fund` | PASS — 724 packages; portable Prisma postinstall PASS |
| npm 10 clean-install dry run | PASS |
| portable Prisma client generation | PASS |
| fresh SQLite migration | PASS |
| migration idempotence/status | PASS |
| preview DB integrity/FK verification | PASS — zero anomalies |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zero warnings/errors |
| `npm run test:unit` | PASS — 55/55 |
| `npm run test:integration` | PASS — 17/17 |
| `npm run test:api` | PASS — 17/17 |
| `npm run test:auth` | PASS — 24/24 |
| `npm run test:security` | PASS — 22/22 |
| `npm run test:booking` | PASS — transaction and durable delivery evidence |
| `npm test` | PASS — 301/301 in 14 files |
| production dependency audit | PASS — 0 vulnerabilities with `--omit=dev` |
| full dependency audit | PARTIAL — five high development-only lint-chain findings |
| `npm run build` | PASS — Next.js 16.4.2 standalone; 238 static/SSG instances |
| standalone production server startup | PASS |
| security headers | PASS — production CSP has no `unsafe-eval` |
| anonymous admin page/API rejection | PASS |
| authenticated admin/login/logout preview workflow | PASS |
| TOTP enable/login/disable workflow | PASS |
| deterministic AI destination query | PASS |
| HTTP DOM landmarks on key public pages | PASS |
| `git diff --check` | PASS |
| browser/mobile/console E2E | NOT VERIFIED — no browser binary |
| Docker image/Compose runtime | NOT VERIFIED — Docker unavailable |
| GitHub Actions | BLOCKED — billing/spending limit |
| production deployment/database | BLOCKED — no production access |

`docs/security-report.md` contains the latest 22-test runtime details. Build/provider warnings explicitly stated that email and WhatsApp were unconfigured; those warnings are truthful blockers, not PASS evidence.

## 12. Provider and external acceptance blockers

| Capability | Status | Why blocked / exact acceptance required |
|---|---|---|
| SMTP/Resend email | BLOCKED | Add official server-side credentials; send student/admin test; verify provider acceptance IDs, inbox receipt, durable SENT transition, retry/failure path, and redacted logs |
| Gmail API | NOT IMPLEMENTED / BLOCKED | Google Cloud app, OAuth consent, least-privilege Gmail scopes, encrypted token lifecycle, revocation, send/read acceptance |
| Google Calendar | NOT IMPLEMENTED / BLOCKED | OAuth authorization, encrypted refresh token, selected calendar, event creation/update/cancel, provider ID persistence, timezone/idempotency acceptance |
| WhatsApp Business | BLOCKED | Meta app approval, Phone Number ID/token/app secret/verify token, signed webhook acceptance, opted-in outbound message, delivery/read webhook evidence |
| Facebook | NOT IMPLEMENTED / BLOCKED | Meta OAuth/Page permissions, encrypted token lifecycle, webhook and approved publish test |
| Instagram | NOT IMPLEMENTED / BLOCKED | Eligible Professional account, Meta permissions/review, token lifecycle, publish test |
| LinkedIn | NOT IMPLEMENTED / BLOCKED | LinkedIn app/product approval, OAuth scopes, organization authorization, publish test |
| Generative AI | NOT IMPLEMENTED / BLOCKED | Approved provider, credentials, model/data terms, persisted draft, safety evaluation, human approval, no autonomous send |
| Production DB | BLOCKED | Real path/ownership/space, verified backup and restore rehearsal, migration status, integrity check |
| Live deployment | BLOCKED | SSH/environment approval, CI success, deploy, readiness, smoke, logs, rollback rehearsal |
| Live browser/mobile | BLOCKED | Run Chromium/WebKit/Firefox at desktop and mobile breakpoints; verify focus, dialogs, touch, navigation, forms, network failures, and console |
| Three private reference repositories | UNAVAILABLE | GitHub returned 403; grant repository access and repeat source/license review |
| Eleven non-GitHub sources | BLOCKED | Sandbox outbound allowlist prevented retrieval; use an authorized review environment |

No passwords, OAuth tokens, API keys, SSH keys, certificates, provider secrets, or production database files were requested, printed, committed, or packaged.

## 13. Reference-source audit

`REFERENCE_SOURCE_AUDIT.md` records:

- 138 deduplicated repository identifiers
- 135 accessible repository inspections
- 3 HTTP-403 unavailable repositories
- 7 GitHub profile links
- 11 blocked external site labels
- stack/function/license/security implication/disposition per repository

Applicable diagram, marketing-kit, higher-study planning, CRM review, SEO, analytics, AI-governance, and communications patterns were implemented natively. License-restricted code was not copied. Unrelated applications, scrapers, WhatsApp-Web automation, downloader/model stacks, autonomous trading tools, and duplicate platforms were rejected.

## 14. Packaging policy

The production ZIP is created from tracked release source only. It excludes:

- `.git`
- `.env*` and all credentials/keys/certificates
- `node_modules`
- `.next`, build output, coverage, caches, and TypeScript build info
- SQLite databases, journals/WAL/SHM files, backups, logs, uploads, exports, and temporary files
- previous ZIP/TAR artifacts

Exact ZIP byte size and SHA-256 are recorded after archive creation in this report's final packaging record and in sidecar checksum/manifest files. The checksum cannot be embedded inside the ZIP itself without changing the ZIP digest.

## 15. Handoff checklist before go-live

- [ ] Resolve GitHub Actions billing/spending limit and obtain a green CI run for the exact commit.
- [ ] Review and merge PR #5 through normal approval.
- [ ] Confirm production Node 22+, disk, service account, reverse proxy, DNS, and TLS.
- [ ] Generate unique `AUTH_SECRET`, `TWO_FACTOR_ENCRYPTION_KEY`, referral secrets, and `CRON_SECRET`; store only in deployment secret management.
- [ ] Verify the production SQLite path and permissions.
- [ ] Create, checksum, copy off-host, and restore-test a pre-deploy backup.
- [ ] Run additive migration and database verification.
- [ ] Configure only approved official provider credentials.
- [ ] Execute provider acceptance tests from Section 12.
- [ ] Run real-browser desktop/mobile/accessibility/console tests.
- [ ] Verify analytics, SEO metadata, sitemap, robots, canonical URLs, and redirects on the live origin.
- [ ] Exercise booking conflict, provider outage, retry, calendar, notification, and rollback paths.
- [ ] Monitor logs and database integrity after cutover.

Until every applicable box is evidenced, retain the status **PARTIAL / PRODUCTION GO-LIVE BLOCKED**.

## 16. Final packaging record

| Field | Exact value |
|---|---|
| Archive | `alaminn-info-production-final.zip` |
| Source commit archived | `715eb3872cb9ddfc6af1319ecf430c2795425855` |
| ZIP entries | 1,120 |
| Exact byte size | **10,251,983 bytes** |
| SHA-256 | **`b795335206b1914de8d910f3f3ac07d34eb8bae7ecf48a91a06e16eaa3c64c77`** |
| Integrity test | PASS — `unzip -t` reported no errors |
| Forbidden-path scan | PASS — no runtime `.env`, database, key/certificate, log, backup, `node_modules`, `.next`, coverage, or `.git` entries |

Sidecars:

- `alaminn-info-production-final.zip.sha256`
- `alaminn-info-production-final.zip.manifest.txt`

`.env.example` is intentionally included as a placeholder-only configuration template. The immutable ZIP contains the pre-digest wording of this section; the repository report and sidecars contain the exact post-creation values so the checksum is not circular.
