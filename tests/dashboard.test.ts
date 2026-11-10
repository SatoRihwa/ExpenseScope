import { beforeAll, describe, expect, it } from "vitest";
import { buildDashboard } from "@/lib/dashboard";
import type { Db } from "@/lib/db/connection";
import { listExpensesForUser } from "@/lib/services/expenses";
import { TODAY, createSeededDb, userOf } from "./helpers";

describe("ダッシュボード集計 (ユーザーA, 基準日 2026-11-10)", () => {
  let db: Db;
  beforeAll(() => {
    db = createSeededDb();
  });
  const expensesOfA = () => listExpensesForUser(db, userOf(db, 1));

  it("今月の支出合計は 11 月分のみ (10/31 は含まず 11/01 を含む)", () => {
    const s = buildDashboard(expensesOfA(), "30d", TODAY);
    expect(s.monthTotal).toBe(9000 + 1200 + 2800 + 1500);
  });

  it("全期間の件数・合計・タグ別集計", () => {
    const s = buildDashboard(expensesOfA(), "all", TODAY);
    expect(s.rangeCount).toBe(8);
    expect(s.rangeTotal).toBe(12800 + 2000 + 3000 + 4500 + 9000 + 1200 + 2800 + 1500);
    expect(s.tagTotals[0]).toEqual({ tag: "光熱費", total: 12800, count: 1 });
    expect(s.tagTotals.find((t) => t.tag === "食費")).toEqual({ tag: "食費", total: 3200, count: 2 });
    expect(s.trendUnit).toBe("month");
    expect(s.trend.map((p) => p.key)).toEqual(["2026-09", "2026-10", "2026-11"]);
    expect(s.trend.map((p) => p.total)).toEqual([12800, 2000 + 3000 + 4500, 9000 + 1200 + 2800 + 1500]);
  });

  it("30日間は 10/12〜11/10: 10/01 を除き 10/30・10/31・11/01 を含む", () => {
    const s = buildDashboard(expensesOfA(), "30d", TODAY);
    expect(s.rangeCount).toBe(6);
    expect(s.rangeTotal).toBe(3000 + 4500 + 9000 + 1200 + 2800 + 1500);
    expect(s.trendUnit).toBe("day");
    expect(s.trend).toHaveLength(30);
    expect(s.trend.find((p) => p.key === "2026-10-31")?.total).toBe(4500);
  });

  it("7日間は 11/04〜11/10", () => {
    const s = buildDashboard(expensesOfA(), "7d", TODAY);
    expect(s.rangeCount).toBe(3);
    expect(s.rangeTotal).toBe(1200 + 2800 + 1500);
    expect(s.trend).toHaveLength(7);
  });

  it("最近の支出は新しい順に最大5件", () => {
    const s = buildDashboard(expensesOfA(), "all", TODAY);
    expect(s.recent.map((e) => e.spentOn)).toEqual([
      "2026-11-10",
      "2026-11-08",
      "2026-11-05",
      "2026-11-01",
      "2026-10-31",
    ]);
  });

  it("支出が無い期間でも壊れない", () => {
    const s = buildDashboard([], "all", TODAY);
    expect(s).toMatchObject({ monthTotal: 0, rangeTotal: 0, rangeCount: 0, trend: [], tagTotals: [] });
  });
});
