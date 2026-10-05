import { useEffect } from "react";
import { FaChartColumn, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import ExerciseStatBody from "./ExerciseStatBody";

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
  const { t } = usePreferences();

  useEffect(() => {
    if (exerciseId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exerciseId, onClose]);

  if (exerciseId === null) return null;

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
          <ExerciseStatBody exerciseId={exerciseId} includePretest={includePretest} />
        </div>
      </div>
    </div>
  );
}
