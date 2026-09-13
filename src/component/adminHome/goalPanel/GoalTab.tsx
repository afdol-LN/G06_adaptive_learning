import {
  FaMagnifyingGlass,
  FaPlus,
} from "react-icons/fa6";
import GoalFormModal from "./component/GoalFormModal";
import GoalViewModal from "./component/GoalViewModal";
import { goalController } from "./goal.controller";
import { ActionButtons } from "../../common/ActionButtons";
import { StatusSwitch } from "../../common/StatusSwitch";
import { usePreferences } from "../../../context/PreferencesContext";

interface GoalTabProps {
  icon?: React.ReactNode;
}

export default function GoalTab({ icon }: GoalTabProps) {
  const { t } = usePreferences();
  const {
    goals,
    isLoading,
    error,
    goalSearch,
    setGoalSearch,
    statusFilter,
    setStatusFilter,
    filteredGoals,
    activeSkills,
    getStatusColor,

    isFormOpen,
    editingGoal,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveGoal,

    viewingGoal,
    openView,
    closeView,

    toggleGoalStatus,
  } = goalController();

  return (
    <div className="ad-tab-goals">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t("admin.goals.title")}</h1>
        <span className="ad-page-sub">{t("admin.goals.count", { count: goals.length })}</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder={t("admin.goals.search")}
            value={goalSearch}
            onChange={(e) => setGoalSearch(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">{t("admin.common.allStatus")}</option>
          <option value="active">{t("admin.status.active")}</option>
          <option value="inactive">{t("admin.status.inactive")}</option>
        </select>

        <button className="ad-btn-primary ad-btn-add" onClick={openCreateForm}>
          <FaPlus /> {t("admin.goals.add")}
        </button>
      </div>

      {error && <div className="ad-inline-error">{error}</div>}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t("admin.goals.col.goal")}</th>
              <th>{t("admin.goals.col.skillRequire")}</th>
              <th>{t("admin.common.actions")}</th>
              <th>{t("admin.common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.common.loading")}
                </td>
              </tr>
            ) : filteredGoals.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.goals.empty")}
                </td>
              </tr>
            ) : (
              filteredGoals.map((g) => {
                const fadeClass = g.status === "inactive" ? "ad-fade-cell" : "";
                return (
                  <tr key={g.id}>
                    <td className={fadeClass}>
                      <span className="ad-skill-name">{g.goal}</span>
                    </td>
                    <td className={fadeClass}>
                      <div className="ad-req-tags">
                        {!g.goalSkillRequire || g.goalSkillRequire.length === 0 ? (
                          <span className="ad-muted">—</span>
                        ) : (
                          g.goalSkillRequire.map((r) => (
                            <span key={r.skillId} className="ad-req-tag">
                              {r.skill?.skillsName || `#${r.skillId}`}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td>
                      <ActionButtons onView={() => openView(g)} onEdit={() => openEditForm(g)} />
                    </td>
                    <td>
                      <StatusSwitch status={g.status} onToggle={() => toggleGoalStatus(g)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <GoalFormModal
        isOpen={isFormOpen}
        editingGoal={editingGoal}
        activeSkills={activeSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveGoal}
        onClose={closeForm}
      />

      <GoalViewModal
        goal={viewingGoal}
        onClose={closeView}
        onEdit={(g) => {
          closeView();
          openEditForm(g);
        }}
      />
    </div>
  );
}
