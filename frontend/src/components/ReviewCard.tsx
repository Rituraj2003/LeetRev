import { rateReview } from "../services/api";
import type { DueReview } from "../types/review";

type ReviewCardProps = {
  review: DueReview;
  onRated:()=> void;
};

export default function ReviewCard({ review ,onRated}: ReviewCardProps) {
  const dueDate = new Date(review.nextReviewAt).toLocaleDateString("en-IN");
  const title = review.problem.title;
  const url = review.problem.url;
  const difficulty = review.problem.difficulty;

  const difficultyDot: Record<string, string> = {
    Easy: "bg-[#5B8266]",
    Medium: "bg-[#C08A3E]",
    Hard: "bg-[#A8553F]",
  };
  const dotClass = difficultyDot[difficulty] ?? "bg-[#8A8578]";
  async function handleRating(rating: number) {
    await rateReview(review.id, rating);
    onRated();
  }

  return (
    <div className="group flex items-center gap-4 py-5 px-1 border-t border-[#E8E4DA] first:border-t-0">
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />

      <div className="flex-1 min-w-0">
        <h2 className="text-[15px] font-medium text-[#1C1B19] group-hover:text-[#2B3A55] transition-colors">
          {title}
        </h2>
        <p className="text-xs text-[#8A8578] mt-1">
          {difficulty} · due {dueDate}
        </p>
      </div>
      <div className="flex gap-2 mt-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            onClick={() => handleRating(rating)}
            className="w-8 h-8 rounded-full border border-[#D9D4C5]
                   text-xs font-medium
                   hover:bg-[#2B3A55]
                   hover:text-white
                   transition-colors"
          >
            {rating}
          </button>
        ))}
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-xs font-medium text-[#2B3A55] hover:text-[#1C1B19] border border-[#D9D4C5] hover:border-[#2B3A55] rounded-full px-3.5 py-1.5 transition-colors"
      >
        Open
      </a>
    </div>
  );
}
