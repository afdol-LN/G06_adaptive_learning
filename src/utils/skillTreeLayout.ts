// Skill tree layout — shared by the student skill tree (SkillTreeSVG) and the admin goal workspace (React Flow),
// so both screens place every node in the same spot. Positions are node centres.

export const NODE_W = 260;
export const NODE_H = 120;
const ROW_GAP = 130;
const COL_GAP = 50;

export interface TreeLayoutInput {
  id: number;
  prerequisiteIds: number[];
}

export interface TreePoint {
  x: number;
  y: number;
}

// Ends of the tree: skills that no other skill in this tree lists as a prerequisite
export function treeEndIds(nodes: TreeLayoutInput[]): number[] {
  const builtOn = new Set(nodes.flatMap((n) => n.prerequisiteIds));
  return nodes.filter((n) => !builtOn.has(n.id)).map((n) => n.id);
}

export function layoutTreePositions(nodes: TreeLayoutInput[]): Map<number, TreePoint> {
  const byId = Object.fromEntries(nodes.map(n => [n.id, n]));

  const depth: Record<number, number> = {};
  const visiting = new Set<number>();
  function getDepth(id: number): number {
    if (depth[id] !== undefined) return depth[id];
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const node = byId[id];
    if (!node) { visiting.delete(id); return depth[id] = 0; }
    const reqs = node.prerequisiteIds;
    if (reqs.length === 0) { visiting.delete(id); return depth[id] = 0; }
    const d = 1 + Math.max(...reqs.map(r => byId[r] ? getDepth(r) : 0));
    visiting.delete(id);
    return depth[id] = d;
  }
  nodes.forEach(n => getDepth(n.id));

  // Standalone skills (no prerequisite in this tree, nothing built on them) only connect to the goal node,
  // so they sit on the last skill row — a short edge to the goal instead of one running past the whole tree
  const maxDepth = Math.max(0, ...Object.values(depth));
  const builtOn = new Set(nodes.flatMap(n => n.prerequisiteIds));
  const standalone = new Set(
    nodes.filter(n => depth[n.id] === 0 && !builtOn.has(n.id)).map(n => n.id)
  );
  standalone.forEach(id => { depth[id] = maxDepth; });

  const layers: Record<number, number[]> = {};
  nodes.forEach(n => {
    const d = depth[n.id];
    (layers[d] = layers[d] || []).push(n.id);
  });

  const positions = new Map<number, TreePoint>();
  const sortedLayerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);

  sortedLayerKeys.forEach(d => {
    const ids = layers[d];
    if (d > 0) {
      ids.sort((a, b) => {
        const avgX = (id: number) => {
          const parents = (byId[id]?.prerequisiteIds || []).filter(p => positions.has(p));
          // standalone skills moved down here have no parent — keep them at the right end of the row
          if (!parents.length) return standalone.has(id) ? Number.MAX_SAFE_INTEGER : 0;
          return parents.reduce((s, p) => s + positions.get(p)!.x, 0) / parents.length;
        };
        return avgX(a) - avgX(b);
      });
    }
    // one gap for both the width and the step — they used to differ (70 vs 50), pushing every row off-centre
    const total = ids.length * NODE_W + (ids.length - 1) * COL_GAP;
    const startX = -total / 2 + NODE_W / 2;
    ids.forEach((id, i) => {
      positions.set(id, {
        x: startX + i * (NODE_W + COL_GAP),
        y: d * (NODE_H + ROW_GAP),
      });
    });
  });

  return positions;
}

// The goal node hangs one row below the deepest skill, joined only to the ends of the tree
// and centred under them (adt-learning/docs/adr/0005). null when the tree is empty.
export function layoutGoalPosition(
  nodes: TreeLayoutInput[],
  positions: Map<number, TreePoint>,
): (TreePoint & { fromIds: number[] }) | null {
  if (nodes.length === 0) return null;
  const pointOf = (id: number) => positions.get(id) ?? { x: 0, y: 0 };
  const fromIds = treeEndIds(nodes);
  const anchor = (fromIds.length > 0 ? fromIds : nodes.map((n) => n.id)).map(pointOf);
  return {
    fromIds,
    x: anchor.reduce((sum, p) => sum + p.x, 0) / anchor.length,
    y: Math.max(...nodes.map((n) => pointOf(n.id).y)) + NODE_H + ROW_GAP,
  };
}
