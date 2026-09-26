import { FaAward } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { SummaryReport } from "../../models/learningReportModel";
import { EffortGrid, LearnerBlock, ReportHeader } from "./ReportParts";
import { fmtDate, fmtDuration } from "./reportFormat";

/** every goal the learner has: one row each, totals, and the completed ones as achievements */
export default function SummaryReportView({ report }: { report: SummaryReport }) {
  const { t, locale } = usePreferences();
  const completed = report.goals.filter((g) => g.isComplete);

  return (
    <>
      <ReportHeader
        title={t("report.summary.title")}
        documentNo={report.documentNo}
        issuedAt={report.issuedAt}
      />

      <section className="lr-statement">
        <p>
          {t("report.summary.statement", {
            name: report.learner.fullName,
            goals: report.totals.goals,
            completed: report.totals.completedGoals,
          })}
        </p>
      </section>

      <LearnerBlock learner={report.learner} />
      <EffortGrid effort={report.totals} />

      <section className="lr-block">
        <h2 className="lr-h2">{t("report.summary.goalsHeading")}</h2>
        {report.goals.length === 0 ? (
          <p className="lr-note">{t("report.summary.noGoals")}</p>
        ) : (
          <table className="lr-table">
            <thead>
              <tr>
                <th>{t("report.goal.name")}</th>
                <th>{t("report.goal.started")}</th>
                <th>{t("report.goal.status")}</th>
                <th>{t("report.goal.skills")}</th>
                <th>{t("report.effort.sessions")}</th>
                <th>{t("report.effort.accuracy")}</th>
                <th>{t("report.effort.time")}</th>
              </tr>
            </thead>
            <tbody>
              {report.goals.map((g) => (
                <tr key={g.branchId}>
                  <td><span className="lr-skill">{g.name}</span></td>
                  <td>{fmtDate(g.startedAt, locale)}</td>
                  <td>
                    {g.isComplete ? (
                      <span className="lr-status is-mastered">
                        {t("report.goal.completedOn", { date: fmtDate(g.completedAt, locale) })}
                      </span>
                    ) : (
                      <span className="lr-status is-in_progress">
                        {t("report.goal.inProgress", { percent: g.progressPercent })}
                      </span>
                    )}
                  </td>
                  <td className="lr-num">{g.masteredCount}/{g.requiredCount}</td>
                  <td className="lr-num">{g.effort.practiceSessions}</td>
                  <td className="lr-num">{g.effort.questions ? `${g.effort.accuracyPercent}%` : "—"}</td>
                  <td className="lr-num">{fmtDuration(g.effort.studySeconds, t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {completed.length > 0 && (
        <section className="lr-block">
          <h2 className="lr-h2">{t("report.summary.achievements")}</h2>
          <ul className="lr-achievements">
            {completed.map((g) => (
              <li key={g.branchId}>
                <FaAward aria-hidden />
                <span>
                  <strong>{g.name}</strong>
                  <span className="lr-muted">
                    {t("report.goal.completedOn", { date: fmtDate(g.completedAt, locale) })} ·{" "}
                    {t("report.goal.skillsVal", { done: g.masteredCount, total: g.requiredCount })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
