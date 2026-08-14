import "dotenv/config";
import express from "express";
import prisma from "./db.js";
import cors from "cors";
import reportRouter from "./routes/report.js";
import reviewRouter from "./routes/review.js";
import problemRouter from "./routes/problem.js";
import aiRouter from "./routes/solution.js";
import authRouter from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import githubRouter from "./routes/github.js";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);


app.use("/auth", authRouter);
app.use("/api", authMiddleware);
app.use("/api/github", githubRouter);
app.use("/api/reports", reportRouter);

app.use("/api/reviews", reviewRouter);

app.use("/api/problems", problemRouter);

app.use("/api/solutions", aiRouter);

async function main() {
  try {
    await prisma.$connect();
    console.log("Database Connected successfully");

    // await ingest();

    app.listen(PORT, () => {
      console.log(`LeetServer is running on ${PORT}`);
    });
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
}

main();
