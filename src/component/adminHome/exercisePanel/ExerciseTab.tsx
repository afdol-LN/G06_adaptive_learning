import {
  FaMagnifyingGlass,
  FaPlus,
} from "react-icons/fa6";
import ExerciseFormModal from "./component/ExerciseFormModal";
import ExerciseViewModal from "./component/ExerciseViewModal";
import { exerciseController } from "./exercise.controller";
import { ActionButtons } from "../../common/ActionButtons";
import { StatusSwitch } from "../../common/StatusSwitch";
import { usePreferences } from "../../../context/PreferencesContext";

interface ExerciseTabProps {
  icon?: React.ReactNode;
}

export default function ExerciseTab({ icon }: ExerciseTabProps) {
  const { t } = usePreferences();
  const {
    exercises,
    activeSkills,
    isLoading,
    error,

    search,
    setSearch,
    skillFilter,
    setSkillFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    filteredExercises,

    isFormOpen,
    editingExercise,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveExercise,

    viewingExercise,
    openView,
    closeView,

    togglingId,
    toggleExerciseStatus,
  } = exerciseController();

  return (
    <div className="ad-tab-skills">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t("admin.exercises.title")}</h1>
        <span className="ad-page-sub">{t("admin.exercises.count", { count: exercises.length })}</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder={t("admin.exercises.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <option value="all">{t("admin.exercises.allSkills")}</option>
          {activeSkills.map((s) => (
            <option key={s.skillId} value={s.skillId}>
              {s.skillsName}
            </option>
          ))}
        </select>

        <select
          className="ad-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
        >
          <option value="all">{t("admin.common.allTypes")}</option>
          <option value="CHOICE">CHOICE</option>
          <option value="FILL_IN_BLANK">FILL_IN_BLANK</option>
        </select>

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
          <FaPlus /> {t("admin.exercises.add")}
        </button>
      </div>

      {error && <div className="ad-inline-error">{error}</div>}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t("admin.exercises.col.description")}</th>
              <th>{t("admin.exercises.col.skill")}</th>
              <th>{t("admin.exercises.col.level")}</th>
              <th>{t("admin.exercises.col.type")}</th>
              <th>{t("admin.common.actions")}</th>
              <th>{t("admin.common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.common.loading")}
                </td>
              </tr>
            ) : filteredExercises.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.exercises.empty")}
                </td>
              </tr>
            ) : (
              filteredExercises.map((ex) => {
                const fadeClass = ex.status === "inactive" ? "ad-fade-cell" : "";
                return (
                  <tr key={ex.id}>
                    <td className={fadeClass}>
                      <div className="ad-skill-cell">
                        <span className="ad-skill-name">
                          {ex.description.length > 60
                            ? `${ex.description.slice(0, 60)}...`
                            : ex.description}
                        </span>
                      </div>
                    </td>
                    <td className={fadeClass}>{ex.skill?.skillsName || `#${ex.skillId}`}</td>
                    <td className={fadeClass}>{ex.level}</td>
                    <td className={fadeClass}>{ex.type}</td>
                    <td>
                      <ActionButtons onView={() => openView(ex)} onEdit={() => openEditForm(ex)} />
                    </td>
                    <td>
                      <StatusSwitch
                        status={ex.status}
                        onToggle={() => toggleExerciseStatus(ex)}
                        disabled={togglingId === ex.id}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ExerciseFormModal
        isOpen={isFormOpen}
        editingExercise={editingExercise}
        activeSkills={activeSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveExercise}
        onClose={closeForm}
      />

      <ExerciseViewModal
        exercise={viewingExercise}
        onClose={closeView}
        onEdit={(ex) => {
          closeView();
          openEditForm(ex);
        }}
      />
    </div>
  );
}
