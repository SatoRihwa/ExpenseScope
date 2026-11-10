import { badRequest, withUser } from "@/lib/api";
import { getToday } from "@/lib/dates";
import { listExpensesForUser } from "@/lib/services/expenses";
import type { RangeKey } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("range") ?? "all";
  if (param !== "7d" && param !== "30d" && param !== "all") {
    return badRequest("range は 7d / 30d / all のいずれかを指定してください");
  }
  const key: RangeKey = param;
  return withUser((user, db) => {
    const expenses = listExpensesForUser(db, user, { key, today: getToday() });
    return Response.json({ expenses });
  });
}
