import { describe, expect, it } from "vitest";
import { login } from "@/lib/auth/login";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { SESSION_TTL_SECONDS, destroySession, validateSession } from "@/lib/auth/session";
import { seedDatabase } from "@/lib/db/seed";
import { TEST_PASSWORDS, createSeededDb } from "./helpers";

describe("パスワード", () => {
  it("ハッシュ化して検証できる (平文は保存されない)", () => {
    const hash = hashPassword("secret");
    expect(hash).not.toContain("secret");
    expect(verifyPassword("secret", hash)).toBe(true);
    expect(verifyPassword("wrong", hash)).toBe(false);
  });
});

describe("ログインとセッション", () => {
  it("正しい認証情報でログインでき、トークンでユーザーを特定できる", () => {
    const db = createSeededDb();
    const result = login(db, "user-a", TEST_PASSWORDS.DEMO_USER_A_PASSWORD);
    expect(result?.user.id).toBe(1);
    expect(validateSession(db, result!.token)?.loginId).toBe("user-a");
  });

  it("ユーザーBのトークンはユーザーBとして解決される", () => {
    const db = createSeededDb();
    const result = login(db, "user-b", TEST_PASSWORDS.DEMO_USER_B_PASSWORD);
    expect(validateSession(db, result!.token)?.id).toBe(2);
  });

  it("誤ったパスワード・未知のユーザーは拒否される", () => {
    const db = createSeededDb();
    expect(login(db, "user-a", TEST_PASSWORDS.DEMO_USER_B_PASSWORD)).toBeUndefined();
    expect(login(db, "nobody", "x")).toBeUndefined();
  });

  it("不正なトークン・空トークンは無効", () => {
    const db = createSeededDb();
    expect(validateSession(db, "forged-token")).toBeUndefined();
    expect(validateSession(db, undefined)).toBeUndefined();
  });

  it("期限切れとログアウト後のセッションは無効", () => {
    const db = createSeededDb();
    const now = Date.now();
    const a = login(db, "user-a", TEST_PASSWORDS.DEMO_USER_A_PASSWORD, now)!;
    expect(validateSession(db, a.token, now + SESSION_TTL_SECONDS * 1000 + 1)).toBeUndefined();

    const b = login(db, "user-a", TEST_PASSWORDS.DEMO_USER_A_PASSWORD, now)!;
    destroySession(db, b.token);
    expect(validateSession(db, b.token, now)).toBeUndefined();
  });

  it("パスワード環境変数が未設定ならシードは失敗する", () => {
    const db = createSeededDb();
    expect(() => seedDatabase(db, {})).toThrow(/DEMO_USER_A_PASSWORD/);
  });

  it("シードは何度実行しても同じ状態になる", () => {
    const db = createSeededDb();
    const snapshot = () => db.prepare("SELECT id, user_id, spent_on, amount, tag, memo FROM expenses ORDER BY id").all();
    const first = snapshot();
    seedDatabase(db, TEST_PASSWORDS);
    expect(snapshot()).toEqual(first);
  });
});
