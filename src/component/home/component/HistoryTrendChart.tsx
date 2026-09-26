import React, { useEffect, useRef, useState } from "react";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TrendPoint } from "../controller/historyFilter.controller";

interface HistoryTrendChartProps {
  points: TrendPoint[];
}

const HEIGHT = 150;
// room for the y labels on the left and the last value's label on the right
const PAD = { top: 14, right: 44, bottom: 22, left: 36 };
const GRID = [0, 50, 100];

/**
 * % correct per session, oldest → newest — one series, so no legend: the title names it.
 * Drawn at the container's real width (not a stretched viewBox) so the dots stay round.
 * Hover (or tap) snaps a crosshair + tooltip to the nearest session; a visually hidden
 * table carries the same numbers for screen readers.
 */
export const HistoryTrendChart: React.FC<HistoryTrendChartProps> = ({ points }) => {
  const { t, locale } = usePreferences();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  const [active, setActive] = useState<number | null>(null);
  const shown = points.length >= 2;

  // re-run once the plot actually mounts (it renders nothing with fewer than 2 sessions)
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(Math.max(240, Math.round(el.getBoundingClientRect().width)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [shown]);

  if (!shown) return null;

  const plotW = width - PAD.left - PAD.right;
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  // sessions are spaced evenly (by order, not by date) so a busy day doesn't crush its points together
  const x = (i: number) => PAD.left + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const y = (score: number) => PAD.top + (1 - score / 100) * plotH;
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.score).toFixed(1)}`).join(" ");

  const fmtDate = (ms: number) =>
    new Date(ms).toLocaleDateString(locale, { day: "numeric", month: "short" });

  const onMove = (e: React.MouseEvent<SVGRectElement>) => {
    const box = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - box.left + PAD.left;
    const i = Math.round(((px - PAD.left) / plotW) * (points.length - 1));
    setActive(Math.max(0, Math.min(points.length - 1, i)));
  };

  const last = points[points.length - 1];
  const hover = active !== null ? points[active] : null;

  return (
    <figure className="history-trend">
      <figcaption className="history-trend-title">{t("history.trend.title")}</figcaption>
      <div ref={wrapRef} className="history-trend-plot">
        <svg width={width} height={HEIGHT} role="img" aria-label={t("history.trend.aria", { count: points.length, last: last.score })}>
          {/* recessive grid + y labels */}
          {GRID.map((g) => (
            <g key={g}>
              <line x1={PAD.left} x2={PAD.left + plotW} y1={y(g)} y2={y(g)} className="ht-grid" />
              <text x={PAD.left - 8} y={y(g)} textAnchor="end" dominantBaseline="central" className="ht-axis">
                {g}%
              </text>
            </g>
          ))}
          {/* first and last date under the ends */}
          <text x={x(0)} y={HEIGHT - 4} textAnchor="start" className="ht-axis">{fmtDate(points[0].time)}</text>
          <text x={x(points.length - 1)} y={HEIGHT - 4} textAnchor="end" className="ht-axis">{fmtDate(last.time)}</text>

          <path d={path} className="ht-line" />
          {hover && <line x1={x(active!)} x2={x(active!)} y1={PAD.top} y2={PAD.top + plotH} className="ht-cross" />}
          {points.map((p, i) => (
            <circle key={p.sessionId} cx={x(i)} cy={y(p.score)} r={i === active ? 6 : 4} className="ht-dot" />
          ))}
          {/* direct label on the latest value only — never a number on every point */}
          <text x={x(points.length - 1) + 10} y={y(last.score)} dominantBaseline="central" className="ht-last">
            {last.score}%
          </text>

          {/* hit area bigger than the marks: the whole plot */}
          <rect
            x={PAD.left}
            y={0}
            width={plotW}
            height={HEIGHT}
            fill="transparent"
            onMouseMove={onMove}
            onClick={onMove}
            onMouseLeave={() => setActive(null)}
          />
        </svg>

        {hover && (
          <div
            className="ht-tip"
            style={{ left: Math.min(width - 150, Math.max(0, x(active!) - 75)), top: Math.max(0, y(hover.score) - 58) }}
            role="status"
          >
            <div className="ht-tip-value">{t("history.trend.tip", { score: hover.score })}</div>
            <div className="ht-tip-meta">
              {fmtDate(hover.time)} · {hover.session.isPretest
                ? t("session.type.pretest")
                : (hover.session.skillNames ?? []).join(", ") || t("session.type.practice")}
            </div>
          </div>
        )}
      </div>

      {/* the same numbers as a table, for screen readers */}
      <table className="ht-sr">
        <caption>{t("history.trend.title")}</caption>
        <tbody>
          {points.map((p) => (
            <tr key={p.sessionId}>
              <td>{fmtDate(p.time)}</td>
              <td>{p.score}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
};

export default HistoryTrendChart;
