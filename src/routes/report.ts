import {Router} from "express";
import { getYesterdayReport } from "../services/report.js";
const router=Router();
router.get("/yesterday", async (req, res) => {
  try {
    const report = await getYesterdayReport(req.userId);
    res.json(report);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to generate report",
    });
  }
});

export default router;