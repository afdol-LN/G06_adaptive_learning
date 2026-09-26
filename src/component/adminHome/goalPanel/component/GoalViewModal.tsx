import { FaMagnifyingGlass, FaPen, FaBullseye, FaListCheck, FaSitemap } from "react-icons/fa6";
import { Goal } from "../../../../models/goalModel";
import { statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";
import GoalLearningTree from "./GoalLearningTree";

interface GoalViewModalProps {
  goal: Goal | null;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
}

// ใช้หน้าตาชุดเดียวกับ UserViewModal / SkillViewModal (class ad-uv-* ใน Adminhome.css)
export default function GoalViewModal({ goal, onClose, onEdit }: GoalViewModalProps) {
  const { t } = usePreferences();
  if (!goal) return null;

  const requires = goal.goalSkillRequire || [];
  const sk = statusKey(goal.status);
  const isActive = goal.status?.toLowerCase() === "active";

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--user" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {t("admin.goalView.title")}</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-user-hero ad-uv-hero">
            <div className="ad-user-avatar-lg"><FaBullseye aria-hidden /></div>
            <div className="ad-uv-hero-text">
              <div className="ad-uv-name">{goal.goal}</div>
              <div className="ad-uv-username ad-gv-desc">{goal.goalDescription || "-"}</div>
              <div className="ad-uv-pills">
                <span className={`ad-uv-pill ${isActive ? "ad-uv-pill--ok" : "ad-uv-pill--bad"}`}>
                  <span className="ad-uv-dot" />
                  {sk ? t(sk) : goal.status}
                </span>
                <span className="ad-uv-pill">
                  <FaListCheck aria-hidden /> {requires.length} Skill
                </span>
              </div>
            </div>
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaListCheck aria-hidden /> {t("admin.goalView.skillsNeeded")}
              {requires.length > 0 && <span className="ad-uv-count">{requires.length}</span>}
            </div>
            {requires.length === 0 ? (
              <div className="ad-uv-empty">{t("admin.goalView.noSkills")}</div>
            ) : (
              <div className="ad-gv-skills">
                {requires.map((r) => (
                  <div key={r.skillId} className="ad-uv-goal">
                    <div className="ad-uv-goal-head ad-uv-goal-head--static">
                      <span className="ad-uv-goal-name">{r.skill?.skillsName || `#${r.skillId}`}</span>
                      {r.levelRequire != null && (
                        <span className="ad-uv-exp">{t("admin.common.level", { n: r.levelRequire })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaSitemap aria-hidden /> {t("admin.goalView.tree")}
            </div>
            <div className="ad-gv-tree">
              <GoalLearningTree requires={requires} />
            </div>
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
