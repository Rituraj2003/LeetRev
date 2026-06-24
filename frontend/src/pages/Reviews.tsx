import { useEffect, useState } from "react";
import type { DueReviewsResponse } from "../types/review";
import { getDueReviews } from "../services/api";
import ReviewCard from "../components/ReviewCard";

export default function Reviews() {
  const [data, setData] = useState<DueReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function getReviews() {
      try {
        const dueReviews = await getDueReviews();
        setData(dueReviews);
      } catch (error) {
        setError("Failed to get reviews");
      } finally {
        setLoading(false);
      }
    }
  useEffect(() => {
    
    getReviews();
  }, []);

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
          {data.reviews.map((review) => (
            <ReviewCard key={review.id} review={review} onRated={getReviews} />
          ))}
        </div>

      </div>
    </div>
  );
}
