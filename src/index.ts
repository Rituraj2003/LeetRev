import "dotenv/config";
import express from "express";
import prisma from "./db.js";
import cors from "cors";
import { timeStamp } from "node:console";
import {
  fetchCommitFiles,
  fetchFileContent,
  fetchReadme,
  fetchRecentCommits,
  parseCommitMessage,
  parseFileName,
  parseReadMe,
} from "./services/ingestion.js";
import { read } from "node:fs";
import { getYesterdayReport } from "./services/report.js";
import { getDueReviews, rateReview } from "./services/revision.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

async function ingest() {
  const commits = await fetchRecentCommits();
  

  for (const commit of commits) {
    const files = await fetchCommitFiles(commit.sha);
    const cppfile = files.find((f: any) => f.filename.endsWith(".cpp"));

    if (!cppfile) {
      continue;
    }

    const fileInfo = await parseFileName(cppfile.filename);
    if (!fileInfo) {
      continue;
    }

    const { slug, language } = fileInfo;
    const { timeMs, spaceMb } = await parseCommitMessage(commit.commit.message);
    const solvedAt = new Date(commit.commit.author.date);

    // Fetching ReadMe

    const readmecontent = await fetchReadme(slug);
    const { title, difficulty, url } = readmecontent
      ? parseReadMe(readmecontent)
      : { title: slug, difficulty: "Unknown", url: "" };

    const code = await fetchFileContent(cppfile.filename);

    const problem = await prisma.problem.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        difficulty,
        topics: [],
        url,
      },
    });

    const solution = await prisma.solution.upsert({
      where: { commitSha: commit.sha },
      update: {},
      create: {
        problemId: problem.id,
        code: code || "",
        language,
        commitSha: commit.sha,
        solvedAt,
        timeMs,
        spaceMb,
      },
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    await prisma.review.upsert({
      where: {
        problemId: problem.id,
      },
      update: {},
      create: {
        problemId: problem.id,
        nextReviewAt: tomorrow,
      },
    });
  }
}

app.get("/api/reports/yesterday", async (req, res) => {
  try {
    const report = await getYesterdayReport();
    res.json(report);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to generate report",
    });
  }
});

app.get("/api/reviews/due", async (req, res) => {
  try {
    const dueReviews = await getDueReviews();
    res.json(dueReviews);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to get reviews",
    });
  }
});

app.post("/api/reviews/:id/rate", async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating } = req.body;
    await rateReview(reviewId, rating);
    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Failed to rate review",
    });
  }
});

async function main() {
  try {
    await prisma.$connect();
    console.log("Database Connected successfully");

    await ingest();

    app.listen(PORT, () => {
      console.log(`LeetServer is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
}

main();
