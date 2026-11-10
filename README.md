# ApplyPilot

A local-first job application assistant. It finds jobs on **Indeed** that match your filters, scores them against your skills, writes a tailored resume and cover letter for each job, and submits applications. **By default, every submission waits for your approval.** Every application is logged so you never apply to the same job twice.

Runs on your own machine only (not Vercel or serverless): the browser session has to persist, and a home IP is less likely to be flagged.

## Status

| Phase | Scope | Status |
|---|---|---|
| 1 | Scaffold, settings/filters, master resume (upload + form), answer bank | ✅ Done |
| 2 | Worker, persistent Indeed login, search & listing parse (read-only) | ⏳ |
| 3 | Scoring, tailoring, cover letter, PDF, review queue | ⏳ |
| 4 | Indeed "Easily apply" flow, daily cap, pacing, `NEEDS_USER` pauses | ⏳ |
| 5 | Google Sheets sync + `.xlsx` export | ⏳ |
| 6 | Hardening, retries, logs, tests | ⏳ |

## Features (Phase 1)

Setup is **resume first**: the dashboard checklist and the nav go Resume → Settings → Answer bank.

- **Master resume** (`/resume`): upload a PDF/DOCX and the LLM extracts it into structured JSON. You review the result in the form and save it, and nothing is saved automatically. You can also fill in the form by hand. The parse prompt forbids inventing anything: fields missing from the file stay empty. After saving, a **Next: set your filters** link takes you to Settings.
- **Settings** (`/settings`): role keywords, skills & tools, work setup, location, expected salary, job type, date posted, minimum match score (default 70), daily application limit, and run mode. Review mode is the default. Turning on auto mode requires confirmation.
  - **Pre-filled from your resume:** if your saved role keywords or skills are empty, they start with your resume's job titles (headline + experience) and skills. Nothing is saved until you click Save.
  - **Fill from resume** button: adds any resume titles and skills that are missing, without removing what you already have.
  - Without a saved resume, Settings shows a banner linking to the Resume page.
- **Answer bank** (`/answer-bank`): stored answers to screening questions (years per skill, salary, notice period, work authorization, relocation…), with tags.
- **Dashboard** (`/`): a setup checklist.
- **Role & skill suggestions:** role keywords and skills fields suggest common job titles and skills from every field (healthcare, retail, trades, finance, tech and others), grouped by category. You can always type your own and press Enter. To change the lists, edit `src/constants/jobTitles.json` and `src/constants/skills.json` (format: `{ "Category": ["Title", ...] }`).
- **Skills follow your roles:** in Settings, Role keywords show a **"From your resume"** group (your headline and job titles) first. The Skills & tools list shows a **"From your resume"** group first (skills on your saved master resume), then **"Suggested for your roles"** (skills that fit the role keywords you picked), then everything else. `src/constants/roleSkillMap.json` maps each job-title category to its skill categories. Picking a role never adds skills. Only the resume pre-fill and the Fill from resume button add skills, and only ones already on your resume.

## Tech Stack

Next.js 16 (App Router, Cache Components) · TypeScript · MUI v9 + Emotion · MUI X DataGrid · TanStack Query · Prisma 7 + SQLite (`better-sqlite3` adapter) · Anthropic SDK · zod

## Getting Started

```bash
npm install                     # also runs `prisma generate`
# create .env and .env.local (both gitignored) — see Environment Variables below
npx prisma migrate dev          # creates data/app.db
npm run dev                     # http://localhost:3000
```

## Environment Variables

Two gitignored files in the project root. Both are loaded by the dashboard, the worker and Prisma; `.env.local` wins if a key is in both.

```bash
# .env
DATABASE_URL=file:./data/app.db

# .env.local
ANTHROPIC_API_KEY=
LLM_MODEL=claude-opus-5-5
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_JSON_PATH=
```

The database itself is the file `data/app.db` (gitignored). Browse it with `npx prisma studio`.

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` (`.env`) | Yes | SQLite file, e.g. `file:./data/app.db` |
| `ANTHROPIC_API_KEY` | For resume parsing (and later scoring/tailoring) | Anthropic API key |
| `LLM_MODEL` | Yes | Claude model ID, e.g. `claude-opus-5-5` |
| `GOOGLE_SHEETS_ID` | Phase 5 | Target spreadsheet ID |
| `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` | Phase 5 | Path to the service-account JSON (keep it out of git) |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dashboard in dev mode |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `postinstall` | `prisma generate` (runs automatically after `npm install`) |
| `npx prisma migrate dev` | Apply/create migrations |
| `npx prisma studio` | Browse the database |

## Project Layout

```
src/
├── app/            # Pages + thin API routes (validate → service → response)
├── components/     # shared/ UI primitives + one folder per feature
├── services/       # Business logic + all Prisma access
├── lib/            # prisma, config (only place env is read), anthropic, queryClient
├── hooks/          # TanStack Query hooks, one per resource
├── constants/      # Values shared by client and server
├── types/          # zod schemas + types
└── generated/      # Prisma client (generated, gitignored)
prisma/             # schema + migrations
data/               # Local only (gitignored): app.db, browser profile, resumes, error screenshots
```

## Rules ApplyPilot Follows

- No stored passwords. You log in to Indeed yourself, once, in a persistent browser profile.
- Never fabricates skills, employers, dates, titles or credentials.
- Never submits without approval unless you turn on auto mode.
- CAPTCHA, verification, or an unknown form state pauses the run and hands control back to you.
- Indeed's terms restrict automated use, so volume stays low and pacing stays human-like.
