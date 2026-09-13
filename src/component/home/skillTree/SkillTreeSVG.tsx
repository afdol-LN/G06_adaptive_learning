import React from "react";
import { usePreferences } from "../../../context/PreferencesContext";
import { ZoomableSVG } from "./ZoomableSVG";
import {
  NODE_W,
  NODE_H,
  LayoutSkill,
  getNodeColors,
  getProgressColor,
  displayProgressPercent,
  formatProgressLabel,
  getDraftCount,
} from "../utils/skillTree";

// ทุกสีในแผนผังเป็น CSS variable จาก Home.css (มีค่าของธีมมืดแยก) และต้องใส่ผ่าน style
// หรือ className เท่านั้น — var() ใช้ไม่ได้ใน presentation attribute อย่าง fill="..."

interface SkillTreeSVGProps {
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onNodeClick: (skill: LayoutSkill) => void;
  selected: LayoutSkill | null;
  hovered: number | null;
  setHovered: (id: number | null) => void;
  zoomable?: boolean;
}

export const SkillTreeSVG: React.FC<SkillTreeSVGProps> = ({
  skills,
  unlocked,
  canUnlockFn,
  onNodeClick,
  selected,
  hovered,
  setHovered,
  zoomable = false,
}) => {
  const { t } = usePreferences();

  if (skills.length === 0) {
    return <p className="side-panel-empty">{t("skill.emptyTree")}</p>;
  }

  const notStarted = t("skill.notStarted");
  const getNodeById = (id: number) => skills.find((s) => s.skillId === id);

  const getEdgeColor = (fromId: number, toId: number) => {
    if (unlocked.has(toId)) return "var(--edge-open)";
    if (canUnlockFn(toId)) return "var(--edge-ready)";
    return "var(--edge-locked)";
  };

  const isRelatedEdge = (fromId: number, toId: number) =>
    selected && (fromId === selected.skillId || toId === selected.skillId);

  const minX = Math.min(...skills.map((s) => s.x || 0)) - NODE_W / 2 - 40;
  const minY = Math.min(...skills.map((s) => s.y || 0)) - NODE_H / 2 - 40;
  const maxX = Math.max(...skills.map((s) => s.x || 0)) + NODE_W / 2 + 40;
  const maxY = Math.max(...skills.map((s) => s.y || 0)) + NODE_H / 2 + 40;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  const inner = (
    <>
      <defs>
        <pattern id="dots-cobalt" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" className="tree-dot" />
        </pattern>
      </defs>
      <rect x={minX} y={minY} width={svgWidth} height={svgHeight} fill="url(#dots-cobalt)" />

      {/* Dim edges */}
      {skills.map((skill) =>
        (skill.skillPrequisite || []).map((req) => {
          const reqId = req.prerequisiteSkillId;
          const from = getNodeById(reqId);
          if (!from || isRelatedEdge(reqId, skill.skillId)) return null;

          const isActive = unlocked.has(skill.skillId);
          const x1 = from.x;
          const y1 = from.y + NODE_H / 2;
          const x2 = skill.x;
          const y2 = skill.y - NODE_H / 2;
          const midY = y1 + (y2 - y1) / 2;
          const path = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;

          return (
            <path
              key={`edge-${reqId}-${skill.skillId}`}
              d={path}
              fill="none"
              style={{ stroke: getEdgeColor(reqId, skill.skillId) }}
              strokeWidth={isActive ? 2 : 1}
              strokeLinejoin="round"
              strokeDasharray={isActive ? "none" : "4,4"}
              strokeOpacity={selected ? 0.08 : isActive ? 0.85 : 0.3}
            />
          );
        })
      )}

      {/* Highlighted edges */}
      {selected &&
        skills.map((skill) =>
          (skill.skillPrequisite || []).map((req) => {
            const reqId = req.prerequisiteSkillId;
            const from = getNodeById(reqId);
            if (!from || !isRelatedEdge(reqId, skill.skillId)) return null;

            const isActive = unlocked.has(skill.skillId);
            const x1 = from.x;
            const y1 = from.y + NODE_H / 2;
            const x2 = skill.x;
            const y2 = skill.y - NODE_H / 2;
            const midY = y1 + (y2 - y1) / 2;
            const path = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;
            const hc = reqId === selected.skillId ? "var(--accent)" : "var(--node-done-border)";

            return (
              <g key={`edge-rel-${reqId}-${skill.skillId}`}>
                <path
                  d={path}
                  fill="none"
                  style={{ stroke: hc }}
                  strokeWidth={7}
                  strokeOpacity={0.15}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={path}
                  fill="none"
                  style={{ stroke: hc }}
                  strokeWidth={isActive ? 2.6 : 2.2}
                  strokeLinejoin="round"
                  strokeDasharray={isActive ? "none" : "5,4"}
                  strokeOpacity={1}
                  strokeLinecap="round"
                />
              </g>
            );
          })
        )}

      {/* Nodes */}
      {skills.map((skill) => {
        const isUnlocked = unlocked.has(skill.skillId);
        const canUnlockThis = canUnlockFn(skill.skillId);
        const isSelected = selected?.skillId === skill.skillId;
        const isHov = hovered === skill.skillId;

        const isRelated =
          !selected ||
          isSelected ||
          (skill.skillPrequisite || []).some((r) => r.prerequisiteSkillId === selected.skillId) ||
          (selected.skillPrequisite || []).some((r) => r.prerequisiteSkillId === skill.skillId);

        const { bg, border, text, bar } = getNodeColors(isUnlocked, canUnlockThis, displayProgressPercent(skill));
        const nx = skill.x - NODE_W / 2;
        const ny = skill.y - NODE_H / 2;
        const pColor = getProgressColor(displayProgressPercent(skill));

        return (
          <g
            key={skill.skillId}
            className={`tree-node ${isUnlocked || canUnlockThis ? "clickable" : "locked"}`}
            onClick={(e) => {
              e.stopPropagation();
              onNodeClick(skill);
            }}
            onMouseEnter={() => setHovered(skill.skillId)}
            onMouseLeave={() => setHovered(null)}
            style={{
              opacity: selected && !isRelated ? 0.25 : 1,
              transition: "opacity .2s",
            }}
          >
            {canUnlockThis && (
              <rect
                x={nx - 4}
                y={ny - 4}
                width={NODE_W + 8}
                height={NODE_H + 8}
                rx={11}
                fill="none"
                strokeWidth={2}
                className="pulse-ring-blue"
              />
            )}
            {isSelected && (
              <rect
                x={nx - 4}
                y={ny - 4}
                width={NODE_W + 8}
                height={NODE_H + 8}
                rx={11}
                fill="none"
                strokeWidth={2.5}
                opacity={0.9}
                className="tree-node-ring"
              />
            )}
            {isHov && !isSelected && (
              <rect
                x={nx - 3}
                y={ny - 3}
                width={NODE_W + 6}
                height={NODE_H + 6}
                rx={10}
                fill="none"
                style={{ stroke: border }}
                strokeWidth={1.5}
                opacity={0.5}
              />
            )}
            <rect
              x={nx}
              y={ny}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              strokeWidth={isSelected ? 2.5 : 1.5}
              style={{
                fill: bg,
                stroke: isSelected ? "var(--accent)" : border,
                filter: isUnlocked ? "drop-shadow(0 2px 6px rgba(0,71,171,0.10))" : "none",
              }}
            />

            {/* Progress bar */}
            <rect x={nx + 2} y={ny + NODE_H - 10} width={NODE_W - 4} height={7} rx={3.5} style={{ fill: bar }} />
            <rect
              x={nx + 2}
              y={ny + NODE_H - 10}
              width={Math.max(0, ((NODE_W - 4) * displayProgressPercent(skill)) / 100)}
              height={7}
              rx={3.5}
              style={{ fill: pColor }}
              opacity={0.9}
            />

            {/* Name */}
            <text
              x={skill.x}
              y={skill.y - 10}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={19}
              fontWeight="700"
              style={{ fill: text }}
            >
              {skill.skillsName.length > 20 ? skill.skillsName.slice(0, 19) + "…" : skill.skillsName}
            </text>

            {/* Draft: an unfinished session the Exercise page will resume (adt-learning/docs/adr/0003) */}
            {getDraftCount(skill) > 0 && (
              <text
                x={nx + NODE_W - 12}
                y={ny + 16}
                textAnchor="end"
                dominantBaseline="central"
                fontSize={12}
                className="tree-node-draft"
              >
                {t("skill.draft.short", { count: getDraftCount(skill) })}
              </text>
            )}

            {/* Locked or Progress Label */}
            {!isUnlocked && !canUnlockThis ? (
              <text
                x={skill.x}
                y={skill.y + 18}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                className="tree-node-locked"
              >
                {t("skill.locked")}
              </text>
            ) : (
              <text
                x={skill.x}
                y={skill.y + 18}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={15}
                fontWeight="600"
                style={{ fill: pColor }}
              >
                {formatProgressLabel(skill, notStarted)}
              </text>
            )}
          </g>
        );
      })}
    </>
  );

  const viewBox = `${minX} ${minY} ${svgWidth} ${svgHeight}`;
  if (zoomable) {
    return (
      <ZoomableSVG viewBox={viewBox} className="skill-tree-svg">
        {inner}
      </ZoomableSVG>
    );
  }

  return (
    <svg viewBox={viewBox} className="skill-tree-svg">
      {inner}
    </svg>
  );
};
export default SkillTreeSVG;
