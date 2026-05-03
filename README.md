# Healthcare AI Driven Conversational Pre-Anesthetic Assessment Application

A voice-first pre-anesthetic assessment workflow. It converts the PAC history made by docs into a conversational interview, stores the clinician-patient dialogue verbatim, and generates live decision-support outputs for ASA status, STOP-Bang screening, airway risk, and contextual perioperative flags.

The current build now uses all three AI layers you asked for:

- NLP: extracts clinical concepts and red-flag phrases from free-text verbatim answers
- ML: a `RandomForestClassifier` predicts perioperative risk from structured + NLP-derived features
- DL: a multi-layer neural network (`MLPClassifier`) produces a parallel neural risk prediction

## What is included

- A FastAPI backend with:
  - Dynamic question flow based on your `PAC HISTORY.drawio.pdf`
  - Exact transcript capture with separate structured storage
  - SQLite persistence for assessments
  - Hybrid risk stratification combining rules, NLP, ML, and a neural network
  - A local hospital-policy RAG layer backed by `docs/hospital_policy.md`
  - Mixed-intent routing so policy questions do not corrupt clinical answers
  - API endpoints for intake, dashboard listing, and report retrieval
- A React + Vite frontend with:
  - Conversational intake workspace
  - Browser speech recognition for dictation
  - Spoken question playback using the Web Speech API
  - Clinician dashboard
  - One-page printable conversation report
- Tests for the risk engine and API flow
- Reference notes tying the implementation back to your concept document and PAC questionnaire

## Project structure

```text
backend/
  app/
    main.py
    conversation_router.py
    policy_rag.py
    questionnaire.py
    risk_engine.py
    models.py
    database.py
  tests/
frontend/
  src/
    App.tsx
    components/
    hooks/
docs/
  hospital_policy.md
  source-notes.md
```

## How to run

### 1. Start the backend

```powershell
cd "C:\Users\Srijan Jaiswal\Documents\New project\backend"
python -m uvicorn app.main:app --reload
```

The API will run on `http://127.0.0.1:8000`.

### 2. Start the frontend

Open a second terminal:

```powershell
cd "C:\Users\Srijan Jaiswal\Documents\New project\frontend"
npm run dev
```

The frontend will run on `http://127.0.0.1:5173` and proxy API calls to the backend.

## Validation commands

```powershell
cd "C:\Users\Srijan Jaiswal\Documents\New project\backend"
pytest

cd "C:\Users\Srijan Jaiswal\Documents\New project\frontend"
npm run build
```

## Deploy online with Render and Vercel

This repository is ready for a split deployment:

- Render for the FastAPI backend
- Vercel for the React frontend

Files included for deployment:

- [render.yaml](</C:/Users/Srijan Jaiswal/Documents/New project/render.yaml>)
- [frontend/.env.example](</C:/Users/Srijan Jaiswal/Documents/New project/frontend/.env.example>)
- [docs/deploy-render-vercel.md](</C:/Users/Srijan Jaiswal/Documents/New project/docs/deploy-render-vercel.md>)

Quick setup:

1. Push the project to GitHub.
2. On Render, create a web service from the repo using `backend` as the root directory.
3. On Vercel, create a project from the same repo using `frontend` as the root directory.
4. In Vercel, set `VITE_API_BASE_URL` to your Render backend URL.
5. In Render, set `CORS_ALLOW_ORIGINS` to include your Vercel frontend URL.

Example production API URL:

```text
https://your-render-service.onrender.com
```

Example frontend environment variable:

```text
VITE_API_BASE_URL=https://your-render-service.onrender.com
```

Important:

- Render can run the app without a persistent disk, but session records stored in SQLite can be lost on restart or redeploy.
- If you want the deployed records to persist, attach a persistent disk in Render at `/var/data`.
- Vercel serves the site over HTTPS, which is required for reliable browser mic and camera access.

## Windows desktop `.exe`

You can package the project as a true single-file Windows desktop app that starts the backend internally and opens the assessment UI in a native desktop window.

```powershell
cd "C:\Users\Srijan Jaiswal\Documents\New project"
.\build_desktop.ps1
```

The generated executable will be placed at:

```text
C:\Users\Srijan Jaiswal\Documents\New project\dist\ValliAssessment.exe
```

For the packaged desktop build:

- the script creates and uses a project-local `.venv-desktop` environment for reliable packaging
- PyInstaller bundles the app as a single `.exe` and extracts its internal resources at launch
- the built React frontend is served by FastAPI from inside the app and shown through a native Windows WebView window
- the local SQLite database is stored in `%LOCALAPPDATA%\ValliPreAnestheticAssessment\data`
- if you place a custom `hospital_policy.md` in `%LOCALAPPDATA%\ValliPreAnestheticAssessment`, the app will use that file first

## Key backend endpoints

- `GET /api/health`
- `POST /api/sessions`
- `POST /api/sessions/{session_id}/answer`
- `GET /api/sessions`
- `GET /api/sessions/{session_id}`
- `GET /api/sessions/{session_id}/report`

## Hospital policy RAG

Hospital-detail retrieval is configured through [docs/hospital_policy.md](</C:/Users/Srijan Jaiswal/Documents/New project/docs/hospital_policy.md>). The backend uses a lightweight local retrieval layer in [policy_rag.py](</C:/Users/Srijan Jaiswal/Documents/New project/backend/app/policy_rag.py>) to answer questions about topics such as fasting, escort requirements, discharge ride-home planning, and medication instruction escalation.

Important:

- This is not connected to a live hospital HIS/EMR or intranet yet.
- Replace `docs/hospital_policy.md` with your hospital's approved policies before using it for anything real.
- If a patient asks a policy question while answering an assessment question, the assistant will answer from the policy knowledge base and keep the current assessment on track instead of storing the policy question as clinical data.

## Clinical positioning

This project is built as a decision-support prototype. It intentionally preserves the transcript exactly as entered while generating a separate advisory risk layer. The current AI stack is demo-oriented and uses synthetic training data for the ML and DL models, so it is useful for hackathons, workflow demos, and product presentations, but it is not a clinically validated medical model and must not replace anesthesiologist review, institutional protocols, or bedside airway examination.

## Suggested next upgrades

- Add authentication and clinician roles
- Integrate OpenAI or another LLM for more adaptive question phrasing while keeping transcript storage verbatim
- Add webcam-based consented airway capture with a proper computer vision model
- Export PDF reports
- Add audit trails and encrypted storage for production use
