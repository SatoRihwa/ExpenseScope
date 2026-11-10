import { AppHeader } from "@/components/AppHeader";
import { ExpenseTable } from "@/components/ExpenseTable";
import { requireUser } from "@/lib/auth/current-user";
import { getDb } from "@/lib/db/connection";
import { listExpensesForUser } from "@/lib/services/expenses";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const user = await requireUser();
  const expenses = listExpensesForUser(getDb(), user);
  return (
    <>
      <AppHeader user={user} />
      <main className="container">
        <div className="page-head">
          <div>
            <h1>支出明細</h1>
            <p className="muted">{expenses.length}件</p>
          </div>
        </div>
        <section className="card">
          <ExpenseTable expenses={expenses} />
        </section>
      </main>
    </>
  );
}
