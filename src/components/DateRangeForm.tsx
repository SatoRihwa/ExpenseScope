import type { DateString } from "@/lib/types";

export function DateRangeForm({ from, to, error }: { from?: DateString; to?: DateString; error?: string }) {
  return (
    <form action="/" method="get" className="range-form">
      <label>
        開始日
        <input type="date" name="from" defaultValue={from} required />
      </label>
      <span className="range-sep">〜</span>
      <label>
        終了日
        <input type="date" name="to" defaultValue={to} required />
      </label>
      <button type="submit" className="button primary">
        期間を適用
      </button>
      {error ? (
        <p role="alert" className="error">
          {error}
        </p>
      ) : null}
    </form>
  );
}
