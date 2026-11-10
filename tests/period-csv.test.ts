import { beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "@/lib/auth/login";
import { SESSION_COOKIE } from "@/lib/auth/session";
import type { Db } from "@/lib/db/connection";
import { CSV_HEADER, buildExpensesCsv } from "@/lib/csv";
import { parsePeriod, selectExpenses } from "@/lib/period";
import { listExpensesForUser } from "@/lib/services/expenses";
import type { Expense } from "@/lib/types";
import { TEST_PASSWORDS, TODAY, createSeededDb, userOf } from "./helpers";

let db: Db;
let cookieValue: string | undefined;

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => (name === SESSION_COOKIE && cookieValue ? { name, value: cookieValue } : undefined),
  }),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: vi.fn() }));
vi.mock("@/lib/db/connection", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/db/connection")>()),
  getDb: () => db,
}));

const { GET: exportCsv } = await import("@/app/api/expenses/export/route");

beforeEach(() => {
  process.env.APP_TODAY = TODAY;
  db = createSeededDb();
  cookieValue = login(db, "user-a", TEST_PASSWORDS.DEMO_USER_A_PASSWORD)!.token;
});

describe("期間指定のパース", () => {
  it("指定なしはプリセット (既定 30日間)", () => {
    expect(parsePeriod({})).toEqual({ selection: { kind: "preset", range: "30d" } });
    expect(parsePeriod({ range: "7d" }).selection).toEqual({ kind: "preset", range: "7d" });
  });

  it("開始日・終了日が揃っていれば任意期間", () => {
    expect(parsePeriod({ from: "2026-10-01", to: "2026-11-03" })).toEqual({
      selection: { kind: "custom", from: "2026-10-01", to: "2026-11-03" },
    });
  });

  it("不正な指定はエラーメッセージ付きでプリセットに戻る", () => {
    expect(parsePeriod({ from: "2026-10-01" }).error).toBeDefined();
    expect(parsePeriod({ from: "2026-13-01", to: "2026-13-02" }).error).toBeDefined();
    expect(parsePeriod({ from: "2026-11-03", to: "2026-10-01" }).error).toBeDefined();
    expect(parsePeriod({ from: "2026-11-03", to: "2026-10-01" }).selection.kind).toBe("preset");
  });
});

describe("共通フィルター (selectExpenses)", () => {
  it("任意期間: 開始日当日を含み、期間外 (前後) は除く", () => {
    const all = listExpensesForUser(db, userOf(db, 1));
    const selected = selectExpenses(all, { kind: "custom", from: "2026-10-01", to: "2026-11-03" }, TODAY);
    const dates = selected.map((e) => e.spentOn).sort();
    expect(dates[0]).toBe("2026-10-01");
    expect(dates).toContain("2026-11-01");
    expect(dates).not.toContain("2026-09-15");
    expect(dates).not.toContain("2026-11-05");
  });

  it("任意期間でも他ユーザーの明細は含まれない", () => {
    const all = listExpensesForUser(db, userOf(db, 1));
    const selected = selectExpenses(all, { kind: "custom", from: "2026-01-01", to: "2026-12-31" }, TODAY);
    expect(selected.every((e) => e.userId === 1)).toBe(true);
  });

  it("プリセットは従来どおり (7日間は 3 件)", () => {
    const all = listExpensesForUser(db, userOf(db, 1));
    expect(selectExpenses(all, { kind: "preset", range: "7d" }, TODAY)).toHaveLength(3);
  });
});

describe("CSV 生成", () => {
  const sample = (over: Partial<Expense>): Expense => ({
    id: 1,
    userId: 1,
    spentOn: "2026-10-01",
    amount: 2000,
    tag: "食費",
    memo: "メモ",
    ...over,
  });

  it("BOM・ヘッダー・CRLF・列順 (タグ, 日付, 金額, メモ)", () => {
    const csv = buildExpensesCsv([sample({})]);
    expect(csv.startsWith("﻿")).toBe(true);
    expect(CSV_HEADER).toEqual(["タグ", "日付", "金額", "メモ"]);
    expect(csv.slice(1)).toBe("タグ,日付,金額,メモ\r\n食費,2026-10-01,2000,メモ\r\n");
  });

  it("カンマ・引用符・改行を含むメモをエスケープする", () => {
    const csv = buildExpensesCsv([sample({ memo: 'a,"b"\nc' })]);
    expect(csv).toContain('"a,""b""\nc"');
  });

  it("数式として解釈される先頭文字を無効化する", () => {
    const csv = buildExpensesCsv([sample({ memo: "=SUM(A1:A2)" })]);
    expect(csv).toContain("'=SUM(A1:A2)");
  });

  it("明細が無くてもヘッダーのみ出力する", () => {
    expect(buildExpensesCsv([]).slice(1)).toBe("タグ,日付,金額,メモ\r\n");
  });
});

describe("CSV エクスポート API", () => {
  const call = (query: string) => exportCsv(new Request(`http://localhost/api/expenses/export?${query}`));

  it("未認証は 401", async () => {
    cookieValue = undefined;
    expect((await call("range=all")).status).toBe(401);
  });

  it("自分の明細を CSV でダウンロードできる", async () => {
    const res = await call("from=2026-10-01&to=2026-11-03");
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(res.headers.get("Content-Disposition")).toContain("expenses_2026-10-01_2026-11-03.csv");
    const body = await res.text();
    expect(body).toContain("食費,2026-10-01,2000,月初のまとめ買い");
    expect(body).not.toContain("食材の宅配");
  });

  it("不正な期間は 400", async () => {
    expect((await call("from=2026-11-03&to=2026-10-01")).status).toBe(400);
  });
});
