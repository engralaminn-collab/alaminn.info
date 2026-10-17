# Database migration policy

The authoritative application schema is `prisma/schema.prisma` and its provider is SQLite.
`prisma/migrations/` therefore contains SQLite migrations only.

## Active migrations

1. `00000000000000_initial` — 55-table SQLite baseline.
2. `20261017193000_add_password_reset_fields` — additive User password-reset fields and index.
3. `20261017200000_add_email_delivery_queue` — durable email status and retry queue.
4. `20261017203000_add_two_factor_auth` — encrypted TOTP state and hashed recovery-code storage.

The historical MySQL draft was removed from the active Prisma migration path and retained at
`prisma/legacy-migrations/mysql_initial.sql` for forensic reference. It must **not** be applied
to the SQLite database. The application intentionally refuses a `mysql://` `DATABASE_URL`
because the checked-in schema, adapter, backup flow, and active migration lock all target SQLite.

## Safe deployment

1. Stop writes or place the application in maintenance mode.
2. Run `npm run db:backup` and verify the resulting backup.
3. Run `npm run db:migrate:deploy`; the checked-in runner only performs additive SQLite changes and refuses partial/unknown schemas.
4. Run `npm run db:migrate:status` and require an up-to-date result.
5. Run `npm run db:verify` before switching traffic.
6. Retain both the pre-migration backup and previous application release for rollback.

`npm run db:reset` is intentionally disabled. The migration runner records application history in
`_alaminn_migrations`, checks SQLite integrity and foreign keys, and does not drop tables or rows.

Production migration and restore remain blocked until the operator verifies the actual production
`DATABASE_URL`, file ownership, free disk space, and backup restoration on the server. Never infer
the production database provider from old deployment scripts.

## Provider changes

Moving to MySQL or another provider is a separate reviewed data-migration project. It requires a
complete provider-specific schema, migration history for all 55 models, data export/import,
referential-integrity validation, application cutover, and rollback testing. Do not swap schema
files during a normal application deployment.
