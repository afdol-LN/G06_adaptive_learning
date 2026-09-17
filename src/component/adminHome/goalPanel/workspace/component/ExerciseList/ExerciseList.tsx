import { FaPlus } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { ActionButtons } from "../../../../../common/ActionButtons";
import { StatusSwitch } from "../../../../../common/StatusSwitch";
import Pagination from "../../../../../common/Pagination";
import { ExerciseListProps, exerciseListController } from "./exerciseList.controller";

export default function ExerciseList(props: ExerciseListProps) {
  const { t } = usePreferences();
  const view = exerciseListController(props);

  return (
    <div className="ad-ws-section">
      <div className="ad-ws-section-title">
        <span>{view.title}</span>
        <div className="ad-ws-ex-tools">
          <select
            className="ad-select ad-select-sm"
            value={view.statusFilter}
            onChange={view.handleStatusFilterChange}
            aria-label={t("admin.common.status")}
          >
            {view.statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="ad-btn-sm ad-btn-view"
            onClick={view.handleAdd}
            disabled={view.isBusy}
          >
            <FaPlus aria-hidden /> {t("admin.workspace.panel.ex.add")}
          </button>
        </div>
      </div>

      {view.isEmpty ? (
        <span className="ad-muted">{t("admin.workspace.panel.ex.empty")}</span>
      ) : view.isFilteredEmpty ? (
        <span className="ad-muted">{t("admin.workspace.panel.ex.emptyFilter")}</span>
      ) : (
        <ul className="ad-ws-list">
          {view.rows.map((row) => (
            <li key={row.id} className={row.className}>
              <span className="ad-ws-ex-desc">{row.preview}</span>
              <span className="ad-ws-meta">
                <span>{row.levelLabel}</span>
                <span>{row.type}</span>
              </span>
              <div className="ad-ws-ex-actions">
                <ActionButtons onView={row.handleView} onEdit={row.handleEdit} disabled={view.isBusy} />
                <StatusSwitch
                  status={row.status}
                  onToggle={row.handleToggle}
                  disabled={row.isToggleDisabled}
                />
              </div>
            </li>
          ))}
        </ul>
      )}

      <Pagination page={view.page} totalPages={view.totalPages} onChange={view.handlePageChange} />
    </div>
  );
}
