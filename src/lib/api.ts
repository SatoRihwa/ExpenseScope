import { getCurrentUser } from "./auth/current-user";
import { getDb, type Db } from "./db/connection";
import type { User } from "./types";

export const unauthorized = () => Response.json({ error: "認証が必要です" }, { status: 401 });
export const notFound = () => Response.json({ error: "見つかりません" }, { status: 404 });
export const badRequest = (message: string) => Response.json({ error: message }, { status: 400 });

/** 認証処理 (ここ) とデータアクセス (services / repositories) を分離するための薄いラッパー。 */
export async function withUser(handler: (user: User, db: Db) => Response | Promise<Response>): Promise<Response> {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return handler(user, getDb());
}
