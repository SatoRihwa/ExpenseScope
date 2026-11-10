import { badRequest, notFound, withUser } from "@/lib/api";
import { getExpenseForUser } from "@/lib/services/expenses";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return badRequest("id が不正です");
  return withUser((user, db) => {
    const expense = getExpenseForUser(db, user, Number(id));
    return expense ? Response.json({ expense }) : notFound();
  });
}
