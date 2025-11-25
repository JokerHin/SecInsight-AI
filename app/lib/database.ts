import { Database } from "@sqlitecloud/drivers";

const SQLITECLOUD_URL = process.env.SQLITECLOUD_URL || "";

if (!SQLITECLOUD_URL) {
  console.warn("SQLITECLOUD_URL not set - database features will not work");
}

let dbInstance: Database | null = null;

export function getDatabase(): Database {
  if (!dbInstance && SQLITECLOUD_URL) {
    dbInstance = new Database(SQLITECLOUD_URL);
  }
  if (!dbInstance) {
    throw new Error(
      "Database connection not available. Check SQLITECLOUD_URL."
    );
  }
  return dbInstance;
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const db = getDatabase();

    // Create analysis table
    await db.sql`
      CREATE TABLE IF NOT EXISTS analysis (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `;

    // Create history table
    await db.sql`
      CREATE TABLE IF NOT EXISTS history (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        fileName TEXT NOT NULL,
        scanName TEXT,
        critical INTEGER DEFAULT 0,
        high INTEGER DEFAULT 0,
        medium INTEGER DEFAULT 0,
        low INTEGER DEFAULT 0,
        total INTEGER DEFAULT 0
      )
    `;

    // Create index on timestamp for faster queries
    await db.sql`
      CREATE INDEX IF NOT EXISTS idx_history_timestamp ON history(timestamp DESC)
    `;

    console.log("Database tables initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Analysis operations
export async function saveAnalysis(id: string, data: any) {
  try {
    const db = getDatabase();
    const jsonData = JSON.stringify(data);
    const timestamp = Date.now();

    await db.sql`
      INSERT OR REPLACE INTO analysis (id, data, created_at)
      VALUES (${id}, ${jsonData}, ${timestamp})
    `;

    console.log("Saved analysis to database:", id);
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
}

export async function getAnalysis(id: string): Promise<any | null> {
  try {
    const db = getDatabase();
    const result = await db.sql`
      SELECT data FROM analysis WHERE id = ${id}
    `;

    if (result && result.length > 0) {
      return JSON.parse(result[0].data);
    }
    return null;
  } catch (error) {
    console.error("Error getting analysis:", error);
    return null;
  }
}

export async function deleteAnalysis(id: string) {
  try {
    const db = getDatabase();
    await db.sql`
      DELETE FROM analysis WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting analysis:", error);
  }
}

// History operations
export async function addToHistory(item: {
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
}) {
  try {
    const db = getDatabase();

    await db.sql`
      INSERT INTO history (
        id, timestamp, fileName, scanName,
        critical, high, medium, low, total
      ) VALUES (
        ${item.id},
        ${item.timestamp},
        ${item.fileName},
        ${item.scanName || null},
        ${item.summary.critical},
        ${item.summary.high},
        ${item.summary.medium},
        ${item.summary.low},
        ${item.summary.total}
      )
    `;

    console.log("Added to history:", item.id);
  } catch (error) {
    console.error("Error adding to history:", error);
    throw error;
  }
}

export async function getHistory(): Promise<any[]> {
  try {
    const db = getDatabase();
    const result = await db.sql`
      SELECT 
        id, timestamp, fileName, scanName,
        critical, high, medium, low, total
      FROM history
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    // Transform to match expected format
    return (result || []).map((row: any) => ({
      id: row.id,
      timestamp: row.timestamp,
      fileName: row.fileName,
      scanName: row.scanName,
      summary: {
        critical: row.critical,
        high: row.high,
        medium: row.medium,
        low: row.low,
        total: row.total,
      },
    }));
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
}

export async function deleteFromHistory(id: string) {
  try {
    const db = getDatabase();

    // Delete from history
    await db.sql`
      DELETE FROM history WHERE id = ${id}
    `;

    // Also delete the analysis
    await deleteAnalysis(id);

    console.log("Deleted from history:", id);
  } catch (error) {
    console.error("Error deleting from history:", error);
  }
}
