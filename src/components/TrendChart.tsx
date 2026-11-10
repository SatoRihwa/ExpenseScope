import { formatYen } from "@/lib/dates";
import type { TrendPoint } from "@/lib/dashboard";

const W = 880;
const H = 300;
const PAD = { top: 16, right: 16, bottom: 40, left: 92 };

function niceMax(value: number): number {
  if (value <= 0) return 1000;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

/** 依存ライブラリなしのシンプルな棒グラフ (サーバーコンポーネント)。 */
export function TrendChart({ points, unit }: { points: TrendPoint[]; unit: "day" | "month" }) {
  const max = niceMax(Math.max(0, ...points.map((p) => p.total)));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const slot = points.length > 0 ? innerW / points.length : innerW;
  const barW = Math.min(40, slot * 0.7);
  const labelEvery = Math.max(1, Math.ceil(points.length / 10));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  if (points.length === 0) return <p className="muted">この期間の支出はありません。</p>;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${unit === "day" ? "日別" : "月別"}の支出推移`} className="chart">
      {ticks.map((t) => {
        const y = PAD.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y} y2={y} className="chart-grid" />
            <text x={PAD.left - 8} y={y + 5} textAnchor="end" className="chart-text">
              {formatYen(Math.round(max * t))}
            </text>
          </g>
        );
      })}
      {points.map((p, i) => {
        const h = (p.total / max) * innerH;
        const x = PAD.left + slot * i + (slot - barW) / 2;
        return (
          <g key={p.key}>
            <rect x={x} y={PAD.top + innerH - h} width={barW} height={h} rx={3} className="chart-bar">
              <title>{`${p.label}: ${formatYen(p.total)}`}</title>
            </rect>
            {i % labelEvery === 0 ? (
              <text x={x + barW / 2} y={H - 14} textAnchor="middle" className="chart-text">
                {p.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
