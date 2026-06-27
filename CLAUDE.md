# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

---

# Research Desk — Project Guide

## What this app does

A research desk for structured content creation. Sources (Reddit, TikTok, etc.) are captured in an Inbox, distilled into Ideas (Kanban board), and then turned into AI-generated Article drafts via Anthropic.

Full workflow: `Source → Idea → Article Draft → Article`

## Tech Stack

- **Next.js 16** — App Router, TypeScript, `app/(app)/` for UI routes, `app/api/` for API routes
- **Prisma 7** — SQLite via `@prisma/adapter-better-sqlite3` (`PrismaBetterSqlite3` class, `{ url: "file:/absolute/path" }`)
- **Tailwind CSS v4** — `@theme` block for design tokens
- **Anthropic SDK** — AI draft generation, model from `ANTHROPIC_MODEL` env var

## Dev Commands

```bash
npm run dev          # start dev server (port 3000)
npx prisma migrate dev --name <name>   # schema migration
npx prisma generate  # regenerate client after schema change
npx tsx prisma/seed.ts                 # seed Thailand location data + link templates
npx jest             # run regression tests
```

## Architecture: Critical Constraint

**Source → Idea → Article is the only allowed path.**

`Source.rawText` must NEVER reach the AI prompt. This is enforced structurally:
- `lib/idea-reader.ts` reads only Idea-level data, never joins the Source table
- `app/api/ideas/[id]/generate-draft/route.ts` only calls `readIdeaForPrompt()`
- Regression tests in `__tests__/no-rawtext-in-prompt.test.ts` guard this

Do not break this constraint under any circumstances.

## Database

- File: `prisma/dev.db` (SQLite)
- Config: `prisma.config.ts` (Prisma 7 config file — required)
- Seed: `prisma/seed.ts` — 83 Thailand locations + template-location link
- `.env`: `DATABASE_URL`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `EXPORT_MODE`, `EXPORT_DIR`

## Design Tokens

| Token | Value |
|-------|-------|
| Background | `#EBE5D9` |
| Sidebar | `#17263A` |
| Amber (primary) | `#C8892E` |
| Card background | `#F4EFE6` |
| Cream | `#FDFAF6` |
| Border | `#D8CFBF` |
| Muted text | `#A89C8E` |
| Body text | `#1F1A13` |

## Key Files

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | DB schema (Location, Source, Idea, Article, PromptTemplate, …) |
| `lib/types.ts` | All shared TypeScript types and label maps |
| `lib/idea-reader.ts` | Safe idea loader for AI prompts (no rawText) |
| `lib/prisma.ts` | Prisma client singleton |
| `components/Sidebar.tsx` | App navigation |
| `components/LocationPicker.tsx` | Cascading location select (N levels deep) |
| `components/ui.tsx` | Shared UI primitives (Button, Badge, LocationCrumb, …) |
| `app/(app)/settings/page.tsx` | Prompt Templates + Topic Areas management |
| `docs/workflow.md` | End-to-end user workflow documentation |

## Location Hierarchy

```
Country → Region → Province → District → Place / Ort → Hotel / Restaurant / Shop / Attraction / Other POI
```

Seeded: 1 Thailand country + 6 regions + 76 provinces = 83 locations.

## Prompt Templates

Template variables: `{{title}}`, `{{category}}`, `{{area}}`, `{{sourceCount}}`, `{{credibility}}`, `{{summary}}`, `{{researchNotes}}`, `{{date}}`

Template resolution order when generating a draft:
1. Explicit `templateId` in request body
2. Template linked to idea's location (or nearest ancestor location)
3. Global default template (`isDefault: true`)
