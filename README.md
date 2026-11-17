# ScholarSearch

ScholarSearch is an intelligent scholarship discovery and matching platform designed to connect students across India with financial aid opportunities tailored to their academic background, demographic profile, and financial need.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, and Supabase.

---

## Key Features

- **Personalized Eligibility Scoring**: Evaluates student profiles against scholarship criteria using a multi-dimensional matching algorithm to highlight the best matches.
- **Advanced Multi-Tier Filtering**: Filter opportunities across 15+ dimensions, including academic level, stream, income brackets, category, state, and deadlines.
- **Student Dashboard**: Manage profiles, bookmark eligible opportunities, and track application deadlines in one place.
- **Secure Admin Control Center**: Manage scholarship listings, user accounts, and incoming support inquiries with isolated JWT session authentication and bcrypt password protection.
- **First-Party Analytics**: Built-in privacy-conscious visit tracking that records platform usage metrics without relying on invasive third-party trackers.
- **Row Level Security (RLS)**: Enforces database-level isolation policies across all tables, safeguarding student data and administrator credentials.

---

## Tech Stack

- **Framework**: Next.js 15 (React 19, Turbopack, App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Storage)
- **Security & Cryptography**: Jose (JWT), bcryptjs
- **Animations & Icons**: Framer Motion, Lucide Icons

---

## Project Structure

```
├── .github/workflows/    # CI automation (lint, typecheck, build)
├── public/               # Static assets & brand media
├── scripts/              # Utility & database seeding scripts
│   └── seed-scholarships.mjs
├── src/
│   ├── app/              # Next.js App Router pages & API routes
│   │   ├── admin/        # Admin portal routes (dashboard, scholarships, users, analytics)
│   │   ├── api/          # Secure REST endpoints & admin handlers
│   │   ├── dashboard/    # Student dashboard & saved scholarships
│   │   └── scholarships/ # Public search & detail views
│   ├── components/       # Reusable React components
│   │   ├── admin/        # Admin sidebar & management UI
│   │   ├── layout/       # Navigation, footer, background effects
│   │   ├── profile/      # Student profile forms & inputs
│   │   ├── scholarship/  # Scholarship card displays & badges
│   │   └── search/       # Basic & advanced filter panels
│   └── lib/              # Supabase clients, utilities, and TypeScript types
│       ├── supabase/     # Client, Server, and Admin client wrappers
│       ├── admin-auth.ts # JWT verification & session management
│       ├── types.ts      # Core data interfaces
│       └── utils.ts      # Matching algorithms & date helpers
└── supabase/             # Database schemas & seed data
    ├── schema.sql        # Unified PostgreSQL DDL, RLS, and triggers
    └── seed.sql          # Initial sample dataset
```

---

## Getting Started

### 1. Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher
- A Supabase account and project

### 2. Clone and Install

```bash
git clone https://github.com/AJVADkp/scholarship-finder.git
cd scholarship-finder
npm install
```

### 3. Environment Variables

Create a `.env.local` file by copying the provided example:

```bash
cp .env.example .env.local
```

Fill in the required configuration parameters:

| Variable | Description | Scope |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL | Client & Server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase Anon API key | Client & Server |
| `SUPABASE_SERVICE_ROLE_KEY` | Privileged Supabase Service Role key | Server-Side Only |
| `ADMIN_JWT_SECRET` | 32+ character secret for admin JWT sessions | Server-Side Only |
| `NEXT_PUBLIC_SITE_URL` | Application root URL (`http://localhost:3000` locally) | Client & Server |

> **Security Note**: Never commit `.env.local` or expose `SUPABASE_SERVICE_ROLE_KEY` on the client. The service role key bypasses Row Level Security and must only be used in authenticated server contexts.

### 4. Database Setup

1. Open your Supabase Dashboard and go to the **SQL Editor**.
2. Run the SQL script located at `supabase/schema.sql` to initialize all tables, RLS policies, indexes, and storage buckets.
3. (Optional) Run the database seed script to populate curated scholarships:

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

- `npm run dev` — Starts the local Next.js development server with Turbopack.
- `npm run build` — Compiles and optimizes the production build.
- `npm run start` — Starts the Next.js production server.
- `npm run lint` — Runs ESLint checks across all project source files.
- `npm run typecheck` — Runs TypeScript compiler checks without emitting files.
- `npm run db:seed` — Seeds the database with curated scholarship records.

---

## Security Practices

- **API Secret Rotation**: If Supabase or application secrets were ever shared or pushed publicly, immediately generate new credentials via the Supabase Dashboard (**Settings -> API -> Reset**).
- **JWT Cookie Protection**: Admin sessions use `httpOnly`, `sameSite=strict`, and HTTPS cookies to prevent XSS credential theft.
- **Strict Headers**: Configured with Content-Type nosniff, frame denial, and referrer protection in `next.config.ts`.
