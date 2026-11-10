import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "../db/connection";
import type { User } from "../types";
import { SESSION_COOKIE, validateSession } from "./session";

/** Cookie のトークンをサーバー側で検証し、認証済みユーザーを返す。未認証なら undefined。 */
export async function getCurrentUser(): Promise<User | undefined> {
  const store = await cookies();
  return validateSession(getDb(), store.get(SESSION_COOKIE)?.value);
}

/** ページ用: 未認証ならログイン画面へリダイレクトする。 */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
