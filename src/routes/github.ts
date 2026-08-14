import { Router } from "express";
import prisma from "../db.js";
import {
  fetchUserRepositories,
  verifyRepository,
  ingest
} from "../services/ingestion.js";

const router = Router();

router.get("/status", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        githubUsername: true,
        githubRepoOwner: true,
        githubRepoName: true,
        lastSyncAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({
      githubUsername: user.githubUsername,
      repository:
        user.githubRepoOwner && user.githubRepoName
          ? { owner: user.githubRepoOwner, name: user.githubRepoName }
          : null,
      lastSyncAt: user.lastSyncAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get GitHub status" });
  }
});

router.get("/repos", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        error: "User Not found",
      });
    }
    if (!user.githubAccessToken) {
      return res.status(400).json({
        error: "Github account is not connected",
      });
    }
    const repos = await fetchUserRepositories(user.githubAccessToken);
    return res.json(repos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch repositories",
    });
  }
});

router.post("/repos/select", async (req, res) => {
  try {
    const { repoName, owner } = req.body;

    if (typeof repoName !== "string" || !repoName.trim()) {
      return res.status(400).json({ error: "Repository name is required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },
    });
    if (!user) {
      return res.status(404).json({
        error: "User Not found",
      });
    }
    if (!user.githubAccessToken) {
      return res.status(400).json({
        error: "Github account is not connected",
      });
    }
    const repoOwner =
      typeof owner === "string" && owner.trim() ? owner.trim() : user.githubUsername;
    const repository = await verifyRepository(
      user.githubAccessToken,
      repoOwner,
      repoName.trim(),
    );
    if (!repository) {
      return res.status(400).json({
        error: "Repository not found or inaccessible",
      });
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        githubRepoName: repository.name,
        githubRepoOwner: repository.owner.login,
      },
    });
    return res.json({
      message: "Repository connected",
      repository: {
        owner: updatedUser.githubRepoOwner,
        name: updatedUser.githubRepoName,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to select repository",
    });
  }
});

router.post("/sync",async(req,res)=>{
    try{
        const sync = await ingest(req.userId);
        return res.json({
            message:"Github repo synced successfully",
            sync,
        })
    }catch(error){
        console.error("GitHub sync failed:", error);
        return res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to sync Github repository"
        })
    }
})

export default router;
