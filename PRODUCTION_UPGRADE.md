# PRODUCTION UPGRADE — Demo to Production-Grade

> **Purpose**: Self-contained spec for Claude Code. Read this file and execute all changes described below to upgrade the Socio Lead Intelligence app from demo mode to production quality.

## Overview

The app is deployed on Vercel with real Bonfire data (249+ Utah opportunities) flowing in daily via cron. Currently in demo mode: single hardcoded user with `password123`, stub pages (Analytics, Calendar), no AI brief generation endpoint, fictional team names, and debug logging exposed. This spec upgrades it for the production team: Tyler Dial, Ruth Hardy, Ben Gibbs, and Lance Erikson.

---

## Workstream 1: Seed Data & Auth Cleanup

### 1a. Update `prisma/seed.ts`
- Change user from `Tyler Martinez / tyler@socio-analytics.com / password123` to `Tyler Dial / tyler@dialedintelligence.com` with a strong password (e.g. `Socio!Lead2026$`)
- Replace fictional TeamMembers with:
  - Tyler Dial — tyler@dialedintelligence.com
  - Ruth Hardy — ruth@dialedintelligence.com
  - Ben Gibbs — ben@dialedintelligence.com
  - Lance Erikson — lance@dialedintelligence.com

### 1b. Update `app/(auth)/login/page.tsx`
- Remove the demo credentials paragraph: `<p className="text-xs ...">Demo: tyler@socio-analytics.com / password123</p>`
- Update placeholder in email input from `tyler@socio-analytics.com` to generic `you@company.com`

### 1c. Update `app/api/auth/login/route.ts`
- In the catch block, replace `return NextResponse.json({ error: message }, ...)` with `return NextResponse.json({ error: "Internal server error" }, { status: 500 })` — do not expose internal error messages

---

## Workstream 2: AI Brief Generation (OpenAI gpt-4o-mini)

### 2a. Install dependency
```bash
npm install openai
```

### 2b. Create `lib/ai.ts`
```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface BriefInput {
  title: string;
  description: string | null;
  issuingOrg: string | null;
  category: string | null;
  estimatedValue: number | null;
  locationState: string | null;
  locationCountry: string;
  deadline: string | null;
  icpScore: number | null;
  tier: string | null;
}

interface GeneratedBrief {
  summary: string;
  fitAnalysis: string;
  strengths: string[];
  concerns: string[];
  recommendation: "PURSUE" | "CONSIDER" | "PASS";
}

export async function generateBrief(input: BriefInput): Promise<GeneratedBrief> {
  const prompt = `You are an analyst for a social-impact consulting firm (Socio Analytics) based in Utah. Analyze this government contracting opportunity and provide a structured intelligence brief.

OPPORTUNITY:
Title: ${input.title}
Issuing Organization: ${input.issuingOrg || "Unknown"}
Description: ${input.description || "No description available"}
Category: ${input.category || "Unspecified"}
Estimated Value: ${input.estimatedValue ? `$${input.estimatedValue.toLocaleString()}` : "Not specified"}
Location: ${input.locationState || "N/A"}, ${input.locationCountry}
Deadline: ${input.deadline || "Not specified"}
ICP Score: ${input.icpScore ?? "Not scored"}/100 (${input.tier || "Unranked"})

Respond with ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentence executive summary of the opportunity",
  "fitAnalysis": "2-3 sentences on how this aligns with a Utah-based social impact research & evaluation firm",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendation": "PURSUE" | "CONSIDER" | "PASS"
}

Guidelines:
- PURSUE: Strong fit (score 75+, relevant sector, good geography)
- CONSIDER: Moderate fit (score 50-74, adjacent sector or distant geography)
- PASS: Poor fit (score <50, unrelated sector, or significant barriers)
- Be specific and actionable, not generic
- Reference the firm's Utah base and social-impact focus`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 800,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from OpenAI");

  return JSON.parse(content) as GeneratedBrief;
}
```

### 2c. Create `app/api/opportunities/[id]/brief/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateBrief } from "@/lib/ai";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: params.id },
    });
    if (!opportunity) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const brief = await generateBrief({
      title: opportunity.title,
      description: opportunity.description,
      issuingOrg: opportunity.issuingOrg,
      category: opportunity.category,
      estimatedValue: opportunity.estimatedValue,
      locationState: opportunity.locationState,
      locationCountry: opportunity.locationCountry,
      deadline: opportunity.deadline?.toISOString() ?? null,
      icpScore: opportunity.icpScore,
      tier: opportunity.tier,
    });

    const updated = await prisma.opportunity.update({
      where: { id: params.id },
      data: {
        aiBrief: brief as any,
        aiGeneratedAt: new Date(),
      },
      include: {
        assignedTo: true,
        matchedKeywords: { include: { keyword: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Brief generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate brief" },
      { status: 500 }
    );
  }
}
```

### 2d. Create `hooks/use-ai-brief.ts`
```typescript
"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Opportunity } from "@/types";

export function useGenerateBrief() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string): Promise<Opportunity> => {
      const res = await fetch(`/api/opportunities/${opportunityId}/brief`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate brief");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["opportunity"] });
    },
  });
}
```

### 2e. Update `components/opportunities/opportunity-modal.tsx`
- Import `useGenerateBrief` from `@/hooks/use-ai-brief`
- Import `Sparkles`, `Loader2` from `lucide-react`
- Add a "Generate Brief" button just above the existing `{opportunity.aiBrief && <AIBrief ... />}` block
- Button shows loading spinner while generating
- On success, the existing AIBrief component renders the result

### Environment Variable
Add `OPENAI_API_KEY` to `.env` locally and to Vercel environment variables.

---

## Workstream 3: Analytics Page

### 3a. Install dependency
```bash
npm install recharts
```

### 3b. Create `app/api/analytics/route.ts`
Returns aggregated metrics from the database:
- `byTier`: { HOT: n, WARM: n, COOL: n, COLD: n }
- `bySource`: { UTAH_BONFIRE: n, SAM_GOV: n, ... }
- `byStatus`: { NEW: n, REVIEWING: n, PURSUING: n, ... }
- `pipelineValue`: total estimatedValue of active opportunities
- `teamAssignments`: [{ name, count }]
- `weeklyTrend`: [{ week, count }] for last 12 weeks
- `scoreDistribution`: [{ range, count }] histogram (0-20, 20-40, 40-60, 60-80, 80-100)
- `totalCount`, `avgScore`

### 3c. Create `hooks/use-analytics.ts`
React Query hook that fetches `/api/analytics`.

### 3d. Rewrite `app/(dashboard)/analytics/page.tsx`
- Must be a `"use client"` page
- Row 1: Summary cards (Total, Avg Score, Pipeline Value, Active Sources)
- Row 2: Tier donut chart (recharts `PieChart`) + Source bar chart
- Row 3: Status bar chart + Team assignments bar chart
- Row 4: Weekly trend line chart (full width, `LineChart`)

---

## Workstream 4: Calendar Page

### Rewrite `app/(dashboard)/calendar/page.tsx`
- `"use client"` page
- Custom month-grid calendar (no extra dependencies)
- Fetch opportunities via existing `useOpportunities` hook
- Group opportunities by deadline date
- Each day cell shows count + tier-color dots (red=HOT, amber=WARM, blue=COOL, gray=COLD)
- Click a day to see the list of opportunities with deadlines on that date
- Previous/Next month navigation with today button
- "No Deadline" section below the grid for opportunities without a deadline

---

## Workstream 5: Production Hardening

### 5a. Create `middleware.ts` (project root)
```typescript
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC_PATHS = ["/login", "/api/auth", "/api/scraper", "/api/health"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Also allow static assets and Next.js internals
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

### 5b. Validate status enum in `app/api/opportunities/[id]/route.ts`
In the PATCH handler, validate `status` against allowed values `["NEW","REVIEWING","PURSUING","PASSED","WON","LOST"]` before updating. Return 400 if invalid.

### 5c. Handle Prisma P2025 in `app/api/team/[id]/route.ts`
Catch `PrismaClientKnownRequestError` with code `P2025` and return 404 instead of 500.

### 5d. Protect `app/api/health/route.ts`
Add CRON_SECRET bearer token check (same pattern as scraper routes).

---

## Workstream 6: Production Database Update Script

### Create `scripts/update-production-user.ts`
Script to run once against production DB to:
1. Update the existing User record: name → "Tyler Dial", email → "tyler@dialedintelligence.com", password → hashed strong password
2. Delete all existing TeamMembers
3. Create 4 TeamMembers: Tyler Dial, Ruth Hardy, Ben Gibbs, Lance Erikson
4. Run via: `npx tsx scripts/update-production-user.ts`

---

## New Environment Variables
| Variable | Where | Notes |
|----------|-------|-------|
| `OPENAI_API_KEY` | `.env` + Vercel | From OpenAI dashboard |
| `CRON_SECRET` | Already set | Used by scrapers + health |

## Implementation Order
1. Workstream 5 — hardening foundations
2. Workstream 1 — remove demo artifacts
3. Workstream 2 — AI briefs (highest-impact feature)
4. Workstream 3 — analytics charts
5. Workstream 4 — calendar view
6. Workstream 6 — DB migration script
7. `npm run build` to verify zero errors
8. Git commit and push → Vercel auto-deploys

## Verification Checklist
- [ ] `npm run build` — zero TypeScript errors
- [ ] Login with new credentials → sidebar shows "Tyler Dial"
- [ ] Unauthenticated visit to `/` → redirected to `/login`
- [ ] Open opportunity → click "Generate Brief" → AI brief renders
- [ ] `/analytics` → charts render with real Bonfire data
- [ ] `/calendar` → month grid shows deadlines
- [ ] PATCH opportunity with invalid status → 400 error
- [ ] Deploy to Vercel → all features work
