import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { GoalWorkspace, WorkspaceSkill } from "../../../../../../models/goalModel";
import { drawnPrerequisiteEdgeKeys } from "../../../../../../utils/prerequisiteEdges";
import {
  NODE_H,
  NODE_W,
  layoutGoalPosition,
  layoutTreePositions,
  type TreeLayoutInput,
  type TreePoint,
} from "../../../../../../utils/skillTreeLayout";

// ขนาดต้องตรงกับ .ad-ws-node / .ad-ws-goal-node ใน Adminhome.css ไม่งั้นเส้นจะไม่ตรงกลางกล่อง
// ใช้ขนาดเดียวกับ skill tree ฝั่งนักศึกษา ตำแหน่งที่ได้จาก layout จึงเหมือนกันทุกจุด
export const SKILL_NODE_WIDTH = NODE_W;
export const SKILL_NODE_HEIGHT = NODE_H;
export const GOAL_NODE_WIDTH = NODE_W;
export const GOAL_NODE_HEIGHT = NODE_H;
export const GOAL_NODE_ID = "goal";

export type SkillNodeData = { skill: WorkspaceSkill; min: number; isSelected: boolean };
export type GoalNodeData = { name: string; requiredCount: number; isSelected: boolean };
export type SkillFlowNode = Node<SkillNodeData, "skill">;
export type GoalFlowNode = Node<GoalNodeData, "goal">;

const makeEdge = (source: string, target: string): Edge => ({
  id: `${source}->${target}`,
  source,
  target,
  // เส้นหักมุมฉากลงกลางระหว่างแถว แบบเดียวกับ SkillTreeSVG
  type: "step",
  // สีหัวลูกศร/เส้นมาจาก CSS (.ad-ws-flow) — ไม่ส่ง color เป็นค่าคงที่ที่ใช้ได้แค่ธีมเดียว
  markerEnd: { type: MarkerType.ArrowClosed },
});

// layout ให้จุดกึ่งกลาง ส่วน React Flow ใช้มุมซ้ายบน
const topLeft = (p: TreePoint | undefined) => ({
  x: (p?.x ?? 0) - NODE_W / 2,
  y: (p?.y ?? 0) - NODE_H / 2,
});

/**
 * ตำแหน่งมาจาก layoutTreePositions ตัวเดียวกับ skill tree ของนักศึกษา แล้วแปลงเป็น nodes/edges ของ React Flow
 * tree จบที่ goal node เหมือนที่นักศึกษาเห็น (ADR 0005): เส้นเข้า goal มาจากปลาย tree เท่านั้น
 */
export function layoutWorkspaceTree(
  workspace: GoalWorkspace,
  selectedSkillId: number | null,
  isGoalSelected: boolean,
): { nodes: (SkillFlowNode | GoalFlowNode)[]; edges: Edge[] } {
  const input: TreeLayoutInput[] = workspace.skills.map((s) => ({
    id: s.skillId,
    prerequisiteIds: s.prerequisiteSkillIds,
  }));
  const positions = layoutTreePositions(input);
  const goalPosition = layoutGoalPosition(input, positions);

  const closureIds = new Set(workspace.skills.map((s) => s.skillId));
  const edges: Edge[] = [];

  // เส้น A→C ที่มีทาง A→B→C อยู่แล้วไม่วาด — ตรงกับ skill tree ฝั่งนักศึกษา;
  // แผงด้านข้างยังแสดง prerequisite ครบทุกตัว
  const drawn = drawnPrerequisiteEdgeKeys(input);

  workspace.skills.forEach((s) => {
    s.prerequisiteSkillIds.forEach((p) => {
      if (!closureIds.has(p) || !drawn.has(`${p}-${s.skillId}`)) return;
      edges.push(makeEdge(String(p), String(s.skillId)));
    });
  });

  (goalPosition?.fromIds ?? []).forEach((id) => {
    edges.push(makeEdge(String(id), GOAL_NODE_ID));
  });

  const skillNodes: SkillFlowNode[] = workspace.skills.map((s) => ({
    id: String(s.skillId),
    type: "skill",
    position: topLeft(positions.get(s.skillId)),
    data: {
      skill: s,
      min: workspace.minExercisesPerSkill,
      isSelected: s.skillId === selectedSkillId,
    },
  }));

  const goalNode: GoalFlowNode = {
    id: GOAL_NODE_ID,
    type: "goal",
    position: topLeft(goalPosition ?? undefined),
    data: {
      name: workspace.goal.goal,
      requiredCount: workspace.skills.filter((s) => s.required).length,
      isSelected: isGoalSelected,
    },
  };

  return { nodes: [...skillNodes, goalNode], edges };
}
