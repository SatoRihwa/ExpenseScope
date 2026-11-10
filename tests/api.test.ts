import { beforeEach, describe, expect, it, vi } from "vitest";
import { login } from "@/lib/auth/login";
import { SESSION_COOKIE } from "@/lib/auth/session";
import type { Db } from "@/lib/db/connection";
import { TEST_PASSWORDS, createSeededDb } from "./helpers";

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

const { GET: getMe } = await import("@/app/api/me/route");
const { GET: getList } = await import("@/app/api/expenses/route");
const { GET: getDetail } = await import("@/app/api/expenses/[id]/route");

const detail = (id: string) => getDetail(new Request(`http://localhost/api/expenses/${id}`), { params: Promise.resolve({ id }) });
const list = (query = "") => getList(new Request(`http://localhost/api/expenses${query}`));

beforeEach(() => {
  process.env.APP_TODAY = "2026-11-10";
  db = createSeededDb();
  cookieValue = undefined;
});

const signInAs = (loginId: "user-a" | "user-b") => {
  const password = loginId === "user-a" ? TEST_PASSWORDS.DEMO_USER_A_PASSWORD : TEST_PASSWORDS.DEMO_USER_B_PASSWORD;
  cookieValue = login(db, loginId, password)!.token;
};

describe("API: 認証", () => {
  it("未認証は全 API で 401", async () => {
    expect((await getMe()).status).toBe(401);
    expect((await list()).status).toBe(401);
    expect((await detail("1")).status).toBe(401);
  });

  it("偽のセッション Cookie は 401", async () => {
    cookieValue = "forged";
    expect((await list()).status).toBe(401);
  });

  it("/api/me はログインユーザーを返す (パスワードハッシュを含まない)", async () => {
    signInAs("user-a");
    const body = await (await getMe()).json();
    expect(body.user).toEqual({ id: 1, loginId: "user-a", displayName: "ユーザーA" });
  });
});

describe("API: 一覧", () => {
  it("自分の明細のみ返す", async () => {
    signInAs("user-b");
    const body = await (await list()).json();
    expect(body.expenses.length).toBe(5);
    expect(body.expenses.every((e: { userId: number }) => e.userId === 2)).toBe(true);
  });

  it("range で絞り込める", async () => {
    signInAs("user-a");
    expect((await (await list("?range=7d")).json()).expenses).toHaveLength(3);
    expect((await (await list("?range=30d")).json()).expenses).toHaveLength(6);
    expect((await (await list("?range=all")).json()).expenses).toHaveLength(8);
  });

  it("不正な range は 400", async () => {
    signInAs("user-a");
    expect((await list("?range=1y")).status).toBe(400);
  });
});

describe("API: 詳細", () => {
  it("自分の明細は 200", async () => {
    signInAs("user-a");
    const res = await detail("5");
    expect(res.status).toBe(200);
    expect((await res.json()).expense).toMatchObject({ id: 5, spentOn: "2026-11-01", amount: 9000 });
  });

  it("他ユーザーの明細は 404 (双方向)", async () => {
    signInAs("user-a");
    expect((await detail("9")).status).toBe(404);
    signInAs("user-b");
    expect((await detail("5")).status).toBe(404);
  });

  it("存在しない ID は 404、不正な ID は 400", async () => {
    signInAs("user-a");
    expect((await detail("9999")).status).toBe(404);
    expect((await detail("abc")).status).toBe(400);
  });
});
