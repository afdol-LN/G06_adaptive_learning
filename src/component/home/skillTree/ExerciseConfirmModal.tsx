import React from "react";
import { FaBookOpen } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { LayoutSkill, getProgressColor, displayProgressPercent, formatProgressLabel, getDraftCount } from "../utils/skillTree";

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
  const { t } = usePreferences();
  const pct = displayProgressPercent(skill);
  // a skill with a draft continues it rather than starting over (adt-learning/docs/adr/0003)
  const draftCount = getDraftCount(skill);

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <FaBookOpen aria-hidden />
        </div>
        <h2 className="confirm-title">{draftCount > 0 ? t("confirm.resumeTitle") : t("confirm.title")}</h2>
        <p className="confirm-desc">
          {draftCount > 0 ? t("confirm.resumeLead", { count: draftCount }) : t("confirm.lead")}
          <br />
          <strong>{skill.skillsName}</strong> {draftCount > 0 ? t("confirm.resumeTail") : t("confirm.tail")}
        </p>
        <div className="confirm-progress-row">
          <div className="confirm-progress-track">
            <div
              className="confirm-progress-fill"
              style={{ width: `${pct}%`, background: getProgressColor(pct) }}
            />
          </div>
          <span className="confirm-progress-pct" style={{ color: getProgressColor(pct) }}>
            {formatProgressLabel(skill, t("skill.notStarted"))}
          </span>
        </div>
        <div className="confirm-btn-row">
          <button className="confirm-btn-cancel" onClick={onCancel}>
            {t("confirm.cancel")}
          </button>
          <button className="confirm-btn-ok" onClick={onConfirm}>
            {draftCount > 0 ? t("confirm.resumeOk") : t("confirm.ok")}
          </button>
        </div>
      </div>
    </div>
  );
};
export default ExerciseConfirmModal;
