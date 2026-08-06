import { FaMagnifyingGlass, FaPen } from "react-icons/fa6";
import { Skill } from "../../../../models/skillModel";
import { getTierColor, getStatusColor } from "../../../../utils/adminUi";

interface SkillViewModalProps {
  skill: Skill | null;
  onClose: () => void;
  onEdit: (skill: Skill) => void;
}

export default function SkillViewModal({ skill, onClose, onEdit }: SkillViewModalProps) {
  if (!skill) return null;

  const prerequisites = skill.skillPrequisite || [];

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> รายละเอียด Skill</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">Skill code</label>
            <div>{skill.skillCode}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">ชื่อ Skill</label>
            <div>{skill.skillsName}</div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Tier</label>
              <div>
                <span
                  className="ad-tier-badge"
                  style={{
                    background: `${getTierColor(skill.tier)}18`,
                    color: getTierColor(skill.tier),
                    border: `1px solid ${getTierColor(skill.tier)}40`,
                  }}
                >
                  {skill.tier || "-"}
                </span>
              </div>
            </div>
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <div>
                <span className="ad-status-dot" style={{ background: getStatusColor(skill.status) }} />
                <span className="ad-muted">{skill.status}</span>
              </div>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">Prerequisite</label>
            <div className="ad-req-tags">
              {prerequisites.length === 0 ? (
                <span className="ad-muted">— ไม่มี prerequisite —</span>
              ) : (
                prerequisites.map((p) => (
                  <span key={p.prerequisiteSkillId} className="ad-req-tag">
                    {p.prerequisiteSkill?.skillsName || `#${p.prerequisiteSkillId}`}
                    {p.prerequisiteLevel != null ? ` (level ${p.prerequisiteLevel})` : ""}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            ปิด
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(skill)}>
            <FaPen /> แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
