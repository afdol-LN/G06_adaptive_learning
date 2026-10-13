import React from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

export interface RadarAxis {
  key: string;
  label: string;
  /** 0–100 */
  value: number;
}

interface BehaviorRadarProps {
  axes: RadarAxis[];
  ariaLabel: string;
}

/**
 * Radar ของการ์ดพฤติกรรม — สีทั้งหมดมาจาก CSS (.behavior-radar ใน Home.css)
 * เพราะ attribute ของ SVG อย่าง stroke="var(--x)" ไม่ resolve CSS variable
 * วง ring50/ring70 คือเกณฑ์เดียวกับขีดบนแถบ (50% และ 70%)
 */
const BehaviorRadar: React.FC<BehaviorRadarProps> = ({ axes, ariaLabel }) => {
  const data = axes.map((a) => ({ axis: a.label, value: a.value, ring50: 50, ring70: 70 }));

  return (
    <div className="behavior-radar" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="68%" margin={{ top: 8, right: 40, bottom: 8, left: 40 }}>
          <PolarGrid gridType="polygon" />
          <PolarAngleAxis dataKey="axis" />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar dataKey="ring50" className="radar-ring" isAnimationActive={false} />
          <Radar dataKey="ring70" className="radar-ring" isAnimationActive={false} />
          <Radar dataKey="value" className="radar-value" dot />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BehaviorRadar;
