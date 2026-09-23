import { FaCircleCheck, FaCircleXmark, FaRocket } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import {
  ReadinessChecklistProps,
  readinessChecklistController,
} from "./readinessChecklist.controller";

export default function ReadinessChecklist(props: ReadinessChecklistProps) {
  const { t } = usePreferences();
  const view = readinessChecklistController(props);

  return (
    <div className="ad-card ad-ws-checklist">
      <div className="ad-ws-section-title">{t("admin.workspace.checklist.title")}</div>

      <ul className="ad-ws-rules">
        {view.rows.map((row) => (
          <li key={row.rule} className={row.className}>
            {row.passed ? <FaCircleCheck aria-hidden /> : <FaCircleXmark aria-hidden />}
            <div className="ad-ws-rule-body">
              <span>{row.label}</span>
              {row.failingSkills.length > 0 && (
                <div className="ad-req-tags">
                  {row.failingSkills.map((failing) => (
                    <button
                      key={failing.id}
                      type="button"
                      className="ad-req-tag ad-ws-rule-skill"
                      onClick={failing.handleClick}
                    >
                      {failing.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {view.message && <div className={view.messageClass}>{view.message.text}</div>}

      {view.needsPublish ? (
        <button
          type="button"
          className="ad-btn-primary"
          onClick={view.handlePublish}
          disabled={view.isBusy}
        >
          <FaRocket aria-hidden /> {view.publishLabel}
        </button>
      ) : (
        <div className="ad-ws-msg-ok">{t("admin.workspace.publish.done")}</div>
      )}
    </div>
  );
}
