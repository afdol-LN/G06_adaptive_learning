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
import { usePreferences } from "../../../context/PreferencesContext";

interface SkillTabProps {
  icon?: React.ReactNode;
  getSkillQuestions?: (skillId: number) => any[];
  setViewSkillQ?: (skill: any) => void;
}

export default function SkillTab({ icon, getSkillQuestions, setViewSkillQ }: SkillTabProps) {
  const { t } = usePreferences();
  const {
    skills,
    isLoading,
    error,
    skillSearch,
    setSkillSearch,
    statusFilter,
    setStatusFilter,
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
        <h1 className="ad-page-title">{icon} {t("admin.skills.title")}</h1>
        <span className="ad-page-sub">{t("admin.skills.count", { count: skills.length })}</span>
      </div>

      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input
            className="ad-search"
            placeholder={t("admin.skills.search")}
            value={skillSearch}
            onChange={(e) => setSkillSearch(e.target.value)}
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
          <FaPlus /> {t("admin.skills.add")}
        </button>
      </div>

      {error && <div className="ad-inline-error">{error}</div>}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t("admin.skills.col.code")}</th>
              <th>{t("admin.skills.col.skill")}</th>
              <th>{t("admin.skills.col.tier")}</th>
              <th>{t("admin.skills.col.prereq")}</th>
              {getSkillQuestions && <th>{t("admin.skills.col.questions")}</th>}
              <th>{t("admin.common.actions")}</th>
              <th>{t("admin.common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.common.loading")}
                </td>
              </tr>
            ) : filteredSkills.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", padding: 24 }}>
                  {t("admin.skills.empty")}
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
                        <button className="ad-btn-sm ad-btn-questions" onClick={() => setViewSkillQ(s)}>
                          <FaPenToSquare /> {t("admin.skills.questionCount", { count: getSkillQuestions(s.skillId).length })}
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
              {t("admin.skills.deleteConfirm", { name: deleteTarget.skillsName })}
            </div>
            <div className="ad-confirm-btns">
              <button className="ad-btn-cancel" onClick={cancelDelete} disabled={isDeleting}>
                {t("admin.common.cancel")}
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
