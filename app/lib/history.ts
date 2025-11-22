import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), ".analysis-cache");
const HISTORY_FILE = path.join(STORAGE_DIR, "history.json");

export interface AnalysisHistoryItem {
  id: string;
  timestamp: number;
  fileName: string;
  scanName?: string;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
  };
}

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export function addToHistory(item: AnalysisHistoryItem) {
  try {
    let history: AnalysisHistoryItem[] = [];

    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      history = JSON.parse(data);
    }

    // Add new item at the beginning
    history.unshift(item);

    // Keep only last 50 items
    if (history.length > 50) {
      history = history.slice(0, 50);
    }

    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
    console.log("Added to history:", item.id);
  } catch (error) {
    console.error("Error adding to history:", error);
  }
}

export function getHistory(): AnalysisHistoryItem[] {
  try {
    if (fs.existsSync(HISTORY_FILE)) {
      const data = fs.readFileSync(HISTORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading history:", error);
  }
  return [];
}

export function deleteFromHistory(id: string) {
  try {
    let history = getHistory();
    history = history.filter((item) => item.id !== id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");

    // Also delete the analysis file
    const analysisFile = path.join(STORAGE_DIR, `${id}.json`);
    if (fs.existsSync(analysisFile)) {
      fs.unlinkSync(analysisFile);
    }
  } catch (error) {
    console.error("Error deleting from history:", error);
  }
}
