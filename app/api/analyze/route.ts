import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { analyzeWithGemini } from "@/app/lib/gemini";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { addToHistory } from "@/app/lib/history";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Store analysis results temporarily (in production, use Redis or database)
const analysisCache = new Map<string, any>();

// File-based storage directory
const STORAGE_DIR = path.join(process.cwd(), ".analysis-cache");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Helper to save analysis to file
function saveAnalysisToFile(analysisId: string, data: any) {
  try {
    const filePath = path.join(STORAGE_DIR, `${analysisId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data), "utf-8");
  } catch (error) {
    console.error("Error saving analysis to file:", error);
  }
}

// Helper to load analysis from file
function loadAnalysisFromFile(analysisId: string): any | null {
  try {
    const filePath = path.join(STORAGE_DIR, `${analysisId}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error loading analysis from file:", error);
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv")) {
      return NextResponse.json(
        { error: "Only CSV files are allowed" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();

    // Get optional scan name from form data
    const scanName = formData.get("scanName") as string | null;

    // Parse CSV with papaparse
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });

    if (parseResult.errors.length > 0) {
      console.error("CSV parsing errors:", parseResult.errors);
    }

    const rawData = parseResult.data;

    if (!rawData || rawData.length === 0) {
      return NextResponse.json(
        { error: "CSV file is empty or invalid" },
        { status: 400 }
      );
    }

    console.log(`Parsed ${rawData.length} rows from CSV`);
    console.log("Sample row:", rawData[0]);

    // Analyze with Gemini AI (with timeout)
    const analysisPromise = analyzeWithGemini(text, rawData);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Analysis timeout after 45 seconds")),
        45000
      )
    );

    const analysis = (await Promise.race([
      analysisPromise,
      timeoutPromise,
    ])) as any;

    // Generate unique ID for this analysis
    const analysisId = randomBytes(16).toString("hex");

    // Store in both cache and file
    analysisCache.set(analysisId, analysis);
    saveAnalysisToFile(analysisId, analysis);

    // Add to history
    addToHistory({
      id: analysisId,
      timestamp: Date.now(),
      fileName: file.name,
      scanName: scanName || undefined,
      summary: analysis.summary,
    });

    // Set timeout to clear from memory cache only (file persists)
    setTimeout(() => analysisCache.delete(analysisId), 60 * 60 * 1000);

    console.log("Created analysis with ID:", analysisId);
    console.log(
      "Analysis has",
      analysis.prioritizedIssues?.length || 0,
      "issues"
    );

    // Return just the ID
    return NextResponse.json({ analysisId });
  } catch (error: any) {
    console.error("Analysis error:", error);
    console.error("Error stack:", error.stack);

    // Return more specific error messages
    let errorMessage = "Failed to analyze CSV file";

    if (error.message?.includes("timeout")) {
      errorMessage =
        "Analysis took too long. Please try with a smaller CSV file or try again.";
    } else if (error.message?.includes("API key")) {
      errorMessage =
        "Invalid Google AI API key. Please check server configuration.";
    } else if (
      error.message?.includes("quota") ||
      error.message?.includes("rate limit")
    ) {
      errorMessage =
        "API rate limit reached. Please try again in a few minutes.";
    } else if (error.message?.includes("JSON")) {
      errorMessage = "AI returned invalid data format. Please try again.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const analysisId = searchParams.get("id");

  console.log("GET request for analysis ID:", analysisId);
  console.log("Cache size:", analysisCache.size);
  console.log("Cache keys:", Array.from(analysisCache.keys()));

  if (!analysisId) {
    return NextResponse.json(
      { error: "No analysis ID provided" },
      { status: 400 }
    );
  }

  // Try memory cache first
  let analysis = analysisCache.get(analysisId);

  // If not in cache, try loading from file
  if (!analysis) {
    console.log("Not in memory cache, trying file...");
    analysis = loadAnalysisFromFile(analysisId);

    if (analysis) {
      // Restore to memory cache
      analysisCache.set(analysisId, analysis);
      console.log("Restored analysis to memory cache from file");
    }
  }

  if (!analysis) {
    console.log("Analysis not found in cache or file for ID:", analysisId);
    return NextResponse.json(
      { error: "Analysis not found or expired" },
      { status: 404 }
    );
  }

  console.log(
    "Returning analysis with",
    analysis.prioritizedIssues?.length || 0,
    "issues"
  );
  return NextResponse.json(analysis);
}
