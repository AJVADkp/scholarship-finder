# Pull Request: Phase 1 — Fix Real Bugs and Security Hardening

## Overview

- **Branch**: `fix/phase-1-security-and-bugs`
- **Target**: `main`
- **Scope**: Core security enhancements, admin API schema alignment, rate limiting, and Next.js 16 migration.

---

## 1. What Changed

### A. Admin Scholarship API Mismatch

- **Problem**: `POST /api/admin/scholarships` and `PUT /api/admin/scholarships/[id]` used an invalid column allowlist (`name`, `eligibility`, `url`, `academic_level`, `income_limit`, `gender`) which dropped or rejected submissions from the admin form.
- **Fix**: Created shared Zod validation schemas (`scholarshipCreateSchema`, `scholarshipUpdateSchema`) in `src/lib/validations/scholarship.ts` mapping directly to the actual database columns (`title`, `eligibility_criteria`, `application_link`, `academic_levels`, `streams`, `income_range`, `gender_eligibility`, `caste_categories`, `special_backgrounds`, etc.). Added comprehensive unit tests in `tests/scholarship-validation.test.ts`.

### B. Secret Management & Startup Validation

- Centralized `getAdminJwtSecret()` in `src/lib/admin-auth.ts` enforcing a strict minimum of 32 characters (`MIN_ADMIN_JWT_SECRET_LENGTH = 32`). Fails fast with descriptive diagnostic messages if missing or insecure.
- Removed hardcoded fallback secrets across all routes, middleware, and tests.

### C. Admin Account Provisioning & Seed Security

- Removed the pre-seeded bcrypt default hash from `supabase/schema.sql`.
- Created `scripts/create-admin.mjs` for provisioning administrator credentials securely using bcrypt (cost 12) with interactive or CLI argument support (`npm run admin:create`). Documented in `README.md`.

### D. Durable Rate Limiting

- Replaced the ephemeral in-memory rate limiter with a distributed, durable rate limiting engine in `src/lib/rate-limit.ts`.
- Supports Upstash Redis (`@upstash/ratelimit`) when configured via `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, with automatic fallback to a PostgreSQL counter table (`rate_limit_counters`).
- Added `getClientIp()` in `src/lib/request-utils.ts` to derive client IP from the first hop of `x-forwarded-for` to prevent reverse-proxy header spoofing.
- Applied rate limits across:
  - `POST /api/admin/login`: 5 attempts / 15 minutes per IP.
  - `POST /api/contact`: 5 messages / 5 minutes per IP.
  - `POST /api/track`: 60 events / 1 minute per IP.

### E. Telemetry & Analytics Privacy Hardening (`/api/track`)

- Validated payloads via `trackEventSchema` in `src/lib/validations/track.ts` (length caps and type coercions).
- Client-supplied `user_id` and `user_name` are ignored; user identity is derived strictly server-side from active Supabase session cookies.
- IPs are anonymized before storage: IPv4 truncated to `/24` subnet mask; others hashed with salted SHA-256.

### F. Contact Form Hardening (`/api/contact`)

- Added dedicated backend endpoint `POST /api/contact` replacing direct client table inserts.
- Enforced input validation, length limits, and anti-bot honeypot protection (`website_url` field).
- Added database check constraints on `contact_messages` (`char_length(name) <= 100`, `char_length(email) <= 255`, `char_length(message) <= 2000`).

### G. Database Error Sanitization

- Removed raw Supabase `error.message` leaks across all routes (`/api/admin/scholarships`, `/api/admin/users`, `/api/admin/settings`, `/api/admin/analytics`, `/api/track`, `/api/contact`).
- Errors are logged server-side with structured context; clients receive sanitized, stable HTTP error codes.

### H. Audit Logging & Session Revocation

- Added `admin_audit_log` table with indexes recording admin logins, logouts, scholarship mutations, user edits/deletions, and credential updates.
- Added cryptographic `jti` (UUID v4) to admin session JWTs.
- Implemented `revoked_tokens` table checking revocation status upon logout and across route requests.

### I. Strict Security Headers

- Added strict `Content-Security-Policy` and `Permissions-Policy` in `next.config.ts`.
- Guarded against clickjacking, script injection, and unauthorized peripheral access.

### J. Next.js 16 Proxy Migration

- Migrated deprecated `src/middleware.ts` to `src/proxy.ts` exporting `proxy()` and backwards-compatible `middleware` alias, fully resolving Next 16 deprecation notices.

---

## 2. Why

These changes address critical security vulnerabilities, align API contracts with the actual database schema, protect user privacy, and ensure resilient operational standards for production deployments.

---

## 3. How to Test

### Automated Test Suite

```bash
npm test
```

All unit tests in `tests/admin-auth.test.ts`, `tests/request-utils.test.ts`, `tests/scholarship-validation.test.ts`, and `tests/smoke.test.ts` should pass.

### Full Pipeline Verification

```bash
# Set placeholder environment variables
$env:NEXT_PUBLIC_SUPABASE_URL="https://placeholder.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY="placeholder"
$env:SUPABASE_SERVICE_ROLE_KEY="placeholder"
$env:ADMIN_JWT_SECRET="ci-build-mock-secret-for-jwt-signing-key-32b"

npm run typecheck
npm run lint
npm test
npm run build
```

---

## 4. Risks & Mitigations

| Risk                                    | Mitigation                                                                                                   |
| :-------------------------------------- | :----------------------------------------------------------------------------------------------------------- |
| Missing `ADMIN_JWT_SECRET` in local dev | Clear startup error explaining required 32-character secret; documented in `.env.example` and `README.md`.   |
| Rate limiting database overhead         | High-performance indexed counter table; falls back gracefully to in-memory sliding window if database fails. |
| Strict CSP blocking external scripts    | Allowlist includes Vercel analytics and Google Fonts domains required by the application.                    |
| Reverse-proxy spoofed IP headers        | Takes the first hop of `x-forwarded-for`, falling back to `x-real-ip`.                                       |
