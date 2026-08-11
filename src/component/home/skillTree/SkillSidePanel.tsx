import React from "react";
import { LayoutSkill, getProgressColor, displayProgressPercent, formatProgressLabel } from "../utils/skillTree";
import { FaBookOpen } from "react-icons/fa6";

interface SkillSidePanelProps {
  selected: LayoutSkill | null;
  setSelected: (skill: LayoutSkill | null) => void;
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onStartExercise: (skill: LayoutSkill) => void;
}

export const SkillSidePanel: React.FC<SkillSidePanelProps> = ({
  selected,
  setSelected,
  skills,
  unlocked,
  canUnlockFn,
  onStartExercise,
}) => {
  if (!selected) return null;
  const skill = skills.find((s) => s.skillId === selected.skillId);
  if (!skill) return null;

  const prereqNodes = (skill.skillPrequisite || [])
    .map((p) => skills.find((s) => s.skillId === p.prerequisiteSkillId))
    .filter((n): n is LayoutSkill => !!n);

  const nextNodes = skills.filter((s) =>
    (s.skillPrequisite || []).some((p) => p.prerequisiteSkillId === skill.skillId)
  );

  const isUnlocked = unlocked.has(skill.skillId);
  const canDo = canUnlockFn(skill.skillId);

  return (
    <div className="side-panel">
      <div className="side-panel-section">
        <div className="side-panel-top-row">
          <span className="side-panel-icon" style={{ display: "flex", alignItems: "center", color: "#0047AB" }}>
            <FaBookOpen />
          </span>
          <button className="btn-close" onClick={() => setSelected(null)}>
            ✕
          </button>
        </div>
        <div className="side-panel-title">{skill.skillsName}</div>
        <div className="progress-row">
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{
                width: `${displayProgressPercent(skill)}%`,
                background: getProgressColor(displayProgressPercent(skill)),
              }}
            />
          </div>
          <span className="progress-pct" style={{ color: getProgressColor(displayProgressPercent(skill)) }}>
            {formatProgressLabel(skill)}
          </span>
        </div>
        <p className="side-panel-status">
          {isUnlocked ? "ปลดล็อกแล้ว" : canDo ? "พร้อมปลดล็อก" : "ยังล็อกอยู่"}
        </p>
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">มาจาก (Prerequisite)</p>
        {prereqNodes.length === 0 ? (
          <p className="side-panel-empty">— ไม่มี (จุดเริ่มต้น)</p>
        ) : (
          prereqNodes.map((n) => (
            <div key={n.skillId} className="node-row" onClick={() => setSelected(n)}>
              <span className="node-row-name">{n.skillsName}</span>
              <span className="node-row-pct" style={{ color: getProgressColor(displayProgressPercent(n)) }}>
                {formatProgressLabel(n)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">ต่อไป (Unlocks)</p>
        {nextNodes.length === 0 ? (
          <p className="side-panel-empty">— ไม่มี (จุดสิ้นสุด)</p>
        ) : (
          nextNodes.map((n) => (
            <div key={n.skillId} className="node-row" onClick={() => setSelected(n)}>
              <span className="node-row-name">{n.skillsName}</span>
              <span className="node-row-pct" style={{ color: getProgressColor(displayProgressPercent(n)) }}>
                {formatProgressLabel(n)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="side-panel-section">
        <button
          className={`btn-exercise ${isUnlocked ? "unlocked" : canDo ? "can-unlock" : "disabled"}`}
          disabled={!isUnlocked && !canDo}
          onClick={() => onStartExercise(skill)}
        >
          {isUnlocked ? "ไปทำ Exercise →" : canDo ? "ปลดล็อก + Exercise →" : "ยังทำไม่ได้"}
        </button>
      </div>
    </div>
  );
};
export default SkillSidePanel;
