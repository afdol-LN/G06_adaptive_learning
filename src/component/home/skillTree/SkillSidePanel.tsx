import React from "react";
import { FaBookOpen, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { LayoutSkill, getProgressColor, displayProgressPercent, formatProgressLabel, getDraftCount } from "../utils/skillTree";

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

  const isUnlocked = unlocked.has(skill.skillId);
  const canDo = canUnlockFn(skill.skillId);
  const draftCount = getDraftCount(skill);

  const nodeRow = (n: LayoutSkill) => (
    <div key={n.skillId} className="node-row" onClick={() => setSelected(n)}>
      <span className="node-row-name">{n.skillsName}</span>
      <span className="node-row-pct" style={{ color: getProgressColor(displayProgressPercent(n)) }}>
        {formatProgressLabel(n, notStarted)}
      </span>
    </div>
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
          <p className="side-panel-empty">{t("skill.prereqNone")}</p>
        ) : (
          prereqNodes.map(nodeRow)
        )}
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">{t("skill.unlocks")}</p>
        {nextNodes.length === 0 ? (
          <p className="side-panel-empty">{t("skill.unlocksNone")}</p>
        ) : (
          nextNodes.map(nodeRow)
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
