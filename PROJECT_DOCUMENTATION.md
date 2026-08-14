# LeetRev — Project Documentation and Interview Guide

LeetRev is a multi-user revision assistant for LeetCode practice. It connects a user's GitHub account, reads solutions committed by LeetHub, stores each solution and its metadata, schedules revision, and generates an optional AI explanation of the code.

## 1. Problem statement

Solving a problem once does not guarantee that its pattern will be remembered. Developers commonly keep their accepted solutions in GitHub, but GitHub does not provide:

- a revision queue;
- a per-user daily problem report;
- code-specific feedback; or
- a way to revisit solutions on a schedule.

LeetRev turns a GitHub repository into a personal learning log.

## 2. Core user journey

```text
GitHub login
  → choose LeetHub repository
  → sync recent solution commits
  → store Problem, Solution, and Review records
  → view yesterday's report / review queue
  → rate a review or open its code workspace
  → request cached AI analysis when needed
```

### First sync and later syncs

On a user's first sync, LeetRev imports only commits from the 24 hours before the account was created. This prevents a 744-commit repository from creating an overwhelming historical backlog.

After a successful sync, `User.lastSyncAt` is saved. Every later sync asks GitHub only for commits made after that time. Database uniqueness on `(userId, commitSha)` is an additional safety net against duplicates.

## 3. Architecture

```text
React + Vite frontend                 Express API                     External services
────────────────────                 ───────────                     ─────────────────
Login / Setup / Dashboard   →   JWT middleware + route modules   →   GitHub OAuth + REST API
Review / Workspace          →   services + Prisma client         →   Google Gemini API
                             →   PostgreSQL database
```

### Backend layers

1. **Routes** receive HTTP requests and return HTTP responses.
2. **Middleware** validates the bearer JWT and adds `req.userId`.
3. **Services** hold business logic: ingestion, reports, reviews, problem loading, and AI review generation.
4. **Prisma** reads and writes PostgreSQL records.

This separation makes it easier to test logic without an HTTP server and prevents route files from becoming large, mixed-responsibility files.

## 4. Technology choices and trade-offs

| Technology | Why it is used | Obvious alternative | Why this choice fits / trade-off |
|---|---|---|---|
| TypeScript | Safer request, database, and frontend data contracts. | JavaScript | JavaScript is faster to start, but type errors such as a mismatched review response are easier to miss. TypeScript adds a compile step. |
| Node.js + Express | Simple REST API, async GitHub/Gemini calls, large ecosystem. | NestJS, Fastify | NestJS gives stronger conventions but more boilerplate. Fastify is faster but Express is easier to explain and sufficient here. |
| React + Vite | Component-based UI with fast local development. | Next.js, plain HTML | Next.js is useful for SSR/SEO; LeetRev is an authenticated dashboard, so a Vite SPA is simpler. |
| Tailwind CSS | Fast consistent styling directly near the component. | CSS modules, Material UI | CSS modules separate styles well; Material UI provides ready components but can make a student project look generic. |
| PostgreSQL | Relational data, foreign keys, transactions, JSON support, robust production option. | MongoDB, SQLite | MongoDB is flexible but relations like User → Solution → Review are clearer in PostgreSQL. SQLite is excellent locally but less suited to concurrent hosted users. |
| Prisma | Type-safe queries, schema-driven migrations, Prisma Studio. | Raw SQL, Drizzle | Raw SQL offers complete control but more repetitive code. Drizzle is lighter; Prisma is especially useful for visual schema/migration learning. |
| GitHub OAuth | Users grant access without sharing passwords or personal access tokens manually. | Manual token input | OAuth is safer and smoother, but needs callback URL configuration and token lifecycle handling. |
| GitHub REST API | Reads repositories, commits, files, and README metadata. | Webhooks, GitHub GraphQL | REST is direct for this first version. Webhooks are better for automatic production sync; GraphQL can reduce requests for complex screens. |
| JWT | Stateless API authentication between SPA and backend. | Server sessions | JWT avoids a session store and is simple for a demo. Server sessions or HTTP-only cookies are safer for a production browser app. |
| Google Gemini | Produces code explanation, complexity, and revision guidance. | OpenAI, local model, no AI | A hosted model delivers useful results quickly. It adds API cost, latency, and output-validation requirements. |
| Zod | Validates AI JSON before storing it. | Manual checks, Joi | Zod keeps runtime validation and TypeScript types close together. |

## 5. Database design

### Main entities

| Model | Purpose | Important fields |
|---|---|---|
| `User` | Identity and GitHub integration settings. | `githubId`, `githubUsername`, `githubAccessToken`, selected repository, `lastSyncAt` |
| `Problem` | Shared canonical LeetCode problem metadata. | `slug`, title, difficulty, topics, LeetCode URL |
| `Solution` | One user’s code from one GitHub commit. | `userId`, `problemId`, code, language, `commitSha`, solve date, performance, optional AI analysis |
| `Review` | Spaced-revision state for one solution. | `solutionId`, next review date, status, interval fields |

### Relationships

```text
User 1 ── * Solution * ── 1 Problem
                 |
                 1
                 |
                 1
               Review
```

### Multi-user design decisions

- Every `Solution` belongs to a `User`.
- Every `Review` belongs to a `Solution`, which makes a review automatically user-owned.
- Queries for reports, reviews, problem details, and AI analysis filter through `userId`.
- `@@unique([userId, commitSha])` allows different users to import the same public GitHub commit SHA without conflict.
- `Problem.slug` is globally unique because a LeetCode slug represents the same problem for every user. Code is never shared between users.

## 6. Authentication and authorization

1. Frontend opens `GET /auth/github`.
2. Backend redirects to GitHub OAuth with `read:user repo` scope.
3. GitHub redirects to `GET /auth/github/callback`.
4. Backend exchanges the authorization code for a GitHub access token, upserts the user, creates a one-hour JWT, and redirects to the frontend callback.
5. Frontend stores the JWT and sends it as `Authorization: Bearer <token>` for every `/api/*` request.
6. `authMiddleware` verifies the JWT and sets `req.userId`.

The GitHub access token is used only server-side to list repositories and import commits/files.

## 7. API reference

All `/api/*` endpoints require this header:

```http
Authorization: Bearer <jwt>
```

### Authentication

| Method and path | Purpose | Request | Response |
|---|---|---|---|
| `GET /auth/github` | Begins GitHub OAuth. | None | Redirect to GitHub. |
| `GET /auth/github/callback` | Receives OAuth code. | GitHub query parameters | Redirect to frontend `/auth/callback?token=...`. |

### GitHub setup and synchronization

| Method and path | Purpose | Request | Response |
|---|---|---|---|
| `GET /api/github/status` | Gets connected account, selected repository, and last sync time. | None | GitHub username, repository or `null`, `lastSyncAt`. |
| `GET /api/github/repos` | Lists accessible GitHub repositories. | None | Repository ID, name, full name, privacy, description, owner. |
| `POST /api/github/repos/select` | Saves the repository to sync. | `{ "repoName": "...", "owner": "..." }` | Selected owner/name. |
| `POST /api/github/sync` | Imports new recent commits. | None | Checked commit count and processed solution-file count. |

### Learning features

| Method and path | Purpose | Request | Response |
|---|---|---|---|
| `GET /api/reports/yesterday` | Yesterday's per-user solved-problem report. | None | Date, total solved, problem summaries. |
| `GET /api/reviews/due` | Gets due reviews. | None | Total due and up to five review cards. |
| `POST /api/reviews/start` | Starts five upcoming new reviews immediately. | None | Updated due-review response. |
| `POST /api/reviews/:id/rate` | Rates a review from 1 to 5. | `{ "rating": 1..5 }` | `{ "success": true }`. |
| `GET /api/problems/:id` | Opens user-scoped problem workspace. | None | Problem, latest user solution, associated review. |
| `POST /api/solutions/:solutionId/generate-analysis` | Creates/reuses AI analysis. | None | Validated AI analysis JSON. |

### Main response/error rules

- `401`: missing, malformed, or expired JWT.
- `404`: requested user/record does not exist.
- `400`: invalid or inaccessible repository.
- `500`: service/database/external API failure.

## 8. GitHub ingestion logic

The importer expects the LeetHub-style structure below:

```text
0005-longest-palindromic-substring/
  README.md
  solution.cpp
```

For every qualifying recent commit it:

1. fetches commit details;
2. finds a `.cpp` file;
3. derives the problem slug and language from its path;
4. reads performance values from the commit message;
5. parses the LeetHub README for title, difficulty, topics, and LeetCode URL;
6. creates/reuses `Problem`;
7. creates/reuses that user’s `Solution`;
8. creates/reuses its `Review` due the following day.

## 9. Review logic

### Current implementation

- New imported solutions are due tomorrow at midnight.
- If the user wants to start immediately, **Start 5 reviews now** changes five `NEW` reviews to `LEARNING` and makes them due now.
- `GET /api/reviews/due` returns at most five due reviews to keep the screen focused.
- Ratings 1–4 schedule reviews after 2, 3, 7, or 15 days.
- Rating 5 marks a review as `MASTERED`.

### Why this is deliberately simple

It is a clear first spaced-repetition model, easy to demo and explain. The schema already contains `reps`, `easeFactor`, and `intervalDays`, so a future SM-2-style algorithm can be added without redesigning the database.

## 10. AI analysis flow

1. User opens a workspace and clicks generate analysis.
2. Backend confirms the solution belongs to that user.
3. A prompt contains problem title, difficulty, language, and code.
4. Gemini returns structured JSON.
5. Zod validates that JSON before it is saved to `Solution.aiAnalysis`.
6. Later requests reuse the stored analysis, avoiding extra cost and inconsistent results.

## 11. Local setup

### Requirements

- Node.js 20+
- PostgreSQL
- A GitHub OAuth App
- A Gemini API key

### Environment variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=long-random-secret
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_CALLBACK_URL=http://localhost:3000/auth/github/callback
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=...
```

### Commands

```bash
# Backend
npm install
npx prisma migrate dev
npm run dev

# Frontend, in another terminal
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

To inspect data, run `npx prisma studio` from the project root and open `http://localhost:5555`.

## 12. Deployment checklist

1. Host the frontend and backend separately or as one platform deployment.
2. Use hosted PostgreSQL and set `DATABASE_URL` in the backend host.
3. Set `FRONTEND_URL` to the deployed frontend origin.
4. Set frontend `VITE_API_URL` to the deployed API origin.
5. Update the GitHub OAuth callback URL to `https://your-api-domain/auth/github/callback`.
6. Add all secrets to host environment variables; never commit `.env`.
7. Run `npx prisma migrate deploy` against production database.
8. Add `dist/`, `tmp/`, `output/`, and `.env` to `.gitignore`.

## 13. Known limitations and sensible next improvements

| Current limitation | Why it exists now | Next improvement |
|---|---|---|
| Only `.cpp` is ingested. | The source repository uses C++. | Map extensions such as `.py`, `.java`, `.js`, and `.ts` to languages. |
| No GitHub pagination. | First sync is intentionally only one day. | Paginate while retaining `since`, for users with very high daily activity. |
| Manual Sync button. | Easier than background jobs for a first version. | GitHub webhooks or a cron/queue worker. |
| Basic review intervals. | Keeps spaced repetition explainable. | Implement SM-2 and update `reps`, `easeFactor`, `intervalDays`. |
| JWT in localStorage. | Fast SPA demo setup. | Use secure, HTTP-only cookies and refresh/session rotation. |
| GitHub tokens stored directly. | Local development convenience. | Encrypt tokens at rest and add token revocation/reconnect handling. |
| No automated tests. | Time was focused on end-to-end workflow. | Add unit tests for parsers/scheduling and API integration tests. |

## 14. Interview questions and model answers

### Why did you choose PostgreSQL instead of MongoDB?

The application has explicit relationships and ownership rules: users own solutions, and solutions own reviews. PostgreSQL foreign keys make invalid relationships difficult to create. Prisma makes the relational queries readable. MongoDB could store this data, but enforcing ownership and joining related entities would be less direct.

### How do you prevent one user from reading another user’s solution?

Authentication middleware gets `userId` from the JWT. Services filter every sensitive query by that ID. For example, a review is found only if `review.solution.userId` matches the authenticated user. A user cannot access another user’s solution just by guessing an ID.

### Why store both Problem and Solution?

Problem is shared metadata: title, URL, difficulty, topics. Solution is personal and versioned by user and GitHub commit: code, language, time, memory, solve date, and AI analysis. This prevents duplicate problem metadata while keeping each user’s work private.

### How do you avoid duplicate imports?

Each solution has a composite unique key of `(userId, commitSha)`. The importer uses upsert. `lastSyncAt` also limits GitHub requests to new commits after a successful sync.

### Why not import a user’s entire repository on first login?

It can create hundreds of review cards and immediately overwhelm the user. LeetRev starts with the previous 24 hours, which provides a useful daily workflow. Historical import can later be offered as an explicit, rate-limited onboarding option.

### Why cache AI analysis in the database?

Generating the same explanation repeatedly costs money, adds latency, and can produce slightly different answers. Caching gives a stable experience and only calls the model when analysis is missing.

### What happens if GitHub fails during sync?

The backend returns an error; `lastSyncAt` is only updated after the loop completes successfully. That means a later retry starts from the previous successful point instead of silently skipping commits.

### How would you scale sync?

Move sync into a background job queue. The API would enqueue a job and return immediately; a worker handles GitHub rate limits, retries, pagination, and progress. GitHub webhooks could trigger sync when a new commit is pushed.

### What security improvements would you make before production?

Use OAuth `state` validation, HTTP-only secure cookies, encrypted GitHub tokens, request validation with Zod on all input routes, rate limiting, security headers, audit logs, token revocation, and tests for authorization boundaries.

### What is the hardest technical trade-off in this project?

Onboarding historical data. Importing all history gives richer data but produces an unusable review backlog. The current choice prioritizes a manageable daily habit; future versions can let users choose a controlled historical-import plan.

## 15. Short project pitch

> LeetRev is a multi-user LeetCode revision system built with React, Express, PostgreSQL, Prisma, GitHub OAuth, and Gemini. It converts recently committed LeetHub solutions into user-isolated problem, solution, and review records; gives a daily report; schedules revision; and provides cached AI code feedback. The key design decision is incremental per-user sync, which prevents a large GitHub history from overwhelming new users.
