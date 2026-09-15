# iLD Project Control 2026

Vercel + Neon portfolio dashboard for shared project tracking and monthly review meetings.

## Phase 1–2 improvements

- Automatic shared-data refresh within about 4 seconds using a lightweight version endpoint.
- Optimistic locking prevents one device from silently overwriting another device's project update.
- Monthly tracking updates only the selected month instead of rewriting the entire project.
- Normalized project statuses: `Done`, `Late`, `On Progress`, `Not Started`.
- Login attempt throttling: five failed PIN attempts per IP in 15 minutes.
- Meeting Mode with filters for status, department, leader, key driver, and review state.
- Structured meeting records: blocker, decision, action, owner, due date, action status, and reviewer.
- `Save & Next` workflow for faster portfolio review meetings.
- Legacy debug endpoint and incompatible GitHub Pages workflow removed.

## Required environment variables

Configure these in Vercel for Production, Preview, and Development:

- `DATABASE_URL`: Neon pooled PostgreSQL connection string.
- `ADMIN_PIN`: administrator PIN. Use a strong value.
- `SESSION_SECRET`: random secret of at least 32 characters.

Never commit real secrets. `.env.example` contains placeholders only.

## Upgrade an existing database

Before deploying this source:

1. Open Neon Console → SQL Editor.
2. Select the production branch and `neondb` database.
3. Back up the database or create a Neon restore point.
4. Run the complete file `database/migration-phase-1-2.sql` once.
5. Confirm the final query returns the `portfolio` version row.

The migration is repeat-safe: columns, tables, and indexes use `IF NOT EXISTS`, and triggers are recreated deliberately.

## Deploy to Vercel

1. Push this folder to the connected GitHub repository.
2. Vercel serves `site/` and exposes functions under `api/`.
3. Confirm the deployment status is Ready.
4. Test `/api/version`; it should return JSON containing `version`.
5. Open the website on two devices. Edit on one device; the other should update within about four seconds.

Do not enable GitHub Pages: it cannot run this project's server-side API routes.

## Local development

Create `.env.local` using `.env.example`, then run:

```bash
npm install
npx vercel dev
```

Opening `site/index.html` directly only shows fallback data. Database and login APIs require `vercel dev` or Vercel.

## Main structure

- `api/` — Vercel serverless API routes.
- `database/` — Neon SQL schema and upgrade migration.
- `lib/` — session authorization helpers.
- `site/` — deployed HTML, CSS, JavaScript, and fallback data.
- `source-data/` — original Excel source workbook.
- `PROJECT_STRUCTURE.md` — file map.

## Tracking legend

- `1` — Attend
- `2` — Absent
- `NA` — Not applicable
- `4` — Completed

These codes are categorical tracking states, not a percentage scale.
