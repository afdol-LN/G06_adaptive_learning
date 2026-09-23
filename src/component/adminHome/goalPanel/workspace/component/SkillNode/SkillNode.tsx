import { Handle, Position, type NodeProps } from "@xyflow/react";
import { usePreferences } from "../../../../../../context/PreferencesContext";
import type { SkillFlowNode } from "../WorkspaceTree/treeLayout";
import { skillNodeController } from "./skillNode.controller";

// node ของ React Flow เป็น HTML <div> — สีมาจาก class ใน Adminhome.css (มีค่าทั้งธีมสว่าง/มืด)
export default function SkillNode({ data }: NodeProps<SkillFlowNode>) {
  const { t } = usePreferences();
  const view = skillNodeController(data);

  return (
    <div className={view.className}>
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <div className="ad-ws-node-name" title={view.name}>
        {view.name}
      </div>
      <div className="ad-ws-node-sub">{view.subtitle}</div>
      {view.showTags && (
        <div className="ad-ws-node-tags">
          {view.isPulledIn && <span className="ad-ws-tag">{t("admin.workspace.node.prereq")}</span>}
          {view.isInactive && (
            <span className="ad-ws-tag ad-ws-tag--off">{t("admin.status.inactive")}</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
    </div>
  );
}
