import {
  FaCheck,
  FaCircleQuestion,
  FaCode,
  FaListUl,
  FaUsers,
} from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import CodeBlock from "../../common/CodeBlock";
import { exerciseStatDetailController, rateTone } from "./exerciseStats.controller";

interface Props {
  exerciseId: number;
  includePretest: boolean;
  /** ซ่อนป้าย skill/ระดับ + โจทย์ + โค้ด — ใช้ในแท็บ "สถิติ" ของ ExerciseViewModal ที่แสดงส่วนนี้ไว้แล้ว */
  hideQuestion?: boolean;
}

/**
 * เนื้อหาสถิติของโจทย์ 1 ข้อ: ตัวเลขสรุป, คำตอบที่เลือก/พิมพ์, รายชื่อนักเรียนว่าใครถูก/ผิด
 * ใช้ร่วมกันระหว่าง ExerciseStatDetailModal (หน้าสถิติ) กับแท็บ "สถิติ" ใน ExerciseViewModal
 * โหลดข้อมูลเองตอน mount (เปิดแท็บถึงค่อยยิง request)
 */
export default function ExerciseStatBody({ exerciseId, includePretest, hideQuestion = false }: Props) {
  const { t, lang } = usePreferences();
  const { detail, isLoading, error } = exerciseStatDetailController(exerciseId, includePretest);

  const locale = lang === "th" ? "th-TH" : "en-GB";
  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const maxPicked = Math.max(1, ...(detail?.choices.map((c) => c.pickedCount) ?? [1]));
  const isFill = detail?.type !== undefined && detail.type !== "CHOICE";

  return (
    <>
      {isLoading && <p className="ad-empty-state">{t("admin.stats.loading")}</p>}
      {error && (
        <div className="ad-hist-error" role="alert">
          {t("admin.stats.modal.loadError")} ({error})
        </div>
      )}

      {detail && (
        <>
          {/* ข้อมูลข้อ (ซ่อนได้ เมื่ออยู่ในแท็บของ modal รายละเอียดที่แสดงโจทย์ไว้แล้ว) */}
          {!hideQuestion && (
            <>
              {/* ข้อมูลข้อ: skill / ระดับ เป็นป้าย แล้วตามด้วยโจทย์และโค้ด */}
              <div className="ad-uv-pills">
                <span className="ad-uv-pill">{detail.skillName}</span>
                <span className="ad-uv-pill">
                  {t("admin.stats.col.level")} {detail.level}
                </span>
              </div>

              <div className="ad-uv-section">
                <div className="ad-uv-section-title">
                  <FaCircleQuestion aria-hidden /> {t("admin.stats.col.question")}
                </div>
                <div className="ad-ev-question">{detail.fullDescription}</div>
              </div>

              {detail.code && (
                <div className="ad-uv-section">
                  <div className="ad-uv-section-title">
                    <FaCode aria-hidden /> {t("admin.exView.code")}
                  </div>
                  <CodeBlock code={detail.code} language={detail.language} />
                </div>
              )}
            </>
          )}

          {/* ตัวเลขสรุป — อ่านแบบ dashboard ทีเดียวจบ แทนประโยคยาวคั่นด้วย · */}
          <div className="ad-sd-kpis">
            <div className="ad-sd-kpi">
              <span className="ad-sd-kpi-val">{detail.totalStudents}</span>
              <span className="ad-sd-kpi-lbl">{t("admin.stats.col.students")}</span>
            </div>
            <div className="ad-sd-kpi is-ok">
              <span className="ad-sd-kpi-val">{detail.correctStudents}</span>
              <span className="ad-sd-kpi-lbl">{t("admin.stats.col.correct")}</span>
            </div>
            <div className="ad-sd-kpi is-bad">
              <span className="ad-sd-kpi-val">{detail.wrongStudents}</span>
              <span className="ad-sd-kpi-lbl">{t("admin.stats.col.wrong")}</span>
            </div>
            <div className="ad-sd-kpi">
              <span className="ad-sd-kpi-val">{detail.attemptsAll}</span>
              <span className="ad-sd-kpi-lbl">{t("admin.stats.modal.kpiAttempts")}</span>
            </div>
            <div className={`ad-sd-kpi is-${rateTone(detail.correctRate)}`}>
              <span className="ad-sd-kpi-val">
                {detail.correctRate === null ? "—" : `${detail.correctRate}%`}
              </span>
              <span className="ad-sd-kpi-lbl">{t("admin.stats.col.rate")}</span>
            </div>
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaListUl aria-hidden />{" "}
              {isFill ? t("admin.stats.modal.choicesFill") : t("admin.stats.modal.choices")}
            </div>
            {detail.choices.length === 0 ? (
              <div className="ad-uv-empty">{t("admin.stats.modal.noChoices")}</div>
            ) : (
              <ul className="ad-stats-choices">
                {detail.choices.map((ch, i) => (
                  <li
                    key={ch.choiceId ?? `t-${i}`}
                    className={`ad-stats-choice ${ch.isCorrect ? "is-correct" : ""}`}
                  >
                    <div className="ad-stats-choice-top">
                      <span className="ad-stats-choice-text">
                        {ch.text || "—"}
                        {ch.isCorrect && (
                          <span className="ad-sd-correct">
                            <FaCheck aria-hidden /> {t("admin.stats.modal.correctMark")}
                          </span>
                        )}
                      </span>
                      <span className="ad-stats-choice-n">
                        {t("admin.stats.modal.picked", { n: ch.pickedCount })}
                      </span>
                    </div>
                    <div className="ad-stats-bar">
                      <div
                        className={`ad-stats-bar-fill ${ch.isCorrect ? "is-ok" : "is-pick"}`}
                        style={{ width: `${(ch.pickedCount / maxPicked) * 100}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaUsers aria-hidden /> {t("admin.stats.modal.students")}
              {detail.students.length > 0 && (
                <span className="ad-uv-count">{detail.students.length}</span>
              )}
            </div>
            {detail.students.length === 0 ? (
              <div className="ad-uv-empty">{t("admin.stats.modal.noStudents")}</div>
            ) : (
              <div className="ad-stats-scroll ad-sd-table-wrap">
                <table className="ad-table ad-sd-table">
                  <thead>
                    <tr>
                      <th>{t("admin.stats.modal.col.name")}</th>
                      <th>{t("admin.stats.modal.col.result")}</th>
                      <th className="is-num">{t("admin.stats.modal.col.attempts")}</th>
                      <th>{t("admin.stats.modal.col.answer")}</th>
                      <th className="is-num">{t("admin.stats.modal.col.time")}</th>
                      <th className="is-num">{t("admin.stats.modal.col.pl")}</th>
                      <th>{t("admin.stats.modal.col.last")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detail.students.map((s) => (
                      <tr key={s.userId}>
                        <td>
                          {/* avatar + ชื่ออยู่แถวเดียวกัน (เดิมชื่อตกลงไปใต้ avatar) */}
                          <div className="ad-user-cell">
                            <span className="ad-avatar-sm" aria-hidden>
                              {s.name?.[0] ?? "?"}
                            </span>
                            <span className="ad-user-name-sm">{s.name}</span>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`ad-hist-score ${s.isCorrect ? "is-great" : "is-poor"}`}
                          >
                            {s.isCorrect
                              ? t("admin.stats.modal.right")
                              : t("admin.stats.modal.wrongMark")}
                          </span>
                        </td>
                        <td className="is-num">{s.attempts}</td>
                        <td>
                          <code className="ad-sd-answer">{s.firstAnswer ?? "—"}</code>
                        </td>
                        <td className="is-num">{s.timeSpentSec ?? "—"}</td>
                        <td className="is-num">
                          {s.latestProgress === null ? "—" : `${s.latestProgress}%`}
                        </td>
                        <td className="ad-muted ad-sd-date">{formatDateTime(s.lastAnsweredAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
