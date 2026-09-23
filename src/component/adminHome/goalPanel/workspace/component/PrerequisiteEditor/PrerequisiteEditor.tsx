import { FaCheck, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { PrerequisiteEditorProps, prerequisiteEditorController } from "./prerequisiteEditor.controller";

export default function PrerequisiteEditor(props: PrerequisiteEditorProps) {
  const { t } = usePreferences();
  const view = prerequisiteEditorController(props);

  return (
    <div className="ad-ws-section">
      <div className="ad-ws-section-title">{t("admin.workspace.panel.prereq.title")}</div>

      <div className="ad-req-tags">
        {view.hasChips ? (
          view.chips.map((chip) => (
            <span key={chip.id} className="ad-req-tag">
              {chip.name}
              <button
                type="button"
                className="ad-ws-chip-remove"
                aria-label={chip.removeLabel}
                onClick={chip.handleRemove}
                disabled={view.isBusy}
              >
                <FaXmark aria-hidden />
              </button>
            </span>
          ))
        ) : (
          <span className="ad-muted">{t("admin.workspace.panel.prereq.none")}</span>
        )}
      </div>

      <div className="ad-ws-inline">
        <select className="ad-select" value="" disabled={view.isBusy} onChange={view.handleAdd}>
          <option value="">{t("admin.workspace.panel.prereq.add")}</option>
          {view.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {view.isDirty && (
          <>
            <button
              type="button"
              className="ad-btn-sm ad-btn-toggle"
              onClick={view.handleSave}
              disabled={view.isBusy}
            >
              <FaCheck aria-hidden /> {t("admin.workspace.panel.prereq.save")}
            </button>
            <button
              type="button"
              className="ad-btn-sm ad-btn-view"
              onClick={view.handleReset}
              disabled={view.isBusy}
            >
              {t("admin.common.cancel")}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
