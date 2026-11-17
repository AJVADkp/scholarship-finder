# Pull Request: Phase 4 — Code Structure and Performance

## Overview
- **Branch**: `refactor/phase-4-code-structure-and-performance`
- **Target**: `main`
- **Scope**: Code modularization of files over 300 lines, server component audit, image optimization (WebP + Next.js `Image`), lazy-loading heavyweight canvas animations, dynamic SEO metadata generation, and runtime environment standardization.

---

## 1. What Changed

### A. Decomposition of Files Over ~300 Lines
Every file exceeding the 300-line threshold was refactored into focused, single-responsibility subcomponents and custom hooks without altering user-facing behavior:

| File | Before | After | Extracted Subcomponents / Hooks |
| :--- | :--- | :--- | :--- |
| `src/app/scholarships/page.tsx` | 598 lines | 214 lines | `src/hooks/useScholarshipSearch.ts`<br>`src/components/search/SearchSidebar.tsx`<br>`src/components/search/SearchPagination.tsx` |
| `src/components/profile/ProfileForm.tsx` | 564 lines | 125 lines | `src/components/profile/ProfileFormShared.tsx`<br>`src/components/profile/ProfileAcademicSection.tsx`<br>`src/components/profile/ProfileDemographicSection.tsx`<br>`src/components/profile/ProfileFinancialSection.tsx` |
| `src/app/dashboard/page.tsx` | 357 lines | 262 lines | `src/components/profile/EditBasicInfoModal.tsx` |
| `src/app/admin/scholarships/page.tsx` | 494 lines | 249 lines | `src/components/admin/ScholarshipFormModal.tsx`<br>`src/components/admin/ScholarshipTable.tsx` |
| `src/app/admin/analytics/page.tsx` | 404 lines | 218 lines | `src/components/admin/AnalyticsStats.tsx`<br>`src/components/admin/AnalyticsUserModal.tsx` |

### B. Client Component Audit & Server Component Conversion
- Audited all `'use client'` components across the codebase.
- Converted static presentational components (`CategoryBadge.tsx` and `DeadlineBadge.tsx`) to Server Components by removing unnecessary `'use client'` directives, eliminating client-side bundle weight for all listing cards.
- Verified that all remaining `'use client'` components strictly contain user interactivity, hooks (`useState`, `useEffect`, `useRouter`), or browser DOM/Canvas APIs.

### C. Image Delivery & Canvas Lazy-Loading
- **Asset Optimization**: Transitioned logo references to `logo.webp` (33.8 KB) instead of the uncompressed `logo.png` (530 KB), yielding a **93.6% reduction in asset payload size**.
- **Responsive Logo Component**: Updated `Navbar.tsx` to render `<Image src="/logo.webp" alt="ScholarSearch" width={32} height={32} priority />` with Next.js image optimization.
- **Metadata Icons**: Configured `layout.tsx` metadata with WebP favicon and apple touch icon entries.
- **Client-Side Canvas Isolation**: Wrapped `ParticleBackground` in `DynamicParticleBackground.tsx` using `next/dynamic` with `{ ssr: false }`, preventing heavy canvas computations from blocking initial HTML streaming and eliminating hydration mismatches.

### D. Dynamic SEO & Dependency Hygiene
- **Dynamic Robots**: Replaced static `public/robots.txt` with dynamic `src/app/robots.ts` using Next.js `MetadataRoute.Robots` to dynamically bind the sitemap URL to `process.env.NEXT_PUBLIC_SITE_URL`.
- **Node Engine Specification**: Added `"engines": { "node": ">=20.0.0", "npm": ">=10.0.0" }` to `package.json` and created `.nvmrc` pinned to `20`.
- **Dependency Cleanup**: Removed stale devDependency `@types/bcryptjs`.

---

## 2. Why

- Monolithic files containing 400-600 lines create tight coupling, hinder readability, and inflate re-render scope.
- Delivering unoptimized PNGs and eagerly initializing Canvas particle animations degrades Core Web Vitals (LCP and TBT).
- Standardizing Node engine requirements prevents subtle runtime discrepancies between local development and CI/CD environments.

---

## 3. How to Test

```bash
# Verify all types, linting, unit tests, and production build
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
| State desynchronization during component extraction | Retained exact parent-child state interfaces and callback contracts; verified with 55 automated tests. |
| Next.js App Router dynamic SSR limitation | Isolated `{ ssr: false }` dynamic import inside a dedicated `'use client'` wrapper (`DynamicParticleBackground.tsx`). |
