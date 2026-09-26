import { FaMagnifyingGlass, FaCheck, FaPen, FaCircleQuestion, FaCode, FaListUl } from "react-icons/fa6";
import { Exercise } from "../../../../models/exerciseModel";
import { statusKey } from "../../../../utils/adminUi";
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
  const isActive = exercise.status?.toLowerCase() === "active";
  const isChoice = exercise.type === "CHOICE";

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--wide ad-modal--detail" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {title ?? t("admin.exView.title")}</span>
        </div>

        <div className="ad-modal-body">
          {/* ข้อมูลประกอบก่อน แล้วค่อยอ่านโจทย์ → โค้ด → คำตอบ ตามลำดับที่ผู้เรียนเห็น */}
          <div className="ad-ev-meta">
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.exercises.col.skill")}</span>
              <span className="ad-uv-value">{exercise.skill?.skillsName || skillName || `#${exercise.skillId}`}</span>
            </div>
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.exercises.col.level")}</span>
              <span className="ad-uv-value">{exercise.level}</span>
            </div>
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.exercises.col.type")}</span>
              <span className="ad-uv-value">
                {isChoice ? t("admin.exForm.type.choice") : t("admin.exForm.type.fill")}
              </span>
            </div>
            {!hideStatus && (
              <div className="ad-uv-item">
                <span className="ad-uv-label">{t("admin.common.status")}</span>
                <span>
                  <span className={`ad-uv-pill ${isActive ? "ad-uv-pill--ok" : "ad-uv-pill--bad"}`}>
                    <span className="ad-uv-dot" />
                    {sk ? t(sk) : exercise.status}
                  </span>
                </span>
              </div>
            )}
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaCircleQuestion aria-hidden /> {t("admin.exercises.col.description")}
            </div>
            <div className="ad-ev-question">{exercise.description}</div>
          </div>

          {exercise.code && (
            <div className="ad-uv-section">
              <div className="ad-uv-section-title">
                <FaCode aria-hidden /> {t("admin.exView.code")}
              </div>
              <CodeBlock code={exercise.code} language={exercise.language} />
            </div>
          )}

          {isChoice ? (
            <div className="ad-uv-section">
              <div className="ad-uv-section-title">
                <FaListUl aria-hidden /> {t("admin.exView.choices")}
              </div>
              {choices.length === 0 ? (
                <div className="ad-uv-empty">{t("admin.exView.noChoices")}</div>
              ) : (
                <div className="ad-ev-choices">
                  {choices.map((c, i) => (
                    <div key={c.id} className={`ad-ev-choice${c.isAnswer ? " is-answer" : ""}`}>
                      <span className="ad-ev-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="ad-ev-script">{c.script}</span>
                      {c.isAnswer && (
                        <span className="ad-ev-correct">
                          <FaCheck aria-hidden /> {t("admin.exView.correctAnswer")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="ad-uv-section">
              <div className="ad-uv-section-title">
                <FaCheck aria-hidden /> {t("admin.exView.correctAnswer")}
              </div>
              <div className="ad-ev-answer">
                <code>{exercise.fillInBlank}</code>
                <span className="ad-uv-pill">
                  {exercise.isCasesensitive === "YES" ? t("admin.exView.caseOn") : t("admin.exView.caseOff")}
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
