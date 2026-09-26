import { FaMagnifyingGlass, FaPen, FaBookOpen, FaLayerGroup, FaDiagramProject } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { getTierColor, getTierLabel, statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";

interface SkillViewModalProps {
  skill: Skill | null;
  onClose: () => void;
  onEdit: (skill: Skill) => void;
}

// ใช้หน้าตาชุดเดียวกับ UserViewModal (class ad-uv-* ใน Adminhome.css)
export default function SkillViewModal({ skill, onClose, onEdit }: SkillViewModalProps) {
  const { t } = usePreferences();
  if (!skill) return null;

  const prerequisites = skill.skillPrequisite || [];
  const sk = statusKey(skill.status);
  const isActive = skill.status?.toLowerCase() === "active";
  const tierColor = getTierColor(skill.tier);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--detail" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {t("admin.skillView.title")}</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-user-hero ad-uv-hero">
            <div className="ad-user-avatar-lg"><FaBookOpen aria-hidden /></div>
            <div className="ad-uv-hero-text">
              <div className="ad-uv-name">{skill.skillsName}</div>
              <div className="ad-uv-username">{skill.skillCode}</div>
              <div className="ad-uv-pills">
                <span className={`ad-uv-pill ${isActive ? "ad-uv-pill--ok" : "ad-uv-pill--off"}`}>
                  <span className="ad-uv-dot" />
                  {sk ? t(sk) : skill.status}
                </span>
                {skill.tier && (
                  <span
                    className="ad-uv-pill"
                    style={{ color: tierColor, borderColor: `${tierColor}66` }}
                  >
                    <FaLayerGroup aria-hidden /> {getTierLabel(skill.tier)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="ad-uv-grid">
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.skills.col.code")}</span>
              <span className="ad-uv-value">{skill.skillCode || "-"}</span>
            </div>
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.skills.col.tier")}</span>
              <span className="ad-uv-value">{skill.tier ? getTierLabel(skill.tier) : "-"}</span>
            </div>
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaDiagramProject aria-hidden /> {t("admin.skills.col.prereq")}
              {prerequisites.length > 0 && <span className="ad-uv-count">{prerequisites.length}</span>}
            </div>

            {prerequisites.length === 0 ? (
              <div className="ad-uv-empty">{t("admin.skillView.noPrereq")}</div>
            ) : (
              <div className="ad-uv-goals">
                {prerequisites.map((p) => (
                  <div key={p.prerequisiteSkillId} className="ad-uv-goal">
                    <div className="ad-uv-goal-head ad-uv-goal-head--static">
                      <span className="ad-uv-goal-name">
                        {p.prerequisiteSkill?.skillsName || `#${p.prerequisiteSkillId}`}
                      </span>
                      {p.prerequisiteLevel != null && (
                        <span className="ad-uv-exp">{t("admin.common.level", { n: p.prerequisiteLevel })}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            {t("admin.common.close")}
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(skill)}>
            <FaPen /> {t("admin.common.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}
