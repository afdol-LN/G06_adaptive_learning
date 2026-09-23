import { useState } from "react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { GoalWorkspace, WorkspaceSkill } from "../../../../../../models/goalModel";
import { AiDraft, ExerciseDraftPayload } from "../../../../../../models/aiDraftModel";
import { missingDraftCount } from "../../utils/draftCount";
import { draftToExercise } from "../../utils/exerciseDraft.mapper";
import { truncate } from "../../utils/text";

export interface DraftListProps {
  workspace: GoalWorkspace;
  skill: WorkspaceSkill;
  drafts: AiDraft[];
  isBusy: boolean;
  isGenerating: boolean;
  generateMessage: string | null;
  busyDraftId: number | null;
  onGenerate: () => void;
  onApprove: (draftId: number) => void;
  onEdit: (draft: AiDraft) => void;
  onReject: (draftId: number) => void;
}

/** ร่างไม่นับเป็นข้อจนกว่าจะอนุมัติ — ค้างไว้ได้ ไม่ขวางการ publish goal */
export function draftListController({
  workspace,
  skill,
  drafts,
  isBusy,
  isGenerating,
  generateMessage,
  busyDraftId,
  onGenerate,
  onApprove,
  onEdit,
  onReject,
}: DraftListProps) {
  const { t } = usePreferences();
  // ร่างที่เปิดดูรายละเอียดอยู่ — เก็บเป็น id เพื่อให้ modal แสดงข้อมูลล่าสุดหลังแก้/โหลดใหม่
  const [viewingDraftId, setViewingDraftId] = useState<number | null>(null);
  const viewingDraft = drafts.find((draft) => draft.id === viewingDraftId) ?? null;

  const rows = drafts.map((draft) => {
    const payload = draft.payload as ExerciseDraftPayload;
    return {
      id: draft.id,
      preview: truncate(payload.description),
      levelLabel: t("admin.common.level", { n: payload.skillLevel }),
      type: payload.type,
      isDisabled: isBusy || busyDraftId === draft.id,
      handleView: () => setViewingDraftId(draft.id),
      handleApprove: () => onApprove(draft.id),
      handleEdit: () => onEdit(draft),
      handleReject: () => onReject(draft.id),
    };
  });

  return {
    generateLabel: isGenerating
      ? t("admin.workspace.panel.ai.generating")
      : t("admin.workspace.panel.ai.generate", { count: missingDraftCount(workspace, skill) }),
    isGenerateDisabled: isBusy || isGenerating,
    generateMessage,
    isEmpty: drafts.length === 0,
    rows,
    handleGenerate: onGenerate,
    viewing: viewingDraft
      ? {
          exercise: draftToExercise(viewingDraft),
          skillName: skill.skillsName,
          handleClose: () => setViewingDraftId(null),
          handleEdit: () => {
            setViewingDraftId(null);
            onEdit(viewingDraft);
          },
        }
      : null,
  };
}
