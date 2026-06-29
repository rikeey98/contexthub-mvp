import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

let db: Database.Database | null = null;

export function initDatabase(userDataPath: string) {
  fs.mkdirSync(userDataPath, { recursive: true });
  const dbPath = path.join(userDataPath, "contexthub.db");
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

export function getDb() {
  if (!db) throw new Error("Database is not initialized");
  return db;
}
