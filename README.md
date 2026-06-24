# 🚀 LeetRev

> A smart LeetCode revision system that automatically tracks solved problems, schedules reviews, and helps developers retain DSA concepts through structured repetition.

---

## 📌 Problem

Most developers solve hundreds of LeetCode problems but forget the underlying concepts after a few weeks.

Traditional trackers answer:

* How many problems have I solved?
* What is my current streak?

LeetRev answers:

* What should I revise today?
* Which problems am I forgetting?
* Which problems have I mastered?

---

## ✨ Features

### Automated GitHub Ingestion

* Fetches recent GitHub commits
* Detects newly solved LeetCode problems
* Extracts metadata automatically
* Stores solutions and performance metrics

### Problem Repository

Stores:

* Problem Title
* Difficulty
* LeetCode URL
* Solution Code
* Runtime
* Memory Usage

### Smart Review Queue

Automatically creates revision tasks for newly solved problems.

Shows:

* Due Reviews
* Difficulty
* Due Date
* Direct LeetCode Link

### Rating-Based Scheduling

After reviewing a problem:

| Rating | Action               |
| ------ | -------------------- |
| 1      | Review after 2 days  |
| 2      | Review after 3 days  |
| 3      | Review after 7 days  |
| 4      | Review after 15 days |
| 5      | Mark as MASTERED     |

MASTERED problems are automatically removed from the active review queue.

### Real-Time Updates

After rating a problem:

* Backend updates schedule
* Frontend refreshes automatically
* Review card disappears instantly

---

# 🏗️ Architecture

GitHub Repository

↓

Ingestion Service

↓

PostgreSQL Database

↓

Express API

↓

React Frontend

↓

Revision Workflow

---

# 🛠️ Tech Stack

## Backend

* Node.js
* Express.js
* TypeScript
* Prisma ORM
* PostgreSQL
* Docker

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## APIs

* GitHub REST API

---

# 🗄️ Database Design

## Problem

Stores problem metadata.

Fields:

* slug
* title
* difficulty
* topics
* url

---

## Solution

Stores solved submissions.

Fields:

* problemId
* code
* language
* commitSha
* solvedAt
* timeMs
* spaceMb

---

## Review

Stores revision scheduling information.

Fields:

* problemId
* nextReviewAt
* status

Status Values:

* NEW
* MASTERED

---

# 🔄 Review Workflow

Solve Problem

↓

GitHub Commit

↓

LeetRev Ingestion

↓

Review Created

↓

Due Review Queue

↓

User Reviews Problem

↓

Rate 1–5

↓

Schedule Updated

↓

Repeat Until Mastered

---

# 📡 API Endpoints

## Reports

### GET /api/reports/yesterday

Returns previous day's coding summary.

---

## Reviews

### GET /api/reviews/due

Returns currently due review problems.

---

### POST /api/reviews/:id/rate

Rate a review and update its schedule.

Request:

```json
{
  "rating": 4
}
```

Response:

```json
{
  "success": true
}
```

---

# 🎨 Frontend

### Dashboard

Displays coding activity and reports.

### Reviews Page

Displays:

* Due review count
* Problem title
* Difficulty
* Due date
* Rating controls
* Direct problem link

### Review Cards

Users can:

* Open the problem
* Submit rating
* Update review schedule

---

# 🧠 Key Engineering Decisions

### Prisma Upserts

Used throughout ingestion to prevent duplicate records.

Benefits:

* Idempotent ingestion
* Safe repeated execution

---

### Service-Oriented Backend

Business logic lives inside services.

Example:

```text
Route
 ↓
Service
 ↓
Prisma
```

This keeps controllers thin and maintainable.

---

### Callback-Based React Updates

ReviewCard components notify their parent when a review is completed.

```text
ReviewCard
 ↓
onRated()
 ↓
Reviews Page
 ↓
Refresh Queue
```

This ensures the UI always reflects the latest database state.

---

# 🚧 Current Status

## Completed

* GitHub ingestion pipeline
* Problem metadata extraction
* Solution storage
* Review creation
* Due review queue
* Rating system
* Review scheduling
* React frontend
* Auto-refresh after rating

## In Progress

* Dashboard analytics
* Mastered problems page

## Planned

* Review history tracking
* Topic analytics
* Revision heatmap
* Email reminders
* Calendar integration
* Advanced spaced repetition algorithms
* AI-generated revision notes

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Rituraj2003/LeetRev.git
cd LeetRev
```

## Install Backend Dependencies

```bash
npm install
```

## Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Configure Environment Variables

Create:

```bash
.env
```

Example:

```env
DATABASE_URL=your_database_url
GITHUB_TOKEN=your_github_token
```

## Start PostgreSQL

```bash
docker compose up -d
```

## Run Prisma Migrations

```bash
npx prisma migrate dev
```

## Start Backend

```bash
npm run dev
```

## Start Frontend

```bash
cd frontend
npm run dev
```

---

# 📈 Future Vision

LeetRev aims to become a complete interview preparation companion that not only tracks solved problems but actively helps developers retain and master concepts over time.

The long-term goal is to combine:

* GitHub Activity
* LeetCode Solutions
* Spaced Repetition
* Analytics
* AI Assistance

into a single learning platform.

---

## 👨‍💻 Author

**Rituraj Mishra**

MCA Student | Full Stack Developer | DSA Enthusiast

Built with React, Express, Prisma, PostgreSQL, and a lot of debugging.
