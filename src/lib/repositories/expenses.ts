import type { Db } from "../db/connection";
import type { Expense } from "../types";

interface ExpenseRow {
  id: number;
  user_id: number;
  spent_on: string;
  amount: number;
  tag: string;
  memo: string;
}

const toExpense = (r: ExpenseRow): Expense => ({
  id: r.id,
  userId: r.user_id,
  spentOn: r.spent_on,
  amount: r.amount,
  tag: r.tag,
  memo: r.memo,
});

/** データアクセスのみ。認可判定はサービス層 (services/expenses.ts) の責務。 */
export function selectExpensesByUserId(db: Db, userId: number): Expense[] {
  const rows = db
    .prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY spent_on DESC, id DESC")
    .all(userId) as ExpenseRow[];
  return rows.map(toExpense);
}

export function selectExpenseById(db: Db, id: number): Expense | undefined {
  const row = db.prepare("SELECT * FROM expenses WHERE id = ?").get(id) as ExpenseRow | undefined;
  return row ? toExpense(row) : undefined;
}
