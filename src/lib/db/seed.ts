import { hashPassword } from "../auth/password";
import { dropAll, initSchema, type Db } from "./connection";
import { SEED_EXPENSES, SEED_USERS } from "./seed-data";

/** DB を作り直して固定データを投入する。env からパスワードを読み、保存時にハッシュ化する。 */
export function seedDatabase(db: Db, env: Record<string, string | undefined>): void {
  const passwords = SEED_USERS.map((u) => {
    const value = env[u.passwordEnv];
    if (!value) throw new Error(`${u.passwordEnv} が未設定です。.env.example を .env.local にコピーして設定してください。`);
    return value;
  });

  dropAll(db);
  initSchema(db);

  const insertUser = db.prepare("INSERT INTO users (id, login_id, display_name, password_hash) VALUES (?, ?, ?, ?)");
  const insertExpense = db.prepare(
    "INSERT INTO expenses (id, user_id, spent_on, amount, tag, memo) VALUES (@id, @userId, @spentOn, @amount, @tag, @memo)",
  );
  db.transaction(() => {
    SEED_USERS.forEach((u, i) => insertUser.run(u.id, u.loginId, u.displayName, hashPassword(passwords[i]!)));
    for (const e of SEED_EXPENSES) insertExpense.run(e);
  })();
}
