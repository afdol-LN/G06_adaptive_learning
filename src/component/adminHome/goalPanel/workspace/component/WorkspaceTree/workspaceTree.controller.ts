import { useMemo } from "react";
import type { NodeMouseHandler } from "@xyflow/react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import { GoalWorkspace } from "../../../../../../models/goalModel";
import { GOAL_NODE_ID, layoutWorkspaceTree } from "./treeLayout";

export interface WorkspaceTreeProps {
  workspace: GoalWorkspace;
  selectedSkillId: number | null;
  isGoalSelected: boolean;
  onSelectSkill: (skillId: number) => void;
  onSelectGoal: () => void;
}

export function workspaceTreeController({
  workspace,
  selectedSkillId,
  isGoalSelected,
  onSelectSkill,
  onSelectGoal,
}: WorkspaceTreeProps) {
  const { theme } = usePreferences();

  const { nodes, edges } = useMemo(
    () => layoutWorkspaceTree(workspace, selectedSkillId, isGoalSelected),
    [workspace, selectedSkillId, isGoalSelected],
  );

  // goal node → แผงรายการ skill ของ goal, skill node → แผงของ skill นั้น
  const handleNodeClick: NodeMouseHandler = (_, node) => {
    if (node.id === GOAL_NODE_ID) onSelectGoal();
    else onSelectSkill(Number(node.id));
  };

  return {
    isEmpty: workspace.skills.length === 0,
    nodes,
    edges,
    // จำนวน skill เปลี่ยน = mount ใหม่ให้ fitView จัดมุมมองใหม่
    flowKey: workspace.skills.length,
    // React Flow v12 มี colorMode ของตัวเอง — ให้ตามธีมของแอป
    colorMode: theme,
    handleNodeClick,
  };
}
