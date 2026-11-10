import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { SCHEMA_SQL } from "./schema";

export type Db = Database.Database;

export function openDatabase(filename: string): Db {
  if (filename !== ":memory:") fs.mkdirSync(path.dirname(path.resolve(filename)), { recursive: true });
  const db = new Database(filename);
  db.pragma("foreign_keys = ON");
  if (filename !== ":memory:") db.pragma("journal_mode = WAL");
  return db;
}

export function initSchema(db: Db): void {
  db.exec(SCHEMA_SQL);
}

export function dropAll(db: Db): void {
  db.exec("DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS expenses; DROP TABLE IF EXISTS users;");
}

export function databasePath(env: NodeJS.ProcessEnv = process.env): string {
  return env.DATABASE_PATH?.trim() || "data/expensescope.db";
}

let cached: Db | undefined;

/** アプリ実行時に使う共有接続。スキーマが無ければ作成する (データ投入は npm run db:seed)。 */
export function getDb(): Db {
  if (!cached) {
    cached = openDatabase(databasePath());
    initSchema(cached);
  }
  return cached;
}
