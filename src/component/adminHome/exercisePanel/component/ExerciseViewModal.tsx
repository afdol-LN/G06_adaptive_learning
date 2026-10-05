import { useEffect, useState } from "react";
import {
  FaMagnifyingGlass,
  FaCheck,
  FaPen,
  FaCircleQuestion,
  FaCode,
  FaListUl,
} from "react-icons/fa6";
import { Exercise } from "../../../../models/exerciseModel";
import { statusKey } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";
import CodeBlock from "../../../common/CodeBlock";
import ExerciseStatBody from "../../exerciseStatsPanel/ExerciseStatBody";
import { DetailTabs, DetailTab } from "../../learnerStatsPanel/DetailTabs";
import { DeleteButton } from "../../deletePanel/DeleteButton";

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
  /** แท็บ "สถิติ" (ใครทำถูก/ผิด) — ค่าเริ่มต้น: มีเฉพาะโจทย์จริง (ร่างจาก AI ยังไม่มีคนทำ) */
  showStats?: boolean;
  /** มีค่า = แสดงปุ่ม "ลบ" มุมซ้ายล่าง; เรียกหลังลบสำเร็จ (ปิด modal + โหลดรายการใหม่) */
  onDeleted?: () => void;
}

export default function ExerciseViewModal({
  exercise,
  onClose,
  onEdit,
  title,
  skillName,
  hideStatus = false,
  showStats = !hideStatus,
  onDeleted,
}: ExerciseViewModalProps) {
  const { t } = usePreferences();
  const [tab, setTab] = useState<DetailTab>("detail");
  const [includePretest, setIncludePretest] = useState(false);

  // เปิดข้อใหม่ → เริ่มที่แท็บรายละเอียดเสมอ
  const exerciseId = exercise?.id;
  useEffect(() => {
    setTab("detail");
  }, [exerciseId]);

  if (!exercise) return null;

  const choices = exercise.exerciseChoices || [];
  const sk = statusKey(exercise.status);
  const isActive = exercise.status?.toLowerCase() === "active";
  const isChoice = exercise.type === "CHOICE";

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className={`ad-modal ad-modal--wide ad-modal--detail${tab === "stats" && showStats ? " ad-modal--stats" : ""}`} onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title"><FaMagnifyingGlass /> {title ?? t("admin.exView.title")}</span>
          {showStats && (
            <DetailTabs tab={tab} onChange={setTab} ariaLabel={t("admin.exView.title")} />
          )}
        </div>

        <div className="ad-modal-body">
          {tab === "stats" && showStats ? (
            <>
              {/* ใครทำข้อนี้ถูก/ผิด — เนื้อหาเดียวกับหน้าสถิติ (ไม่ซ้ำโจทย์ที่อยู่แท็บรายละเอียดแล้ว) */}
              <label className="ad-stats-check ad-ev-pretest">
                <input
                  type="checkbox"
                  checked={includePretest}
                  onChange={(e) => setIncludePretest(e.target.checked)}
                />
                {t("admin.stats.includePretest")}
              </label>
              <ExerciseStatBody exerciseId={exercise.id} includePretest={includePretest} hideQuestion />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="ad-modal-footer">
          {onDeleted && (
            <DeleteButton kind="exercise" id={exercise.id} name={exercise.description} onDeleted={onDeleted} />
          )}
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
