import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TrendPoint } from "../controller/historyFilter.controller";

interface HistoryTrendChartProps {
  points: TrendPoint[];
}

const HEIGHT = 150;
// room for the last value's label on the right; the y axis keeps its own width on the left
const MARGIN = { top: 14, right: 44, bottom: 0, left: 0 };
const Y_AXIS_WIDTH = 36;
const GRID = [0, 50, 100];

type TrendDatum = TrendPoint & { index: number };

/**
 * % correct per session, oldest → newest — one series, so no legend: the title names it.
 * Drawn with Recharts. Colours never go through SVG attributes (var() doesn't resolve there):
 * every mark gets a class and Home.css (.history-trend-plot) paints it from theme tokens.
 * Hover / tap / arrow keys snap a crosshair + tooltip to the nearest session; a visually hidden
 * table carries the same numbers for screen readers.
 */
export const HistoryTrendChart: React.FC<HistoryTrendChartProps> = ({ points }) => {
  const { t, locale } = usePreferences();
  if (points.length < 2) return null;

  // sessions are spaced evenly (by order, not by date) so a busy day doesn't crush its points together
  const data: TrendDatum[] = points.map((p, index) => ({ ...p, index }));
  const lastIndex = data.length - 1;
  const last = data[lastIndex];

  const fmtDate = (ms: number) =>
    new Date(ms).toLocaleDateString(locale, { day: "numeric", month: "short" });

  // first and last date only, pinned inside the plot's ends
  const renderDateTick = (props: { x?: number | string; y?: number | string; payload?: { value: number } }) => {
    const i = props.payload?.value ?? 0;
    return (
      <text
        x={Number(props.x)}
        y={Number(props.y) + 12}
        textAnchor={i === 0 ? "start" : "end"}
        className="ht-axis"
      >
        {fmtDate(data[i].time)}
      </text>
    );
  };

  // direct label on the latest value only — never a number on every point
  const renderLastLabel = (props: { x?: number | string; y?: number | string; index?: number }) =>
    props.index === lastIndex ? (
      <text x={Number(props.x) + 10} y={Number(props.y)} dominantBaseline="central" className="ht-last">
        {last.score}%
      </text>
    ) : (
      <g />
    );

  const renderTip = ({ active, payload }: TooltipContentProps) => {
    const hover = active ? (payload?.[0]?.payload as TrendDatum | undefined) : undefined;
    if (!hover) return null;
    return (
      <div className="ht-tip" role="status">
        <div className="ht-tip-value">{t("history.trend.tip", { score: hover.score })}</div>
        <div className="ht-tip-meta">
          {fmtDate(hover.time)} · {hover.session.isPretest
            ? t("session.type.pretest")
            : (hover.session.skillNames ?? []).join(", ") || t("session.type.practice")}
        </div>
      </div>
    );
  };

  return (
    <figure className="history-trend">
      <figcaption className="history-trend-title">{t("history.trend.title")}</figcaption>
      <div className="history-trend-plot">
        <ResponsiveContainer width="100%" height={HEIGHT} minWidth={240}>
          <LineChart
            data={data}
            margin={MARGIN}
            title={t("history.trend.aria", { count: points.length, last: last.score })}
          >
            {/* recessive grid + y labels */}
            <CartesianGrid vertical={false} />
            <YAxis
              domain={[0, 100]}
              ticks={GRID}
              width={Y_AXIS_WIDTH}
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ className: "ht-axis" }}
              tickFormatter={(v: number) => `${v}%`}
            />
            <XAxis
              dataKey="index"
              type="number"
              domain={[0, lastIndex]}
              ticks={[0, lastIndex]}
              axisLine={false}
              tickLine={false}
              tick={renderDateTick}
              height={22}
            />
            <Tooltip
              content={renderTip}
              cursor={{ className: "ht-cross" }}
              isAnimationActive={false}
            />
            <Line
              type="linear"
              dataKey="score"
              dot={{ r: 4, className: "ht-dot" }}
              activeDot={{ r: 6, className: "ht-dot" }}
              label={renderLastLabel}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
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
