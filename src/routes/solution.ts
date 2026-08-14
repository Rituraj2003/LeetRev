import { Router } from "express";
import { generateAIReview } from "../services/aiReview.js";
const router=Router();

router.post("/:solutionId/generate-analysis",async (req, res) => {
  try {
    const solutionId = req.params.solutionId;
    const analysis = await generateAIReview(solutionId,req.userId);
    return res.status(200).json(analysis);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to Generate Reviews",
    });
  }
})
export default router