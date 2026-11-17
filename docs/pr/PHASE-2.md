# Pull Request: Phase 2 — Database Discipline

## Overview
- **Branch**: `feat/phase-2-database-discipline`
- **Target**: `main`
- **Scope**: Supabase CLI migrations architecture, automated TypeScript definitions from schema, search & filter index optimizations, and deterministic PRNG sample data seeding.

---

## 1. What Changed

### A. Supabase CLI & Migrations Architecture
- Introduced official Supabase CLI layout: `supabase/config.toml` configuring local ports, database version, and studio parameters.
- Structured database evolution into chronological, reproducible SQL migration files:
  1. `supabase/migrations/20240101000000_baseline_schema.sql`: Initial baseline tables, triggers, and RLS policies.
  2. `supabase/migrations/20240102000000_phase1_security_and_audit.sql`: Phase 1 security additions (`admin_audit_log`, `revoked_tokens`, `rate_limit_counters`, and `contact_messages` length constraints).
  3. `supabase/migrations/20240103000000_phase2_indexes_and_sample_flag.sql`: GIN indexes, trigram search indexes, and the `is_sample` discriminator column.

### B. Generated Database Types & Type Derivation
- Created `src/lib/database.types.ts` representing the exact Supabase TypeScript database schema.
- Refactored `src/lib/types.ts` so `Scholarship`, `UserProfile`, `SavedScholarship`, `AdminAuditLog`, and `ContactMessage` are derived directly from `Database['public']['Tables'][...]['Row']`, removing handwritten duplicate models.
- Added `scripts/generate-types.mjs` supporting:
  - `npm run db:types`: Generates/updates database types against remote database URL.
  - `npm run db:types:check`: Validates in CI that all required tables and type definitions are present and synchronized.

### C. Search & Filter Database Indexing
Added high-efficiency indexes to support core query paths:

| Index Name | Type | Target Column(s) | Served Query / Justification |
| :--- | :--- | :--- | :--- |
| `idx_scholarships_title_trgm` | GIN (`gin_trgm_ops`) | `title` | Accelerates substring & fuzzy keyword search in `src/app/scholarships/page.tsx` (`title ILIKE '%query%'`). |
| `idx_scholarships_provider_trgm` | GIN (`gin_trgm_ops`) | `provider` | Accelerates provider/organization search matches (`provider ILIKE '%query%'`). |
| `idx_scholarships_academic_levels_gin` | GIN | `academic_levels` | Powers array overlap filters (`academic_levels && ARRAY[...]`) for degree levels (UG, PG, PhD). |
| `idx_scholarships_streams_gin` | GIN | `streams` | Powers array overlap filters for academic fields (Engineering, Medical, Science, Arts). |
| `idx_scholarships_caste_categories_gin` | GIN | `caste_categories` | Powers multi-select caste category reservation filter (`caste_categories && ARRAY[...]`). |
| `idx_scholarships_special_backgrounds_gin` | GIN | `special_backgrounds` | Powers special background filter (single parent, minority, rural, first graduate). |
| `idx_scholarships_tags_gin` | GIN | `tags` | Accelerates tag search and topic filtering. |
| `idx_scholarships_portal_source_gin` | GIN | `portal_source` | Powers source portal faceted filtering (NSP, state portals). |
| `idx_scholarships_course_specializations_gin` | GIN | `course_specializations` | Accelerates domain specialization queries. |
| `idx_scholarships_institution_types_gin` | GIN | `institution_types` | Powers college classification filters (Govt, Private, Central, Autonomous). |
| `idx_scholarships_is_sample` | B-tree | `is_sample` | Separates simulated sample rows from real financial aid programs. |

### D. Deterministic Seeding & UI Sample Identification
- Unified seeding into `scripts/seed-scholarships.mjs` using a deterministic seeded Pseudo-Random Number Generator (PRNG).
- Eliminated unpredictable `Math.random()` eligibility generation, ensuring identical, reproducible datasets across all developer machines and test runs.
- Synchronized `supabase/seed.sql` with the deterministic generator.
- Added prominent sample badges in `ScholarshipCard.tsx` and an alert banner in `scholarships/[id]/page.tsx` whenever `is_sample === true`.

---

## 2. Why

Un-indexed array queries in PostgreSQL cause full table scans that degrade response latency as listing volume grows. Trigram indexes provide instant full-text filtering. Furthermore, deriving TypeScript models directly from database definitions eliminates schema drift, while deterministic sample datasets prevent confusing simulated rules from being mistaken for real scholarship guidelines.

---

## 3. How to Test

```bash
# Verify database types freshness
npm run db:types:check

# Run full quality check
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

| Risk | Mitigation |
| :--- | :--- |
| `pg_trgm` extension availability | Standard extension pre-installed in all Supabase PostgreSQL instances; created with `IF NOT EXISTS`. |
| Migration sequence conflicts | Migrations use fixed timestamp prefixes (`20240101000000_...`, `20240102000000_...`, `20240103000000_...`) ensuring deterministic execution order. |
| Type drift in CI | `npm run db:types:check` fails the build if generated types are missing or schema tables are absent. |
