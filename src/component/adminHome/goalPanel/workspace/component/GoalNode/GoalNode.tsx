import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FaFlagCheckered } from "react-icons/fa6";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import type { GoalFlowNode } from "../WorkspaceTree/treeLayout";

/** ปลายทางของ tree — คลิกแล้วเปิดแผงของ goal (จัดการใน workspaceTree.controller) */
export default function GoalNode({ data }: NodeProps<GoalFlowNode>) {
  const { t } = usePreferences();
  return (
    <div className={`ad-ws-goal-node${data.isSelected ? " is-selected" : ""}`}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <FaFlagCheckered aria-hidden />
      <div className="ad-ws-goal-text">
        <div className="ad-ws-node-name" title={data.name}>
          {data.name}
        </div>
        <div className="ad-ws-node-sub">
          {t("admin.workspace.node.goalSub", { count: data.requiredCount })}
        </div>
      </div>
    </div>
  );
}
