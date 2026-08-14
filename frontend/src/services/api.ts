import type { AIAnalysis } from "../types/ai";
import type { ProblemDetailResponse } from "../types/problem";
import type { yesterdayReport } from "../types/report";
import type { DueReviewsResponse } from "../types/review";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "leetrev_token";

export type GitHubRepository = {
  id: number;
  name: string;
  fullName: string;
  private: boolean;
  description: string | null;
  owner: string;
};

export type GitHubStatus = {
  githubUsername: string;
  repository: { owner: string; name: string } | null;
  lastSyncAt: string | null;
};

export type GitHubSyncResult = {
  message: string;
  sync: {
    commitsChecked: number;
    solutionFilesProcessed: number;
  };
};

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiFetch(path: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${path}`, { ...init, headers });
}

async function getErrorMessage(response: Response) {
  const body = await response.json().catch(() => null);
  return body?.error || "Request failed";
}

export async function getGitHubStatus(): Promise<GitHubStatus> {
  const response = await apiFetch("/api/github/status");
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}

export async function getGitHubRepositories(): Promise<GitHubRepository[]> {
  const response = await apiFetch("/api/github/repos");
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}

export async function selectGitHubRepository(repository: GitHubRepository) {
  const response = await apiFetch("/api/github/repos/select", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ repoName: repository.name, owner: repository.owner }),
  });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}

export async function syncGitHubRepository(): Promise<GitHubSyncResult> {
  const response = await apiFetch("/api/github/sync", { method: "POST" });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}

export async function getYesterdayReport(): Promise<yesterdayReport> {
  const response = await apiFetch("/api/reports/yesterday");
  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }
  return response.json();
}

export async function getDueReviews(): Promise<DueReviewsResponse> {
  const response = await apiFetch("/api/reviews/due");
  if (!response.ok) {
    throw new Error("Failed to get reviews");
  }

  return response.json();
}

export async function startReviewSession(): Promise<DueReviewsResponse> {
  const response = await apiFetch("/api/reviews/start", { method: "POST" });
  if (!response.ok) throw new Error(await getErrorMessage(response));
  return response.json();
}

export async function rateReview(reviewId: string, rating: number) {
  const response = await apiFetch(
    `/api/reviews/${reviewId}/rate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rating,
      }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to rate review");
  }
  return response.json();
}

export async function getProblemDetails(
  problemId: string,
): Promise<ProblemDetailResponse> {
  const response = await apiFetch(
    `/api/problems/${problemId}`,
  );

  if (!response.ok) {
    throw new Error("Failed to get problem Details");
  }
  return response.json();
}

export async function generateAnalysis(
  solutionId: string,
): Promise<AIAnalysis> {
  const response = await apiFetch(
    `/api/solutions/${solutionId}/generate-analysis`,
    { method: "POST" },
  );
  if (!response.ok) {
    const error = await response.json();

    throw new Error(error.error);
  }
  return await response.json();
}
