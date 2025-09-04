# Repository Guidelines

## Project Structure & Module Organization
- Python backend lives at repo root: `api_server.py`, `start_api_server.py`, `disaster_labeling.py`, `create_web_map.py`.
- Data stays under `1c__Hatay_Enkaz_Bina_Etiketleme/` (TIFF/shape files). Keep paths stable.
- Static outputs (images, HTML maps) are written to `static/` and served by the API.
- Frontend is Next.js in `client/` with `src/app`, `src/components`, `src/lib`.
- Docs: `README.md`, `API_DOCUMENTATION.md`, `INTEGRATION_GUIDE.md`.

## Build, Test, and Development Commands
- Python setup (Windows): `python -m venv .venv && .\.venv\Scripts\activate && pip install -r requirements.txt`.
- Run API (dev): `python start_api_server.py` or `python api_server.py` → docs at `http://127.0.0.1:8000/docs`.
- Health check: `curl http://127.0.0.1:8000/health`.
- Frontend dev: `cd client && npm install && npm run dev` → `http://localhost:3000`.
- Frontend build/start: `cd client && npm run build && npm start`.
- Lint (client): `cd client && npm run lint`.

## Coding Style & Naming Conventions
- Python: PEP 8, 4‑space indent, add type hints where practical; functions/modules use `snake_case`.
- Frontend: React components `PascalCase.tsx` in `src/components`; utilities `camelCase.ts` in `src/lib`.
- API: route and model names must match `API_DOCUMENTATION.md`; avoid breaking changes.
- Linting: ESLint configured in `client/eslint.config.mjs`.

## Testing Guidelines
- No formal suite included. Prefer small, verifiable changes with manual checks:
  - Backend: `GET /health`, `/data/info`, and sample analysis endpoints.
  - Frontend: verify flows in `src/app/page.tsx` and related components.
- If adding tests: use `pytest` for Python (`tests/` or `test_*.py`), and Vitest/Jest for the client (`*.test.ts`). Keep tests fast and isolated.

## Commit & Pull Request Guidelines
- Commits: concise, imperative subject (≤ 72 chars). Example: `feat(api): add field search endpoint`.
- PRs: include purpose, scope, screenshots for UI, and links to relevant docs/issues. Note any data/schema impacts and API changes.
- Keep changes scoped (backend vs client) and reference affected paths.

## Security & Configuration Tips
- Do not commit secrets; use `client/.env.local` for frontend config. Backend reads local files; no secret keys expected.
- Large assets (TIFF/PNG/ZIP): consider Git LFS; avoid renaming files in `1c__Hatay_Enkaz_Bina_Etiketleme/` without updating scripts.
- CORS: API allows `http://localhost:3000`; adjust if deploying elsewhere.

