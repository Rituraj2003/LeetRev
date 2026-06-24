import type { ProblemSummary } from "../types/report";

type ProblemCardProps = {
  problem: ProblemSummary;
};
export default function ProblemCard({ problem }: ProblemCardProps) {
  const solvedTime = new Date(problem.solvedAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const difficultyColors = {
    Easy: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    Medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
    Hard: "bg-rose-50 text-rose-700 ring-rose-600/20",
  };
  const badgeClass =
    difficultyColors[problem.difficulty] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="group border border-gray-200/70 rounded-xl p-5 bg-white hover:border-gray-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-lg font-semibold  text-gray-900 leading-snug">
          {problem.title}
        </h3>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ring-1 ring-inset ${badgeClass}`}>
          {problem.difficulty}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-300"/>
            {problem.language.toUpperCase()}
        </span>
        <span className="text-gray-300">.</span>
        <span>{solvedTime}</span>
      </div>

    </div>
  );
}
