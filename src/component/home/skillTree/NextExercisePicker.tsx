import React, { useState } from "react";
import { FaCheck, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { LayoutSkill, getProgressColor, displayProgressPercent, formatProgressLabel, getDraftCount } from "../utils/skillTree";

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
  const { t } = usePreferences();
  const [picked, setPicked] = useState<LayoutSkill | null>(null);
  const available = skills.filter((s) => unlocked.has(s.skillId) || canUnlockFn(s.skillId));

  return (
    <div className="ex-picker-overlay" onClick={onClose}>
      <div className="ex-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ex-picker-header">
          <span className="ex-picker-title">{t("picker.title")}</span>
          <button className="btn-close" onClick={onClose} aria-label={t("common.close")}>
            <FaXmark aria-hidden />
          </button>
        </div>
        <p className="ex-picker-hint">{t("picker.hint")}</p>
        <div className="ex-picker-list">
          {available.map((s) => (
            <div
              key={s.skillId}
              className={`ex-picker-item ${picked?.skillId === s.skillId ? "selected" : ""}`}
              onClick={() => setPicked(s)}
            >
              <div className="ex-picker-info">
                <span className="ex-picker-name">{s.skillsName}</span>
                <span className="ex-picker-prog" style={{ color: getProgressColor(displayProgressPercent(s)) }}>
                  {formatProgressLabel(s, t("skill.notStarted"))}
                </span>
                {getDraftCount(s) > 0 && (
                  <span className="ex-picker-draft">{t("skill.draft.short", { count: getDraftCount(s) })}</span>
                )}
              </div>
              {picked?.skillId === s.skillId && (
                <span className="ex-picker-check"><FaCheck aria-hidden /></span>
              )}
            </div>
          ))}
        </div>
        <button
          className={`btn-go-exercise ${picked ? "active" : "inactive"}`}
          disabled={!picked}
          onClick={() => picked && onGo(picked)}
        >
          {picked
            ? t(getDraftCount(picked) > 0 ? "picker.resume" : "picker.go", { name: picked.skillsName })
            : t("picker.pickFirst")}
        </button>
      </div>
    </div>
  );
};
export default NextExercisePicker;
