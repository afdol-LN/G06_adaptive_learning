import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FaArrowLeft, FaPrint } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { ReportScope } from "../../models/learningReportModel";
import PreferenceControls from "../common/PreferenceControls";
import { useAutoPrint, useLearningReport } from "./learningReport.controller";
import BranchReportView from "./BranchReportView";
import SummaryReportView from "./SummaryReportView";
import "../decorate/LearningReport.css";

/**
 * /report/branch/:branchId?sessions=1 and /report/all — an A4 document the browser saves as PDF.
 * The toolbar is screen-only; the print dialog opens by itself once the report has rendered.
 */
export default function LearningReportPage() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  const { branchId } = useParams();
  const [search] = useSearchParams();

  const scope: ReportScope | null = useMemo(() => {
    if (branchId === undefined) return { kind: "all" };
    const id = Number(branchId);
    if (!Number.isInteger(id) || id <= 0) return null;
    return { kind: "branch", branchId: id, withSessions: search.get("sessions") === "1" };
  }, [branchId, search]);

  const { branch, summary, error, isLoading } = useLearningReport(scope);
  useAutoPrint(!!(branch || summary));

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
          disabled={!(branch || summary)}
        >
          <FaPrint aria-hidden /> {t("report.print")}
        </button>
      </div>

      <main className="lr-sheet">
        {isLoading && <p className="lr-state">{t("report.loading")}</p>}
        {error && (
          <p className="lr-state lr-state--error" role="alert">
            {t("report.loadError")} ({error})
          </p>
        )}
        {branch && scope?.kind === "branch" && (
          <BranchReportView report={branch} withSessions={scope.withSessions} />
        )}
        {summary && <SummaryReportView report={summary} />}
        {(branch || summary) && <footer className="lr-footer">{t("report.footer")}</footer>}
      </main>
    </div>
  );
}
