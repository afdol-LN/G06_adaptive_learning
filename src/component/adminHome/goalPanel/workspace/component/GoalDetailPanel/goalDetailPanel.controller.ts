import { usePreferences } from "../../../../../../context/PreferencesContext";
import { GoalWorkspace, WorkspaceSkill } from "../../../../../../models/goalModel";
import type { AddSkillBoxProps } from "../AddSkillBox/addSkillBox.controller";

export interface GoalDetailPanelProps {
  workspace: GoalWorkspace;
  addSkillBox: AddSkillBoxProps;
  isBusy: boolean;
  error: string | null;
  onSelectSkill: (skillId: number) => void;
  onRemoveRequired: (skill: WorkspaceSkill) => void;
  onEditGoal: () => void;
}

/** แผงของ goal node — รายการ skill ที่นักศึกษาต้องเรียน + เพิ่ม/ถอด required skill */
export function goalDetailPanelController({
  workspace,
  addSkillBox,
  isBusy,
  error,
  onSelectSkill,
  onRemoveRequired,
  onEditGoal,
}: GoalDetailPanelProps) {
  const { t } = usePreferences();
  const { goal, skills, minExercisesPerSkill } = workspace;
  const isActive = goal.status === "active";

  const metaOf = (skill: WorkspaceSkill) =>
    [
      skill.skillCode,
      t("admin.workspace.node.count", { count: skill.activeExerciseCount, min: minExercisesPerSkill }),
    ].join(" · ");

  const required = skills.filter((s) => s.required);
  const pulled = skills.filter((s) => !s.required);

  const requiredRows = required.map((skill) => ({
    skillId: skill.skillId,
    name: skill.skillsName,
    meta: metaOf(skill),
    levelLabel:
      skill.levelRequire != null ? t("admin.common.level", { n: skill.levelRequire }) : null,
    isInactive: skill.status !== "active",
    removeLabel: t("admin.workspace.goalPanel.removeAria", { name: skill.skillsName }),
    handleOpen: () => onSelectSkill(skill.skillId),
    handleRemove: () => onRemoveRequired(skill),
  }));

  // prerequisite ที่ถูกดึงเข้ามา — บอกว่าเป็นพื้นฐานของ skill ไหน (ถอดตรงนี้ไม่ได้ ต้องแก้ prerequisite)
  const pulledRows = pulled.map((skill) => ({
    skillId: skill.skillId,
    name: skill.skillsName,
    meta: metaOf(skill),
    foundationOf: t("admin.workspace.goalPanel.foundationOf", {
      names: skills
        .filter((s) => s.prerequisiteSkillIds.includes(skill.skillId))
        .map((s) => s.skillsName)
        .join(", "),
    }),
    isInactive: skill.status !== "active",
    handleOpen: () => onSelectSkill(skill.skillId),
  }));

  return {
    name: goal.goal,
    description: goal.goalDescription,
    statusClass: `ad-ws-status ad-ws-status--${isActive ? "active" : "draft"}`,
    statusLabel: isActive ? t("admin.workspace.status.active") : t("admin.workspace.status.draft"),
    summary: t("admin.workspace.goalPanel.summary", {
      total: skills.length,
      required: required.length,
      pulled: pulled.length,
    }),
    error,
    isBusy,
    handleEdit: onEditGoal,
    addSkillBox,
    requiredTitle: t("admin.workspace.goalPanel.required.title", { count: required.length }),
    requiredRows,
    pulledTitle: t("admin.workspace.goalPanel.pulled.title", { count: pulled.length }),
    pulledRows,
    showPulled: pulled.length > 0,
  };
}
