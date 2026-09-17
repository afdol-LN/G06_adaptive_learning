import { FaLink, FaTrash } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import PrerequisiteEditor from "../PrerequisiteEditor/PrerequisiteEditor";
import ExerciseList from "../ExerciseList/ExerciseList";
import DraftList from "../DraftList/DraftList";
import { SkillDetailPanelProps, skillDetailPanelController } from "./skillDetailPanel.controller";

export default function SkillDetailPanel(props: SkillDetailPanelProps) {
  const { t } = usePreferences();
  const view = skillDetailPanelController(props);

  if (!view) {
    return (
      <div className="ad-card ad-ws-panel ad-ws-panel-empty ad-muted">
        {t("admin.workspace.panel.empty")}
      </div>
    );
  }

  return (
    <div className="ad-card ad-ws-panel">
      <div className="ad-ws-panel-head">
        <h2 className="ad-ws-panel-name">{view.name}</h2>
        <div className="ad-ws-meta">
          <span>{view.code}</span>
          {view.tier && <span className="ad-ws-tag">{view.tier}</span>}
          <span className={view.statusClass}>{view.statusLabel}</span>
          <span>{view.usedInLabel}</span>
        </div>
      </div>

      {view.sharedWarning && <div className="ad-ws-note ad-ws-note--warn">{view.sharedWarning}</div>}

      {view.error && <div className="ad-form-error">{view.error}</div>}

      {view.isRequired ? (
        <div className="ad-ws-section">
          <div className="ad-ws-inline">
            <label className="ad-label" htmlFor="ad-ws-level">
              {t("admin.workspace.panel.levelRequire")}
            </label>
            <select
              id="ad-ws-level"
              className="ad-select"
              value={view.levelValue}
              disabled={view.isBusy}
              onChange={view.handleLevelChange}
            >
              <option value="">{t("admin.common.noLevel")}</option>
              {view.levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="ad-btn-sm ad-btn-del"
              onClick={view.handleRemoveRequired}
              disabled={view.isBusy}
            >
              <FaTrash aria-hidden /> {t("admin.workspace.panel.remove")}
            </button>
          </div>
        </div>
      ) : (
        <div className="ad-ws-note">
          <div>{view.pulledInText}</div>
          <button
            type="button"
            className="ad-btn-sm ad-btn-view"
            onClick={view.handleMakeRequired}
            disabled={view.isBusy}
          >
            <FaLink aria-hidden /> {t("admin.workspace.panel.makeRequired")}
          </button>
        </div>
      )}

      <PrerequisiteEditor {...view.prerequisiteEditor} />
      {/* key = skill: เปลี่ยน skill แล้วรายการข้อเริ่มที่หน้า 1 ใหม่ */}
      <ExerciseList key={view.skillId} {...view.exerciseList} />
      <DraftList {...view.draftList} />
    </div>
  );
}
