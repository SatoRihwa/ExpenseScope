"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={formAction} className="form">
      <label>
        ユーザーID
        <input name="loginId" type="text" autoComplete="username" required defaultValue="user-a" />
      </label>
      <label>
        パスワード
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error ? (
        <p role="alert" className="error">
          {state.error}
        </p>
      ) : null}
      <button type="submit" className="button primary" disabled={pending}>
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
