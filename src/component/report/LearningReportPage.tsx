import { useEffect, useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { ReportScope } from "../../models/learningReportModel";
import PreferenceControls from "../common/PreferenceControls";
import { useAutoPrint, useLearningReport } from "./learningReport.controller";
import BranchReportView from "./BranchReportView";
import SummaryReportView from "./SummaryReportView";
import { bundleFileName, reportFileName } from "./reportFormat";
import "../decorate/LearningReport.css";

const isId = (id: number) => Number.isInteger(id) && id > 0;

/**
 * /report/branches?ids=1,2&sessions=1, /report/branch/:branchId?sessions=1 and /report/all — an A4
 * document the browser saves as PDF; several goals are one sheet each, each starting a new page.
 * The toolbar is screen-only; the print dialog opens by itself once the report has rendered.
 */
export default function LearningReportPage({ multi = false }: { multi?: boolean }) {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const { branchId } = useParams();
  const [search] = useSearchParams();

  const scope: ReportScope | null = useMemo(() => {
    const withSessions = search.get("sessions") === "1";
    if (multi) {
      const ids = [...new Set((search.get("ids") ?? "").split(",").filter(Boolean).map(Number))];
      if (ids.length === 0 || !ids.every(isId)) return null;
      return { kind: "branches", branchIds: ids, withSessions };
    }
    if (branchId === undefined) return { kind: "all" };
    const id = Number(branchId);
    if (!isId(id)) return null;
    return { kind: "branches", branchIds: [id], withSessions };
  }, [multi, branchId, search]);

  const { branches, summary, error, isLoading } = useLearningReport(scope);
  const ready = !!(branches || summary);

  // "Save as PDF" names the file after document.title — set it before the print dialog opens
  const only = branches?.length === 1 ? branches[0] : null;
  const fileName = only
    ? reportFileName(
        only.goal.isComplete ? "certificate" : "progress",
        only.documentNo,
        only.learner.username,
        only.goal.name,
      )
    : branches?.length
      ? bundleFileName(branches[0].learner.username, branches.length)
      : summary
        ? reportFileName("transcript", summary.documentNo, summary.learner.username)
        : null;
  useEffect(() => {
    if (!fileName) return;
    const previous = document.title;
    document.title = fileName;
    return () => {
      document.title = previous;
    };
  }, [fileName]);

  useAutoPrint(ready);

  return (
    <div className="lr-page">
      <div className="lr-toolbar">
        <button type="button" className="lr-btn" onClick={() => navigate("/home", { state: { tab: "Profile" } })}>
          <FaArrowLeft aria-hidden /> {t("report.back")}
        </button>
        <span className="lr-toolbar-hint">{t("report.printHint")}</span>
        <PreferenceControls />
        <button
          type="button"
          className="lr-btn lr-btn--primary"
          onClick={() => window.print()}
          disabled={!ready}
        >
          <FaPrint aria-hidden /> {t("report.print")}
        </button>
      </div>

      <main>
        {!ready && (
          <div className="lr-sheet">
            {isLoading && <p className="lr-state">{t("report.loading")}</p>}
            {error && (
              <p className="lr-state lr-state--error" role="alert">
                {t("report.loadError")} ({error})
              </p>
            )}
          </div>
        )}
        {branches &&
          scope?.kind === "branches" &&
          branches.map((report) => (
            <article key={report.goal.branchId} className="lr-sheet">
              <BranchReportView report={report} withSessions={scope.withSessions} />
              <footer className="lr-footer">{t("report.footer")}</footer>
            </article>
          ))}
        {summary && (
          <article className="lr-sheet">
            <SummaryReportView report={summary} />
            <footer className="lr-footer">{t("report.footer")}</footer>
          </article>
        )}
      </main>
    </div>
  );
}
