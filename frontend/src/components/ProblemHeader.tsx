import type { Problem, Review, Solution } from "../types/problem";

type ProblemHeaderProps = {
  problem: Problem;
  solution: Solution | null;
  review: Review | null;
};

const difficultyDot: Record<string, string> = {
  Easy: "bg-[#5B8266]",
  Medium: "bg-[#C08A3E]",
  Hard: "bg-[#A8553F]",
};

const difficultyText: Record<string, string> = {
  Easy: "text-[#5B8266]",
  Medium: "text-[#C08A3E]",
  Hard: "text-[#A8553F]",
};

export default function ProblemHeader({ problem, solution, review }: ProblemHeaderProps) {
  const solvedDate = solution
    ? new Date(solution.solvedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  const dotClass = difficultyDot[problem.difficulty] ?? "bg-[#8A8578]";
  const textClass = difficultyText[problem.difficulty] ?? "text-[#8A8578]";

  return (
    <div className="bg-white border-b border-[#E8E4DA] px-8 py-8">

      {/* eyebrow */}
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-3">
        Problem Journal
      </p>

      {/* title row */}
      <div className="flex items-start justify-between gap-6">
        <h1 className="font-serif text-4xl text-[#1C1B19] leading-tight max-w-2xl">
          {problem.title}
        </h1>
        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 mt-1 text-xs font-medium text-[#2B3A55] hover:text-[#1C1B19] border border-[#D9D4C5] hover:border-[#2B3A55] rounded-full px-4 py-2 transition-colors"
        >
          Open on LeetCode ↗
        </a>
      </div>

      {/* meta row */}
      <div className="mt-4 flex items-center gap-5 text-sm">
        <span className={`flex items-center gap-1.5 font-medium ${textClass}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
          {problem.difficulty}
        </span>

        <span className="text-[#D9D4C5]">·</span>

        <span className="text-[#6B6659]">
          Solved <span className="font-medium text-[#1C1B19]">{solvedDate}</span>
        </span>

        <span className="text-[#D9D4C5]">·</span>

        <span className="text-[#6B6659]">
          Review <span className="font-medium text-[#1C1B19]">{review?.status ?? "Not Scheduled"}</span>
        </span>

      </div>
    </div>
  );
}
