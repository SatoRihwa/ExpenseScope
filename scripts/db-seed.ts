import { databasePath, openDatabase } from "../src/lib/db/connection";
import { seedDatabase } from "../src/lib/db/seed";
import { SEED_EXPENSES, SEED_USERS } from "../src/lib/db/seed-data";

const db = openDatabase(databasePath());
seedDatabase(db, process.env);
db.close();
console.log(
  `DB を初期化し、テストデータを投入しました: ${databasePath()} (ユーザー ${SEED_USERS.length} 件 / 支出 ${SEED_EXPENSES.length} 件)`,
);
