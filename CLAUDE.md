# CLAUDE.md — ApplyPilot

@AGENTS.md

`AGENTS.md` holds the Next.js-generated agent rules for this Next.js version. Read it alongside this file.

## Project
ApplyPilot is a job application assistant built as a **subscription SaaS** and run **local-first**. The owner uses it on their own PC now. The same code deploys to the cloud (Vercel + Neon + R2) later with env changes only.

- It finds jobs through **official job APIs** and scores them against the user's skills.
- It writes a tailored resume and cover letter for each job.
- A **browser extension** in the user's own browser autofills application forms. **The user always clicks Submit.**
- Every application is tracked so no job is ever applied to twice.

Full architecture: `docs/saas-architecture.md` (local-only, gitignored).

The user is a full-stack JS/TS developer (Next.js). Keep explanations brief; use analogies for new concepts.

---

## Stack
- **Framework:** Next.js 16 (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **UI:** Material UI v9 + `@emotion/styled`; **MUI X DataGrid** (`@mui/x-data-grid`) for all tables
- **Data fetching:** TanStack Query
- **Database:** Prisma 7 + **PostgreSQL** (`@prisma/adapter-pg`). Local Postgres now; Neon (Singapore) when deployed.
- **Files:** storage driver in `src/lib/storage`. Local `data/uploads/` now; Cloudflare R2 when deployed.
- **Auth:** Better Auth (Phase 1). Users live in Postgres, and every row is scoped by `userId`.
- **Browser extension:** Chrome MV3 in `extension/` (Phase 4). It talks to the site's API with a per-device token.
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`); model set via `LLM_MODEL`. All AI runs server-side.
- **Validation:** zod (forms, LLM JSON output, job API data)
- **Resume PDF:** `@react-pdf/renderer`
- **Export:** `exceljs` for `.xlsx`; Google Sheets (`googleapis`) optional
- **Billing:** Paddle or Lemon Squeezy (Phase 5). Off locally (`BILLING_ENABLED=false`).

**Local-first, deploy-ready.**
- Every external service sits behind an env-selected **driver** (local ↔ cloud). Code must behave the same in both.
- Never hard-code `localhost` or a domain; use `config.appUrl`.
- The deploy target is Vercel, region `sin1` (the target market is the Philippines). **Don't deploy, and don't add paid services, until the owner says so.** See the spending timeline in the plan doc.

**No automation of job sites.** Indeed blocks automated browsers through Cloudflare.
- Never drive job sites with Playwright or headless browsers.
- Never add stealth plugins, fingerprint spoofing or CAPTCHA solving.
- Jobs come from official APIs. The extension only assists on pages the user has opened, and the user submits.

---

## Folder Structure
```
src/
├── app/                # Pages, layouts, API routes (thin), providers.tsx
├── components/
│   ├── shared/         # Pure UI primitives — no API calls, no business logic
│   ├── jobs/           # Feature components, one folder per feature
│   ├── review/
│   ├── resume/
│   ├── settings/
│   └── history/
├── services/           # Business logic + all Prisma access (used by API routes, cron, and the extension API)
├── lib/                # Integrations: prisma.ts, config.ts, queryClient.ts, anthropic.ts, storage/
├── hooks/              # TanStack Query hooks (one per resource) + other hooks
├── constants/          # Values shared by client components AND server code
├── utils/              # Pure helpers
├── types/              # Shared interfaces/types
├── styles/             # theme.ts + global styles
└── generated/          # Generated Prisma client — never edit by hand
extension/              # Chrome MV3 extension (Phase 4)
prisma/schema.prisma
prisma.config.ts        # Prisma 7 config (repo root) — do not delete
vercel.json             # Region + crons for the future deploy
docs/                   # Local-only planning docs (gitignored)
data/                   # Local-only (gitignored): uploads/ (local storage driver), errors/
```

---

## Commands
- `npm run dev`: the app on http://localhost:3000
- `npm run build` / `npm start`
- `npm run lint`
- `npm run test`: Vitest (`src/**/*.test.ts`)
- `npx prisma migrate dev` / `npx prisma generate` / `npx prisma studio`
- `npx prisma migrate deploy`: apply migrations at deploy time

---

## Workflow
- Before making any changes, give a step-by-step plan and wait for approval.
- For any continuation or multi-session task that extends an existing feature or pattern, first read and analyze the original implementation, and base the plan on it.
- **No `Co-Authored-By` (or any AI attribution) in commits or PRs.** Plain subject + body only.
- **Never commit or push without asking.** When a task is done, report what changed and ask for permission to commit, then ask separately before pushing. Approving a plan is not permission to commit.
- Finish and verify one build phase before starting the next. Run `npx tsc --noEmit` and `npm run lint` before reporting done.

---

## Core Flow
1. **Account.** The user signs up and logs in through Better Auth. Locally, auth emails are printed to the terminal (`EMAIL_DRIVER=console`). **Never ask for, store, or type passwords for job sites.**
2. **Filters.** Role keywords, skills & tools, work setup (remote/hybrid/onsite), location, expected salary, job type, date posted, minimum match score (default 70).
3. **Resume.** Upload (PDF/DOCX → parsed) or build in a form. Stored as a **master resume JSON** (zod-validated). The original file goes through the storage driver.
4. **Find jobs.** `JobSource` adapters for official/public job APIs. Searches run manually ("Search now") or on a daily schedule (a cron route: Vercel Cron in the cloud, `npm run cron` locally). Users can also save the job they're viewing through the extension.
5. **Score.** The LLM returns zod-validated JSON `{ score, matchedSkills, missingSkills, reasoning }`. Jobs below the threshold are skipped.
6. **Tailor.** A per-job resume (reordered and re-emphasized) + a cover letter when the form asks for one.
7. **Answer bank.** Stored answers to screening questions (years per skill, salary, notice period, work authorization, relocation). The LLM maps new question wording to stored answers. **If there's no confident match, set status `NEEDS_USER`. Never guess.**
8. **Review queue.** The user approves or edits each tailored application.
9. **Apply (extension).** On the job's page, the extension autofills the form from the approved application. **The user reviews and clicks Submit.** The extension never submits on its own.
10. **Track + dedupe.** Record every application before and after submission; export to `.xlsx` (Google Sheets optional).

Long AI work runs as queued tasks (the `Task` table, polled by the UI). No Redis.

### Job sites (extension)
- Dedupe key: the site's job id (Indeed: `jk` param). Secondary key: hash of normalized `company + title + location` (`src/utils/jobHash.ts`).
- Keep each site's selectors in one file (`extension/sites/<site>/selectors.ts`). Prefer role- and label-based lookups.
- CAPTCHA, verification, or an unknown form state → stop and tell the user. Never try to solve or bypass.
- External-redirect jobs are logged as `EXTERNAL_MANUAL` with the link.

### Data Model (minimum)
- `User`, `Session`, `Account` (Better Auth), `Device` (hashed extension tokens), `Subscription`, `UsageEvent`
- `Settings` (filters, dailyCap, mode, threshold, schedule), one per user
- `MasterResume` (JSON), `AnswerBankEntry` (question, answer, tags)
- `Job` (site, externalId, url, title, company, location, salary, description, score, scoreJson, firstSeenAt), with `@@unique([site, externalId])`
- `Application` (jobId, status enum `QUEUED | APPROVED | SUBMITTED | FAILED | SKIPPED | NEEDS_USER | EXTERNAL_MANUAL`, resumePath, coverLetter, submittedAt, error)
- `Task` (type, payload JSON, status, progress)
- Every user-owned model has `userId`. Services always filter by it.

### Spreadsheet Columns
Date | Company | Title | Location | Salary | Score | Status | Job URL | Resume version | Cover letter (Y/N) | Notes

### Hard Rules (Product)
- **Never fabricate** skills, employers, dates, titles, or credentials. Only rephrase, reorder, and emphasize what's in the master resume and answer bank.
- Never store or type passwords, card numbers, or government IDs.
- Never submit an application. The user clicks Submit.
- Check dedupe before tailoring (saves LLM cost) **and** before autofilling.
- Validate all LLM output with zod and retry once on failure.
- `data/`, `docs/`, `.env*`, and any service-account JSON are gitignored.

---

## Code Rules

### General
- TypeScript only (`.ts` / `.tsx`)
- Named exports only, except page/layout files in `src/app/`
- Every function gets a one-line JSDoc comment
- Always use arrow functions, never the `function` keyword
- camelCase for functions/variables, PascalCase for components/interfaces/types, SCREAMING_SNAKE_CASE for constants
- Always use the `@/` alias, never relative paths like `../../lib/prisma`
- Icons: `@mui/icons-material` first, then an SVG. Never unicode symbols.
- Never `any`; use `unknown` or a proper type
- Prefer `interface` for object shapes; use `type` for unions/primitives
- Styling: MUI components only, with no custom CSS files outside `src/styles/`. Use `sx` only for one-off layout tweaks; real styling goes in `.element.tsx`.
- **No raw HTML tags in JSX** (`div`, `span`, `p`, `button`, `a`, `ul/li`, `h1–h6`, `label`, `table…`). Use the MUI equivalent (`Box`/`Stack`, `Typography`, `Button`/`IconButton`, `Link`, etc.).
  - Exceptions: `<input type="file">`, `<form>` when native submit is needed, root `<html>`/`<body>`, `<li {...props}>` in `Autocomplete.renderOption`, and a `<span>` wrapping a disabled child in `Tooltip`. `styled('input')` etc. in a `.element.tsx` is fine for exception elements.

### Component Structure
```
src/components/shared/Button/
├── index.tsx            # logic + JSX
└── button.element.tsx   # styled components (@emotion/styled), named exports
```
- The styled file is `<componentName>.element.tsx` (camelCase, matching the folder name)
- `index.tsx` imports from `./<componentName>.element` and never defines styles inline
```tsx
import styled from '@emotion/styled';
import { Stack } from '@mui/material';

export const ActionsStack = styled(Stack)(({ theme }) => ({
  gap: theme.spacing(1),
  flexDirection: 'row',
}));
```

### Client/Server-Shared Config (`src/constants/`)
A value needed by both a `'use client'` component and server code (filter options, status labels, default settings) must live in `src/constants/<domain>.ts`, never inside a client component's folder. Next.js turns every export of a `'use client'` module into an opaque reference on the server.

### API Routes (`src/app/api/`)
- Routes never import `prisma`. They validate input (zod), call a `src/services/` function, and shape the response.
- Expected service failures carry an HTTP status: `throw Object.assign(new Error(message), { status })`. In the route:
  ```ts
  const status = (err as { status?: number }).status;
  if (status) return NextResponse.json({ error: err.message }, { status });
  throw err;
  ```
- Use Prisma transactions for multi-model writes.
- From Phase 1, every route gets the current user (`requireUser()`) and passes `userId` to services. Extension routes authenticate with a device token. Cron routes check `CRON_SECRET`.

### Services
- All business logic and DB access live in `src/services/`. Routes, cron and extension endpoints call the same services; never duplicate logic.

### Drivers (local ↔ cloud)
- Files: always go through `storage` from `@/lib/storage` (`put`, `get`, `delete`, `getUrl`). Never call `fs` or the R2/S3 SDK directly from services or routes.
- Email (Phase 1): an email driver (`console` locally, a provider when deployed).
- Billing (Phase 5): limits are checked in services. With `BILLING_ENABLED=false` every user is unlimited.
- A new external service gets a driver too, with a local default that costs nothing.

### Prisma 7
- Config lives in repo-root `prisma.config.ts`. Migrations use `DIRECT_URL` when set (Neon's direct connection), otherwise `DATABASE_URL`.
- The client is generated to `src/generated/prisma`; always import from `@/generated/prisma/client`, never `@prisma/client`.
- Single client in `src/lib/prisma.ts`; never instantiate elsewhere:
  ```ts
  import { PrismaPg } from '@prisma/adapter-pg';
  import { PrismaClient } from '@/generated/prisma/client';
  import { config } from '@/lib/config';

  const adapter = new PrismaPg({ connectionString: config.databaseUrl });
  export const prisma = new PrismaClient({ adapter });
  ```
- Postgres text matching is case-sensitive. Use `mode: 'insensitive'` for user-facing search.

### Environment Variables
- Access env only through `src/lib/config.ts` (zod-validated at startup). Never use `process.env` elsewhere.
- Only exception: the `NODE_ENV === 'development'` check gating `ReactQueryDevtools` in `providers.tsx`.
- `.env` (gitignored) holds only the database URL:
  ```
  DATABASE_URL=postgresql://postgres:<password>@localhost:5432/applypilot
  ```
- `.env.local` (gitignored) holds everything else and overrides `.env`. Driver settings default to local values, so locally only the AI keys are required:
  ```
  ANTHROPIC_API_KEY=
  LLM_MODEL=
  # Optional; local defaults shown
  APP_URL=http://localhost:3000
  STORAGE_DRIVER=local          # local | r2
  EMAIL_DRIVER=console
  BILLING_ENABLED=false
  CRON_SECRET=
  # Only when STORAGE_DRIVER=r2
  R2_ACCOUNT_ID=
  R2_ACCESS_KEY_ID=
  R2_SECRET_ACCESS_KEY=
  R2_BUCKET=
  # Only when deployed on Neon
  DIRECT_URL=
  ```
- When deployed, these values go in Vercel's Environment Variables settings.

### Data Fetching (TanStack Query)
- All fetching goes through `useQuery`/`useMutation` hooks in `src/hooks/`. Never raw `fetch` + `useState`/`useEffect` in a component.
- One hook per **resource** (jobs, applications, settings, resume, answer bank), shared across components.
- `QueryClient` lives in `src/lib/queryClient.ts` (`getQueryClient()`) and is wired once in `src/app/providers.tsx`.
- Query keys are array-based, feature-scoped, and colocated with the hook as a `<resource>Keys` factory:
  ```ts
  export const applicationsKeys = {
    all: ['applications'] as const,
    list: (status?: ApplicationStatus) => [...applicationsKeys.all, status ?? null] as const,
  };
  ```
- On success, mutations call `invalidateQueries({ queryKey: xKeys.all })` and report errors via `useToastQueue().showToast`, never local error state.
- Optimistic updates (e.g. approving or skipping in the review queue): `onMutate` snapshot + `setQueryData`, restore in `onError`, invalidate in `onSettled`.
- Use `refetchInterval` for live task progress (searches, tailoring queue).
- `ReactQueryDevtools` only in development.

### Global Route Files
- Always use the custom `src/app/not-found.tsx`, the global `src/app/loading.tsx`, and `src/app/error.tsx` (a Client Component that calls `console.error(error)` in a `useEffect`).

---

## Shared Component Catalog
Check this before building any UI. If a shared component covers 80% of the need, extend it without breaking existing usage. Never build inline duplicates.

| Component | Path | Use for |
|---|---|---|
| `ThemeRegistry` | `shared/ThemeRegistry/` | Emotion SSR cache (`AppRouterCacheProvider`). Mounted once in `providers.tsx`. |
| `Button` | `shared/Button/` | All buttons. `buttonType`: `submit`, `confirm`, `cancel` (outlined), `destructive` (red) |
| `Input` | `shared/Input/` | Single-line text fields |
| `Textarea` | `shared/Textarea/` | Multi-line fields (cover letter edit, answer bank) |
| `Dropdown` | `shared/Dropdown/` | Selects (work setup, job type, date posted), with a `searchable` option |
| `Modal` | `shared/Modal/` | General dialogs (application preview/edit) |
| `ConfirmModal` | `shared/ConfirmModal/` | Destructive or risky actions (skip, delete, cancel a subscription). Props: `title`, `description`, `icon`, `severity: 'error' \| 'warning' \| 'primary'`, `confirmButtonType`, `confirmLabel`, `cancelLabel`, `children?` |
| `PageTitle` | `shared/PageTitle/` | Every page heading. Props: `title`, `subtitle` (required on every page), `variant?`, `sx?`. The second word onward renders in `theme.palette.primary.main`. |
| `ToastQueueProvider` | `shared/ToastQueueProvider/` | All toasts via `useToastQueue().showToast(message, severity?)` |
| `LoadingState` | `shared/LoadingState/` | In-place loading (not route-level) |
| `DataTable` | `shared/DataTable/` | MUI X `DataGrid` wrapper with app defaults. Use for jobs, review queue, and history. Never use a raw `DataGrid`. |
| `StatusChip` | `shared/StatusChip/` | Colored `Chip` for application status (labels/colors from `src/constants/applicationStatus.ts`) |
| `ScoreBadge` | `shared/ScoreBadge/` | Match score display (color by threshold) |

---

## README
- After adding, changing, or removing a feature, update `README.md`.
- New env vars go in the Environment Variables section; new scripts go in the Scripts table.
- Keep the "Deploy later" checklist current when a phase adds a cloud service.

---

## Build Phases
Everything runs locally until the owner decides to deploy.
0. **Platform:** local Postgres, storage driver, `config.ts` validation, `vercel.json`, deploy-ready README (no deploy)
1. **Multi-user foundation:** Better Auth, `userId` on all models, `requireUser()`, per-user pages, account delete/export
2. **Job sources:** `JobSource` interface, first 1–2 official APIs, cron route + "Search now", Jobs page with dedupe
3. **AI core:** score, tailor, cover letter, PDF, answer matching, review queue, queued long tasks, `UsageEvent` metering
4. **Extension:** MV3, device-code login, side panel to save/score/tailor/autofill/mark applied; the user submits
5. **Billing:** plans, webhooks, limits enforced (off locally), pricing/terms pages
6. **Tracking + export:** History page, `.xlsx` export, optional Google Sheets
7. **Hardening:** Vitest for services/parsers/scoping, rate limits, monitoring, spend limits
