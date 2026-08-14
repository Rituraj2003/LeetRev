import type { Complexity } from "../types/ai";

type ComplexitySectionProps = {
  title: string;
  complexity: Complexity;
};

export default function ComplexitySection({ title, complexity }: ComplexitySectionProps) {
  return (
    <div className="pt-6 border-t border-[#F0EDE6]">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-4">
        {title}
      </p>

      <div className="flex items-start gap-6 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8A8578] mb-1">Your solution</p>
          <span className="font-mono text-lg font-semibold text-[#2B3A55]">
            {complexity.yourSolution}
          </span>
        </div>

        <div className="w-px self-stretch bg-[#F0EDE6]" />

        <div>
          <p className="text-[10px] uppercase tracking-widest text-[#8A8578] mb-1">Optimal</p>
          <span className="font-mono text-lg font-semibold text-[#5B8266]">
            {complexity.optimal}
          </span>
        </div>
      </div>

      <p className="text-sm leading-7 text-[#5C584F]">
        {complexity.explanation}
      </p>
    </div>
  );
}