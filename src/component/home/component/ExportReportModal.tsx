import { useEffect, useState } from "react";
import { FaFilePdf, FaLayerGroup } from "react-icons/fa6";
import { useApp } from "../../../context/AppContext";
import { usePreferences } from "../../../context/PreferencesContext";

interface ExportReportModalProps {
  open: boolean;
  onClose: () => void;
  /** the goal shown on Home — preselected */
  activeBranchId: string | null;
}

/**
 * Profile → Export PDF: tick the goals to export (each becomes a certificate or a progress report,
 * optionally with its session log) or export every goal at once. All of them land in one document
 * that opens in a new tab and brings up the print dialog.
 */
export default function ExportReportModal({ open, onClose, activeBranchId }: ExportReportModalProps) {
  const { t } = usePreferences();
  const { branches } = useApp() as {
    branches: { id: string; goalName?: string; goalCompletedAt?: string | null }[];
  };
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [withSessions, setWithSessions] = useState(true);

  useEffect(() => {
    if (!open) return;
    const initial = activeBranchId ?? branches[0]?.id;
    setSelected(new Set(initial ? [String(initial)] : []));
  }, [open, activeBranchId, branches]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const exportPdf = (ids: string[]) => {
    if (ids.length === 0) return;
    const params = new URLSearchParams({ ids: ids.join(",") });
    if (withSessions) params.set("sessions", "1");
    window.open(`/report/branches?${params}`, "_blank", "noopener");
    onClose();
  };

  // keep the list order (oldest goal first) rather than the order the boxes were ticked
  const selectedIds = branches.map((b) => String(b.id)).filter((id) => selected.has(id));

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

        <fieldset className="export-branch">
          <legend className="export-label">{t("export.goals")}</legend>
          {branches.length === 0 && <p className="export-kind">{t("export.noGoals")}</p>}
          <div className="export-options">
            {branches.map((b) => {
              const id = String(b.id);
              const checked = selected.has(id);
              return (
                <label key={id} className={`export-option ${checked ? "is-active" : ""}`}>
                  <input type="checkbox" checked={checked} onChange={() => toggle(id)} />
                  <span>
                    <strong>{b.goalName || `#${id}`}</strong>
                    <small>
                      {b.goalCompletedAt ? t("export.kindCertificate") : t("export.kindProgress")}
                    </small>
                  </span>
                </label>
              );
            })}
          </div>
          <label className="export-check">
            <input
              type="checkbox"
              checked={withSessions}
              onChange={(e) => setWithSessions(e.target.checked)}
            />
            {t("export.withSessions")}
          </label>
        </fieldset>

        <div className="confirm-btn-row">
          <button type="button" className="confirm-btn-cancel" onClick={onClose}>
            {t("export.cancel")}
          </button>
          <button
            type="button"
            className="confirm-btn-cancel export-all-btn"
            onClick={() => exportPdf(branches.map((b) => String(b.id)))}
            disabled={branches.length === 0}
          >
            <FaLayerGroup aria-hidden /> {t("export.goAll", { count: branches.length })}
          </button>
          <button
            type="button"
            className="confirm-btn-ok"
            onClick={() => exportPdf(selectedIds)}
            disabled={selectedIds.length === 0}
          >
            <FaFilePdf aria-hidden /> {t("export.goSelected", { count: selectedIds.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
