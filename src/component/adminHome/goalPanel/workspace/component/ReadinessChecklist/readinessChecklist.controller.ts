import { usePreferences } from "../../../../../../context/PreferencesContext";
import type { TKey } from "../../../../../../i18n";
import { GoalWorkspace, ReadinessRule } from "../../../../../../models/goalModel";
import { PublishMessage } from "../../workspace.types";

const RULE_KEY: Record<ReadinessRule, TKey> = {
  HAS_REQUIRED_SKILL: "admin.workspace.rule.HAS_REQUIRED_SKILL",
  MIN_EXERCISES: "admin.workspace.rule.MIN_EXERCISES",
  LEVEL_COVERAGE: "admin.workspace.rule.LEVEL_COVERAGE",
  NO_PREREQ_CYCLE: "admin.workspace.rule.NO_PREREQ_CYCLE",
};

export interface ReadinessChecklistProps {
  workspace: GoalWorkspace;
  message: PublishMessage | null;
  isBusy: boolean;
  onSelectSkill: (skillId: number) => void;
  onPublish: () => void;
}

/** แสดงผลตรวจจาก backend ตรง ๆ — ไม่คำนวณ readiness ซ้ำที่ frontend */
export function readinessChecklistController({
  workspace,
  message,
  isBusy,
  onSelectSkill,
  onPublish,
}: ReadinessChecklistProps) {
  const { t } = usePreferences();
  const nameOf = new Map(workspace.skills.map((s) => [s.skillId, s.skillsName]));

  const rows = workspace.readiness.checks.map((check) => ({
    rule: check.rule,
    passed: check.passed,
    className: `ad-ws-rule ${check.passed ? "is-pass" : "is-fail"}`,
    label: t(RULE_KEY[check.rule], { min: workspace.minExercisesPerSkill }),
    failingSkills: check.passed
      ? []
      : check.skillIds.map((id) => ({
          id,
          name: nameOf.get(id) ?? `#${id}`,
          handleClick: () => onSelectSkill(id),
        })),
  }));

  const isActive = workspace.goal.status === "active";
  const hasInactiveSkill = workspace.skills.some((s) => s.status !== "active");

  return {
    rows,
    message,
    messageClass: message?.kind === "ok" ? "ad-ws-msg-ok" : "ad-inline-error",
    // goal เปิดแล้วและ skill ครบ active = ไม่มีอะไรให้ publish
    needsPublish: !isActive || hasInactiveSkill,
    publishLabel: isActive
      ? t("admin.workspace.publish.skills")
      : t("admin.workspace.publish.goal"),
    isBusy,
    handlePublish: onPublish,
  };
}
