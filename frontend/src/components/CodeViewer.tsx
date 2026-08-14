import type { Solution } from "../types/problem";
import CodeBlock from "./CodeBlock";

type CodeViewerProps = {
  solution: Solution | null;
};

export default function CodeViewer({ solution }: CodeViewerProps) {
  if (!solution) {
    return (
      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-6">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578]">
          Latest Solution
        </p>

        <p className="mt-4 text-sm text-[#8A8578]">No solution available.</p>
      </div>
    );
  }

  const solvedDate = new Date(solution.solvedAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E8E4DA] flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578]">
            Latest Solution
          </p>
        </div>

        <div className="flex items-center gap-5 text-xs">
          <span className="text-[#6B6659]">
            <span className="font-semibold text-[#1C1B19]">
              {solution.timeMs} ms
            </span>{" "}
            Runtime
          </span>

          <span className="text-[#6B6659]">
            <span className="font-semibold text-[#1C1B19]">
              {solution.spaceMb} MB
            </span>{" "}
            Memory
          </span>

          <span className="rounded-full bg-[#F3F1EB] px-2.5 py-1 text-[11px] font-medium text-[#6B6659]">
            {solution.language.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Code */}
      <div className="bg-[#1C1B19]">
        <pre className="overflow-x-auto p-6 text-sm text-[#F5F3ED]">
          <CodeBlock code={solution.code} language={solution.language} />
        </pre>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#E8E4DA] bg-white">
        <p className="text-xs text-[#8A8578]">
          Solved on{" "}
          <span className="font-medium text-[#1C1B19]">{solvedDate}</span>
        </p>
      </div>
    </div>
  );
}
