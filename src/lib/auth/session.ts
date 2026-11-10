import { createHash, randomBytes } from "node:crypto";
import type { Db } from "../db/connection";
import { findUserById } from "../repositories/users";
import type { User } from "../types";

export const SESSION_COOKIE = "expensescope_session";
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** セッションを作成し、Cookie に載せる生トークンを返す。DB にはハッシュのみ保存する。 */
export function createSession(db: Db, userId: number, nowMs: number = Date.now()): string {
  const token = randomBytes(32).toString("base64url");
  db.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").run(
    hashToken(token),
    userId,
    nowMs + SESSION_TTL_SECONDS * 1000,
  );
  return token;
}

/** サーバー側でセッションを検証する。無効・期限切れなら undefined。 */
export function validateSession(db: Db, token: string | undefined, nowMs: number = Date.now()): User | undefined {
  if (!token) return undefined;
  const row = db.prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?").get(hashToken(token)) as
    | { user_id: number; expires_at: number }
    | undefined;
  if (!row) return undefined;
  if (row.expires_at <= nowMs) {
    destroySession(db, token);
    return undefined;
  }
  return findUserById(db, row.user_id);
}

export function destroySession(db: Db, token: string): void {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(hashToken(token));
}
