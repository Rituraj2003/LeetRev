import { useEffect, useState } from "react";
import type { DueReviewsResponse } from "../types/review";
import { getDueReviews, startReviewSession } from "../services/api";
import ReviewCard from "../components/ReviewCard";

export default function Reviews() {
  const [data, setData] = useState<DueReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingSession, setStartingSession] = useState(false);
  useEffect(() => {
    async function loadReviews() {
      try {
        const dueReviews = await getDueReviews();
        setData(dueReviews);
      } catch {
        setError("Failed to get reviews");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

  async function handleStartSession() {
    setStartingSession(true);
    setError("");
    try {
      setData(await startReviewSession());
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "Failed to start a review session");
    } finally {
      setStartingSession(false);
    }
  }

  function handleRated(reviewId: string) {
    if (!data) return;

    setData({
      totalDue: Math.max(0, data.totalDue - 1),
      reviews: data.reviews.filter((review) => review.id !== reviewId),
    });
  }

  if (loading) {
    return <h1>Loading....</h1>;
  }
  if (error) {
    return <h1>{error}</h1>;
  }
  if (!data) {
    return <h1>No report found</h1>;
  }
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="max-w-2xl px-6 py-14 mx-auto">

        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-3">
          Revision
        </p>
        <h1 className="font-serif text-4xl text-[#1C1B19] mb-1 leading-tight">
          Today's Review Queue
        </h1>
        <p className="text-[#6B6659] text-[15px] mt-2">
          <span className="font-semibold text-[#1C1B19]">{data.totalDue}</span> problem{data.totalDue !== 1 ? 's' : ''} due
        </p>

        <div className="mt-10">
          {data.totalDue === 0 && (
            <div className="rounded-xl border border-[#E8E4DA] bg-white p-6">
              <p className="font-medium text-[#1C1B19]">No reviews are due yet.</p>
              <p className="mt-2 text-sm text-[#6B6659]">
                Your newly imported solutions are scheduled for tomorrow. Start five now to begin your first session today.
              </p>
              <button
                type="button"
                onClick={handleStartSession}
                disabled={startingSession}
                className="mt-5 rounded-lg bg-[#2B3A55] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#1C1B19] disabled:opacity-60"
              >
                {startingSession ? "Starting session…" : "Start 5 reviews now"}
              </button>
            </div>
          )}
          {data.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onRated={handleRated} />
          ))}
        </div>

      </div>
    </div>
  );
}
