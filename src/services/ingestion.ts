import prisma from "../db.js";
const BASE_URL = "https://api.github.com";

const DEFAULT_HEADERS = {
  "User-Agent": "LeetRev-App",
  accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function fetchRecentCommits(
  accessToken: string,
  repoOwner: string,
  repoName: string,
  since?: string,
) {
  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };
  const url = since
    ? `${BASE_URL}/repos/${repoOwner}/${repoName}/commits?since=${since}`
    : `${BASE_URL}/repos/${repoOwner}/${repoName}/commits`;

  const res = await fetch(url, { headers });

  if (res.status === 409) {
    throw new Error(
      "This repository has no commits yet. Select the repository containing your LeetCode solution commits.",
    );
  }

  if (!res.ok) {
    throw new Error(`Github API error: ${res.status} ${res.statusText}`);
  }
  const commits = (await res.json()) as any[];

  return commits;
}

export async function fetchCommitFiles(sha: string, accessToken: string, repoOwner: string, repoName: string) {
  const url = `${BASE_URL}/repos/${repoOwner}/${repoName}/commits/${sha}`;
  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`not fetched,${res.status} ${res.statusText}`);
  }
  const data = (await res.json()) as any;
  return data.files as any[];
}

export function parseCommitMessage(message: string) {
  const timematch = message.match(/Time:\s*([\d.]+)\s*ms/);
  const spacematch = message.match(/Space:\s*([\d.]+)\s*MB/);

  return {
    timeMs: timematch ? parseFloat(timematch[1]) : null,
    spaceMb: spacematch ? parseFloat(spacematch[1]) : null,
  };
}

export function parseFileName(filename: string) {
  const parts = filename.split("/");
  const folder = parts[0];
  const file = parts[1];

  if (!folder || !file) return null;

  const ext = file.split(".").pop();
  const language = ext || "unknown";
  return { slug: folder, language };
}

export async function fetchReadme(slug: string, accessToken: string, repoOwner: string, repoName: string) {
  const url = `${BASE_URL}/repos/${repoOwner}/${repoName}/contents/${slug}/README.md`;
  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };
  const res = await fetch(url, { headers });

  if (!res.ok) {
    return null; // README might not exist yet
  }

  const data = (await res.json()) as any;
  // GitHub returns file content as base64 encoded string
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return content;
}

export function parseReadMe(content: string) {
  const titlematch = content.match(/<a href="[^"]*">[\d]+\.\s*(.+?)<\/a>/);
  const title = titlematch ? titlematch[1].trim() : "Unknown";

  const urlmatch = content.match(
    /href="(https:\/\/leetcode\.com\/problems\/[^"]+)"/,
  );
  const url = urlmatch ? urlmatch[1] : "";

  const difficultymatch = content.match(/<h3>(Easy|Medium|Hard)<\/h3>/);
  const difficulty = difficultymatch ? difficultymatch[1] : "Unknown";

  const topicmatch = content.match(/topics[^<]*<\/p>\s*<p>([^<]+)<\/p>/i);
  const topics = topicmatch
    ? topicmatch[1]
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  return { title, difficulty, topics, url };
}

export async function fetchFileContent(filePath: string, accessToken: string, repoOwner: string, repoName: string) {
  const url = `${BASE_URL}/repos/${repoOwner}/${repoName}/contents/${filePath}`;
  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };
  const res = await fetch(url, { headers });

  if (!res.ok) return null;

  const data = (await res.json()) as any;
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return content;
}

export async function fetchUserRepositories(accessToken: string) {
  const url = `${BASE_URL}/user/repos?per_page=100&sort=updated`;

  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };

  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  const repos = (await res.json()) as any[];

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    description: repo.description,
    owner: repo.owner.login,
  }));
}

export async function verifyRepository(
  accessToken: string,
  owner: string,
  repo: string,
) {
  const url = `${BASE_URL}/repos/${owner}/${repo}`;

  const headers = {
    ...DEFAULT_HEADERS,
    authorization: `Bearer ${accessToken}`,
  };

  const res = await fetch(url, { headers });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as any;
}

export async function ingest(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  if (!user.githubAccessToken) {
    throw new Error("GitHub access token not found");
  }
  if (!user.githubRepoOwner || !user.githubRepoName) {
    throw new Error("GitHub repository not selected");
  }

  const syncStartedAt = new Date();
  const firstSyncSince = new Date(user.createdAt);
  firstSyncSince.setDate(firstSyncSince.getDate() - 1);
  const since = user.lastSyncAt || firstSyncSince;
  const commits = await fetchRecentCommits(
    user.githubAccessToken,
    user.githubRepoOwner,
    user.githubRepoName,
    since.toISOString(),
  );
  let solutionFilesProcessed = 0;

  for (const commit of commits) {
    const files = await fetchCommitFiles(commit.sha, user.githubAccessToken, user.githubRepoOwner, user.githubRepoName);
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

    const readmecontent = await fetchReadme(slug, user.githubAccessToken, user.githubRepoOwner, user.githubRepoName);
    const { title, difficulty, topics, url } = readmecontent
      ? parseReadMe(readmecontent)
      : { title: slug, difficulty: "Unknown", topics: [], url: "" };

    const code = await fetchFileContent(
      cppfile.filename,
      user.githubAccessToken,
      user.githubRepoOwner,
      user.githubRepoName,
    );

    const problem = await prisma.problem.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title,
        difficulty,
        topics,
        url,
      },
    });

    const solution = await prisma.solution.upsert({
      where: {
        userId_commitSha: {
          userId: userId,
          commitSha: commit.sha,
        },
      },
      update: {},
      create: {
        userId: userId,
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
        solutionId: solution.id,
      },
      update: {},
      create: {
        solutionId: solution.id,
        nextReviewAt: tomorrow,
      },
    });
    solutionFilesProcessed++;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastSyncAt: syncStartedAt },
  });

  return { commitsChecked: commits.length, solutionFilesProcessed };
}
