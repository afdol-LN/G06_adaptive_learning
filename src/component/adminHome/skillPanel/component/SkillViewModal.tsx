import { FaMagnifyingGlass, FaPen } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { getTierColor, getTierLabel, getStatusColor, statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";

interface SkillViewModalProps {
  skill: Skill | null;
  onClose: () => void;
  onEdit: (skill: Skill) => void;
}

export default function SkillViewModal({ skill, onClose, onEdit }: SkillViewModalProps) {
  const { t } = usePreferences();
  if (!skill) return null;

  const prerequisites = skill.skillPrequisite || [];
  const sk = statusKey(skill.status);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {t("admin.skillView.title")}</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">{t("admin.skills.col.code")}</label>
            <div>{skill.skillCode}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.skillForm.name")}</label>
            <div>{skill.skillsName}</div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.skills.col.tier")}</label>
              <div>
                <span
                  className="ad-tier-badge"
                  style={{
                    background: `${getTierColor(skill.tier)}18`,
                    color: getTierColor(skill.tier),
                    border: `1px solid ${getTierColor(skill.tier)}40`,
                  }}
                >
                  {skill.tier ? getTierLabel(skill.tier) : "-"}
                </span>
              </div>
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("admin.common.status")}</label>
              <div>
                <span className="ad-status-dot" style={{ background: getStatusColor(skill.status) }} />
                <span className="ad-muted">{sk ? t(sk) : skill.status}</span>
              </div>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.skills.col.prereq")}</label>
            <div className="ad-req-tags">
              {prerequisites.length === 0 ? (
                <span className="ad-muted">{t("admin.skillView.noPrereq")}</span>
              ) : (
                prerequisites.map((p) => (
                  <span key={p.prerequisiteSkillId} className="ad-req-tag">
                    {p.prerequisiteSkill?.skillsName || `#${p.prerequisiteSkillId}`}
                    {p.prerequisiteLevel != null ? ` (${t("admin.common.level", { n: p.prerequisiteLevel })})` : ""}
                  </span>
                ))
              )}
            </div>
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
