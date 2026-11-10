import { initSchema, openDatabase, type Db } from "@/lib/db/connection";
import { seedDatabase } from "@/lib/db/seed";
import { findUserById } from "@/lib/repositories/users";
import type { User } from "@/lib/types";

export const TEST_PASSWORDS = {
  DEMO_USER_A_PASSWORD: "test-password-a",
  DEMO_USER_B_PASSWORD: "test-password-b",
};

export const TODAY = "2026-11-10";

/** 固定データを投入したインメモリ DB。 */
export function createSeededDb(): Db {
  const db = openDatabase(":memory:");
  initSchema(db);
  seedDatabase(db, TEST_PASSWORDS);
  return db;
}

export function userOf(db: Db, id: number): User {
  const user = findUserById(db, id);
  if (!user) throw new Error(`seed user ${id} not found`);
  return user;
}
