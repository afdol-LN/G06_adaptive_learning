import { ReactNode } from "react";
import { aiController } from "./ai.controller";
import AiGenerateForm from "./component/AiGenerateForm";
import DraftCard from "./component/DraftCard";
import ApproveModal from "./component/ApproveModal";
import RegenerateModal from "./component/RegenerateModal";
import ExerciseFormModal from "../exercisePanel/component/ExerciseFormModal";
import SkillFormModal from "../skillPanel/component/SkillFormModal";
import GoalFormModal from "../goalPanel/component/GoalFormModal";
import {
  AiDraftEntityType,
  AiDraftStatus,
} from "../../../models/aiDraftModel";
import { usePreferences } from "../../../context/PreferencesContext";

interface AiTabProps {
  icon?: ReactNode;
}

export default function AiTab({ icon }: AiTabProps) {
  const { t } = usePreferences();
  const {
    drafts,
    allSkills,
    activeSkills,
    isLoading,
    error,
    skillNameById,

    form,
    updateForm,
    isGenerating,
    generateError,
    rejectedReasons,
    generate,

    statusFilter,
    setStatusFilter,
    entityFilter,
    setEntityFilter,

    busyDraftId,
    approveDraft,
    rejectDraft,
    regenerateDraft,

    editingDraft,
    editingExercise,
    editingSkill,
    editingGoal,
    isSaving,
    formError,
    openEdit,
    closeEdit,
    saveExerciseDraft,
    saveSkillDraft,
    saveGoalDraft,

    approveTarget,
    setApproveTarget,
    regenerateTarget,
    setRegenerateTarget,
  } = aiController();

  const pendingCount = drafts.filter((d) => d.status === "pending").length;

  return (
    <div className="ad-tab-ai">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t("admin.ai.title")}</h1>
        <span className="ad-page-sub">
          {t("admin.ai.sub")}
          {statusFilter === "pending" && t("admin.ai.pendingCount", { count: pendingCount })}
        </span>
      </div>

      <AiGenerateForm
        form={form}
        activeSkills={activeSkills}
        isGenerating={isGenerating}
        generateError={generateError}
        rejectedReasons={rejectedReasons}
        onChange={updateForm}
        onSubmit={generate}
      />

      <div className="ad-toolbar ad-ai-toolbar">
        <select
          className="ad-select"
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as AiDraftStatus | "all")
          }
        >
          <option value="pending">{t("admin.ai.status.pending")}</option>
          <option value="approved">{t("admin.ai.status.approved")}</option>
          <option value="rejected">{t("admin.ai.status.rejected")}</option>
          <option value="all">{t("admin.common.allStatus")}</option>
        </select>

        <select
          className="ad-select"
          value={entityFilter}
          onChange={(e) =>
            setEntityFilter(e.target.value as AiDraftEntityType | "all")
          }
        >
          <option value="all">{t("admin.common.allTypes")}</option>
          <option value="exercise">Exercise</option>
          <option value="skill">Skill</option>
          <option value="goal">Goal</option>
        </select>
      </div>

      {error && <div className="ad-ai-alert-error">{error}</div>}

      {isLoading ? (
        <div className="ad-muted">{t("admin.common.loading")}</div>
      ) : drafts.length === 0 ? (
        <div className="ad-card ad-ai-empty">
          <span className="ad-muted">{t("admin.ai.empty")}</span>
        </div>
      ) : (
        <div className="ad-ai-draft-grid">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              isBusy={busyDraftId === draft.id}
              skillNameById={skillNameById}
              onApprove={() => setApproveTarget(draft)}
              onEdit={() => openEdit(draft)}
              onRegenerate={() => setRegenerateTarget(draft)}
              onReject={() => rejectDraft(draft)}
            />
          ))}
        </div>
      )}

      <ApproveModal
        draft={approveTarget}
        isBusy={busyDraftId === approveTarget?.id}
        onConfirm={(status) =>
          approveTarget && approveDraft(approveTarget, status)
        }
        onClose={() => setApproveTarget(null)}
      />

      <RegenerateModal
        draft={regenerateTarget}
        isBusy={busyDraftId === regenerateTarget?.id}
        onConfirm={(instruction) =>
          regenerateTarget && regenerateDraft(regenerateTarget, instruction)
        }
        onClose={() => setRegenerateTarget(null)}
      />

      {/* แก้ร่างด้วย FormModal เดิมของแต่ละ tab — หน้าตาและ validation เหมือนที่ admin คุ้นอยู่แล้ว */}
      <ExerciseFormModal
        isOpen={editingDraft?.entityType === "exercise"}
        editingExercise={editingExercise}
        activeSkills={activeSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveExerciseDraft}
        onClose={closeEdit}
        title={t("admin.ai.editExercise")}
        submitLabel={t("admin.ai.saveDraft")}
      />

      <SkillFormModal
        isOpen={editingDraft?.entityType === "skill"}
        editingSkill={editingSkill}
        allSkills={allSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveSkillDraft}
        onClose={closeEdit}
        title={t("admin.ai.editSkill")}
        submitLabel={t("admin.ai.saveDraft")}
      />

      <GoalFormModal
        isOpen={editingDraft?.entityType === "goal"}
        editingGoal={editingGoal}
        activeSkills={activeSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveGoalDraft}
        onClose={closeEdit}
        title={t("admin.ai.editGoal")}
        submitLabel={t("admin.ai.saveDraft")}
      />
    </div>
  );
}
