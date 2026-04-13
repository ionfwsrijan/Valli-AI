# Deploy to Render and Vercel

This app is set up for a split deployment:

- Backend API on Render
- Frontend on Vercel

## 1. Push the project to GitHub

Both Render and Vercel work best when they can pull from the same repository.

## 2. Deploy the backend on Render

Use the root [render.yaml](</C:/Users/Srijan Jaiswal/Documents/New project/render.yaml>) blueprint or create a web service manually with these values:

- Root directory: `backend`
- Runtime: `Python`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/api/health`

Environment variables:

- `PREANESTHETIC_DATA_DIR=/var/data`
- `CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
- `CORS_ALLOW_ORIGIN_REGEX=https://.*\.vercel\.app`

Optional but recommended:

- Attach a persistent disk at `/var/data` if you want session records and SQLite data to survive restarts and redeploys.
- If you later use a custom Vercel domain, add that exact URL to `CORS_ALLOW_ORIGINS`.

After deployment, note the Render URL, for example:

```text
https://valli-backend.onrender.com
```

## 3. Deploy the frontend on Vercel

Create a new Vercel project from the same repository and set:

- Root directory: `frontend`
- Framework preset: `Vite`

Environment variable:

- `VITE_API_BASE_URL=https://your-render-service.onrender.com`

Vercel will build the frontend and publish it over HTTPS, which is important for browser microphone and camera access.

## 4. Connect the two

Once Vercel gives you the final frontend URL:

1. Open the Render service settings.
2. Add the Vercel production URL to `CORS_ALLOW_ORIGINS`.
3. Redeploy the Render service if needed.

Example:

```text
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://your-app.vercel.app
```

## 5. Smoke test

Check these URLs after deployment:

- Render API health: `https://your-render-service.onrender.com/api/health`
- Vercel frontend: `https://your-app.vercel.app`

Then verify:

- New assessment starts
- Answers move to the next question
- Camera access works over HTTPS
- Final report loads
