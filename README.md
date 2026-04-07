# Mobile.de CSV Product Checker

A browser-based tool to validate **mobile.de CSV API Extension** exports against financing product rules (Loaning, Balloon, Leasing). Parsing and analysis run entirely **client-side**—your file never leaves your machine.

## Features

- **CSV upload** — Parses exports with [Papa Parse](https://www.papaparse.com/); handles large files locally.
- **Vehicle identification** — Uses **column B** (second column) as the vehicle ID, consistent with mobile.de / Excel conventions.
- **Field mapping** — Recognizes financing columns by **two-letter API codes** (e.g. `ET`, `EU`) and **numeric column IDs** in headers (e.g. `149` for `ET`).
- **Products** — Validate **Loaning**, **Balloon**, **Leasing**, or **all three** in one run.
- **Modes** — **Flexible** (minimum required fields) vs **strict** (extended company / instalment-plan mapping).
- **Results** — Per vehicle and product: **OK**, **WARNING**, **NO DATA**, or **CONFLICT**, with missing fields and notes.
- **Export** — Download analysis as a CSV for spreadsheets or ticketing.

## Tech stack

- [React](https://react.dev/) 19 · [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) 8
- [Tailwind CSS](https://tailwindcss.com/) 4 · [shadcn-style UI](https://ui.shadcn.com/) components ([Base UI](https://base-ui.com/), Lucide icons)

## Prerequisites

- [Node.js](https://nodejs.org/) (current LTS recommended)
- npm (bundled with Node)

## Getting started

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Scripts

| Command        | Description                    |
| -------------- | ------------------------------ |
| `npm run dev`  | Start dev server with HMR      |
| `npm run build`| Typecheck + production build   |
| `npm run preview` | Serve the production build locally |

## Usage (short)

1. Export or save your inventory CSV in **mobile.de CSV API Extension** format.
2. Upload the file in the app.
3. Choose **Loaning**, **Balloon**, **Leasing**, or **All**, and **Flexible** or **Strict**.
4. Run **Analyze** and review the summary and table; use **Download results CSV** if needed.

For leasing, the UI includes notes on import rules (e.g. **KU**, **KL**, **KQ**, **KS**). Align exports with your internal legal and mapping requirements.

## Project layout (overview)

- `src/validation/` — Product-specific validators and `analyzeRows` orchestration
- `src/constants/fields.ts` — API column codes, aliases, and field sets
- `src/lib/` — CSV parsing, normalization, vehicle ID resolution
- `src/components/` — UI: upload, controls, results table, summary

## License

Private project (`"private": true` in `package.json`). Adjust licensing if you publish the repository.
