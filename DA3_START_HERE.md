# DocMind AI — DA3 Start Here

This file records the first DA3 preparation changes made from the uploaded project ZIP. It is a starter guide, not proof that every feature of the whole application has passed testing.

## Initial code review

The uploaded archive contains React/Vite frontend source and a FastAPI backend, but it does not contain a `.git` directory, a `.env` file, or an existing automated test suite.

Initial issues identified in source:
- Required backend settings have no example configuration file.
- `get_current_user` used an incorrect conditional expression that always selected HTTP 404 instead of the intended HTTP 401 for invalid credentials.
- `main.py` contained a malformed Markdown-style URL in the CORS origins list.
- The frontend calls `GET /api/v1/auth/me`, but the backend did not define that endpoint.
- The backend uses the legacy `google-generativeai` SDK; check/migrate the SDK deliberately before relying on external AI calls.
- The ZIP has no `.git` history. Use the existing Git clone or clone the repository again for version-management screenshots.

## Initial DA3 changes in this starter

- Added `docmind-backend/.env.example` containing placeholder configuration keys. Copy it to `.env` locally and fill real credentials privately. Never commit `.env`.
- Added a `GET /api/v1/auth/me` endpoint to match the frontend request.
- Corrected the invalid-token status code to HTTP 401.
- Corrected the local CORS origin string.
- Improved PDF processing to close files after reading, skip blank pages, and reject invalid chunk settings.
- Added five PDF processor tests in `docmind-backend/tests/test_pdf_processor.py`.
- Added development testing tools in `docmind-backend/requirements-dev.txt` and basic pytest settings in `docmind-backend/pytest.ini`.

## First steps on Windows (PowerShell)

### Phase 1: start with the PDF processor tests

1. Extract this starter archive into a new folder so your original project stays safe.
2. Open VS Code at the extracted project root.
3. Open a terminal and go to the backend:

   ```powershell
   cd docmind-backend
   py -3.12 -m venv .venv
   .\.venv\Scripts\Activate.ps1
   python -m pip install --upgrade pip
   pip install pytest pytest-cov pymupdf
   python -m pytest -v
   python -m pytest --cov=app.services.pdf_processor --cov-report=term-missing
   ```

4. Capture the two terminal outputs on your own machine after running them. The tests cover page text extraction, chunk overlap, blank pages, invalid chunk settings, and invalid PDFs.

### Phase 2: configure the complete backend

After Phase 1 works, install the application dependencies and create your local environment file:

```powershell
pip install -r requirements-dev.txt
Copy-Item .env.example .env
notepad .env
```

Edit `.env` with your actual database URL, a long random secret key, and Gemini API key. The values in `.env.example` are placeholders and will not run the full backend as-is. Do not share or commit your real `.env` file.

5. Only after the configuration is correct should we run the full API, integration, and frontend checks. Save screenshots only after you have the real output on your machine.

## Current initial test result in the preparation environment

The five tests in `docmind-backend/tests/test_pdf_processor.py` passed against the modified starter copy. Coverage for `app/services/pdf_processor.py` was 97% in that run. This is a preliminary result for one module only; rerun the tests locally and use your own result as DA3 evidence.

## Frontend check

From a second terminal:

```powershell
cd frontend
npm ci
npm run build
npm run lint
```

The frontend dependencies did not finish installing in the preparation environment, so no valid frontend build or lint result is claimed here. Run these commands locally and resolve any reported dependency or code errors.

## Mutation testing note

Mutation testing with current `mutmut` versions requires a fork-capable environment; on Windows, use WSL/Linux for `mutmut`. Official documentation: https://mutmut.readthedocs.io/en/latest/ . Do not claim a mutation score until a real run has completed. Keep the source under version control before running mutation testing.

## Screenshot checklist for DA3 evidence

- [ ] `pytest -v` with real test results
- [ ] Coverage report
- [ ] Integration test results for PDF upload → processing → retrieval → response
- [ ] Regression test results after a code change
- [ ] Mutation testing report (or documented manual mutation experiment, if approved by your instructor)
- [ ] Git history and status from a real Git clone
- [ ] Frontend production build output
- [ ] Backend startup and Swagger UI
- [ ] Login/register and profile workflow
- [ ] PDF upload and resulting document status
- [ ] Question answering with a known fact from the uploaded PDF
- [ ] Summary and quiz features, if they are working

## Important feature mismatches to verify before the demo

- The frontend shows a Google Drive upload option, but the backend ZIP has no `/api/v1/documents/upload/drive` route; the UI already displays a fallback message when the route is missing.
- The frontend sends a quiz difficulty query parameter, but the backend quiz route does not accept/use that parameter. Do not claim quiz difficulty changes the generated question set until fixed and verified.
- Ensure document ownership is checked by chat and assessment endpoints before allowing a user to query another user's document.
- Confirm the exact Gemini SDK/model and API quota by running a real request. Never include API keys in screenshots or source control.
