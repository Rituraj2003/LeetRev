import { Router } from "express";
import { getProblemDetails } from "../services/problem.js";
const router=Router();

router.get("/:id", async (req, res) => {
  try {
    const problemId = req.params.id;
    const problem = await getProblemDetails(problemId,req.userId);
    res.json(problem);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to get problem details",
    });
  }
})

export default router;