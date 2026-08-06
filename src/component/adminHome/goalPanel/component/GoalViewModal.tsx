import { FaMagnifyingGlass, FaPen } from "react-icons/fa6";
import { Goal } from "../../../../models/goalModel";
import { getStatusColor } from "../../../../utils/adminUi";
import GoalLearningTree from "./GoalLearningTree";

interface GoalViewModalProps {
  goal: Goal | null;
  onClose: () => void;
  onEdit: (goal: Goal) => void;
}

export default function GoalViewModal({ goal, onClose, onEdit }: GoalViewModalProps) {
  if (!goal) return null;

  const requires = goal.goalSkillRequire || [];

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> รายละเอียด Goal</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">ชื่อ Goal</label>
            <div>{goal.goal}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">คำอธิบาย</label>
            <div>{goal.goalDescription || "-"}</div>
          </div>

          <div className="ad-field">
            <label className="ad-label">สถานะ</label>
            <div>
              <span className="ad-status-dot" style={{ background: getStatusColor(goal.status) }} />
              <span className="ad-muted">{goal.status}</span>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">Skill ที่ต้องใช้ (Level ที่ต้องการ)</label>
            <div className="ad-req-tags">
              {requires.length === 0 ? (
                <span className="ad-muted">— ไม่มี Skill ที่ต้องใช้ —</span>
              ) : (
                requires.map((r) => (
                  <span key={r.skillId} className="ad-req-tag">
                    {r.skill?.skillsName || `#${r.skillId}`}
                    {r.levelRequire != null ? ` (level ${r.levelRequire})` : ""}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">Learning Tree</label>
            <GoalLearningTree requires={requires} />
          </div>
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            ปิด
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(goal)}>
            <FaPen /> แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
