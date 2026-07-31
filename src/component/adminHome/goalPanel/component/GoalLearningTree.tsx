import { GoalSkillRequireEntry } from "../../../../models/goalModel";

interface TreeNode {
  skillId: number;
  name: string;
  level: number | null;
  depth: number;
}

interface TreeEdge {
  fromSkillId: number;
  toSkillId: number;
}

function buildTree(requires: GoalSkillRequireEntry[]): { nodes: TreeNode[]; edges: TreeEdge[] } {
  const requiredIds = new Set(requires.map((r) => r.skillId));
  const edges: TreeEdge[] = [];
  requires.forEach((r) => {
    (r.skill?.skillPrequisite || []).forEach((p) => {
      if (requiredIds.has(p.prerequisiteSkillId)) {
        edges.push({ fromSkillId: p.prerequisiteSkillId, toSkillId: r.skillId });
      }
    });
  });

  const outgoing = new Map<number, number[]>();
  const remaining = new Map<number, number>();
  requires.forEach((r) => remaining.set(r.skillId, 0));
  edges.forEach((e) => {
    outgoing.set(e.fromSkillId, [...(outgoing.get(e.fromSkillId) || []), e.toSkillId]);
    remaining.set(e.toSkillId, (remaining.get(e.toSkillId) || 0) + 1);
  });

  const depth = new Map<number, number>();
  let queue: number[] = [];
  requires.forEach((r) => {
    if ((remaining.get(r.skillId) || 0) === 0) {
      depth.set(r.skillId, 0);
      queue.push(r.skillId);
    }
  });

  while (queue.length > 0) {
    const next: number[] = [];
    queue.forEach((current) => {
      const currentDepth = depth.get(current) || 0;
      (outgoing.get(current) || []).forEach((child) => {
        depth.set(child, Math.max(depth.get(child) ?? 0, currentDepth + 1));
        remaining.set(child, (remaining.get(child) || 0) - 1);
        if (remaining.get(child) === 0) {
          next.push(child);
        }
      });
    });
    queue = next;
  }

  requires.forEach((r) => {
    if (!depth.has(r.skillId)) depth.set(r.skillId, 0);
  });

  const nodes: TreeNode[] = requires.map((r) => ({
    skillId: r.skillId,
    name: r.skill?.skillsName || `#${r.skillId}`,
    level: r.levelRequire,
    depth: depth.get(r.skillId) || 0,
  }));

  return { nodes, edges };
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 56;
const COLUMN_GAP = 80;
const ROW_GAP = 24;

export default function GoalLearningTree({ requires }: { requires: GoalSkillRequireEntry[] }) {
  const { nodes, edges } = buildTree(requires);

  if (nodes.length === 0) {
    return <span className="ad-muted">— ยังไม่มี Skill ที่ต้องใช้ —</span>;
  }

  const columns = new Map<number, TreeNode[]>();
  nodes.forEach((n) => {
    const col = columns.get(n.depth) || [];
    col.push(n);
    columns.set(n.depth, col);
  });

  const positions = new Map<number, { x: number; y: number }>();
  const maxDepth = Math.max(...nodes.map((n) => n.depth));
  for (let d = 0; d <= maxDepth; d++) {
    const col = columns.get(d) || [];
    col.forEach((n, i) => {
      positions.set(n.skillId, {
        x: d * (NODE_WIDTH + COLUMN_GAP),
        y: i * (NODE_HEIGHT + ROW_GAP),
      });
    });
  }

  const maxRows = Math.max(...Array.from(columns.values()).map((c) => c.length));
  const width = (maxDepth + 1) * (NODE_WIDTH + COLUMN_GAP) - COLUMN_GAP + 20;
  const height = maxRows * (NODE_HEIGHT + ROW_GAP) - ROW_GAP + 20;

  return (
    <svg className="ad-goal-tree" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <marker id="goal-tree-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const from = positions.get(e.fromSkillId);
        const to = positions.get(e.toSkillId);
        if (!from || !to) return null;
        return (
          <line
            key={`${e.fromSkillId}-${e.toSkillId}-${i}`}
            x1={from.x + NODE_WIDTH}
            y1={from.y + NODE_HEIGHT / 2}
            x2={to.x}
            y2={to.y + NODE_HEIGHT / 2}
            stroke="#94a3b8"
            strokeWidth={2}
            markerEnd="url(#goal-tree-arrow)"
          />
        );
      })}
      {nodes.map((n) => {
        const pos = positions.get(n.skillId)!;
        return (
          <g key={n.skillId} transform={`translate(${pos.x}, ${pos.y})`}>
            <rect width={NODE_WIDTH} height={NODE_HEIGHT} rx={8} fill="#eff6ff" stroke="#93c5fd" />
            <text x={12} y={22} fontSize={13} fontWeight={700} fill="#0f172a">
              {n.name}
            </text>
            <text x={12} y={40} fontSize={12} fill="#475569">
              {n.level != null ? `level ${n.level}` : "ไม่ระบุ level"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
