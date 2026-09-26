import React from "react";
import { FaFlagCheckered, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  LayoutGoalNode,
  LayoutSkill,
  getProgressColor,
  formatGoalCompletedOn,
} from "../utils/skillTree";
import { SkillProgressRow } from "./SkillProgressRow";

interface GoalSidePanelProps {
  goal: LayoutGoalNode | null;
  open: boolean;
  onClose: () => void;
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onSelectSkill: (skill: LayoutSkill) => void;
}

// แผงสรุปของ goal node ท้าย skill tree — ความคืบหน้าเป้าหมาย (ตัวเลขเดียวกับการ์ดหน้า Home)
// และทักษะที่เป้าหมายต้องการ ไม่มีปุ่มไปทำ exercise เพราะ goal node ไม่ใช่ทักษะ (adt-learning/docs/adr/0005)
export const GoalSidePanel: React.FC<GoalSidePanelProps> = ({
  goal,
  open,
  onClose,
  skills,
  unlocked,
  canUnlockFn,
  onSelectSkill,
}) => {
  const { t, locale } = usePreferences();
  if (!open || !goal) return null;

  const notStarted = t("skill.notStarted");
  const pct = goal.progressPercent;
  const required = goal.requiredSkillIds
    .map((id) => skills.find((s) => s.skillId === id))
    .filter((s): s is LayoutSkill => !!s);

  return (
    <div className="side-panel">
      <div className="side-panel-section">
        <div className="side-panel-top-row">
          <span className="side-panel-icon"><FaFlagCheckered aria-hidden /></span>
          <button className="btn-close" onClick={onClose} aria-label={t("common.close")}>
            <FaXmark aria-hidden />
          </button>
        </div>
        <div className="side-panel-title">{goal.goalName}</div>
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%`, background: getProgressColor(pct) }} />
          </div>
          <span className="progress-pct" style={{ color: getProgressColor(pct) }}>
            {goal.isComplete ? t("goalNode.complete") : `${pct}%`}
          </span>
        </div>
        <p className="side-panel-status">
          {goal.isComplete
            ? goal.completedAt
              ? t("goalNode.completedOn", { date: formatGoalCompletedOn(goal.completedAt, locale) })
              : t("goalNode.statusDone")
            : `${t("goalNode.count", { done: goal.masteredCount, total: goal.requiredCount })} · ${t("goalNode.statusTodo")}`}
        </p>
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">{t("goalNode.required")}</p>
        {required.map((n) => (
          <SkillProgressRow
            key={n.skillId}
            skill={n}
            isUnlocked={unlocked.has(n.skillId)}
            canUnlock={canUnlockFn(n.skillId)}
            notStartedLabel={notStarted}
            onClick={onSelectSkill}
          />
        ))}
      </div>
    </div>
  );
};
export default GoalSidePanel;
