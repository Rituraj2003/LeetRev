import { Router } from "express";
import prisma from "../db.js";
import jwt from "jsonwebtoken";

const router = Router();

function getSecret() {
  return (process.env.JWT_SECRET || "default_leetrev_jwt_secret_key").trim();
}

router.get("/github", async (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID?.trim() || "";
  const callbackURI = process.env.GITHUB_CALLBACK_URL?.trim() || "";

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackURI);
  url.searchParams.set("scope", "read:user repo");

  return res.redirect(url.toString());
});

router.get("/github/callback", async (req, res) => {
  try {
    const clientId = process.env.GITHUB_CLIENT_ID?.trim() || "";
    const clientSecret = process.env.GITHUB_CLIENT_SECRET?.trim() || "";
    const callbackURI = process.env.GITHUB_CALLBACK_URL?.trim() || "";
    const rawFrontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:5173";
    const frontendUrl = rawFrontendUrl.replace(/\/$/, "");

    const code = req.query.code;
    if (!code || typeof code !== "string") {
      return res.status(400).json({ error: "Missing authorization code from GitHub" });
    }

    const response = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "LeetRev-App",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: callbackURI,
      }),
    });

    const data: any = await response.json();
    if (!response.ok || data.error) {
      console.error("GitHub Token Error:", data);
      return res.status(400).json({ error: data.error_description || data.error || "Failed to exchange token with GitHub" });
    }

    const accessToken = data.access_token;
    if (!accessToken) {
      return res.status(400).json({ error: "No access token received from GitHub" });
    }

    const userResponse = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "LeetRev-App",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    const userData: any = await userResponse.json();
    if (!userResponse.ok || !userData || !userData.id) {
      console.error("GitHub User Profile Error:", userData);
      return res.status(400).json({ error: "Failed to fetch GitHub user profile" });
    }

    const user = await prisma.user.upsert({
      where: {
        githubId: userData.id.toString(),
      },
      update: {
        githubUsername: userData.login,
        email: userData.email || null,
        avatarUrl: userData.avatar_url || "",
        githubAccessToken: accessToken,
      },
      create: {
        githubId: userData.id.toString(),
        githubUsername: userData.login,
        email: userData.email || null,
        avatarUrl: userData.avatar_url || "",
        githubAccessToken: accessToken,
      },
    });

    const secret = getSecret();
    const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "7d" });

    const redirectUrl = new URL(`${frontendUrl}/auth/callback`);
    redirectUrl.searchParams.set("token", token);

    return res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("GitHub Auth Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal Server Error during GitHub Authentication",
    });
  }
});

export default router;
