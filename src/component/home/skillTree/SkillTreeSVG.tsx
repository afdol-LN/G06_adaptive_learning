import React from "react";
import { FaFlagCheckered } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { ScrollableSVG } from "./ScrollableSVG";
import {
  NODE_W,
  NODE_H,
  LayoutSkill,
  LayoutGoalNode,
  getNodeColors,
  getGoalNodeColors,
  getProgressColor,
  formatGoalCompletedOn,
  displayProgressPercent,
  formatProgressLabel,
  getDraftCount,
  isMastered,
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
  /** goal node ท้าย tree (adt-learning/docs/adr/0005) — null เมื่อ goal ไม่มีทักษะที่ต้องการ */
  goal?: LayoutGoalNode | null;
  goalSelected?: boolean;
  onGoalClick?: () => void;
  /** โหนดที่ backend แนะนำให้ฝึกต่อ — tree เปิดมาโดยเลื่อนไปที่โหนดนี้ */
  recommendedSkillId?: number | null;
}

const truncateName = (name: string) => (name.length > 20 ? name.slice(0, 19) + "…" : name);

// ความหนาของขอบล่างที่ทำให้โหนดดูนูน — ต้องตรงกับ translateY ตอน :active ใน Home.css (.tree-node-face)
const NODE_DEPTH = 10;
// progress bar ในโหนด: เว้นจากขอบซ้าย/ขวา BAR_INSET และยกขึ้นจากขอบล่าง BAR_BOTTOM (ไม่ชนกรอบโหนด)
const BAR_INSET = 16;
const BAR_BOTTOM = 22;
const BAR_W = NODE_W - BAR_INSET * 2;
// วงรอบโหนด (pulse / selected) ยุบตามหน้าโหนด: ขอบบนเลื่อนลง ขอบล่างอยู่ที่เดิม — Home.css .tree-node-halo
const HALO_STYLE = { "--halo-h": NODE_H + NODE_DEPTH + 8 } as React.CSSProperties;

export const SkillTreeSVG: React.FC<SkillTreeSVGProps> = ({
  skills,
  unlocked,
  canUnlockFn,
  onNodeClick,
  selected,
  hovered,
  setHovered,
  goal = null,
  goalSelected = false,
  onGoalClick,
  recommendedSkillId = null,
}) => {
  const { t, locale } = usePreferences();

  if (skills.length === 0) {
    return <p className="side-panel-empty">{t("skill.emptyTree")}</p>;
  }

  const notStarted = t("skill.notStarted");
  const getNodeById = (id: number) => skills.find((s) => s.skillId === id);
  const isGoalParent = (skillId: number) => !!goal && goal.fromSkillIds.includes(skillId);

  // เลื่อนไปเฉพาะโหนดที่เปิดได้จริง — กันกรณี backend กับ unlock rule ฝั่งนี้เห็นไม่ตรงกัน
  const recommended =
    recommendedSkillId != null
      ? skills.find(
          (s) => s.skillId === recommendedSkillId && (unlocked.has(s.skillId) || canUnlockFn(s.skillId))
        ) ?? null
      : null;

  const getEdgeColor = (fromId: number, toId: number) => {
    if (unlocked.has(toId)) return "var(--edge-open)";
    if (canUnlockFn(toId)) return "var(--edge-ready)";
    return "var(--edge-locked)";
  };

  const isRelatedEdge = (fromId: number, toId: number) =>
    selected && (fromId === selected.skillId || toId === selected.skillId);

  // the goal node sits below every skill, so it counts toward the canvas bounds too
  const placed: { x: number; y: number }[] = goal ? [...skills, goal] : skills;
  const minX = Math.min(...placed.map((s) => s.x || 0)) - NODE_W / 2 - 40;
  const minY = Math.min(...placed.map((s) => s.y || 0)) - NODE_H / 2 - 40;
  const maxX = Math.max(...placed.map((s) => s.x || 0)) + NODE_W / 2 + 40;
  const maxY = Math.max(...placed.map((s) => s.y || 0)) + NODE_H / 2 + 40;
  const svgWidth = maxX - minX;
  const svgHeight = maxY - minY;

  // Edges into the goal node — only from the ends of the tree (skills nothing else builds on),
  // merging on a line just above the goal row. Solid once that skill is at 100%, dashed until then.
  const goalEdges =
    goal &&
    goal.fromSkillIds.map((reqId) => {
      const from = getNodeById(reqId);
      if (!from) return null;
      const mastered = from.progressPercent === 100;
      const related = goalSelected || selected?.skillId === reqId;
      const x1 = from.x;
      const y1 = from.y + NODE_H / 2;
      const x2 = goal.x;
      const y2 = goal.y - NODE_H / 2;
      const midY = y2 - 40;
      return (
        <path
          key={`edge-goal-${reqId}`}
          d={`M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`}
          fill="none"
          style={{ stroke: related ? "var(--accent)" : mastered ? "var(--edge-open)" : "var(--edge-locked)" }}
          strokeWidth={related ? 2.6 : mastered ? 2 : 1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          strokeDasharray={mastered ? "none" : "6,4"}
          strokeOpacity={selected && !related ? 0.08 : 0.9}
        />
      );
    });

  const renderGoalNode = (g: LayoutGoalNode) => {
    // goal progress from the backend — the same number as the Home "Goal progress" card
    const pct = g.progressPercent;
    const { bg, border, text, bar } = getGoalNodeColors(g.isComplete);
    const nx = g.x - NODE_W / 2;
    const ny = g.y - NODE_H / 2;
    const isRelated = !selected || isGoalParent(selected.skillId);

    return (
      <g
        className="tree-node clickable"
        onClick={(e) => {
          e.stopPropagation();
          onGoalClick?.();
        }}
        style={{ opacity: isRelated ? 1 : 0.25, transition: "opacity 300ms linear" }}
      >
        {goalSelected && (
          <rect
            x={nx - 4}
            y={ny - 4}
            width={NODE_W + 8}
            height={NODE_H + NODE_DEPTH + 8}
            rx={11}
            fill="none"
            strokeWidth={2.5}
            opacity={0.9}
            className="tree-node-ring tree-node-halo"
            style={HALO_STYLE}
          />
        )}
        <rect
          x={nx}
          y={ny + NODE_DEPTH}
          width={NODE_W}
          height={NODE_H}
          rx={8}
          className="tree-node-lip"
          style={{ fill: `color-mix(in srgb, ${border} 78%, black)` }}
        />
        <g className="tree-node-face">
        <rect
          x={nx}
          y={ny}
          width={NODE_W}
          height={NODE_H}
          rx={8}
          strokeWidth={goalSelected ? 2.5 : 1.5}
          strokeDasharray={g.isComplete ? undefined : "6,4"}
          style={{ fill: bg, stroke: goalSelected ? "var(--accent)" : border }}
        />

        {/* Goal progress bar */}
        <rect x={nx + BAR_INSET} y={ny + NODE_H - BAR_BOTTOM} width={BAR_W} height={7} rx={3.5} style={{ fill: bar }} />
        <rect
          x={nx + BAR_INSET}
          y={ny + NODE_H - BAR_BOTTOM}
          width={Math.max(0, (BAR_W * pct) / 100)}
          height={7}
          rx={3.5}
          style={{ fill: getProgressColor(pct) }}
          opacity={0.9}
        />

        <FaFlagCheckered x={nx + 12} y={ny + 11} size={16} style={{ color: text }} aria-hidden />
        <text x={nx + 34} y={ny + 19} dominantBaseline="central" fontSize={12} fontWeight="700" style={{ fill: text }}>
          {t("goalNode.label")}
        </text>

        <text
          x={g.x}
          y={g.y - 4}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={19}
          fontWeight="700"
          style={{ fill: text }}
        >
          {truncateName(g.goalName)}
        </text>

        <text
          x={g.x}
          y={g.y + 24}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={15}
          fontWeight="600"
          style={{ fill: getProgressColor(pct) }}
        >
          {g.isComplete ? t("goalNode.complete") : `${pct}%`}
        </text>

        {/* Top right: count (in-progress) หรือ วันที่เสร็จ (complete) */}
        <text
          x={nx + NODE_W - 12}
          y={ny + 19}
          textAnchor="end"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="600"
          style={{ fill: text }}
        >
          {g.isComplete
            ? g.completedAt
              ? formatGoalCompletedOn(g.completedAt, locale)
              : ""
            : t("goalNode.count", { done: g.masteredCount, total: g.requiredCount })}
        </text>
        </g>
      </g>
    );
  };

  const inner = (
    <>


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
              strokeWidth={isActive ? 2 : 1.5}
              strokeLinejoin="round"
              strokeDasharray={isActive ? "none" : "6,4"}
              // edges into locked / not-yet-unlocked skills stay dashed but must be readable (was 0.3 opacity)
              strokeOpacity={selected || goalSelected ? 0.08 : isActive ? 0.85 : 0.9}
            />
          );
        })
      )}

      {goalEdges}

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
        // with the goal node selected, only the skills joined to it stay lit
        const dimmed = (selected && !isRelated) || (goalSelected && !isGoalParent(skill.skillId));

        const { bg, border, text, bar } = getNodeColors(isUnlocked, canUnlockThis, displayProgressPercent(skill));
        const nx = skill.x - NODE_W / 2;
        const ny = skill.y - NODE_H / 2;
        const pColor = getProgressColor(displayProgressPercent(skill));
        // the pulse invites practice — a skill already at 100% has nothing left to invite
        // (canUnlockFn is true for every open node, mastered ones included)
        const mastered = isMastered(skill);
        const pulses = canUnlockThis && !mastered;

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
              opacity: dimmed ? 0.25 : 1,
              transition: "opacity 300ms linear",
            }}
          >
            {pulses && (
              <rect
                x={nx - 4}
                y={ny - 4}
                width={NODE_W + 8}
                height={NODE_H + NODE_DEPTH + 8}
                rx={11}
                fill="none"
                strokeWidth={2}
                className="pulse-ring-blue tree-node-halo"
                style={HALO_STYLE}
              />
            )}
            {isSelected && (
              <rect
                x={nx - 4}
                y={ny - 4}
                width={NODE_W + 8}
                height={NODE_H + NODE_DEPTH + 8}
                rx={11}
                fill="none"
                strokeWidth={2.5}
                opacity={0.9}
                className="tree-node-ring tree-node-halo"
                style={HALO_STYLE}
              />
            )}
            {/* ขอบล่าง (lip) ที่ทำให้โหนดดูนูน — หน้าโหนดเลื่อนลงมาทับเมื่อ hover/กด */}
            <rect
              x={nx}
              y={ny + NODE_DEPTH}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              className="tree-node-lip"
              style={{ fill: `color-mix(in srgb, ${border} 78%, black)` }}
            />
            <g className={`tree-node-face${isHov ? " hovered" : ""}`}>
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
              }}
            />

            {/* Progress bar — a completed skill shows "completed" instead (adt-learning/docs/adr/0007) */}
            {!mastered && (
              <>
                <rect x={nx + BAR_INSET} y={ny + NODE_H - BAR_BOTTOM} width={BAR_W} height={7} rx={3.5} style={{ fill: bar }} />
                <rect
                  x={nx + BAR_INSET}
                  y={ny + NODE_H - BAR_BOTTOM}
                  width={Math.max(0, (BAR_W * displayProgressPercent(skill)) / 100)}
                  height={7}
                  rx={3.5}
                  style={{ fill: pColor }}
                  opacity={0.9}
                />
              </>
            )}

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
              {truncateName(skill.skillsName)}
            </text>


            {/* Draft: an unfinished session the Exercise page will resume (adt-learning/docs/adr/0003) */}
            {/* ถ้ามีทั้ง % และ draft ให้ draft ขยับลงมา 14px ไม่ทับกัน */}
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
            ) : mastered ? (
              // no bar below it, so the word sits lower and larger than the percentage did
              <text
                x={skill.x}
                y={skill.y + 24}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={17}
                fontWeight="800"
                style={{ fill: pColor }}
              >
                {t("skill.mastered")}
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
          </g>
        );
      })}

      {/* Goal node — the end of every branch's tree (adt-learning/docs/adr/0005) */}
      {goal && renderGoalNode(goal)}
    </>
  );

  return (
    <ScrollableSVG
      minX={minX}
      minY={minY}
      width={svgWidth}
      height={svgHeight}
      className="skill-tree-svg"
      focus={recommended ? { x: recommended.x, y: recommended.y } : null}
      // กล่องรวมขอบล่าง (lip) ด้วย — ปุ่มจะหายเมื่อเห็นส่วนใดของโหนดเป้าหมายก็ได้
      jumpTarget={
        goal
          ? { x: goal.x, y: goal.y + NODE_DEPTH / 2, width: NODE_W, height: NODE_H + NODE_DEPTH, label: t("goalNode.jump") }
          : null
      }
      backToTopLabel={t("goalNode.backToTop")}
    >
      {inner}
    </ScrollableSVG>
  );
};
export default SkillTreeSVG;
