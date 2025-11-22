"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  scanName?: string;
  summary: {
    totalPackages: number;
    totalVulnerabilities: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
  };
}

export default function Home() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scan from history?")) {
      return;
    }

    try {
      await fetch(`/api/history?id=${id}`, { method: "DELETE" });
      setHistory(history.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting history item:", error);
      alert("Failed to delete history item");
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-cyan-900">
      <div className="max-w-7xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <img
            src="/logo.png"
            alt="SecInsight AI Logo"
            width={120}
            height={120}
            className="mx-auto mb-6"
          />
          <h1 className="text-6xl font-bold text-white mb-6">
            SecInsight <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-2xl text-gray-300 mb-4">
            Intelligent DevSecOps Assistant
          </p>
          <p className="text-lg text-gray-400 max-w-3xl mx-auto">
            Transform security chaos into actionable insights. Upload your
            vulnerability scan CSV and let AI prioritize, explain, and provide
            one-click remediation.
          </p>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mb-20">
          <Link
            href="/upload"
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-700 text-white text-xl font-semibold rounded-xl shadow-2xl transition-all transform hover:scale-105"
          >
            🚀 Analyze Security Scan
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800 bg-opacity-50 p-8 rounded-2xl backdrop-blur">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-3">
              AI-Powered Prioritization
            </h3>
            <p className="text-gray-400">
              Google Gemini analyzes vulnerabilities and assigns priority scores
              (1-10) based on actual risk, not just severity labels.
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 p-8 rounded-2xl backdrop-blur">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-white mb-3">
              Smart Insights
            </h3>
            <p className="text-gray-400">
              Get context-aware explanations, false positive likelihood, and
              trend analysis for each vulnerability.
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 p-8 rounded-2xl backdrop-blur">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">
              One-Click Remediation
            </h3>
            <p className="text-gray-400">
              Copy-paste ready fixes, config changes, and upgrade commands to
              resolve issues instantly.
            </p>
          </div>
        </div>

        {/* Supported Tools */}
        <div className="bg-slate-800 bg-opacity-30 p-8 rounded-2xl text-center mb-16">
          <h3 className="text-2xl font-bold text-white mb-6">
            Supports All Major Security Tools
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              "Snyk",
              "Trivy",
              "npm audit",
              "ScoutSuite",
              "Semgrep",
              "Dependabot",
              "OWASP ZAP",
              "Bandit",
            ].map((tool) => (
              <span
                key={tool}
                className="px-6 py-3 bg-cyan-600 bg-opacity-20 text-cyan-300 rounded-full font-semibold"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Scan History */}
        {!loading && history.length > 0 && (
          <div className="mt-16">
            <h3 className="text-3xl font-bold text-white mb-8 text-center">
              📊 Recent Scans
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-800 bg-opacity-50 p-6 rounded-xl backdrop-blur border border-slate-700 hover:border-cyan-500 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      {item.scanName && (
                        <h4 className="text-lg font-semibold text-cyan-400 mb-1 truncate">
                          {item.scanName}
                        </h4>
                      )}
                      <p className="text-sm font-medium text-white mb-1 truncate">
                        {item.fileName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteHistoryItem(item.id)}
                      className="text-red-400 hover:text-red-300 ml-2"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-slate-900 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Total Issues</p>
                      <p className="text-2xl font-bold text-white">
                        {item.summary.totalVulnerabilities}
                      </p>
                    </div>
                    <div className="bg-slate-900 bg-opacity-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-400 mb-1">Packages</p>
                      <p className="text-2xl font-bold text-white">
                        {item.summary.totalPackages}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <span className="px-2 py-1 bg-red-600 bg-opacity-20 text-red-300 rounded text-xs font-semibold">
                      🔴 {item.summary.criticalCount}
                    </span>
                    <span className="px-2 py-1 bg-orange-600 bg-opacity-20 text-orange-300 rounded text-xs font-semibold">
                      🟠 {item.summary.highCount}
                    </span>
                    <span className="px-2 py-1 bg-yellow-600 bg-opacity-20 text-yellow-300 rounded text-xs font-semibold">
                      🟡 {item.summary.mediumCount}
                    </span>
                    <span className="px-2 py-1 bg-blue-600 bg-opacity-20 text-blue-300 rounded text-xs font-semibold">
                      🔵 {item.summary.lowCount}
                    </span>
                  </div>

                  <Link
                    href={`/dashboard?id=${item.id}`}
                    className="block w-full px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-center rounded-lg font-semibold transition-all"
                  >
                    View Report
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && history.length === 0 && (
          <div className="mt-16 text-center text-gray-400">
            <p className="text-lg">
              No scans yet. Upload your first CSV to get started! 🚀
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
