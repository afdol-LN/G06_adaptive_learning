import { useEffect } from "react";
import {
  FaChartColumn,
  FaCheck,
  FaCircleQuestion,
  FaCode,
  FaListUl,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import CodeBlock from "../../common/CodeBlock";
import { exerciseStatDetailController } from "./exerciseStats.controller";
import { rateTone } from "./ExerciseStatsTab";

interface Props {
  /** null = closed */
  exerciseId: number | null;
  includePretest: boolean;
  onClose: () => void;
}

export default function ExerciseStatDetailModal({
  exerciseId,
  includePretest,
  onClose,
}: Props) {
  const { t, lang } = usePreferences();
  const { detail, isLoading, error } = exerciseStatDetailController(
    exerciseId,
    includePretest,
  );

  useEffect(() => {
    if (exerciseId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exerciseId, onClose]);

  if (exerciseId === null) return null;

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
    <div className="ad-overlay" onClick={onClose}>
      <div
        className="ad-modal ad-modal--wide ad-modal--detail"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-stats-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-header ad-hist-modal-head">
          <span className="ad-modal-title" id="ad-stats-modal-title">
            <FaChartColumn aria-hidden />{" "}
            {t("admin.stats.modal.title", { id: exerciseId })}
          </span>
          <button
            type="button"
            className="ad-hist-modal-close"
            onClick={onClose}
            aria-label={t("admin.stats.modal.close")}
            title={t("admin.stats.modal.close")}
          >
            <FaXmark aria-hidden />
          </button>
        </div>

        <div className="ad-modal-body ad-hist-modal-body">
          {isLoading && <p className="ad-empty-state">{t("admin.stats.loading")}</p>}
          {error && (
            <div className="ad-hist-error" role="alert">
              {t("admin.stats.modal.loadError")} ({error})
            </div>
          )}

          {detail && (
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
                              {s.latestPL === null ? "—" : `${Math.round(s.latestPL * 100)}%`}
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
        </div>
      </div>
    </div>
  );
}
