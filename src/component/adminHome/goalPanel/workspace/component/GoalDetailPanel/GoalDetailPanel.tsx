import { FaFlagCheckered, FaPen, FaTrash } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import AddSkillBox from "../AddSkillBox/AddSkillBox";
import { GoalDetailPanelProps, goalDetailPanelController } from "./goalDetailPanel.controller";

export default function GoalDetailPanel(props: GoalDetailPanelProps) {
  const { t } = usePreferences();
  const view = goalDetailPanelController(props);

  return (
    <div className="ad-card ad-ws-panel ad-ws-goal-panel">
      <div className="ad-ws-panel-head">
        <div className="ad-ws-panel-title-row">
          <h2 className="ad-ws-panel-name">
            <FaFlagCheckered aria-hidden /> {view.name}
          </h2>
          <button
            type="button"
            className="ad-btn-sm ad-btn-view"
            onClick={view.handleEdit}
            disabled={view.isBusy}
          >
            <FaPen aria-hidden /> {t("admin.common.edit")}
          </button>
        </div>
        <div className="ad-ws-meta">
          <span className={view.statusClass}>{view.statusLabel}</span>
          <span>{view.summary}</span>
        </div>
        {view.description && <div className="ad-ws-goal-desc">{view.description}</div>}
      </div>

      {view.error && <div className="ad-form-error">{view.error}</div>}

      <div className="ad-ws-section">
        <div className="ad-ws-section-title">
          <span>{t("admin.workspace.goalPanel.add")}</span>
        </div>
        <AddSkillBox {...view.addSkillBox} />
      </div>

      <div className="ad-ws-section">
        <div className="ad-ws-section-title">
          <span>{view.requiredTitle}</span>
        </div>
        {view.requiredRows.length === 0 ? (
          <span className="ad-muted">{t("admin.workspace.goalPanel.required.empty")}</span>
        ) : (
          <ul className="ad-ws-list">
            {view.requiredRows.map((row) => (
              <li key={row.skillId} className="ad-ws-skill-row">
                <button
                  type="button"
                  className={`ad-ws-ex-row${row.isInactive ? " is-inactive" : ""}`}
                  onClick={row.handleOpen}
                >
                  <span className="ad-ws-ex-desc">{row.name}</span>
                  <span className="ad-ws-meta">
                    <span>{row.meta}</span>
                    {row.levelLabel && <span>{row.levelLabel}</span>}
                    {row.isInactive && (
                      <span className="ad-ws-tag ad-ws-tag--off">{t("admin.status.inactive")}</span>
                    )}
                  </span>
                </button>
                <button
                  type="button"
                  className="ad-btn-sm ad-btn-del"
                  onClick={row.handleRemove}
                  disabled={view.isBusy}
                  aria-label={row.removeLabel}
                  title={row.removeLabel}
                >
                  <FaTrash aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {view.showPulled && (
        <div className="ad-ws-section">
          <div className="ad-ws-section-title">
            <span>{view.pulledTitle}</span>
          </div>
          <span className="ad-hint-text">{t("admin.workspace.goalPanel.pulled.hint")}</span>
          <ul className="ad-ws-list">
            {view.pulledRows.map((row) => (
              <li key={row.skillId}>
                <button
                  type="button"
                  className={`ad-ws-ex-row${row.isInactive ? " is-inactive" : ""}`}
                  onClick={row.handleOpen}
                >
                  <span className="ad-ws-ex-desc">{row.name}</span>
                  <span className="ad-ws-meta">
                    <span>{row.meta}</span>
                    <span>{row.foundationOf}</span>
                    {row.isInactive && (
                      <span className="ad-ws-tag ad-ws-tag--off">{t("admin.status.inactive")}</span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
