import { usePreferences } from "../../../../../../context/PreferencesContext";
import type { SkillNodeData } from "../WorkspaceTree/treeLayout";

export function skillNodeController({ skill, min, isSelected }: SkillNodeData) {
  const { t } = usePreferences();

  const isPulledIn = !skill.required;
  const isInactive = skill.status !== "active";

  const className = [
    "ad-ws-node",
    isPulledIn ? "ad-ws-node--pulled" : "",
    isInactive ? "ad-ws-node--inactive" : "",
    isSelected ? "is-selected" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const countText = t("admin.workspace.node.count", { count: skill.activeExerciseCount, min });
  const draftText =
    skill.pendingDraftCount > 0
      ? ` · ${t("admin.workspace.node.drafts", { n: skill.pendingDraftCount })}`
      : "";

  return {
    className,
    name: skill.skillsName,
    subtitle: `${countText}${draftText}`,
    isPulledIn,
    isInactive,
    showTags: isPulledIn || isInactive,
  };
}
