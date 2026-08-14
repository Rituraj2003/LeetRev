import type { ReactNode } from "react";

type AnalysisSectionProps = {
  title: string;
  children: ReactNode;
};

export default function AnalysisSection({ title, children }: AnalysisSectionProps) {
  return (
    <div className="pt-6 border-t border-[#F0EDE6]">
      <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-3">
        {title}
      </p>
      <div>{children}</div>
    </div>
  );
}