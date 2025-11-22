"use client";
import { VulnerabilityTable } from "@/components/VulnerabilityTable";
import { RiskChart } from "@/components/RiskChart";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalysis = async () => {
      const analysisId = searchParams.get("id");

      if (!analysisId) {
        setError("No analysis ID provided");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/analyze?id=${analysisId}`);
        const data = await res.json();

        if (res.ok) {
          setAnalysis(data);
        } else {
          setError(data.error || "Failed to load analysis");
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-cyan-300 text-lg">Loading analysis results...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-8 text-center border border-cyan-500">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Error Loading Analysis
          </h2>
          <p className="text-gray-300 mb-6">{error || "Analysis not found"}</p>
          <Link
            href="/upload"
            className="inline-block px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
          >
            Upload New CSV
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/"
              className="text-cyan-400 hover:text-cyan-300 transition-colors mb-2 inline-block"
            >
              ← Back to Home
            </Link>
            <h1 className="text-5xl font-bold text-white mb-2">
              Security Analysis <span className="text-cyan-400">Report</span>
            </h1>
            <p className="text-gray-300 text-xl">
              AI-Powered Prioritization & Remediation
            </p>
          </div>
          <Link
            href="/upload"
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold transition-colors"
          >
            New Scan
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {["critical", "high", "medium", "low"].map((sev) => (
            <div
              key={sev}
              className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl p-6 border border-gray-700 hover:border-cyan-500 transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-sm uppercase font-semibold">
                  {sev}
                </span>
                <span
                  className={`text-2xl ${
                    sev === "critical"
                      ? "🔴"
                      : sev === "high"
                      ? "🟠"
                      : sev === "medium"
                      ? "🟡"
                      : "🟢"
                  }`}
                >
                  {sev === "critical"
                    ? "🔴"
                    : sev === "high"
                    ? "🟠"
                    : sev === "medium"
                    ? "🟡"
                    : "🟢"}
                </span>
              </div>
              <div
                className={`text-5xl font-bold ${
                  sev === "critical"
                    ? "text-red-400"
                    : sev === "high"
                    ? "text-orange-400"
                    : sev === "medium"
                    ? "text-yellow-400"
                    : "text-green-400"
                }`}
              >
                {analysis.summary[sev]}
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <RiskChart data={analysis.prioritizedIssues} />

        {/* AI Insights */}
        <div className="mt-8 bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-8 border border-gray-700">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-4xl">🤖</span>
            <h2 className="text-3xl font-bold text-white">AI Insights</h2>
          </div>
          <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {analysis.insights}
          </p>
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="mt-8 bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl shadow-2xl p-8 border border-gray-700">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-4xl">💡</span>
              <h2 className="text-3xl font-bold text-white">Recommendations</h2>
            </div>
            <ul className="space-y-3">
              {analysis.recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3 text-gray-300">
                  <span className="text-cyan-400 font-bold mt-1">•</span>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Vulnerabilities Table */}
        <div className="mt-8">
          <VulnerabilityTable
            issues={analysis.prioritizedIssues}
            analysisId={searchParams.get("id") || ""}
          />
        </div>
      </div>
    </div>
  );
}
