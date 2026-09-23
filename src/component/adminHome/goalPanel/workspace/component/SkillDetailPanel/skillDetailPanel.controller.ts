import type { ChangeEvent } from "react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { GoalWorkspace, WorkspaceSkill } from "../../../../../../models/goalModel";
import { Skill } from "../../../../../../models/skillModel";
import { Exercise } from "../../../../../../models/exerciseModel";
import { AiDraft } from "../../../../../../models/aiDraftModel";
import type { PrerequisiteEditorProps } from "../PrerequisiteEditor/prerequisiteEditor.controller";
import type { ExerciseListProps } from "../ExerciseList/exerciseList.controller";
import type { DraftListProps } from "../DraftList/draftList.controller";

/** levelRequire เป็น Bloom 1-6 (ต่างจาก exercise.skillLevel ที่มีแค่ 1-5) */
const BLOOM_LEVELS = [1, 2, 3, 4, 5, 6];

export interface SkillDetailPanelProps {
  workspace: GoalWorkspace;
  skill: WorkspaceSkill | null;
  allSkills: Skill[];
  exercises: Exercise[];
  drafts: AiDraft[];
  isBusy: boolean;
  isGenerating: boolean;
  error: string | null;
  generateMessage: string | null;
  busyDraftId: number | null;
  onMakeRequired: (skillId: number) => void;
  onRemoveRequired: (skill: WorkspaceSkill) => void;
  onSetLevel: (skillId: number, level: number | null) => void;
  onSavePrerequisites: (skillId: number, prerequisiteIds: number[]) => Promise<boolean>;
  onAddExercise: () => void;
  onEditExercise: (exercise: Exercise) => void;
  onViewExercise: (exercise: Exercise) => void;
  onToggleExerciseStatus: (exercise: Exercise) => void;
  togglingExerciseId: number | null;
  onGenerate: () => void;
  onApproveDraft: (draftId: number) => void;
  onEditDraft: (draft: AiDraft) => void;
  onRejectDraft: (draftId: number) => void;
}

/** คืน null เมื่อยังไม่ได้เลือก skill — UI แสดงข้อความว่าง */
export function skillDetailPanelController(props: SkillDetailPanelProps) {
  const { t } = usePreferences();
  const { workspace, skill } = props;
  if (!skill) return null;

  const isActive = skill.status === "active";
  const dependentNames = workspace.skills
    .filter((s) => s.prerequisiteSkillIds.includes(skill.skillId))
    .map((s) => s.skillsName)
    .join(", ");

  const prerequisiteEditor: PrerequisiteEditorProps = {
    skill,
    allSkills: props.allSkills,
    isBusy: props.isBusy,
    onSave: props.onSavePrerequisites,
  };

  const exerciseList: ExerciseListProps = {
    exercises: props.exercises,
    minExercises: workspace.minExercisesPerSkill,
    isBusy: props.isBusy,
    onAdd: props.onAddExercise,
    onEdit: props.onEditExercise,
    onView: props.onViewExercise,
    onToggleStatus: props.onToggleExerciseStatus,
    togglingId: props.togglingExerciseId,
  };

  const draftList: DraftListProps = {
    workspace,
    skill,
    drafts: props.drafts,
    isBusy: props.isBusy,
    isGenerating: props.isGenerating,
    generateMessage: props.generateMessage,
    busyDraftId: props.busyDraftId,
    onGenerate: props.onGenerate,
    onApprove: props.onApproveDraft,
    onEdit: props.onEditDraft,
    onReject: props.onRejectDraft,
  };

  return {
    skillId: skill.skillId,
    name: skill.skillsName,
    code: skill.skillCode,
    tier: skill.tier,
    statusClass: isActive ? "ad-ws-tag" : "ad-ws-tag ad-ws-tag--off",
    statusLabel: isActive ? t("admin.status.active") : t("admin.status.inactive"),
    usedInLabel: t("admin.workspace.panel.usedIn", { count: skill.goalCount }),
    sharedWarning:
      skill.goalCount > 1
        ? t("admin.workspace.panel.sharedWarn", { count: skill.goalCount - 1 })
        : null,
    error: props.error,
    isBusy: props.isBusy,

    isRequired: skill.required,
    pulledInText: t("admin.workspace.panel.pulledIn", { children: dependentNames }),
    levelValue: skill.levelRequire ?? "",
    levelOptions: BLOOM_LEVELS.map((level) => ({
      value: level,
      label: t("admin.common.level", { n: level }),
    })),

    handleLevelChange: (e: ChangeEvent<HTMLSelectElement>) =>
      props.onSetLevel(skill.skillId, e.target.value === "" ? null : Number(e.target.value)),
    handleRemoveRequired: () => props.onRemoveRequired(skill),
    handleMakeRequired: () => props.onMakeRequired(skill.skillId),

    prerequisiteEditor,
    exerciseList,
    draftList,
  };
}
