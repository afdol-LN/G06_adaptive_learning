import { FaCheck, FaEye, FaPen, FaWandMagicSparkles, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import ExerciseViewModal from "../../../../exercisePanel/component/ExerciseViewModal";
import { DraftListProps, draftListController } from "./draftList.controller";

export default function DraftList(props: DraftListProps) {
  const { t } = usePreferences();
  const view = draftListController(props);

  return (
    <div className="ad-ws-section">
      <div className="ad-ws-section-title">
        <span>{t("admin.workspace.panel.ai.title")}</span>
        <button
          type="button"
          className="ad-btn-sm ad-btn-regen"
          onClick={view.handleGenerate}
          disabled={view.isGenerateDisabled}
        >
          <FaWandMagicSparkles aria-hidden /> {view.generateLabel}
        </button>
      </div>

      {view.generateMessage && <div className="ad-hint-text">{view.generateMessage}</div>}

      {view.isEmpty ? (
        <span className="ad-muted">{t("admin.workspace.panel.ai.empty")}</span>
      ) : (
        <ul className="ad-ws-list">
          {view.rows.map((row) => (
            <li key={row.id} className="ad-ws-draft">
              <span className="ad-ws-ex-desc">{row.preview}</span>
              <span className="ad-ws-meta">
                <span>{row.levelLabel}</span>
                <span>{row.type}</span>
                <span>#{row.id}</span>
              </span>
              <div className="ad-action-btns">
                <button type="button" className="ad-btn-sm ad-btn-view" onClick={row.handleView}>
                  <FaEye aria-hidden /> {t("admin.common.view")}
                </button>
                <button
                  type="button"
                  className="ad-btn-sm ad-btn-toggle"
                  onClick={row.handleApprove}
                  disabled={row.isDisabled}
                >
                  <FaCheck aria-hidden /> {t("admin.ai.draft.approve")}
                </button>
                <button
                  type="button"
                  className="ad-btn-sm ad-btn-view"
                  onClick={row.handleEdit}
                  disabled={row.isDisabled}
                >
                  <FaPen aria-hidden /> {t("admin.common.edit")}
                </button>
                <button
                  type="button"
                  className="ad-btn-sm ad-btn-del"
                  onClick={row.handleReject}
                  disabled={row.isDisabled}
                >
                  <FaXmark aria-hidden /> {t("admin.ai.draft.reject")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {view.viewing && (
        <ExerciseViewModal
          exercise={view.viewing.exercise}
          title={t("admin.workspace.panel.ai.viewTitle")}
          skillName={view.viewing.skillName}
          hideStatus
          onClose={view.viewing.handleClose}
          onEdit={view.viewing.handleEdit}
        />
      )}
    </div>
  );
}
