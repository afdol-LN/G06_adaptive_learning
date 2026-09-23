import { Background, Controls, ReactFlow } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import SkillNode from "../SkillNode/SkillNode";
import GoalNode from "../GoalNode/GoalNode";
import { WorkspaceTreeProps, workspaceTreeController } from "./workspaceTree.controller";

// ประกาศนอก component ให้ reference คงที่ ไม่งั้น React Flow re-mount node ทุก render
const nodeTypes = { skill: SkillNode, goal: GoalNode };

export default function WorkspaceTree(props: WorkspaceTreeProps) {
  const { t } = usePreferences();
  const view = workspaceTreeController(props);

  if (view.isEmpty) {
    return <div className="ad-ws-tree-empty ad-muted">{t("admin.workspace.tree.empty")}</div>;
  }

  return (
    // .ad-ws-flow กำหนดความสูง — React Flow สูง 0px ถ้า container ไม่มีความสูง
    <div className="ad-ws-flow">
      <ReactFlow
        key={view.flowKey}
        nodes={view.nodes}
        edges={view.edges}
        nodeTypes={nodeTypes}
        colorMode={view.colorMode}
        fitView
        minZoom={0.3}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        onNodeClick={view.handleNodeClick}
      >
        <Background />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
