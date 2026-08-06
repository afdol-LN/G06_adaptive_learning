import { FaMagnifyingGlass, FaCheck, FaPen } from "react-icons/fa6";
import { Exercise } from "../../../../models/exerciseModel";
import { getStatusColor } from "../../../../utils/adminUi";

interface ExerciseViewModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onEdit: (exercise: Exercise) => void;
}

export default function ExerciseViewModal({ exercise, onClose, onEdit }: ExerciseViewModalProps) {
  if (!exercise) return null;

  const choices = exercise.exerciseChoices || [];

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> รายละเอียด Exercise</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">คำอธิบายโจทย์</label>
            <div>{exercise.description}</div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Level</label>
              <div>{exercise.level}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">Skill</label>
              <div>{exercise.skill?.skillsName || `#${exercise.skillId}`}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">ประเภท</label>
              <div>{exercise.type}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <div>
                <span className="ad-status-dot" style={{ background: getStatusColor(exercise.status) }} />
                <span className="ad-muted">{exercise.status}</span>
              </div>
            </div>
          </div>

          {exercise.type === "CHOICE" ? (
            <div className="ad-field">
              <label className="ad-label">ตัวเลือกคำตอบ</label>
              <div className="ad-req-tags">
                {choices.length === 0 ? (
                  <span className="ad-muted">— ไม่มีตัวเลือก —</span>
                ) : (
                  choices.map((c) => (
                    <span
                      key={c.id}
                      className="ad-req-tag"
                      style={
                        c.isAnswer
                          ? { background: "#f0fdf4", borderColor: "#86efac", color: "#16a34a" }
                          : undefined
                      }
                    >
                      {c.isAnswer ? (
                        <>
                          <FaCheck />{" "}
                        </>
                      ) : (
                        ""
                      )}
                      {c.script}
                    </span>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="ad-field">
              <label className="ad-label">คำตอบที่ถูกต้อง</label>
              <div>
                {exercise.fillInBlank}{" "}
                <span className="ad-muted">
                  ({exercise.isCasesensitive === "YES" ? "ตรวจตัวพิมพ์เล็ก/ใหญ่" : "ไม่ตรวจตัวพิมพ์เล็ก/ใหญ่"})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            ปิด
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(exercise)}>
            <FaPen /> แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
