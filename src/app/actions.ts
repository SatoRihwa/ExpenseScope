"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { login } from "@/lib/auth/login";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, destroySession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/connection";

export interface LoginState {
  error?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!loginId || !password) return { error: "ユーザーIDとパスワードを入力してください" };

  const result = login(getDb(), loginId, password);
  if (!result) return { error: "ユーザーIDまたはパスワードが正しくありません" };

  const store = await cookies();
  store.set(SESSION_COOKIE, result.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) destroySession(getDb(), token);
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
