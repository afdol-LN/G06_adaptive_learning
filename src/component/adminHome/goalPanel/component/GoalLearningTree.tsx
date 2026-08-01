import dagre from "dagre";
import { GoalSkillRequireEntry } from "../../../../models/goalModel";

interface TreeNode {
  skillId: number;
  name: string;
  level: number | null;
  x: number;
  y: number;
}

interface TreeEdge {
  fromSkillId: number;
  toSkillId: number;
  points: { x: number; y: number }[];
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;

function layoutTree(requires: GoalSkillRequireEntry[]): {
  nodes: TreeNode[];
  edges: TreeEdge[];
  width: number;
  height: number;
} {
  const requiredIds = new Set(requires.map((r) => r.skillId));

  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 32, ranksep: 56, marginx: 10, marginy: 10 });
  g.setDefaultEdgeLabel(() => ({}));

  requires.forEach((r) => {
    g.setNode(String(r.skillId), { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  requires.forEach((r) => {
    (r.skill?.skillPrequisite || []).forEach((p) => {
      if (requiredIds.has(p.prerequisiteSkillId)) {
        g.setEdge(String(p.prerequisiteSkillId), String(r.skillId));
      }
    });
  });

  dagre.layout(g);

  const nodes: TreeNode[] = requires.map((r) => {
    const n = g.node(String(r.skillId));
    return {
      skillId: r.skillId,
      name: r.skill?.skillsName || `#${r.skillId}`,
      level: r.levelRequire,
      x: n.x,
      y: n.y,
    };
  });

  const edges: TreeEdge[] = g.edges().map((e) => {
    const edge = g.edge(e);
    return {
      fromSkillId: Number(e.v),
      toSkillId: Number(e.w),
      points: edge.points,
    };
  });

  const graph = g.graph();
  return { nodes, edges, width: graph.width ?? 0, height: graph.height ?? 0 };
}

export default function GoalLearningTree({ requires }: { requires: GoalSkillRequireEntry[] }) {
  if (requires.length === 0) {
    return <span className="ad-muted">— ยังไม่มี Skill ที่ต้องใช้ —</span>;
  }

  const { nodes, edges, width, height } = layoutTree(requires);

  return (
    <svg className="ad-goal-tree" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <marker id="goal-tree-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
        </marker>
      </defs>
      {edges.map((e, i) => (
        <polyline
          key={`${e.fromSkillId}-${e.toSkillId}-${i}`}
          points={e.points.map((p) => `${p.x},${p.y}`).join(" ")}
          fill="none"
          stroke="#94a3b8"
          strokeWidth={2}
          markerEnd="url(#goal-tree-arrow)"
        />
      ))}
      {nodes.map((n) => (
        <g key={n.skillId} transform={`translate(${n.x - NODE_WIDTH / 2}, ${n.y - NODE_HEIGHT / 2})`}>
          <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={8} fill="#eff6ff" stroke="#93c5fd" />
          <text x={12} y={22} fontSize={13} fontWeight={700} fill="#0f172a">
            {n.name}
          </text>
          <text x={12} y={40} fontSize={12} fill="#475569">
            {n.level != null ? `level ${n.level}` : "ไม่ระบุ level"}
          </text>
        </g>
      ))}
    </svg>
  );
}
