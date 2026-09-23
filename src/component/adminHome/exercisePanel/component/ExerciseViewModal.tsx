import { FaMagnifyingGlass, FaCheck, FaPen } from "react-icons/fa6";
import { Exercise } from "../../../../models/exerciseModel";
import { getStatusColor, statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";
import CodeBlock from "../../../common/CodeBlock";

interface ExerciseViewModalProps {
  exercise: Exercise | null;
  onClose: () => void;
  onEdit: (exercise: Exercise) => void;
  /** ทับหัวข้อ modal — ใช้ตอน reuse กับร่างจาก AI */
  title?: string;
  /** ชื่อ skill เมื่อ exercise ไม่มี object skill ติดมา (เช่น ร่างจาก AI) */
  skillName?: string;
  /** ร่างยังไม่มีสถานะจริง — ซ่อนช่องสถานะ */
  hideStatus?: boolean;
}

export default function ExerciseViewModal({
  exercise,
  onClose,
  onEdit,
  title,
  skillName,
  hideStatus = false,
}: ExerciseViewModalProps) {
  const { t } = usePreferences();
  if (!exercise) return null;

  const choices = exercise.exerciseChoices || [];
  const sk = statusKey(exercise.status);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--wide" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {title ?? t("admin.exView.title")}</span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">{t("admin.exercises.col.description")}</label>
            <div>{exercise.description}</div>
          </div>

          {exercise.code && (
            <div className="ad-field">
              <label className="ad-label">{t("admin.exView.code")}</label>
              <CodeBlock code={exercise.code} language={exercise.language} />
            </div>
          )}

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.exercises.col.level")}</label>
              <div>{exercise.level}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("admin.exercises.col.skill")}</label>
              <div>{exercise.skill?.skillsName || skillName || `#${exercise.skillId}`}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.exercises.col.type")}</label>
              <div>{exercise.type}</div>
            </div>
            {!hideStatus && (
              <div className="ad-field">
                <label className="ad-label">{t("admin.common.status")}</label>
                <div>
                  <span className="ad-status-dot" style={{ background: getStatusColor(exercise.status) }} />
                  <span className="ad-muted">{sk ? t(sk) : exercise.status}</span>
                </div>
              </div>
            )}
          </div>

          {exercise.type === "CHOICE" ? (
            <div className="ad-field">
              <label className="ad-label">{t("admin.exView.choices")}</label>
              <div className="ad-req-tags">
                {choices.length === 0 ? (
                  <span className="ad-muted">{t("admin.exView.noChoices")}</span>
                ) : (
                  choices.map((c) => (
                    <span key={c.id} className={`ad-req-tag${c.isAnswer ? " is-answer" : ""}`}>
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
              <label className="ad-label">{t("admin.exView.correctAnswer")}</label>
              <div>
                {exercise.fillInBlank}{" "}
                <span className="ad-muted">
                  ({exercise.isCasesensitive === "YES" ? t("admin.exView.caseOn") : t("admin.exView.caseOff")})
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            {t("admin.common.close")}
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(exercise)}>
            <FaPen /> {t("admin.common.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}
