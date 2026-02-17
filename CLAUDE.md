# CLAUDE.md — Socio Lead Intelligence

## Project Overview

Socio Lead Intelligence is a lead qualification and pipeline management tool for Socio Analytics. It scrapes government contracting opportunities (SAM.gov, Bonfire, BidNet, World Bank, UNDP, UNGM), scores them against an Ideal Customer Profile (ICP), and presents a prioritized pipeline with AI-generated briefs.

## Tech Stack

- **Framework:** Next.js 14.2 (App Router) with TypeScript 5
- **Database:** PostgreSQL via Supabase, managed with Prisma 6
- **State Management:** TanStack React Query 5
- **UI:** Tailwind CSS 3.4 + shadcn/ui (Radix primitives) + Lucide icons
- **Auth:** JWT sessions (jose) with bcryptjs password hashing, HTTP-only cookies
- **Fonts:** DM Sans (body/sans), Inter (headings + monospace/numbers)

## Project Structure

```
app/
  (auth)/login/          Login page (unprotected)
  (dashboard)/           All protected pages share auth guard layout
    page.tsx             Dashboard
    opportunities/       Full opportunity browser
    filtering/           Keywords + scoring weights
    team/                Team management
    calendar/, analytics/, settings/  Placeholder pages
  api/                   RESTful route handlers
    auth/                login, logout, me
    opportunities/       CRUD + filtering
    keywords/            CRUD + categories + stats
    scoring-config/      GET/PATCH scoring weights
    team/, stats/
components/
  ui/                    shadcn/ui primitives (do not edit directly)
  layout/                Sidebar, Header
  dashboard/             Metric cards, opportunity cards, tier sections
  opportunities/         Modal, score badge, AI brief, score breakdown
  keywords/              Table, badge, add dialog, detail modal
  filtering/             Scoring weights sliders
  shared/                Loading skeletons, empty states
  providers.tsx          QueryClientProvider (staleTime: 60s)
hooks/                   React Query hooks (use-*.ts)
lib/
  db.ts                  Prisma singleton
  auth.ts                JWT + password functions
  scoring.ts             ICP scoring algorithm (weighted, configurable)
  utils.ts               cn() helper, formatCurrency, formatSource
  generated/prisma/      Generated Prisma client (gitignored)
types/index.ts           All TypeScript interfaces
prisma/
  schema.prisma          7 models, 4 enums
  seed.ts                Demo data seeder
```

## Critical Conventions

### Prisma 6 Client Path
Prisma 6 generates to a custom output path. **Always import from:**
```ts
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Prisma } from "@/lib/generated/prisma/client";
```
Never import from `@prisma/client` — it won't resolve.

### Import Alias
Use `@/*` for all imports (configured in tsconfig.json):
```ts
import { prisma } from "@/lib/db";
import type { Opportunity } from "@/types";
```

### API Route Typing
Use Prisma's generated types for query inputs — avoid `Record<string, unknown>` for create/update:
```ts
const data: Prisma.KeywordCreateInput = { term, type };
const where: Prisma.OpportunityWhereInput = {};
const sortOrder = value as Prisma.SortOrder;
```

### Component Patterns
- All pages and interactive components use `"use client"` directive
- shadcn/ui components live in `components/ui/` — don't modify directly
- Icons use Lucide with `strokeWidth={1.5}` for consistent sharp appearance
- Headings use `font-heading` class (Inter), body uses default `font-sans` (DM Sans)
- Text colors: use `text-zinc-600`+ for readable contrast (not zinc-400/500)

### Hook Pattern
Each data domain has a hook file with query + mutation hooks:
```ts
// hooks/use-keywords.ts
export function useKeywords(filters) { ... }     // useQuery
export function useCreateKeyword() { ... }        // useMutation + invalidate
```
Mutations invalidate their parent query key on success.

### Error Handling in API Routes
```ts
} catch (err: unknown) {
  // For Prisma unique constraint violations:
  if (err && typeof err === "object" && "code" in err && err.code === "P2002") { ... }
  // For not found:
  if (err.code === "P2025") { ... }
}
```

## Database

### Key Models
- **User** — Single admin user (login credentials)
- **Opportunity** — Leads with ICP scoring, AI briefs (stored as JSON), tier classification
- **Keyword** — INCLUDE/EXCLUDE filter terms with HIGH/MEDIUM/LOW confidence tiers
- **OpportunityKeyword** — Junction table for keyword-opportunity matches
- **ScoringConfig** — Singleton row (`id: "default"`) storing adjustable weights
- **TeamMember** — Assignable team members
- **ScraperRun** — Scraping audit log

### Migrations
```bash
npx prisma migrate dev --name description    # Local development
npx prisma migrate deploy                    # Production (Supabase)
npx prisma db seed                           # Seed demo data
```

### Scoring Engine (lib/scoring.ts)
Four dimensions (Budget, Sector, Geography, Timing) with configurable weights stored in ScoringConfig. Formula:
```
rawScore = (budget×wB + sector×wS + geography×wG + timing×wT) / (wB+wS+wG+wT)
finalScore = isUtah ? min(100, rawScore × utahMultiplier) : rawScore
```
Tiers: HOT (≥80), WARM (≥60), COOL (≥40), COLD (<40)

## Environment Variables

```
DATABASE_URL=    # Supabase pooled connection (port 6543, ?pgbouncer=true)
DIRECT_URL=      # Supabase session pooler (port 5432, for migrations)
AUTH_SECRET=     # JWT signing key
```

**Gotcha:** If the database password contains `$`, it must be URL-encoded as `%24` in `.env` (dotenv expands `$` as variable references).

## Build & Deploy

```bash
npm run dev              # Local dev server
npm run build            # prisma generate && next build
npm run lint             # ESLint check
```

- **Hosting:** Vercel
- **Database:** Supabase PostgreSQL
- `postinstall` hook runs `prisma generate` for Vercel builds
- `prisma.config.ts` uses `process.env` (not Prisma's `env()`) to avoid crashes when env vars are missing during install

## Demo Credentials

- **Email:** tyler@socio-analytics.com
- **Password:** password123
