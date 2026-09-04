# iLD Project Control 2026

Complete source backup of the iLD project-management website.

## Included

- Portfolio Overview dashboard
- Project List with search, multi-select filters, edit/add/delete
- Project Tracking heatmap with editable monthly values
- Monthly Project Review workflow
- Meeting Minutes management
- Excel export
- Client-side administrator PIN mode
- Full project and meeting data from `iLD Project tracking 2026.xlsx`

## Project structure

See [`PROJECT_STRUCTURE.md`](PROJECT_STRUCTURE.md) for the complete file tree and file descriptions.

## Run locally

### Quick option

Open `site/index.html` in a browser. For the most reliable behavior, use a local web server:

```bash
npx serve site
```

Then open the local URL printed in the terminal.

### Build option

```bash
npm install
npm run build
```

The generated website is written to `dist/`.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. Import the repository into Vercel.
3. Vercel uses `vercel.json`, runs `npm run build`, and publishes `dist/`.

## Deploy to GitHub Pages

1. Push this folder to a GitHub repository.
2. In GitHub, open **Settings → Pages**.
3. Under **Build and deployment**, select **GitHub Actions**.
4. The included workflow `.github/workflows/deploy-pages.yml` builds and publishes the site.

## Data storage and administrator access

- Initial project and meeting data is embedded in `site/data.js`.
- Updates are saved in the browser's `localStorage`; they are device/browser-specific.
- The administrator PIN configured for this backup is `ILDD0010`.
- The PIN gate is client-side convenience control, not server-grade authentication.
- For secure multi-user editing and shared live data, connect the site to a database and server-side authentication.

## Images and assets

The website does not currently use separate raster or vector image files. The iLD mark, interface icons, charts, status colors, and progress graphics are rendered with HTML, CSS, and JavaScript.

## Main source files

- `site/index.html` — application layout and forms
- `site/styles.css` — complete responsive styling
- `site/app.js` — dashboard, filters, editing, tracking, meeting workflow, PIN mode, Excel export
- `site/data.js` — embedded project and meeting dataset
- `site/worker.js` — Cloudflare/Sites asset worker
- `extract_projects.py` — original Excel-to-JavaScript extraction utility
- `source-data/iLD Project tracking 2026.xlsx` — original workbook

