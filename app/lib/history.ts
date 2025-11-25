import {
  addToHistory as addToHistoryDB,
  getHistory as getHistoryDB,
  deleteFromHistory as deleteFromHistoryDB,
} from "./database";

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

export async function addToHistory(item: AnalysisHistoryItem) {
  try {
    await addToHistoryDB(item);
  } catch (error) {
    console.error("Error adding to history:", error);
  }
}

export async function getHistory(): Promise<AnalysisHistoryItem[]> {
  try {
    return await getHistoryDB();
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
}

export async function deleteFromHistory(id: string) {
  try {
    await deleteFromHistoryDB(id);
  } catch (error) {
    console.error("Error deleting from history:", error);
  }
}
