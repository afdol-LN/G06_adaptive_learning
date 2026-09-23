import dagre from "dagre";
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { GoalWorkspace, WorkspaceSkill } from "../../../../../../models/goalModel";

// ขนาดต้องตรงกับ .ad-ws-node / .ad-ws-goal-node ใน Adminhome.css ไม่งั้นเส้นจะไม่ตรงกลางกล่อง
export const SKILL_NODE_WIDTH = 200;
export const SKILL_NODE_HEIGHT = 76;
export const GOAL_NODE_WIDTH = 220;
export const GOAL_NODE_HEIGHT = 64;
export const GOAL_NODE_ID = "goal";

export type SkillNodeData = { skill: WorkspaceSkill; min: number; isSelected: boolean };
export type GoalNodeData = { name: string; requiredCount: number; isSelected: boolean };
export type SkillFlowNode = Node<SkillNodeData, "skill">;
export type GoalFlowNode = Node<GoalNodeData, "goal">;

const makeEdge = (source: string, target: string): Edge => ({
  id: `${source}->${target}`,
  source,
  target,
  type: "smoothstep",
  // สีหัวลูกศร/เส้นมาจาก CSS (.ad-ws-flow) — ไม่ส่ง color เป็นค่าคงที่ที่ใช้ได้แค่ธีมเดียว
  markerEnd: { type: MarkerType.ArrowClosed },
});

/**
 * dagre คำนวณตำแหน่ง (React Flow ไม่มี auto-layout) แล้วแปลงเป็น nodes/edges ของ React Flow
 * tree จบที่ goal node เหมือนที่นักศึกษาเห็น (ADR 0005): เส้นเข้า goal มาจากปลาย tree เท่านั้น
 */
export function layoutWorkspaceTree(
  workspace: GoalWorkspace,
  selectedSkillId: number | null,
  isGoalSelected: boolean,
): { nodes: (SkillFlowNode | GoalFlowNode)[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 36, ranksep: 64, marginx: 16, marginy: 16 });
  g.setDefaultEdgeLabel(() => ({}));

  const closureIds = new Set(workspace.skills.map((s) => s.skillId));
  const edges: Edge[] = [];
  const hasDependents = new Set<number>();

  workspace.skills.forEach((s) => {
    g.setNode(String(s.skillId), { width: SKILL_NODE_WIDTH, height: SKILL_NODE_HEIGHT });
  });
  g.setNode(GOAL_NODE_ID, { width: GOAL_NODE_WIDTH, height: GOAL_NODE_HEIGHT });

  workspace.skills.forEach((s) => {
    s.prerequisiteSkillIds.forEach((p) => {
      if (!closureIds.has(p)) return;
      hasDependents.add(p);
      g.setEdge(String(p), String(s.skillId));
      edges.push(makeEdge(String(p), String(s.skillId)));
    });
  });

  workspace.skills
    .filter((s) => !hasDependents.has(s.skillId))
    .forEach((s) => {
      g.setEdge(String(s.skillId), GOAL_NODE_ID);
      edges.push(makeEdge(String(s.skillId), GOAL_NODE_ID));
    });

  dagre.layout(g);

  // dagre ให้จุดกึ่งกลาง ส่วน React Flow ใช้มุมซ้ายบน
  const topLeft = (id: string, width: number, height: number) => {
    const n = g.node(id);
    return { x: n.x - width / 2, y: n.y - height / 2 };
  };

  const skillNodes: SkillFlowNode[] = workspace.skills.map((s) => ({
    id: String(s.skillId),
    type: "skill",
    position: topLeft(String(s.skillId), SKILL_NODE_WIDTH, SKILL_NODE_HEIGHT),
    data: {
      skill: s,
      min: workspace.minExercisesPerSkill,
      isSelected: s.skillId === selectedSkillId,
    },
  }));

  const goalNode: GoalFlowNode = {
    id: GOAL_NODE_ID,
    type: "goal",
    position: topLeft(GOAL_NODE_ID, GOAL_NODE_WIDTH, GOAL_NODE_HEIGHT),
    data: {
      name: workspace.goal.goal,
      requiredCount: workspace.skills.filter((s) => s.required).length,
      isSelected: isGoalSelected,
    },
  };

  return { nodes: [...skillNodes, goalNode], edges };
}
