import { Router } from "express";
import { getDueReviews, rateReview, startReviewSession } from "../services/revision.js";
const router = Router();

router.get("/due", async (req, res) => {
  console.log("Authenticated user:", req.userId);
  try {
    const dueReviews = await getDueReviews(req.userId);
    return res.json(dueReviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get reviews",
    });
  }
});

router.post("/start", async (req, res) => {
  try {
    const reviews = await startReviewSession(req.userId);
    return res.json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to start a review session" });
  }
});

router.post("/:id/rate", async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating } = req.body;
    await rateReview(reviewId, rating,req.userId);
    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to give rating",
    });
  }
});

export default router;
