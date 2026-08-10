import {
  FaMagnifyingGlass,
  FaPlus,
} from "react-icons/fa6";
import GoalFormModal from "./component/GoalFormModal";
import GoalViewModal from "./component/GoalViewModal";
import { goalController } from "./goal.controller";
import { ActionButtons } from "../../common/ActionButtons";
import { StatusSwitch } from "../../common/StatusSwitch";

interface GoalTabProps {
  icon?: React.ReactNode;
}

export default function GoalTab({ icon }: GoalTabProps) {
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
        <h1 className="ad-page-title">{icon} จัดการ Goal</h1>
        <span className="ad-page-sub">Goal ทั้งหมด {goals.length} รายการ</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder="ค้นหาชื่อ Goal..."
            value={goalSearch}
            onChange={(e) => setGoalSearch(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="active">active</option>
          <option value="inactive">inactive</option>
        </select>

        <button className="ad-btn-primary ad-btn-add" onClick={openCreateForm}>
          <FaPlus /> เพิ่ม Goal ใหม่
        </button>
      </div>

      {error && (
        <div style={{ color: "#dc2626", fontSize: 13, fontWeight: 600, margin: "8px 0" }}>
          {error}
        </div>
      )}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>Goal</th>
              <th>Skill Require</th>
              <th>Actions</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : filteredGoals.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                  ไม่พบ Goal ที่ตรงกับเงื่อนไข
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
