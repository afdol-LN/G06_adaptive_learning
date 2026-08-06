import {
  FaPenToSquare,
  FaMagnifyingGlass,
  FaPlus,
  FaEye,
  FaPen,
  FaToggleOff,
  FaToggleOn,
} from "react-icons/fa6";
import ExerciseFormModal from "./component/ExerciseFormModal";
import ExerciseViewModal from "./component/ExerciseViewModal";
import { exerciseController } from "./exercise.controller";
import { getStatusColor } from "../../../utils/adminUi";

export default function ExerciseTab() {
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
        <h1 className="ad-page-title"><FaPenToSquare /> จัดการ Exercise</h1>
        <span className="ad-page-sub">Exercise ทั้งหมด {exercises.length} รายการ</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder="ค้นหาคำอธิบายโจทย์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="ad-select"
          value={skillFilter}
          onChange={(e) => setSkillFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
        >
          <option value="all">ทุก Skill</option>
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
          <option value="all">ทุกประเภท</option>
          <option value="CHOICE">CHOICE</option>
          <option value="FILL_IN_BLANK">FILL_IN_BLANK</option>
        </select>

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
          <FaPlus /> เพิ่ม Exercise ใหม่
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
              <th>คำอธิบายโจทย์</th>
              <th>Skill</th>
              <th>Level</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : filteredExercises.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 24 }}>
                  ไม่พบ Exercise ที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredExercises.map((ex) => (
                <tr key={ex.id}>
                  <td>
                    <div className="ad-skill-cell">
                      <span className="ad-skill-name">
                        {ex.description.length > 60
                          ? `${ex.description.slice(0, 60)}...`
                          : ex.description}
                      </span>
                    </div>
                  </td>
                  <td>{ex.skill?.skillsName || `#${ex.skillId}`}</td>
                  <td>{ex.level}</td>
                  <td>{ex.type}</td>
                  <td>
                    <span className="ad-status-dot" style={{ background: getStatusColor(ex.status) }} />
                    <span className="ad-muted">{ex.status}</span>
                  </td>
                  <td>
                    <div className="ad-action-btns">
                      <button className="ad-btn-sm ad-btn-view" onClick={() => openView(ex)}>
                        <FaEye /> ดู
                      </button>
                      <button className="ad-btn-sm ad-btn-view" onClick={() => openEditForm(ex)}>
                        <FaPen /> แก้ไข
                      </button>
                      <button
                        className="ad-btn-sm ad-btn-toggle"
                        disabled={togglingId === ex.id}
                        onClick={() => toggleExerciseStatus(ex)}
                      >
                        {ex.status === "active" ? (
                          <>
                            <FaToggleOff /> ระงับ
                          </>
                        ) : (
                          <>
                            <FaToggleOn /> เปิด
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
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
