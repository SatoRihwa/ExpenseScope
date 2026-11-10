import Link from "next/link";
import { RANGE_OPTIONS, type RangeKey } from "@/lib/types";

export function RangeFilter({ current }: { current: RangeKey | null }) {
  return (
    <div className="segmented" role="group" aria-label="期間フィルター">
      {RANGE_OPTIONS.map((o) => (
        <Link
          key={o.key}
          href={`/?range=${o.key}`}
          className={o.key === current ? "active" : undefined}
          aria-current={o.key === current ? "true" : undefined}
        >
          {o.label}
        </Link>
      ))}
    </div>
  );
}
