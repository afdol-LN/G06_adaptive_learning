import React from "react";
import { FaBookOpen, FaFlagCheckered, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  LayoutGoalNode,
  LayoutSkill,
  getGoalNodeColors,
  getProgressColor,
  displayProgressPercent,
  formatProgressLabel,
  getDraftCount,
} from "../utils/skillTree";
import { SkillProgressRow } from "./SkillProgressRow";

interface SkillSidePanelProps {
  selected: LayoutSkill | null;
  setSelected: (skill: LayoutSkill | null) => void;
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlockFn: (skillId: number) => boolean;
  onStartExercise: (skill: LayoutSkill) => void;
  /** the tree's goal node — a skill it is joined to lists the goal under "next" */
  goal?: LayoutGoalNode | null;
  onOpenGoal?: () => void;
}

export const SkillSidePanel: React.FC<SkillSidePanelProps> = ({
  selected,
  setSelected,
  skills,
  unlocked,
  canUnlockFn,
  onStartExercise,
  goal = null,
  onOpenGoal,
}) => {
  const { t } = usePreferences();
  if (!selected) return null;
  const skill = skills.find((s) => s.skillId === selected.skillId);
  if (!skill) return null;

  const notStarted = t("skill.notStarted");

  const prereqNodes = (skill.skillPrequisite || [])
    .map((p) => skills.find((s) => s.skillId === p.prerequisiteSkillId))
    .filter((n): n is LayoutSkill => !!n);

  const nextNodes = skills.filter((s) =>
    (s.skillPrequisite || []).some((p) => p.prerequisiteSkillId === skill.skillId)
  );
  // an end of the tree leads straight into the goal node (the same edges SkillTreeSVG draws)
  const leadsToGoal = !!goal && goal.fromSkillIds.includes(skill.skillId);

  const isUnlocked = unlocked.has(skill.skillId);
  const canDo = canUnlockFn(skill.skillId);
  const draftCount = getDraftCount(skill);

  const nodeRow = (n: LayoutSkill) => (
    <SkillProgressRow
      key={n.skillId}
      skill={n}
      isUnlocked={unlocked.has(n.skillId)}
      canUnlock={canUnlockFn(n.skillId)}
      notStartedLabel={notStarted}
      onClick={setSelected}
    />
  );

  return (
    <div className="side-panel">
      <div className="side-panel-section">
        <div className="side-panel-top-row">
          <span className="side-panel-icon"><FaBookOpen aria-hidden /></span>
          <button className="btn-close" onClick={() => setSelected(null)} aria-label={t("common.close")}>
            <FaXmark aria-hidden />
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
            {formatProgressLabel(skill, notStarted)}
          </span>
        </div>
        <p className="side-panel-status">
          {isUnlocked
            ? t("skill.status.unlocked")
            : canDo
              ? t("skill.status.ready")
              : t("skill.status.locked")}
        </p>
        {draftCount > 0 && <p className="side-panel-draft">{t("skill.draft.long", { count: draftCount })}</p>}
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">{t("skill.prereq")}</p>
        {prereqNodes.length === 0 ? (
          <div className="node-row node-row-empty">
            <span className="node-row-name">{t("skill.prereqNone")}</span>
          </div>
        ) : (
          prereqNodes.map(nodeRow)
        )}
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">{t("skill.unlocks")}</p>
        {nextNodes.map(nodeRow)}
        {leadsToGoal && goal && (() => {
          // same row as a skill, coloured like the goal node; goal progress comes from the backend
          const pct = goal.progressPercent;
          const { bg, border, text } = getGoalNodeColors(goal.isComplete);
          const label = (
            <>
              <FaFlagCheckered aria-hidden />
              <span className="node-row-name">{t("goalNode.label")}: {goal.goalName}</span>
              <span className="node-row-pct">{pct}%</span>
            </>
          );
          return (
            <div
              className="node-row node-row-progress node-row-goal"
              style={{ background: bg, borderColor: border, color: text }}
              onClick={onOpenGoal}
            >
              {label}
              <span
                className="node-row-fill"
                style={{ "--fill": getProgressColor(pct), "--clip": `${100 - pct}%` } as React.CSSProperties}
                aria-hidden
              >
                {label}
              </span>
            </div>
          );
        })()}
        {nextNodes.length === 0 && !leadsToGoal && (
          <div className="node-row node-row-empty">
            <span className="node-row-name">{t("skill.unlocksNone")}</span>
          </div>
        )}
      </div>

      <div className="side-panel-section">
        <button
          className={`btn-exercise ${isUnlocked ? "unlocked" : canDo ? "can-unlock" : "disabled"}`}
          disabled={!isUnlocked && !canDo}
          onClick={() => onStartExercise(skill)}
        >
          {draftCount > 0 && (isUnlocked || canDo)
            ? t("skill.action.resume")
            : isUnlocked
            ? t("skill.action.go")
            : canDo
              ? t("skill.action.unlock")
              : t("skill.action.disabled")}
        </button>
      </div>
    </div>
  );
};
export default SkillSidePanel;
