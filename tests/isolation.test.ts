import { beforeAll, describe, expect, it } from "vitest";
import type { Db } from "@/lib/db/connection";
import { SEED_EXPENSES } from "@/lib/db/seed-data";
import { getExpenseForUser, listExpensesForUser } from "@/lib/services/expenses";
import { createSeededDb, userOf } from "./helpers";

describe("ユーザー間のデータ分離", () => {
  let db: Db;
  beforeAll(() => {
    db = createSeededDb();
  });

  it("一覧は自分の明細だけを返す", () => {
    for (const id of [1, 2]) {
      const list = listExpensesForUser(db, userOf(db, id));
      expect(list.length).toBe(SEED_EXPENSES.filter((e) => e.userId === id).length);
      expect(list.every((e) => e.userId === id)).toBe(true);
    }
  });

  it("ユーザーAの要件データが登録されている", () => {
    const a = listExpensesForUser(db, userOf(db, 1));
    const key = (e: { spentOn: string; amount: number }) => `${e.spentOn}:${e.amount}`;
    for (const k of ["2026-10-01:2000", "2026-10-30:3000", "2026-10-31:4500", "2026-11-01:9000"]) {
      expect(a.map(key)).toContain(k);
    }
  });

  it("自分の明細の詳細は取得できる", () => {
    const own = SEED_EXPENSES.find((e) => e.userId === 1)!;
    expect(getExpenseForUser(db, userOf(db, 1), own.id)?.id).toBe(own.id);
  });

  it("他ユーザーの明細の詳細は取得できない (双方向)", () => {
    for (const e of SEED_EXPENSES) {
      const other = userOf(db, e.userId === 1 ? 2 : 1);
      expect(getExpenseForUser(db, other, e.id)).toBeUndefined();
    }
  });

  it("存在しない明細は undefined", () => {
    expect(getExpenseForUser(db, userOf(db, 1), 99999)).toBeUndefined();
  });
});
