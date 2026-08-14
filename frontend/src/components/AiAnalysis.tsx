import type { AIAnalysis as AIAnalysisType } from "../types/ai";
import AnalysisSection from "./AnalysisSection";
import ComplexitySection from "./ComplexitySection";

type AIAnalysisProps = {
  analysis: AIAnalysisType | null;
  loading: boolean;
  onGenerate: () => void;
};

export default function AIAnalysis({ analysis, loading, onGenerate }: AIAnalysisProps) {

  // ── loading state ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-12 flex flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B3A55] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B3A55] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#2B3A55] animate-bounce" />
        </div>
        <p className="text-sm text-[#8A8578]">Reviewing your solution...</p>
      </div>
    );
  }

  // ── empty state ────────────────────────────────────────────────
  if (!analysis) {
    return (
      <div className="bg-white border border-[#E8E4DA] rounded-2xl p-12 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#F3F1EB] flex items-center justify-center mb-5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2B3A55" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-3">
          AI Analysis
        </p>
        <h3 className="font-serif text-xl text-[#1C1B19] mb-2">
          Review your solution
        </h3>
        <p className="text-sm text-[#6B6659] max-w-sm leading-relaxed mb-8">
          Get an interview-style breakdown — algorithm, pattern, complexity, improvements, and key learnings.
        </p>

        <button
          onClick={onGenerate}
          className="px-6 py-2.5 rounded-full bg-[#2B3A55] text-white text-sm font-medium hover:opacity-90 active:scale-95 transition-all"
        >
          Analyse solution
        </button>
      </div>
    );
  }

  // ── analysis result ────────────────────────────────────────────
  return (
    <div className="bg-white border border-[#E8E4DA] rounded-2xl overflow-hidden">

      {/* header */}
      <div className="px-8 py-6 border-b border-[#E8E4DA]">
        <p className="text-xs font-medium uppercase tracking-[0.15em] text-[#8A8578] mb-1">
          AI Analysis
        </p>
        <h2 className="font-serif text-2xl text-[#1C1B19]">
          Interview Review
        </h2>
      </div>

      {/* body */}
      <div className="px-8 py-6 space-y-0">

        <AnalysisSection title="Algorithm">
          <p className="text-base font-medium text-[#1C1B19]">
            {analysis.algorithm}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Pattern">
          <p className="text-base font-medium text-[#1C1B19] mb-2">
            {analysis.pattern.name}
          </p>
          <p className="text-sm leading-7 text-[#5C584F]">
            {analysis.pattern.why}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Key Observation">
          <p className="text-sm leading-7 text-[#5C584F]">
            {analysis.keyObservation}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Approach">
          <p className="text-sm leading-7 text-[#5C584F]">
            {analysis.approach}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Improvements">
          <ul className="space-y-2.5">
            {analysis.improvements.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-[#5C584F] leading-relaxed">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C08A3E] shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </AnalysisSection>

        <AnalysisSection title="Interview Feedback">
          <p className="text-sm leading-7 text-[#5C584F]">
            {analysis.interviewFeedback}
          </p>
        </AnalysisSection>

        <AnalysisSection title="Key Learning">
          <p className="text-sm leading-7 text-[#5C584F] font-medium">
            {analysis.keyLearning}
          </p>
        </AnalysisSection>

        <ComplexitySection title="Time Complexity" complexity={analysis.timeComplexity} />
        <ComplexitySection title="Space Complexity" complexity={analysis.spaceComplexity} />

      </div>
    </div>
  );
}