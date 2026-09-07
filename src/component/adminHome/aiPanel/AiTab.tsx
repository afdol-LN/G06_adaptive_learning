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

interface AiTabProps {
  icon?: ReactNode;
}

export default function AiTab({ icon }: AiTabProps) {
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
        <h1 className="ad-page-title">{icon} AI ผู้ช่วย</h1>
        <span className="ad-page-sub">
          ให้ AI ร่าง Exercise / Skill / Goal แล้วตรวจก่อนบันทึกลงระบบ
          {statusFilter === "pending" && ` · รอตรวจ ${pendingCount} รายการ`}
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
          <option value="pending">รอตรวจ</option>
          <option value="approved">อนุมัติแล้ว</option>
          <option value="rejected">ปฏิเสธแล้ว</option>
          <option value="all">ทุกสถานะ</option>
        </select>

        <select
          className="ad-select"
          value={entityFilter}
          onChange={(e) =>
            setEntityFilter(e.target.value as AiDraftEntityType | "all")
          }
        >
          <option value="all">ทุกประเภท</option>
          <option value="exercise">Exercise</option>
          <option value="skill">Skill</option>
          <option value="goal">Goal</option>
        </select>
      </div>

      {error && <div className="ad-ai-alert-error">{error}</div>}

      {isLoading ? (
        <div className="ad-muted">กำลังโหลด...</div>
      ) : drafts.length === 0 ? (
        <div className="ad-card ad-ai-empty">
          <span className="ad-muted">
            ยังไม่มีร่างที่ตรงกับเงื่อนไข — ใช้ฟอร์มด้านบนสั่งให้ AI ร่างให้ได้เลย
          </span>
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
        title="แก้ไขร่าง Exercise"
        submitLabel="บันทึกร่าง"
      />

      <SkillFormModal
        isOpen={editingDraft?.entityType === "skill"}
        editingSkill={editingSkill}
        allSkills={allSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveSkillDraft}
        onClose={closeEdit}
        title="แก้ไขร่าง Skill"
        submitLabel="บันทึกร่าง"
      />

      <GoalFormModal
        isOpen={editingDraft?.entityType === "goal"}
        editingGoal={editingGoal}
        activeSkills={activeSkills}
        isSaving={isSaving}
        formError={formError}
        onSave={saveGoalDraft}
        onClose={closeEdit}
        title="แก้ไขร่าง Goal"
        submitLabel="บันทึกร่าง"
      />
    </div>
  );
}
