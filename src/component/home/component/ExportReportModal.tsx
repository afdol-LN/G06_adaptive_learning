import { useEffect, useState } from "react";
import { FaAward, FaFilePdf, FaLayerGroup } from "react-icons/fa6";
import { useApp } from "../../../context/AppContext";
import { usePreferences } from "../../../context/PreferencesContext";

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  /** the goal shown on Home — preselected */
  activeBranchId: string | null;
}

type Scope = "branch" | "all";

/**
 * Profile → Export PDF: choose one goal (certificate / progress report, optionally with the session
 * log) or a summary of every goal. The report opens in a new tab and brings up the print dialog.
 */
export default function ExportReportModal({ open, onClose, activeBranchId }: ExportReportModalProps) {
  const { t } = usePreferences();
  const { branches } = useApp() as {
    branches: { id: string; goalName?: string; goalCompletedAt?: string | null }[];
  };
  const [scope, setScope] = useState<Scope>("branch");
  const [branchId, setBranchId] = useState<string>(activeBranchId ?? branches[0]?.id ?? "");
  const [withSessions, setWithSessions] = useState(true);

  useEffect(() => {
    if (open) setBranchId(activeBranchId ?? branches[0]?.id ?? "");
  }, [open, activeBranchId, branches]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const chosen = branches.find((b) => String(b.id) === String(branchId));
  const canExport = scope === "all" || !!chosen;

  const exportPdf = () => {
    const url =
      scope === "all"
        ? "/report/all"
        : `/report/branch/${encodeURIComponent(branchId)}${withSessions ? "?sessions=1" : ""}`;
    window.open(url, "_blank", "noopener");
    onClose();
  };

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="confirm-modal export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="confirm-icon-wrap"><FaFilePdf aria-hidden /></div>
        <h2 className="confirm-title" id="export-title">{t("export.title")}</h2>
        <p className="confirm-desc">{t("export.desc")}</p>

        <div className="export-options" role="radiogroup" aria-label={t("export.scope")}>
          <label className={`export-option ${scope === "branch" ? "is-active" : ""}`}>
            <input
              type="radio"
              name="export-scope"
              checked={scope === "branch"}
              onChange={() => setScope("branch")}
            />
            <FaAward aria-hidden />
            <span>
              <strong>{t("export.branch")}</strong>
              <small>{t("export.branchHint")}</small>
            </span>
          </label>
          <label className={`export-option ${scope === "all" ? "is-active" : ""}`}>
            <input
              type="radio"
              name="export-scope"
              checked={scope === "all"}
              onChange={() => setScope("all")}
            />
            <FaLayerGroup aria-hidden />
            <span>
              <strong>{t("export.all")}</strong>
              <small>{t("export.allHint", { count: branches.length })}</small>
            </span>
          </label>
        </div>

        {scope === "branch" && (
          <div className="export-branch">
            <label className="export-label" htmlFor="export-branch-select">{t("export.goal")}</label>
            <select
              id="export-branch-select"
              className="filter-select"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.goalName || `#${b.id}`}
                  {b.goalCompletedAt ? ` · ${t("export.completed")}` : ""}
                </option>
              ))}
            </select>
            <p className="export-kind">
              {chosen?.goalCompletedAt ? t("export.kindCertificate") : t("export.kindProgress")}
            </p>
            <label className="export-check">
              <input
                type="checkbox"
                checked={withSessions}
                onChange={(e) => setWithSessions(e.target.checked)}
              />
              {t("export.withSessions")}
            </label>
          </div>
        )}

        <div className="confirm-btn-row">
          <button type="button" className="confirm-btn-cancel" onClick={onClose}>
            {t("export.cancel")}
          </button>
          <button type="button" className="confirm-btn-ok" onClick={exportPdf} disabled={!canExport}>
            <FaFilePdf aria-hidden /> {t("export.go")}
          </button>
        </div>
      </div>
    </div>
  );
}
