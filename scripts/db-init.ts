import { databasePath, initSchema, openDatabase } from "../src/lib/db/connection";

const db = openDatabase(databasePath());
initSchema(db);
db.close();
console.log(`スキーマを初期化しました: ${databasePath()}`);
