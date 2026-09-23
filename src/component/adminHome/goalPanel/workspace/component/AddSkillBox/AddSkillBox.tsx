import { FaMagnifyingGlass, FaPlus, FaRotate } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { AddSkillBoxProps, addSkillBoxController } from "./addSkillBox.controller";

export default function AddSkillBox(props: AddSkillBoxProps) {
  const { t } = usePreferences();
  const view = addSkillBoxController(props);

  return (
    <div className="ad-ws-add" ref={view.containerRef}>
      <button
        type="button"
        className="ad-btn-primary ad-ws-add-btn"
        onClick={view.handleToggle}
        disabled={view.isBusy}
        aria-expanded={view.isOpen}
      >
        <FaPlus aria-hidden /> {t("admin.workspace.add.button")}
      </button>

      {view.isOpen && (
        <div className="ad-ws-add-menu">
          {/* ส่วนบนไม่เลื่อนตาม — สร้างใหม่ + ค้นหา อยู่ให้เห็นตลอด */}
          <div className="ad-ws-add-top">
            <button
              type="button"
              className="ad-ws-add-item ad-ws-add-create"
              onClick={view.handleCreate}
              disabled={view.isBusy}
            >
              <FaPlus aria-hidden /> {t("admin.workspace.add.createNew")}
            </button>
            <div className="ad-search-wrap">
              <span className="ad-search-icon">
                <FaMagnifyingGlass aria-hidden />
              </span>
              <input
                className="ad-search"
                placeholder={t("admin.workspace.add.search")}
                aria-label={t("admin.workspace.add.search")}
                value={view.query}
                onChange={view.handleQueryChange}
                autoFocus
              />
            </div>
          </div>

          {view.isEmpty ? (
            <div className="ad-ws-add-empty ad-muted">{t("admin.workspace.add.noResults")}</div>
          ) : (
            <ul className="ad-ws-add-results">
              {view.results.map((result) => (
                <li key={result.skillId}>
                  <button
                    type="button"
                    className="ad-ws-add-item"
                    disabled={result.isDisabled}
                    onClick={result.handleClick}
                  >
                    <span className="ad-ws-add-name">{result.name}</span>
                    <span className="ad-ws-add-meta">{result.meta}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {view.error && (
        <div className="ad-inline-error ad-ws-add-error">
          <span>{view.error}</span>
          {view.canRetryLink && (
            <button
              type="button"
              className="ad-btn-sm ad-btn-view"
              onClick={view.handleRetryLink}
              disabled={view.isBusy}
            >
              <FaRotate aria-hidden /> {t("admin.workspace.add.retryLink")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
