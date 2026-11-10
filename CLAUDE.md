# CLAUDE.md — ApplyPilot

@AGENTS.md

`AGENTS.md` holds the Next.js-generated agent rules for this Next.js version. Read it alongside this file.

## Project
ApplyPilot is a local-first job application assistant. It finds jobs on **Indeed** that match the user's filters, scores them against the user's skills, writes a tailored resume and cover letter for each job, and submits applications. By default every submission waits for the user's approval. Every application is logged to a spreadsheet so no job is ever applied to twice.

The user is a full-stack JS/TS developer (Next.js). Keep explanations brief; use analogies for new concepts.

---

## Stack
- **Framework:** Next.js 16 (App Router, `src/` directory)
- **Language:** TypeScript (strict)
- **UI:** Material UI v9 + `@emotion/styled`; **MUI X DataGrid** (`@mui/x-data-grid`) for all tables
- **Data fetching:** TanStack Query
- **Database:** Prisma 7 + **SQLite** (`@prisma/adapter-better-sqlite3`), local file `data/app.db`
- **Browser automation:** Playwright (Node), in a **separate worker process**, never inside a route handler
- **AI:** Anthropic SDK (`@anthropic-ai/sdk`); model set via `LLM_MODEL`
- **Validation:** zod (forms, LLM JSON output, scraped data)
- **Resume PDF:** `@react-pdf/renderer`
- **Tracking:** Google Sheets API (`googleapis`), with `exceljs` for `.xlsx` export
- **Worker runtime:** `tsx`

Runs **locally** on the user's machine. Do not target Vercel or serverless: the browser session must persist, and a residential IP is less likely to be flagged.

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
├── services/           # Business logic + all Prisma access (used by API routes AND the worker)
├── worker/             # Long-running Node process: `tsx src/worker/index.ts`
│   ├── sites/types.ts  # SiteAdapter interface
│   ├── sites/indeed/   # Indeed adapter: search, parse, apply steps, selectors.ts
│   └── browser.ts      # Playwright persistent context
├── lib/                # Integrations: prisma.ts, config.ts, queryClient.ts, anthropic.ts, sheets.ts
├── hooks/              # TanStack Query hooks (one per resource) + other hooks
├── constants/          # Values shared by client components AND server/worker code
├── utils/              # Pure helpers
├── types/              # Shared interfaces/types
├── styles/             # theme.ts + global styles
└── generated/          # Generated Prisma client — never edit by hand
prisma/schema.prisma
prisma.config.ts        # Prisma 7 config (repo root) — do not delete
data/                   # Local-only (gitignored): app.db, browser-profile/, resumes/, errors/
```

---

## Commands
- `npm run dev` — dashboard
- `npm run worker` — `tsx watch --env-file=.env --env-file-if-exists=.env.local src/worker/index.ts`
- `npm run build` / `npm start`
- `npm run lint`
- `npm run test` — Vitest (`src/**/*.test.ts`)
- `npx prisma migrate dev` / `npx prisma generate` / `npx prisma studio`

---

## Workflow
- Before making any changes, give a step-by-step plan and wait for approval.
- For any continuation or multi-session task that extends an existing feature or pattern, first read and analyze the original implementation, and base the plan on it.
- **No `Co-Authored-By` (or any AI attribution) in commits or PRs.** Plain subject + body only.
- **Never commit or push without asking.** When a task is done, report what changed and ask for permission to commit, then ask separately before pushing. Approving a plan is not permission to commit.
- Finish and verify one build phase before starting the next. Run `npx tsc --noEmit` and `npm run lint` before reporting done.

---

## Core Flow
1. **Login (no stored passwords).** The worker opens headed Chromium via `chromium.launchPersistentContext('data/browser-profile')`. The user logs in to Indeed by hand once; the session is reused afterwards. **Never ask for, store, or type the user's password.**
2. **Filters.** Role keywords, tech stack, work setup (remote/hybrid/onsite), location, expected salary, job type, date posted, minimum match score (default 70).
3. **Resume.** Upload (PDF/DOCX → parsed) or build in a form. Stored as a **master resume JSON** (zod-validated).
4. **Score.** The LLM returns zod-validated JSON `{ score, matchedSkills, missingSkills, reasoning }`. Skip jobs below the threshold.
5. **Tailor.** Per-job resume (reordered and re-emphasized) + a cover letter when the form asks for one.
6. **Answer bank.** Stored answers to screening questions (years per skill, salary, notice period, work authorization, relocation). The LLM maps new question wording to stored answers. **If there's no confident match, set status `needs_user`. Never guess.**
7. **Review queue (default mode).** The user approves or edits each tailored application; only approved items are submitted. Auto mode is opt-in, enabled through a `ConfirmModal` warning.
8. **Daily cap + pacing.** A user-set daily max, with randomized delays between actions and applications.
9. **Track + dedupe.** Record every application before and after submission; sync to Google Sheets.

Dashboard ↔ worker communication goes **through the DB** (a `Task` table the worker polls). No Redis.

### Indeed specifics (v1 site)
- Dedupe key: Indeed job key (`jk` param). Secondary key: hash of normalized `company + title + location`.
- v1 only handles **"Easily apply" / Indeed Apply**. External-redirect jobs are logged as `EXTERNAL_MANUAL` with the link.
- The apply flow is multi-step. Detect the current step from the page, not by fixed order, with one handler per step.
- Prefer `getByRole` / `getByLabel` locators. Keep all selectors in `sites/indeed/selectors.ts`.
- **CAPTCHA, verification, or an unknown form state → pause, set `NEEDS_USER`, and save a screenshot to `data/errors/`.** Never try to solve or bypass CAPTCHAs.
- Indeed's terms restrict automated use. Keep volume low, keep human pacing, and keep review mode the default.

### Data Model (minimum)
- `Settings` (filters, dailyCap, mode, threshold)
- `MasterResume` (JSON)
- `AnswerBankEntry` (question, answer, tags)
- `Job` (site, externalId, url, title, company, location, salary, description, score, scoreJson, firstSeenAt), with `@@unique([site, externalId])`
- `Application` (jobId, status enum `QUEUED | APPROVED | SUBMITTED | FAILED | SKIPPED | NEEDS_USER | EXTERNAL_MANUAL`, resumePath, coverLetter, submittedAt, error)
- `Task` (type, payload JSON, status)

### Spreadsheet Columns
Date | Company | Title | Location | Salary | Score | Status | Job URL | Resume version | Cover letter (Y/N) | Notes

### Hard Rules (Product)
- **Never fabricate** skills, employers, dates, titles, or credentials. Only rephrase, reorder, and emphasize what's in the master resume and answer bank.
- Never store or type passwords, card numbers, or government IDs.
- Never submit without approval unless auto mode is on.
- Check dedupe before tailoring (saves LLM cost) **and** right before submitting.
- Validate all LLM output with zod and retry once on failure.
- `data/`, `.env*`, and the Google service-account JSON are gitignored.

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

### Client/Server/Worker-Shared Config (`src/constants/`)
A value needed by both a `'use client'` component and server or worker code (filter options, status labels, default settings) must live in `src/constants/<domain>.ts`, never inside a client component's folder. Next.js turns every export of a `'use client'` module into an opaque reference on the server.

### API Routes (`src/app/api/`)
- Routes never import `prisma`. They validate input (zod), call a `src/services/` function, and shape the response.
- Expected service failures carry an HTTP status: `throw Object.assign(new Error(message), { status })`. In the route:
  ```ts
  const status = (err as { status?: number }).status;
  if (status) return NextResponse.json({ error: err.message }, { status });
  throw err;
  ```
- Use Prisma transactions for multi-model writes.
- Single-user local app, so no auth layer. Don't add NextAuth.

### Services
- All business logic and DB access live in `src/services/`. Both API routes and the worker call the same services; never duplicate logic in the worker.

### Prisma 7
- Config in repo-root `prisma.config.ts`. Client generated to `src/generated/prisma`; always import from `@/generated/prisma/client`, never `@prisma/client`.
- Single client in `src/lib/prisma.ts`; never instantiate elsewhere:
  ```ts
  import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
  import { PrismaClient } from '@/generated/prisma/client';
  import { config } from '@/lib/config';

  const adapter = new PrismaBetterSqlite3({ url: config.databaseUrl });
  export const prisma = new PrismaClient({ adapter });
  ```

### Environment Variables
- Access env only through `src/lib/config.ts`. Never use `process.env` elsewhere.
  ```ts
  // Client-safe
  export const publicConfig = {};

  // Server/worker-only
  export const config = {
    databaseUrl: process.env.DATABASE_URL!,
    anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
    llmModel: process.env.LLM_MODEL!,
    googleSheetsId: process.env.GOOGLE_SHEETS_ID!,
    googleServiceAccountJsonPath: process.env.GOOGLE_SERVICE_ACCOUNT_JSON_PATH!,
  };
  ```
- Only exception: the `NODE_ENV === 'development'` check gating `ReactQueryDevtools` in `providers.tsx`.
- `.env` (gitignored) holds only the database URL:
  ```
  DATABASE_URL=file:./data/app.db
  ```
- `.env.local` (gitignored) holds everything else and overrides `.env`:
  ```
  ANTHROPIC_API_KEY=
  LLM_MODEL=
  GOOGLE_SHEETS_ID=
  GOOGLE_SERVICE_ACCOUNT_JSON_PATH=
  ```

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
- Use `refetchInterval` for live worker status (queue, run progress).
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
| `ConfirmModal` | `shared/ConfirmModal/` | Destructive or risky actions (enable auto mode, skip, delete). Props: `title`, `description`, `icon`, `severity: 'error' \| 'warning' \| 'primary'`, `confirmButtonType`, `confirmLabel`, `cancelLabel`, `children?` |
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

---

## Build Phases
1. Scaffold: Prisma 7 + SQLite, `config.ts`, theme + `providers.tsx` (ThemeRegistry, QueryClient, ToastQueue), app shell/nav, global route files, core shared components, settings/filters page, master resume (upload/parse + form), answer bank page
2. Worker + persistent login + Indeed search & listing parse (read-only, no applying)
3. Scoring + tailoring + cover letter + PDF; review queue (DataTable + Modal)
4. Indeed apply flow (Easily apply only), daily cap, pacing, `NEEDS_USER` pauses
5. Google Sheets sync + `.xlsx` export
6. Hardening: retries, error screenshots, logs, Vitest tests for services and the LLM output parsers
