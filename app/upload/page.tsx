"use client";
import { UploadZone } from "@/components/UploadZone";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [showNameModal, setShowNameModal] = useState(false);
  const [scanName, setScanName] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleFileSelected = (file: File) => {
    setPendingFile(file);
    setShowNameModal(true);
  };

  const handleStartAnalysis = async () => {
    if (!pendingFile) return;

    setShowNameModal(false);
    setIsAnalyzing(true);
    setError("");
    setProgress("Uploading CSV file...");

    try {
      const formData = new FormData();
      formData.append("file", pendingFile);
      if (scanName.trim()) {
        formData.append("scanName", scanName.trim());
      }

      setProgress("Parsing CSV data...");
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonError) {
        console.error("Failed to parse response:", jsonError);
        setError("Server returned invalid response. Please try again.");
        setIsAnalyzing(false);
        return;
      }

      if (res.ok) {
        setProgress("Analysis complete! Redirecting...");
        setTimeout(() => {
          router.push(`/dashboard?id=${data.analysisId}`);
        }, 500);
      } else {
        setError(data.error || "Failed to analyze CSV");
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(
        err.message ||
          "Network error occurred. Please check your connection and try again."
      );
      setIsAnalyzing(false);
    }
  };

  const handleCancelModal = () => {
    setShowNameModal(false);
    setPendingFile(null);
    setScanName("");
  };

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur rounded-2xl p-12">
            {/* Animated Spinner */}
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-cyan-200 border-t-cyan-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl">🤖</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-4">
              AI Analysis in Progress
            </h2>
            <p className="text-xl text-cyan-400 mb-8">{progress}</p>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3 text-gray-300">
                <span className="text-green-400 text-xl">✓</span>
                <span>Parsing CSV structure</span>
              </div>
              <div className="flex items-start gap-3 text-gray-300">
                <div className="animate-pulse">
                  <span className="text-cyan-400 text-xl">⟳</span>
                </div>
                <span>Google Gemini analyzing vulnerabilities</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <span className="text-xl">○</span>
                <span>Generating priority scores</span>
              </div>
              <div className="flex items-start gap-3 text-gray-400">
                <span className="text-xl">○</span>
                <span>Creating remediation advice</span>
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-8">
              This may take 10-30 seconds for large files...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        <img
          src="/logo.png"
          alt="SecInsight AI Logo"
          width={120}
          height={120}
          className="mx-auto mb-6"
        />
        <h1 className="text-5xl font-bold text-white mb-4 text-center">
          SecInsight <span className="text-cyan-400">AI</span>
        </h1>
        <p className="text-xl text-gray-300 text-center mb-12">
          Upload your security scan CSV and get AI-powered insights instantly
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-20 border border-red-500 rounded-lg text-red-200 text-center">
            <strong>Error:</strong> {error}
          </div>
        )}

        <UploadZone onUpload={handleFileSelected} />
        <p className="text-sm text-gray-500 text-center mt-6">
          Supports: Snyk, Trivy, npm audit, ScoutSuite, Semgrep, Dependabot,
          etc.
        </p>

        {/* Name Modal */}
        {showNameModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-8 border border-cyan-500">
              <h3 className="text-2xl font-bold text-white mb-4">
                📝 Name Your Scan
              </h3>
              <p className="text-gray-300 mb-6">
                Give this security scan a memorable name for easy tracking in
                your history.
              </p>
              <input
                type="text"
                value={scanName}
                onChange={(e) => setScanName(e.target.value)}
                placeholder="e.g., Production API Scan - Nov 2025"
                className="w-full px-4 py-3 bg-slate-900 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 placeholder-gray-500 mb-6"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleStartAnalysis();
                  if (e.key === "Escape") handleCancelModal();
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleCancelModal}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartAnalysis}
                  className="flex-1 px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Start Analysis 🚀
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-4">
                Press Enter to start • ESC to cancel
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
