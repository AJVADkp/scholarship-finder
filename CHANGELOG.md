# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-11-18

### Added

- Multi-dimensional scholarship eligibility scoring engine (`src/lib/scoring.ts`) across 9 criteria (academic level, stream, marks, gender, state, income, caste, religion, disability).
- Secure administrative portal with JWT authentication, JTI token revocation on logout, and durable rate limiting.
- Administrative audit logging system (`admin_audit_log`) tracking all mutations and access attempts.
- Automated administrator credential creation CLI script (`scripts/create-admin.mjs`) using bcrypt (cost factor 12).
- Durable multi-backend rate limiter supporting Upstash Redis with Postgres counter table fallback.
- Client IP derivation from first upstream reverse proxy hop with salted SHA-256 IP anonymization.
- Route health check telemetry endpoint (`GET /api/health`).
- Vitest unit and integration test suite with 55 automated tests.
- Playwright end-to-end smoke test harness (`e2e/smoke.spec.ts`).
- Supabase CLI migration layout (`supabase/migrations/`) and TypeScript type generation tooling (`npm run db:types`).
- Dynamic robots.txt generation (`src/app/robots.ts`) bound to `NEXT_PUBLIC_SITE_URL`.
- Branded application error boundaries (`error.tsx`, `global-error.tsx`) and granular route loading skeletons.
- Prettier, Husky, lint-staged, and Commitlint automated code quality checks.

### Changed

- Migrated legacy `middleware.ts` to Next.js 16 `proxy.ts` architecture.
- Replaced uncompressed `logo.png` (530 KB) with optimized `logo.webp` (33.8 KB) using Next.js `Image` optimization.
- Isolated canvas particle background through dynamic client-side loading to prevent main-thread hydration blocking.
- Modularized monolithic components and pages exceeding 300 lines into focused subcomponents and custom hooks.
- Hardened HTTP security headers in `next.config.ts` with Content-Security-Policy and Permissions-Policy.

### Security

- Eliminated default hardcoded administrative credentials from schema and migrations.
- Sanitized all route handler error messages to prevent internal database schema leakages.
- Added honeypot verification and server-side input length validation to public contact submission routes.
