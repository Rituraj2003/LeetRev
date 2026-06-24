import type { yesterdayReport } from "../types/report";
import type { DueReviewsResponse } from "../types/review";

export async function getYesterdayReport(): Promise<yesterdayReport> {
  const response = await fetch("http://localhost:3000/api/reports/yesterday");
  if (!response.ok) {
    throw new Error("Failed to fetch report");
  }
  return response.json();
}

export async function getDueReviews(): Promise<DueReviewsResponse> {
  const response = await fetch("http://localhost:3000/api/reviews/due");
  if (!response.ok) {
    throw new Error("Failed to get reviews");
  }

  return response.json();
}

export async function rateReview(reviewId:string ,rating: number) {
  const response = await fetch(
    `http://localhost:3000/api/reviews/${reviewId}/rate`,
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
