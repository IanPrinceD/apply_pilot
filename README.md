# ApplyPilot

A job application assistant. It finds jobs that match your filters, scores them against your skills, writes a tailored resume and cover letter for each job, and helps you fill in applications. **You always click Submit yourself.** Every application is tracked so you never apply to the same job twice.

**Local-first, deploy-ready.** ApplyPilot runs on your own PC today: local Postgres, local file storage, and no paid services. Every external service sits behind a setting, so moving it to the cloud (Vercel + Neon + Cloudflare R2) later only means changing env values. See [Deploy later](#deploy-later).

## Status

| Phase | Scope | Status |
|---|---|---|
| 0 | Platform: Postgres, storage driver, validated config, deploy-ready setup | ✅ Done |
| 1 | Accounts (Better Auth), per-user data | ⏳ |
| 2 | Job sources (official job APIs), daily search | ⏳ |
| 3 | Scoring, tailoring, cover letter, PDF, review queue | ⏳ |
| 4 | Browser extension: save, tailor, autofill (you submit) | ⏳ |
| 5 | Billing (off when running locally) | ⏳ |
| 6 | History + `.xlsx` export | ⏳ |
| 7 | Hardening, tests | ⏳ |

Earlier work: the scaffold, settings, master resume and answer bank pages are done. A Playwright worker that searched Indeed directly was retired: Indeed blocks automated browsers, so jobs now come from official APIs and the extension instead.

## Features

Setup is **resume first**: the dashboard checklist and the nav go Resume → Settings → Answer bank.

- **Master resume** (`/resume`): upload a PDF/DOCX and the LLM extracts it into structured JSON. You review the result in the form and save it, and nothing is saved automatically. You can also fill in the form by hand. The parse prompt forbids inventing anything: fields missing from the file stay empty. After saving, a **Next: set your filters** link takes you to Settings.
- **Settings** (`/settings`): role keywords, skills & tools, work setup, location, expected salary, job type, date posted, minimum match score (default 70), daily application limit, run mode, and an optional daily search time.
  - **Pre-filled from your resume:** if your saved role keywords or skills are empty, they start with your resume's job titles (headline + experience) and skills. Nothing is saved until you click Save.
  - **Fill from resume** button: adds any resume titles and skills that are missing, without removing what you already have.
  - Without a saved resume, Settings shows a banner linking to the Resume page.
  - **Salary currency** is a searchable picker of every ISO currency (type "peso" or "PHP"). Common ones (PHP, USD, SGD, AUD, EUR, GBP) come first; the default is PHP. The list lives in `src/constants/currencies.json`.
- **Answer bank** (`/answer-bank`): stored answers to screening questions (years per skill, salary, notice period, work authorization, relocation…), with tags.
- **Dashboard** (`/`): a setup checklist.
- **Role & skill suggestions:** role keywords and skills fields suggest common job titles and skills from every field (healthcare, retail, trades, finance, tech and others), grouped by category. You can always type your own and press Enter. To change the lists, edit `src/constants/jobTitles.json` and `src/constants/skills.json` (format: `{ "Category": ["Title", ...] }`).
- **Skills follow your roles:** in Settings, Role keywords show a **"From your resume"** group (your headline and job titles) first. The Skills & tools list shows a **"From your resume"** group first (skills on your saved master resume), then **"Suggested for your roles"** (skills that fit the role keywords you picked), then everything else. `src/constants/roleSkillMap.json` maps each job-title category to its skill categories. Picking a role never adds skills. Only the resume pre-fill and the Fill from resume button add skills, and only ones already on your resume.

## Tech Stack

Next.js 16 (App Router, Cache Components) · TypeScript · MUI v9 + Emotion · MUI X DataGrid · TanStack Query · Prisma 7 + PostgreSQL (`@prisma/adapter-pg`) · storage driver (local disk / Cloudflare R2) · Anthropic SDK · zod

## Run Locally

You need Node.js 20+ and PostgreSQL (tested with 18).

```bash
npm install                                # also runs `prisma generate`
createdb -U postgres applypilot            # once: create the database
# create .env and .env.local (both gitignored), see Environment Variables
npx prisma migrate dev                     # creates the tables
npm run dev                                # http://localhost:3000
```

Browse the database with `npx prisma studio`. Uploaded files are stored under `data/uploads/` (gitignored).

## Environment Variables

Two gitignored files in the project root. `.env.local` wins if a key is in both. All values are read and validated in `src/lib/config.ts`; the app stops at startup with a clear list if something is wrong.

```bash
# .env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/applypilot

# .env.local
ANTHROPIC_API_KEY=
LLM_MODEL=claude-opus-5-5
```

Everything else has a local default, so you don't need to set it on your PC:

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` (`.env`) | (required) | Postgres URL. Locally your own Postgres; when deployed, Neon's **pooled** URL |
| `DIRECT_URL` | unset | Neon's **direct** (non-pooled) URL, used only by `prisma migrate`. Leave unset locally |
| `ANTHROPIC_API_KEY` | unset | Needed for resume parsing (and later scoring/tailoring) |
| `LLM_MODEL` | `claude-opus-5-5` | Claude model ID |
| `APP_URL` | `http://localhost:3000` | Public base URL of the site |
| `STORAGE_DRIVER` | `local` | `local` (files in `data/uploads/`) or `r2` (Cloudflare R2) |
| `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET` | unset | Required only when `STORAGE_DRIVER=r2` |
| `EMAIL_DRIVER` | `console` | How auth emails are sent. `console` prints them in the terminal (Phase 1) |
| `BILLING_ENABLED` | `false` | When `false`, every user is unlimited (Phase 5) |
| `CRON_SECRET` | unset | Protects the scheduled-search route when deployed (Phase 2) |
| `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_JSON_PATH` | unset | Optional Google Sheets export (Phase 6) |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the app in dev mode |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `postinstall` | `prisma generate` (runs automatically after `npm install`) |
| `npx prisma migrate dev` | Create/apply migrations (local) |
| `npx prisma migrate deploy` | Apply migrations when deployed |
| `npx prisma studio` | Browse the database |

## Deploy Later

Nothing here is needed to use ApplyPilot on your own PC. When you're ready to open it to others:

1. **Neon:** create a project in **AWS Asia Pacific (Singapore)**. Copy the pooled URL (`DATABASE_URL`) and the direct URL (`DIRECT_URL`).
2. **Cloudflare R2:** create a bucket and an API token with read/write access to it. Set `STORAGE_DRIVER=r2` and the four `R2_*` values.
3. **Vercel:** import the GitHub repo. `vercel.json` already pins the functions region to `sin1` (Singapore) and adds the daily search cron. Add the env variables above in Project → Settings → Environment Variables, with `APP_URL` set to the site's URL, plus a random `CRON_SECRET`.
4. **Database:** run `npx prisma migrate deploy` with `DATABASE_URL`/`DIRECT_URL` pointing at Neon.
5. **Before taking payments:** Vercel's free Hobby plan is for non-commercial use only. Upgrade to Pro and connect a domain first.

## Project Layout

```
src/
├── app/            # Pages + thin API routes (validate → service → response)
├── components/     # shared/ UI primitives + one folder per feature
├── services/       # Business logic + all Prisma access
├── lib/            # prisma, config (only place env is read), anthropic, storage/, queryClient
├── hooks/          # TanStack Query hooks, one per resource
├── constants/      # Values shared by client and server
├── types/          # zod schemas + types
└── generated/      # Prisma client (generated, gitignored)
prisma/             # schema + migrations
vercel.json         # Region + cron for the future deploy
data/               # Local only (gitignored): uploads/
```

## Rules ApplyPilot Follows

- Never asks for, stores or types your job-site passwords.
- Never fabricates skills, employers, dates, titles or credentials.
- Never submits an application. You review and click Submit.
- Never automates job sites or bypasses CAPTCHAs. Jobs come from official APIs, and the extension only helps on pages you open yourself.
