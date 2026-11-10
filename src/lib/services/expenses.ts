import { filterByRange } from "../dashboard";
import type { Db } from "../db/connection";
import { selectExpenseById, selectExpensesByUserId } from "../repositories/expenses";
import type { DateString, Expense, RangeKey, User } from "../types";

/** 認可込みの一覧取得。常にログインユーザー自身の明細だけを返す。 */
export function listExpensesForUser(db: Db, user: User, range?: { key: RangeKey; today: DateString }): Expense[] {
  const all = selectExpensesByUserId(db, user.id);
  return range ? filterByRange(all, range.key, range.today) : all;
}

/**
 * 認可込みの詳細取得。リポジトリは認可を知らないので、所有者確認はここで必ず行う。
 * 他ユーザーの明細は「存在しない」ものとして扱う (存在有無を漏らさない)。
 */
export function getExpenseForUser(db: Db, user: User, expenseId: number): Expense | undefined {
  const expense = selectExpenseById(db, expenseId);
  return expense && expense.userId === user.id ? expense : undefined;
}
