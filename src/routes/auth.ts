import { Router } from "express";
import prisma from "../db.js";
import jwt from "jsonwebtoken";
const router = Router();
const clientId = process.env.GITHUB_CLIENT_ID!;
const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
const callbackURI = process.env.GITHUB_CALLBACK_URL!;
const secret = process.env.JWT_SECRET!;
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

router.get("/github", async (req, res) => {
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callbackURI);
  url.searchParams.set("scope", "read:user repo");

  return res.redirect(url.toString());
});

router.get("/github/callback", async (req, res) => {
  const code = req.query.code;

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: callbackURI,
    }),
  });

  const data: any = await response.json();
  if (!response.ok) {
    return res.status(400).json(data);
  }

  const accessToken = data.access_token;
  const userResponse = await fetch("https://api.github.com/user", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });
  const userData: any = await userResponse.json();
  const user = await prisma.user.upsert({
    where: {
      githubId: userData.id.toString(),
    },
    update: {
      githubUsername: userData.login,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      githubAccessToken: data.access_token,
    },
    create: {
      githubId: userData.id.toString(),
      githubUsername: userData.login,
      email: userData.email,
      avatarUrl: userData.avatar_url,
      githubAccessToken: data.access_token,
    },
  });
  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: "1h" });
  console.log({
    tokenReceived: !!data.access_token,
    tokenType: data.token_type,
    scope: data.scope,
  });
  console.log({
    githubTokenStored: !!user.githubAccessToken,
  });
  const redirectUrl = new URL("/auth/callback", frontendUrl);
  redirectUrl.searchParams.set("token", token);

  return res.redirect(redirectUrl.toString());
});

export default router;
