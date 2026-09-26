import { FaAward, FaChartLine } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { BranchReport } from "../../models/learningReportModel";
import { ReportHeader, LearnerBlock, EffortGrid } from "./ReportParts";
import { STATUS_LABEL, STOP_LABEL, fmtDate, fmtDateTime } from "./reportFormat";

/** one goal: a certificate once the goal is complete, a progress report before that */
export default function BranchReportView({
  report,
  withSessions,
}: {
  report: BranchReport;
  withSessions: boolean;
}) {
  const { t, locale } = usePreferences();
  const { goal, learner, effort } = report;
  const complete = goal.isComplete;

  return (
    <>
      <ReportHeader
        title={complete ? t("report.certificate.title") : t("report.progress.title")}
        documentNo={report.documentNo}
        issuedAt={report.issuedAt}
      />

      <section className={`lr-statement ${complete ? "is-complete" : ""}`}>
        <span className="lr-statement-icon" aria-hidden>
          {complete ? <FaAward /> : <FaChartLine />}
        </span>
        <p>
          {complete
            ? t("report.certificate.statement", {
                name: learner.fullName,
                goal: goal.name,
                date: fmtDate(goal.completedAt, locale),
                count: goal.requiredCount,
              })
            : t("report.progress.statement", {
                name: learner.fullName,
                goal: goal.name,
                percent: goal.progressPercent,
                done: goal.masteredCount,
                total: goal.requiredCount,
              })}
        </p>
      </section>

      <div className="lr-two-col">
        <LearnerBlock learner={learner} />
        <section className="lr-block">
          <h2 className="lr-h2">{t("report.goal.heading")}</h2>
          <dl className="lr-dl">
            <dt>{t("report.goal.name")}</dt>
            <dd><strong>{goal.name}</strong></dd>
            {goal.description && (
              <>
                <dt>{t("report.goal.description")}</dt>
                <dd>{goal.description}</dd>
              </>
            )}
            <dt>{t("report.goal.started")}</dt>
            <dd>{fmtDate(goal.startedAt, locale)}</dd>
            <dt>{t("report.goal.status")}</dt>
            <dd>
              {complete
                ? t("report.goal.completedOn", { date: fmtDate(goal.completedAt, locale) })
                : t("report.goal.inProgress", { percent: goal.progressPercent })}
            </dd>
            <dt>{t("report.goal.skills")}</dt>
            <dd>{t("report.goal.skillsVal", { done: goal.masteredCount, total: goal.requiredCount })}</dd>
          </dl>
          <div className="lr-bar" aria-hidden>
            <span style={{ width: `${Math.min(goal.progressPercent, 100)}%` }} />
          </div>
        </section>
      </div>

      <EffortGrid effort={effort} />

      <section className="lr-block">
        <h2 className="lr-h2">{t("report.skills.heading")}</h2>
        <table className="lr-table">
          <thead>
            <tr>
              <th>{t("report.skills.col.skill")}</th>
              <th>{t("report.skills.col.start")}</th>
              <th>{t("report.skills.col.now")}</th>
              <th>{t("report.skills.col.status")}</th>
              <th>{t("report.skills.col.masteredAt")}</th>
              <th>{t("report.skills.col.practice")}</th>
            </tr>
          </thead>
          <tbody>
            {report.skills.map((s) => (
              <tr key={s.skillId}>
                <td>
                  <span className="lr-skill">{s.name}</span>
                  <span className="lr-muted">
                    {s.tier ?? ""}
                    {s.required ? "" : ` · ${t("report.skills.prerequisite")}`}
                  </span>
                </td>
                <td className="lr-num">{s.startProgressPercent === null ? "—" : `${s.startProgressPercent}%`}</td>
                <td className="lr-num"><strong>{s.progressPercent}%</strong></td>
                <td>
                  <span className={`lr-status is-${s.status}`}>{t(STATUS_LABEL[s.status])}</span>
                </td>
                <td>
                  {s.masteredAt ? fmtDate(s.masteredAt, locale) : "—"}
                  {s.masteredVia && (
                    <span className="lr-muted">
                      {s.masteredVia === "practice" ? t("report.skills.viaPractice") : t("report.skills.viaPretest")}
                    </span>
                  )}
                </td>
                <td className="lr-num">
                  {s.practiceSessions === 0
                    ? "—"
                    : t("report.skills.practiceVal", { sessions: s.practiceSessions })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="lr-note">{t("report.skills.note")}</p>
      </section>

      {withSessions && report.sessions.length > 0 && (
        <section className="lr-block lr-appendix">
          <h2 className="lr-h2">{t("report.sessions.heading", { count: report.sessions.length })}</h2>
          <table className="lr-table lr-table--dense">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("report.sessions.col.date")}</th>
                <th>{t("report.sessions.col.type")}</th>
                <th>{t("report.sessions.col.score")}</th>
                <th>{t("report.sessions.col.result")}</th>
              </tr>
            </thead>
            <tbody>
              {report.sessions.map((s, i) => (
                <tr key={s.sessionId}>
                  <td className="lr-num lr-muted">{i + 1}</td>
                  <td>{fmtDateTime(s.startTime, locale)}</td>
                  <td>
                    {s.isPretest
                      ? t("session.type.pretest")
                      : t("session.type.practiceSkill", { skill: s.skillNames.join(", ") })}
                  </td>
                  <td className="lr-num">
                    {s.correct}/{s.total} ({s.total ? Math.round((s.correct / s.total) * 100) : 0}%)
                  </td>
                  <td>
                    {s.inProgress
                      ? t("session.inProgress")
                      : s.stopReason && STOP_LABEL[s.stopReason]
                        ? t(STOP_LABEL[s.stopReason])
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
