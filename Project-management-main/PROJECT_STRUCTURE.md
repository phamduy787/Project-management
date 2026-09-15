# Complete project structure

```text
Project-management/
├── api/
│   ├── auth/
│   │   ├── login.js
│   │   ├── logout.js
│   │   └── status.js
│   ├── data.js
│   ├── meetings.js
│   ├── projects.js
│   └── version.js
├── database/
│   └── migration-phase-1-2.sql
├── lib/
│   └── auth.js
├── site/
│   ├── app.js
│   ├── data.js
│   ├── index.html
│   └── styles.css
├── source-data/
│   └── iLD Project tracking 2026.xlsx
├── .env.example
├── .gitattributes
├── .gitignore
├── extract_projects.py
├── package-lock.json
├── package.json
├── PROJECT_STRUCTURE.md
├── README.md
└── vercel.json
```

## Responsibilities

| Path | Purpose |
|---|---|
| `api/auth/` | Server-side administrator session and rate-limited login. |
| `api/data.js` | Combined project and meeting read endpoint. |
| `api/projects.js` | Project CRUD, monthly patch updates, and conflict detection. |
| `api/meetings.js` | Structured meeting-minute CRUD. |
| `api/version.js` | Lightweight version check used by four-second synchronization. |
| `database/migration-phase-1-2.sql` | Repeat-safe Neon upgrade required before deployment. |
| `lib/auth.js` | Signed, HTTP-only administrator session cookie. |
| `site/index.html` | Deployed page structure and forms. |
| `site/styles.css` | Responsive visual design and Meeting Mode styles. |
| `site/app.js` | Dashboard, filters, shared sync, review workflow, editing, and export. |
| `site/data.js` | Embedded fallback dataset. Neon remains the shared source of truth. |
| `source-data/` | Original Excel source workbook. |

The repository intentionally excludes a GitHub Pages workflow, client-side PIN, debug database endpoint, duplicate root application files, and platform-specific worker files.
