# 🌐 LeetRev Deployment Guide (Free Cloud PaaS Stack)

This step-by-step guide explains how to deploy **LeetRev** for free using **Vercel** (Frontend), **Render / Railway** (Backend API), and **Neon / Supabase** (PostgreSQL Database).

---

## 1. Database Setup (Neon PostgreSQL or Supabase)

1. Go to [Neon.tech](https://neon.tech) or [Supabase.com](https://supabase.com) and create a free project.
2. Create a database named `leetrev`.
3. Copy the **PostgreSQL Connection String**. It will look like:
   ```env
   postgresql://<user>:<password>@ep-example-host.region.aws.neon.tech/leetrev?sslmode=require
   ```

---

## 2. GitHub OAuth Application Configuration

1. Go to **GitHub Settings** -> **Developer Settings** -> **OAuth Apps** -> **New OAuth App**.
2. Fill in the details:
   - **Application Name**: `LeetRev Production`
   - **Homepage URL**: `https://<your-vercel-app>.vercel.app`
   - **Authorization Callback URL**: `https://<your-render-app>.onrender.com/auth/github/callback`
3. Generate a new **Client Secret**.
4. Note down the **Client ID** and **Client Secret**.

---

## 3. Backend Deployment (Render.com / Railway.app)

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Set the build and start settings:
   - **Root Directory**: `.` (Project root)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run db:deploy && npm start`
5. Add the Environment Variables:

| Variable | Value |
|---|---|
| `NODE_VERSION` | `20` |
| `DATABASE_URL` | *Your Neon / Supabase connection string* |
| `JWT_SECRET` | *Random 32+ character secret string* |
| `GITHUB_CLIENT_ID` | *Your GitHub OAuth Client ID* |
| `GITHUB_CLIENT_SECRET` | *Your GitHub OAuth Client Secret* |
| `GITHUB_CALLBACK_URL` | `https://<your-render-app>.onrender.com/auth/github/callback` |
| `FRONTEND_URL` | `https://<your-vercel-app>.vercel.app` |
| `GEMINI_API_KEY` | *Your Google Gemini API Key from Google AI Studio* |

6. Click **Create Web Service**. Render will deploy your API and run database migrations automatically.

---

## 4. Frontend Deployment (Vercel)

1. Log into [Vercel.com](https://vercel.com) and click **Add New** -> **Project**.
2. Select your repository.
3. Configure the deployment settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add the Environment Variable:

| Variable | Value |
|---|---|
| `VITE_API_URL` | `https://<your-render-app>.onrender.com` *(No trailing slash)* |

5. Click **Deploy**. Vercel will build and deploy your React SPA with routing rules configured in [`vercel.json`](file:///Users/riturajmishra/Documents/Year%203/Projects/LeetRev/frontend/vercel.json).

---

## 5. Verification & Testing Checklist

- [ ] Open `https://<your-vercel-app>.vercel.app` in your browser.
- [ ] Click **Continue with GitHub** and verify successful OAuth redirection & login.
- [ ] Connect a LeetHub problem repository and run a sync test.
- [ ] Verify review queue functionality & test generating a Gemini AI analysis.
