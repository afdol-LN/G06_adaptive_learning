import React from "react";
import {
  LayoutSkill,
  getNodeColors,
  getProgressColor,
  displayProgressPercent,
  formatProgressLabel,
} from "../utils/skillTree";

interface SkillProgressRowProps {
  skill: LayoutSkill;
  isUnlocked: boolean;
  canUnlock: boolean;
  notStartedLabel: string;
  onClick: (skill: LayoutSkill) => void;
}

// แถวทักษะใน side panel — พื้นเป็น progress bar: สีพื้น/ขอบ/ตัวอักษรจาก getNodeColors,
// แถบเติมจาก getProgressColor เหมือนโหนดใน skill tree
export const SkillProgressRow: React.FC<SkillProgressRowProps> = ({
  skill,
  isUnlocked,
  canUnlock,
  notStartedLabel,
  onClick,
}) => {
  const pct = displayProgressPercent(skill);
  const isLocked = !isUnlocked && !canUnlock;
  const { bg, border, text } = getNodeColors(isUnlocked, !isLocked, pct);
  const label = formatProgressLabel(skill, notStartedLabel);
  return (
    <div
      className={`node-row node-row-progress${isLocked ? " locked" : ""}`}
      style={{ background: bg, borderColor: border, color: isLocked ? undefined : text }}
      onClick={() => onClick(skill)}
    >
      <span className="node-row-name">{skill.skillsName}</span>
      <span className="node-row-pct" style={{ color: getProgressColor(pct) }}>{label}</span>
      {/* แถบทึบ + สำเนาข้อความสีขาว ตัดด้วย clip-path ให้กว้างเท่า pct — ข้อความส่วนที่อยู่บนแถบจึงเป็นสีขาว */}
      <span
        className="node-row-fill"
        style={{ "--fill": getProgressColor(pct), "--clip": `${100 - pct}%` } as React.CSSProperties}
        aria-hidden
      >
        <span className="node-row-name">{skill.skillsName}</span>
        <span className="node-row-pct">{label}</span>
      </span>
    </div>
  );
};

export default SkillProgressRow;
