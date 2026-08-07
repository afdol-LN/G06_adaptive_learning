import {
  FaMagnifyingGlass,
  FaPlus,
  FaPenToSquare,
  FaTriangleExclamation,
} from "react-icons/fa6";
import SkillFormModal from "./component/SkillFormModal";
import SkillViewModal from "./component/SkillViewModal";
import { skillController } from "./skill.controller";
import { ActionButtons } from "../../common/ActionButtons";
import { StatusSwitch } from "../../common/StatusSwitch";

interface SkillTabProps {
  icon?: React.ReactNode;
  getSkillQuestions?: (skillId: number) => any[];
  setViewSkillQ?: (skill: any) => void;
}

export default function SkillTab({ icon, getSkillQuestions, setViewSkillQ }: SkillTabProps) {
  const {
    skills,
    isLoading,
    error,
    skillSearch,
    setSkillSearch,
    filteredSkills,
    getTierColor,
    getTierLabel,
    getStatusColor,

    isFormOpen,
    editingSkill,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveSkill,

    viewingSkill,
    openView,
    closeView,

    toggleSkillStatus,

    deleteTarget,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = skillController();

  return (
    <div className="ad-tab-skills">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} จัดการ Skill</h1>
        <span className="ad-page-sub">Skill ทั้งหมด {skills.length} รายการ</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder="ค้นหาชื่อ Skill, Tier..."
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
          />
        </div>
        <button className="ad-btn-primary ad-btn-add" onClick={openCreateForm}>
          <FaPlus /> เพิ่ม Skill ใหม่
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
              <th>Skill code</th>
              <th>Skill</th>
              <th>Tier</th>
              <th>Prerequisite</th>
              {getSkillQuestions && <th>โจทย์</th>}
              <th>Actions</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  กำลังโหลด...
                </td>
              </tr>
            ) : filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  ไม่พบ Skill ที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              filteredSkills.map((s) => {
                const fadeClass = s.status === "inactive" ? "ad-fade-cell" : "";
                return (
                  <tr key={s.skillId}>
                    <td className={fadeClass}>
                      <div className="ad-skill-cell">
                        <span className="ad-skill-name">{s.skillCode}</span>
                      </div>
                    </td>
                    <td className={fadeClass}>
                      <div className="ad-skill-cell">
                        <span className="ad-skill-name">{s.skillsName}</span>
                      </div>
                    </td>
                    <td className={fadeClass}>
                      <span
                        className="ad-tier-badge"
                        style={{
                          background: `${getTierColor(s.tier)}18`,
                          color: getTierColor(s.tier),
                          border: `1px solid ${getTierColor(s.tier)}40`,
                        }}
                      >
                        {getTierLabel(s.tier)}
                      </span>
                    </td>
                    <td className={fadeClass}>
                      <div className="ad-req-tags">
                        {!s.skillPrequisite || s.skillPrequisite.length === 0 ? (
                          <span className="ad-muted">—</span>
                        ) : (
                          s.skillPrequisite.map((p) => (
                            <span key={p.prerequisiteSkillId} className="ad-req-tag">
                              {p.prerequisiteSkill?.skillsName || `#${p.prerequisiteSkillId}`}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    {getSkillQuestions && setViewSkillQ && (
                      <td className={fadeClass}>
                        <button
                          className="ad-btn-sm"
                          style={{ borderColor: "rgba(139,92,246,0.3)", color: "#8b5cf6" }}
                          onClick={() => setViewSkillQ(s)}
                        >
                          <FaPenToSquare /> {getSkillQuestions(s.skillId).length} ข้อ
                        </button>
                      </td>
                    )}
                    <td>
                      <ActionButtons onView={() => openView(s)} onEdit={() => openEditForm(s)} />
                    </td>
                    <td>
                      <StatusSwitch status={s.status} onToggle={() => toggleSkillStatus(s)} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <SkillFormModal
        isOpen={isFormOpen}
        editingSkill={editingSkill}
        allSkills={skills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveSkill}
        onClose={closeForm}
      />

      <SkillViewModal
        skill={viewingSkill}
        onClose={closeView}
        onEdit={(s) => {
          closeView();
          openEditForm(s);
        }}
      />

      {deleteTarget && (
        <div className="ad-overlay" onClick={cancelDelete}>
          <div className="ad-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="ad-confirm-icon"><FaTriangleExclamation /></div>
            <div className="ad-confirm-msg">
              ต้องการลบ Skill "{deleteTarget.skillsName}" ออกจากระบบใช่ไหม?
            </div>
            <div className="ad-confirm-btns">
              <button className="ad-btn-cancel" onClick={cancelDelete} disabled={isDeleting}>
                ยกเลิก
              </button>
              {/* <button className="ad-btn-danger" onClick={confirmDelete} disabled={isDeleting}>
                {isDeleting ? "กำลังลบ..." : "ยืนยัน ลบ"}
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
