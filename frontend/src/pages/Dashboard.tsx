import { useEffect, useState } from "react";
import type { yesterdayReport } from "../types/report";
import { getYesterdayReport } from "../services/api";
import ProblemCard from "../components/ProblemCard";

export default function ReportPage() {
  const [report, setReport] = useState<yesterdayReport | null>(null);
  const [loading, setloading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await getYesterdayReport();

        setReport(data);
      } catch {
        setError("Failed to load report");
      } finally {
        setloading(false);
      }
    }
    loadReport();
  }, []);

  if (loading) {
    return <h1>Loading....</h1>;
  }
  if (error) {
    return <h1>{error}</h1>;
  }
  if (!report) {
    return <h1>No report found</h1>;
  }
  return (
    <div className="max-w-4xl px-4 sm:px-6 py-10 mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200/70 p-7 shadow-sm ring-1 ring-gray-900/5">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
          Daily Report
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">
          Yesterday's Report
        </h1>
        <p className="text-sm text-gray-500">{report.date}</p>

        <div className="mt-5 flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gray-900 text-white text-xl font-bold">
            {report.totalSolved}
          </span>
          <div>
            <p className="text-sm font-medium text-gray-900">Problems solved</p>
            <p className="text-xs text-gray-500">Keep the streak going</p>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {report.problems.map((problem) => (
          <ProblemCard key={problem.slug} problem={problem} />
        ))}
      </div>
    </div>
  );
}
