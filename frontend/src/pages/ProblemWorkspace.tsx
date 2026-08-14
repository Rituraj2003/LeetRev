import { useEffect, useState } from "react";
import type { ProblemDetailResponse } from "../types/problem";
import { generateAnalysis, getProblemDetails } from "../services/api";
import { useParams } from "react-router-dom";
import ProblemHeader from "../components/ProblemHeader";
import CodeViewer from "../components/CodeViewer";
import AIAnalysis from "../components/AiAnalysis";

export default function ProblemWorkspace() {
  const [data, setData] = useState<ProblemDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [error, setError] = useState("");
  const { problemId } = useParams();

  useEffect(() => {
    async function fetchProblemDetail() {
      try {
        if (!problemId) {
          setError("Problem not found");
          return;
        }

        const details = await getProblemDetails(problemId);
        setData(details);
      } catch {
        setError("Failed to get details");
      } finally {
        setLoading(false);
      }
    }

    fetchProblemDetail();
  }, [problemId]);

  async function handleGenerateAnalysis() {
    console.log("Generate clicked");
    if (!data || !data.solution) return;

    setAnalysisLoading(true);

    try {
      const analysis = await generateAnalysis(data.solution.id);

      setData((prev) => {
        if (!prev || !prev.solution) return prev;

        return {
          ...prev,

          solution: {
            ...prev.solution,

            aiAnalysis: analysis,
          },
        };
      });
    } catch (error) {
      console.error(error);
        alert("AI review couldn't be generated right now. Please try again in a few minutes.");
    } finally {
      setAnalysisLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-sm text-[#8A8578]">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-sm text-[#A8553F]">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <p className="text-sm text-[#8A8578]">No details found</p>
      </div>
    );
  }
  console.log(data);
  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      <div className="sticky top-0 z-10">
        <ProblemHeader
          problem={data.problem}
          solution={data.solution}
          review={data.review}
        />
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 space-y-6">
        <CodeViewer solution={data.solution} />

        <AIAnalysis
          analysis={data.solution!.aiAnalysis}
          loading={analysisLoading}
          onGenerate={handleGenerateAnalysis}
        />
      </div>
    </div>
  );
}
