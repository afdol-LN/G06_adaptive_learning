import React, { useState } from "react";
import { LayoutSkill, getProgressColor } from "../utils/skillTree";

interface NextExercisePickerProps {
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onGo: (skill: LayoutSkill) => void;
  onClose: () => void;
}

export const NextExercisePicker: React.FC<NextExercisePickerProps> = ({
  skills,
  unlocked,
  canUnlockFn,
  onGo,
  onClose,
}) => {
  const [picked, setPicked] = useState<LayoutSkill | null>(null);
  const available = skills.filter((s) => unlocked.has(s.skillId) || canUnlockFn(s.skillId));

  return (
    <div className="ex-picker-overlay" onClick={onClose}>
      <div className="ex-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ex-picker-header">
          <span className="ex-picker-title">เลือกเรื่องที่จะทำ Exercise</span>
          <button className="btn-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p className="ex-picker-hint">เลือกได้ 1 เรื่อง (เฉพาะที่ปลดล็อกแล้วหรือพร้อมปลดล็อก)</p>
        <div className="ex-picker-list">
          {available.map((s) => (
            <div
              key={s.skillId}
              className={`ex-picker-item ${picked?.skillId === s.skillId ? "selected" : ""}`}
              onClick={() => setPicked(s)}
            >
              <div className="ex-picker-info">
                <span className="ex-picker-name">{s.skillsName}</span>
                <span className="ex-picker-prog" style={{ color: getProgressColor(s.progressPercent) }}>
                  {s.progressPercent}%
                </span>
              </div>
              {picked?.skillId === s.skillId && <span className="ex-picker-check">✓</span>}
            </div>
          ))}
        </div>
        <button
          className={`btn-go-exercise ${picked ? "active" : "inactive"}`}
          disabled={!picked}
          onClick={() => picked && onGo(picked)}
        >
          {picked ? `Go Exercise: ${picked.skillsName} →` : "เลือกเรื่องก่อนแล้วกด Go"}
        </button>
      </div>
    </div>
  );
};
export default NextExercisePicker;
