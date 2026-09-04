# Complete project structure

```text
iLD-Project-Control-2026/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml
├── .openai/
│   └── hosting.json
├── site/
│   ├── app.js
│   ├── data.js
│   ├── index.html
│   ├── styles.css
│   └── worker.js
├── source-data/
│   └── iLD Project tracking 2026.xlsx
├── .gitignore
├── extract_projects.py
├── package.json
├── PROJECT_STRUCTURE.md
├── README.md
└── vercel.json
```

## File descriptions

| File | Purpose |
|---|---|
| `site/index.html` | Full website markup, navigation, dashboards, tables, modals, filters, and forms. |
| `site/styles.css` | All desktop/mobile styling, colors, typography, cards, tables, heatmaps, and status states. |
| `site/app.js` | All application behavior and calculations. |
| `site/data.js` | Full embedded project and meeting dataset. |
| `site/worker.js` | Static asset handler used by ChatGPT Sites/Cloudflare Workers. |
| `extract_projects.py` | Utility that extracts project and meeting data from the source Excel workbook. |
| `source-data/iLD Project tracking 2026.xlsx` | Original source workbook used to build the website data. |
| `package.json` | Local build command and project metadata. |
| `vercel.json` | Vercel build and output configuration. |
| `.github/workflows/deploy-pages.yml` | Automatic GitHub Pages deployment workflow. |
| `.openai/hosting.json` | Existing ChatGPT Sites project identity. It may be removed for non-Sites hosting. |

No separate image files are required by the current website.

