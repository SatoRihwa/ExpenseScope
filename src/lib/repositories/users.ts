import type { Db } from "../db/connection";
import type { User } from "../types";

interface UserRow {
  id: number;
  login_id: string;
  display_name: string;
  password_hash: string;
}

const toUser = (r: UserRow): User => ({ id: r.id, loginId: r.login_id, displayName: r.display_name });

export function findUserCredentials(db: Db, loginId: string): { user: User; passwordHash: string } | undefined {
  const row = db.prepare("SELECT * FROM users WHERE login_id = ?").get(loginId) as UserRow | undefined;
  return row ? { user: toUser(row), passwordHash: row.password_hash } : undefined;
}

export function findUserById(db: Db, id: number): User | undefined {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as UserRow | undefined;
  return row ? toUser(row) : undefined;
}
