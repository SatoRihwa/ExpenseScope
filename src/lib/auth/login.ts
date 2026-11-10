import type { Db } from "../db/connection";
import { findUserCredentials } from "../repositories/users";
import type { User } from "../types";
import { DUMMY_HASH, verifyPassword } from "./password";
import { createSession } from "./session";

export function authenticate(db: Db, loginId: string, password: string): User | undefined {
  const found = findUserCredentials(db, loginId);
  const ok = verifyPassword(password, found?.passwordHash ?? DUMMY_HASH);
  return found && ok ? found.user : undefined;
}

export function login(db: Db, loginId: string, password: string, nowMs?: number): { user: User; token: string } | undefined {
  const user = authenticate(db, loginId, password);
  return user ? { user, token: createSession(db, user.id, nowMs) } : undefined;
}
