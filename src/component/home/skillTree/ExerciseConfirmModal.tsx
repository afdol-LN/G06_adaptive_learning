import React from "react";
import { LayoutSkill, getProgressColor } from "../utils/skillTree";
import { FaBookOpen } from "react-icons/fa6";

interface ExerciseConfirmModalProps {
  skill: LayoutSkill;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ExerciseConfirmModal: React.FC<ExerciseConfirmModalProps> = ({
  skill,
  onConfirm,
  onCancel,
}) => {


  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <FaBookOpen style={{ color: "#0047AB" }} />
        </div>
        <h2 className="confirm-title">เริ่มทำ Exercise?</h2>
        <p className="confirm-desc">
          คุณต้องการเริ่มทำ Exercise
          <br />
          <strong>{skill.skillsName}</strong> ใช่หรือไม่?
        </p>
        <div className="confirm-progress-row">
          <div className="confirm-progress-track">
            <div
              className="confirm-progress-fill"
              style={{
                width: `${skill.progressPercent}%`,
                background: getProgressColor(skill.progressPercent),
              }}
            />
          </div>
          <span className="confirm-progress-pct" style={{ color: getProgressColor(skill.progressPercent) }}>
            {skill.progressPercent}%
          </span>
        </div>
        <div className="confirm-btn-row">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            ไม่ใช่
          </button>
          <button className="confirm-btn-ok" onClick={onConfirm}>
            ใช่ เริ่มเลย!
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExerciseConfirmModal;
