import { badRequest, withUser } from "@/lib/api";
import { buildExpensesCsv } from "@/lib/csv";
import { getToday } from "@/lib/dates";
import { parsePeriod, selectExpenses } from "@/lib/period";
import { listExpensesForUser } from "@/lib/services/expenses";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const { selection, error } = parsePeriod({ range: query.get("range"), from: query.get("from"), to: query.get("to") });
  if (error) return badRequest(error);

  return withUser((user, db) => {
    const expenses = selectExpenses(listExpensesForUser(db, user), selection, getToday());
    const suffix = selection.kind === "custom" ? `${selection.from}_${selection.to}` : selection.range;
    return new Response(buildExpensesCsv(expenses), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenses_${suffix}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  });
}
