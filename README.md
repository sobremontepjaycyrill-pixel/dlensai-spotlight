# DLENSAI Spotlight Generator

Generate branded HTML spotlights for a stock ticker and time horizon using OpenAI. Run it locally via CLI or deploy to Vercel for a one-click web UI and API.

---

## Deploy to Vercel (recommended)
1. **Set env vars** in your Vercel project (Project Settings → Environment Variables):
   - `OPENAI_API_KEY` (required)
   - `OPENAI_ORG_ID` (optional if your key is org scoped)
   - `OPENAI_PROJECT_ID` (optional)
   - `OPENAI_MODEL` (defaults to `gpt-4.1` if omitted)
2. Push this repo to GitHub/GitLab/Bitbucket and import it into Vercel (or run `vercel` locally and follow the prompts). The included `vercel.json` wires the API and static UI.
3. Visit the deployed URL. The form POSTs to `/api/spotlight`, streams your request to OpenAI, and lets you download or preview the generated HTML.

### Local preview with Vercel CLI
```bash
npm install
cp .env.example .env   # or create .env with your keys
vercel dev
```
Then open http://localhost:3000.

---

## API contract (serverless function)
`POST /api/spotlight`
```json
{
  "ticker": "TSLA",
  "termYears": 10
}
```
Responses:
```json
{
  "html": "<!doctype html>...",
  "filename": "DLENS_Spotlight_TSLA_10y_via_API.html"
}
```
- 400 if inputs are missing/invalid.
- 405 if method is not POST.
- 500 if the OpenAI call fails (check env vars).

---

## CLI usage (no web server)
1. Install deps: `npm install`
2. Create `.env` with the same variables as above.
3. Run: `node spotlight.js TSLA 10`
4. The HTML file will be saved as `DLENS_Spotlight_TSLA_10y_via_API.html` in the current directory.

---

## Project layout
- `index.html` — static UI that calls the API and previews/downloads the HTML.
- `api/spotlight.js` — Vercel Node serverless function.
- `lib/spotlight.js` — shared OpenAI + prompt logic.
- `prompts/` — DLENS master prompt template.
- `spotlight.js` — CLI entry point.

---

## Notes
- Keep `.env` out of version control (see `.gitignore`).
- The prompt file is bundled into the serverless function; no extra storage is needed.
- If you change prompt text, redeploy so the function picks up the new template.
