import { usePreferences } from "../../context/PreferencesContext";
import type { ReportEffort, ReportLearner } from "../../models/learningReportModel";
import AppLogo from "../common/AppLogo";
import { APP_SHORT_NAME } from "../common/AppBrand";
import { fmtDate, fmtDuration } from "./reportFormat";

/** logo + platform on the left, document title / number / issue date on the right */
export function ReportHeader({
  title,
  documentNo,
  issuedAt,
}: {
  title: string;
  documentNo: string;
  issuedAt: string;
}) {
  const { t, locale } = usePreferences();
  return (
    <header className="lr-header">
      <div className="lr-brand">
        <span className="lr-logo"><AppLogo alt="" /></span>
        <div>
          <div className="lr-brand-name">{APP_SHORT_NAME}</div>
          <div className="lr-brand-sub">{t("report.platform")}</div>
        </div>
      </div>
      <div className="lr-doc">
        <h1 className="lr-title">{title}</h1>
        <div className="lr-doc-meta">
          {t("report.documentNo")} <span className="lr-mono">{documentNo}</span>
        </div>
        <div className="lr-doc-meta">
          {t("report.issuedAt")} {fmtDate(issuedAt, locale)}
        </div>
      </div>
    </header>
  );
}

export function LearnerBlock({ learner }: { learner: ReportLearner }) {
  const { t } = usePreferences();
  const dash = (v: string | number | null) => (v === null || v === "" ? "—" : v);
  return (
    <section className="lr-block">
      <h2 className="lr-h2">{t("report.learner.heading")}</h2>
      <dl className="lr-dl">
        <dt>{t("report.learner.name")}</dt>
        <dd><strong>{learner.fullName}</strong></dd>
        <dt>{t("report.learner.username")}</dt>
        <dd className="lr-mono">{learner.username}</dd>
        <dt>{t("report.learner.campus")}</dt>
        <dd>{dash(learner.campus)}</dd>
        <dt>{t("report.learner.faculty")}</dt>
        <dd>{dash(learner.faculty)}</dd>
        <dt>{t("report.learner.major")}</dt>
        <dd>{dash(learner.major)}</dd>
        <dt>{t("report.learner.year")}</dt>
        <dd>{learner.year ? t("profile.yearVal", { year: learner.year }) : "—"}</dd>
      </dl>
    </section>
  );
}

/** evidence of effort: how much was studied, how well, over what period */
export function EffortGrid({ effort }: { effort: ReportEffort }) {
  const { t, locale } = usePreferences();
  const items = [
    { label: t("report.effort.sessions"), value: effort.practiceSessions },
    { label: t("report.effort.questions"), value: effort.questions },
    { label: t("report.effort.accuracy"), value: `${effort.accuracyPercent}%` },
    { label: t("report.effort.time"), value: fmtDuration(effort.studySeconds, t) },
    { label: t("report.effort.days"), value: effort.activeDays },
  ];
  return (
    <section className="lr-block">
      <h2 className="lr-h2">{t("report.effort.heading")}</h2>
      <div className="lr-stats">
        {items.map((it) => (
          <div key={it.label} className="lr-stat">
            <span className="lr-stat-num">{it.value}</span>
            <span className="lr-stat-label">{it.label}</span>
          </div>
        ))}
      </div>
      <p className="lr-note">
        {t("report.effort.period", {
          from: fmtDate(effort.firstActivityAt, locale),
          to: fmtDate(effort.lastActivityAt, locale),
        })}{" "}
        {t("report.effort.timeNote")}
      </p>
    </section>
  );
}
