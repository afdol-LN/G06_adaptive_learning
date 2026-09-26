import React from "react";
import { FaFlagCheckered, FaPlay } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";

interface HomeGoalBarProps {
  goalName?: string;
  onNextExercise: () => void;
}

// แถบลอยกลางด้านบนของ tree — goal ที่กำลังเรียน (ซ้าย) + ปุ่มแบบฝึกหัดถัดไป (ขวา)
export const HomeGoalBar: React.FC<HomeGoalBarProps> = ({ goalName, onNextExercise }) => {
  const { t } = usePreferences();
  return (
    <div className="home-goal-bar">
      <div className="hgb-goal">
        <FaFlagCheckered aria-hidden className="hgb-icon" />
        <div className="hgb-text">
          <span className="hgb-label">{t("home.goal")}</span>
          <span className="hgb-name" title={goalName}>{goalName || t("home.goalUnset")}</span>
        </div>
      </div>
      <button
        type="button"
        className="btn-next-exercise hgb-next"
        onClick={onNextExercise}
        title={t("home.nextExercise")}
      >
        <FaPlay aria-hidden />
        <span>{t("home.nextExerciseShort")}</span>
      </button>
    </div>
  );
};
export default HomeGoalBar;
