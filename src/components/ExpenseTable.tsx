import Link from "next/link";
import { formatYen } from "@/lib/dates";
import type { Expense } from "@/lib/types";

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  if (expenses.length === 0) return <p className="muted">支出はありません。</p>;
  return (
    <table className="table">
      <thead>
        <tr>
          <th>日付</th>
          <th>タグ</th>
          <th>メモ</th>
          <th className="num">金額</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {expenses.map((e) => (
          <tr key={e.id}>
            <td>{e.spentOn}</td>
            <td>
              <span className="tag">{e.tag}</span>
            </td>
            <td>{e.memo}</td>
            <td className="num">{formatYen(e.amount)}</td>
            <td className="right">
              <Link href={`/expenses/${e.id}`}>詳細</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
