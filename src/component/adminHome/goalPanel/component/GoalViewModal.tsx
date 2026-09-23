import { FaMagnifyingGlass, FaPen } from "react-icons/fa6";
import { Goal } from "../../../../models/goalModel";
import { getStatusColor, statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";
import GoalLearningTree from "./GoalLearningTree";

interface GoalViewModalProps {
  goal: Goal | null;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
}

export default function GoalViewModal({ goal, onClose, onEdit }: GoalViewModalProps) {
  const { t } = usePreferences();
  if (!goal) return null;

  const requires = goal.goalSkillRequire || [];
  const sk = statusKey(goal.status);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {t("admin.goalView.title")}</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">{t("admin.goalForm.name")}</label>
            <div>{goal.goal}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.goalForm.description")}</label>
            <div>{goal.goalDescription || "-"}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.common.status")}</label>
            <div>
              <span className="ad-status-dot" style={{ background: getStatusColor(goal.status) }} />
              <span className="ad-muted">{sk ? t(sk) : goal.status}</span>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.goalView.skillsNeeded")}</label>
            <div className="ad-req-tags">
              {requires.length === 0 ? (
                <span className="ad-muted">{t("admin.goalView.noSkills")}</span>
              ) : (
                requires.map((r) => (
                  <span key={r.skillId} className="ad-req-tag">
                    {r.skill?.skillsName || `#${r.skillId}`}
                    {r.levelRequire != null ? ` (${t("admin.common.level", { n: r.levelRequire })})` : ""}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.goalView.tree")}</label>
            <GoalLearningTree requires={requires} />
          </div>
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            {t("admin.common.close")}
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(goal)}>
            <FaPen /> {t("admin.common.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}
