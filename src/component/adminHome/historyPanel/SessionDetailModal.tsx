import { useEffect } from "react";
import { FaListCheck, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { SessionCard } from "../../common/SessionCard";
import { sessionDetailController } from "./history.controller";

interface SessionDetailModalProps {
  /** null = closed */
  sessionId: number | null;
  userName: string;
  onClose: () => void;
}

/** one student session, shown with the same card the student sees in their own History */
export default function SessionDetailModal({ sessionId, userName, onClose }: SessionDetailModalProps) {
  const { t } = usePreferences();
  const { session, error, isLoading } = sessionDetailController(sessionId);

  useEffect(() => {
    if (sessionId === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sessionId, onClose]);

  if (sessionId === null) return null;

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div
        className="ad-modal ad-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ad-hist-session-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ad-modal-header ad-hist-modal-head">
          <span className="ad-modal-title" id="ad-hist-session-title">
            <FaListCheck aria-hidden /> {t("admin.history.session.title", { id: sessionId, name: userName })}
          </span>
          <button
            type="button"
            className="ad-hist-modal-close"
            onClick={onClose}
            aria-label={t("admin.history.session.close")}
            title={t("admin.history.session.close")}
          >
            <FaXmark aria-hidden />
          </button>
        </div>
        <div className="ad-modal-body ad-hist-modal-body">
          {isLoading && <p className="ad-empty-state">{t("admin.history.loading")}</p>}
          {error && (
            <div className="ad-hist-error" role="alert">
              {t("admin.history.session.loadError")} ({error})
            </div>
          )}
          {session && <SessionCard session={session} defaultOpen />}
        </div>
      </div>
    </div>
  );
}
