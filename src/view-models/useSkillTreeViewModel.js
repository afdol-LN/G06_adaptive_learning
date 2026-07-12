/**
 * @file useSkillTreeViewModel.js
 * @description ViewModel สำหรับ SkillTree จัดการ Graph Layout, Nodes, Edges, การเลือก Node และ Filtering
 */
import { useState, useMemo } from 'react';

export const G07_GOAL_SKILLS = new Set([
  'SK-007',
  'SK-008',
  'SK-014',
  'SK-019',
  'SK-029',
  'SK-030',
  'SK-031',
  'SK-032',
  'SK-033',
  'SK-034',
]);

export const SKILLS = {
  'SK-001': { name: 'Python Fundamentals', tier: 'T1', minReq: null },
  'SK-002': { name: 'Basic Input / Output', tier: 'T1', minReq: null },
  'SK-003': { name: 'Variables & Data Types', tier: 'T1', minReq: null },
  'SK-004': { name: 'Operators & Expressions', tier: 'T1', minReq: null },
  'SK-006': { name: 'Control Flow — Conditional', tier: 'T1', minReq: null },
  'SK-007': { name: 'Control Flow — Loops', tier: 'T1', minReq: 'D3' },
  'SK-008': { name: 'List', tier: 'T2', minReq: 'D3' },
  'SK-009': { name: 'Tuple', tier: 'T2', minReq: null },
  'SK-010': { name: 'Dictionary', tier: 'T2', minReq: null },
  'SK-012': { name: 'Functions — Basic', tier: 'T2', minReq: null },
  'SK-014': { name: 'Recursion', tier: 'T2', minReq: 'D2' },
  'SK-019': { name: 'OOP — Class & Object', tier: 'T3', minReq: 'D2' },
  'SK-021': { name: 'OOP — Inheritance', tier: 'T3', minReq: null },
  'SK-027': { name: 'Iterators & Protocols', tier: 'T3', minReq: null },
  'SK-029': { name: 'Sorting Algorithms', tier: 'T3', minReq: 'D3' },
  'SK-030': { name: 'Searching Algorithms', tier: 'T3', minReq: 'D3' },
  'SK-031': { name: 'Complexity (Big-O)', tier: 'T3', minReq: 'D2' },
  'SK-032': { name: 'Stack & Queue', tier: 'T3', minReq: 'D3' },
  'SK-033': { name: 'Linked List', tier: 'T3', minReq: 'D2' },
  'SK-034': { name: 'Tree & BST', tier: 'T3', minReq: 'D2' },
};

export const EDGES = [
  { from: 'SK-001', to: 'SK-002', lvl: 'D1' },
  { from: 'SK-001', to: 'SK-003', lvl: 'D1' },
  { from: 'SK-002', to: 'SK-003', lvl: 'D1' },
  { from: 'SK-003', to: 'SK-004', lvl: 'D1' },
  { from: 'SK-003', to: 'SK-012', lvl: 'D2' },
  { from: 'SK-003', to: 'SK-014', lvl: 'D2' },
  { from: 'SK-004', to: 'SK-006', lvl: 'D2' },
  { from: 'SK-004', to: 'SK-007', lvl: 'D2' },
  { from: 'SK-006', to: 'SK-007', lvl: 'D1' },
  { from: 'SK-006', to: 'SK-008', lvl: 'D2' },
  { from: 'SK-006', to: 'SK-019', lvl: 'D2' },
  { from: 'SK-007', to: 'SK-008', lvl: 'D2' },
  { from: 'SK-007', to: 'SK-012', lvl: 'D2' },
  { from: 'SK-007', to: 'SK-014', lvl: 'D2' },
  { from: 'SK-007', to: 'SK-029', lvl: 'D3' },
  { from: 'SK-008', to: 'SK-009', lvl: 'D2' },
  { from: 'SK-008', to: 'SK-010', lvl: 'D3' },
  { from: 'SK-008', to: 'SK-019', lvl: 'D2' },
  { from: 'SK-008', to: 'SK-021', lvl: 'D3' },
  { from: 'SK-009', to: 'SK-010', lvl: 'D2' },
  { from: 'SK-010', to: 'SK-027', lvl: 'D2' },
  { from: 'SK-010', to: 'SK-032', lvl: 'D3' },
  { from: 'SK-010', to: 'SK-034', lvl: 'D3' },
  { from: 'SK-012', to: 'SK-027', lvl: 'D3' },
  { from: 'SK-012', to: 'SK-029', lvl: 'D3' },
  { from: 'SK-012', to: 'SK-030', lvl: 'D3' },
  { from: 'SK-012', to: 'SK-034', lvl: 'D3' },
  { from: 'SK-014', to: 'SK-021', lvl: 'D2' },
  { from: 'SK-014', to: 'SK-033', lvl: 'D3' },
  { from: 'SK-021', to: 'SK-030', lvl: 'D2' },
  { from: 'SK-021', to: 'SK-031', lvl: 'D3' },
  { from: 'SK-027', to: 'SK-034', lvl: 'D3' },
  { from: 'SK-030', to: 'SK-031', lvl: 'D2' },
  { from: 'SK-030', to: 'SK-033', lvl: 'D3' },
  { from: 'SK-031', to: 'SK-032', lvl: 'D2' },
  { from: 'SK-032', to: 'SK-033', lvl: 'D2' },
];

export const NODE_W = 156;
export const NODE_H = 62;
export const H_GAP = 22;
export const V_GAP = 90;

function buildPrereqMap() {
  const m = {};
  for (const e of EDGES) {
    if (!m[e.to]) m[e.to] = [];
    m[e.to].push({ prereq: e.from, minLevel: e.lvl });
  }
  return m;
}

function buildChildMap() {
  const m = {};
  for (const e of EDGES) {
    if (!m[e.from]) m[e.from] = [];
    m[e.from].push({ child: e.to, minLevel: e.lvl });
  }
  return m;
}

function computeDepths(prereqMap) {
  const memo = {};
  function depth(id) {
    if (id in memo) return memo[id];
    const prs = prereqMap[id] || [];
    memo[id] =
      prs.length === 0
        ? 0
        : 1 + Math.max(...prs.map(p => depth(p.prereq)));
    return memo[id];
  }
  for (const id of Object.keys(SKILLS)) depth(id);
  return memo;
}

function layoutNodes(depths, prereqMap) {
  const layers = {};
  for (const id of Object.keys(SKILLS)) {
    const d = depths[id] ?? 0;
    if (!layers[d]) layers[d] = [];
    layers[d].push(id);
  }

  const positions = {};
  const sorted = Object.entries(layers).sort((a, b) => +a[0] - +b[0]);

  for (const [di, ids] of sorted) {
    const d = +di;

    if (d > 0) {
      ids.sort((a, b) => {
        const avg = id => {
          const ps = (prereqMap[id] || [])
            .map(p => p.prereq)
            .filter(p => positions[p]);
          if (!ps.length) return 0;
          return ps.reduce((s, p) => s + positions[p].x, 0) / ps.length;
        };
        return avg(a) - avg(b);
      });
    }

    const total = ids.length * NODE_W + (ids.length - 1) * H_GAP;
    const startX = -total / 2 + NODE_W / 2;
    ids.forEach((id, i) => {
      positions[id] = {
        x: startX + i * (NODE_W + H_GAP),
        y: d * (NODE_H + V_GAP),
      };
    });
  }
  return positions;
}

export function useSkillTreeViewModel() {
  const [selected, setSelected] = useState(null);
  const [showOnly, setShowOnly] = useState('all'); // "all" | "goal"

  const prereqMap = useMemo(buildPrereqMap, []);
  const childMap = useMemo(buildChildMap, []);
  const depths = useMemo(() => computeDepths(prereqMap), [prereqMap]);
  const positions = useMemo(
    () => layoutNodes(depths, prereqMap),
    [depths, prereqMap]
  );

  const highlightSet = useMemo(() => {
    if (!selected) return new Set();
    const s = new Set([selected]);
    const q = [selected];
    while (q.length) {
      const cur = q.shift();
      for (const { prereq } of prereqMap[cur] || []) {
        if (!s.has(prereq)) {
          s.add(prereq);
          q.push(prereq);
        }
      }
    }
    for (const { child } of childMap[selected] || []) s.add(child);
    return s;
  }, [selected, prereqMap, childMap]);

  const visibleNodes = useMemo(() => {
    if (showOnly === 'goal')
      return Object.keys(SKILLS).filter(id => G07_GOAL_SKILLS.has(id));
    return Object.keys(SKILLS);
  }, [showOnly]);

  const visibleSet = useMemo(() => new Set(visibleNodes), [visibleNodes]);
  const visibleEdges = useMemo(
    () => EDGES.filter(e => visibleSet.has(e.from) && visibleSet.has(e.to)),
    [visibleSet]
  );

  const viewBox = useMemo(() => {
    const pad = 56;
    const xs = visibleNodes.map(id => positions[id]?.x ?? 0);
    const ys = visibleNodes.map(id => positions[id]?.y ?? 0);
    const x0 = Math.min(...xs) - NODE_W / 2 - pad;
    const y0 = Math.min(...ys) - NODE_H / 2 - pad;
    const x1 = Math.max(...xs) + NODE_W / 2 + pad;
    const y1 = Math.max(...ys) + NODE_H / 2 + pad;
    return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
  }, [visibleNodes, positions]);

  function handleNodeClick(id) {
    setSelected(prev => (prev === id ? null : id));
  }

  const selInfo = selected ? SKILLS[selected] : null;
  const selPre = selected
    ? (prereqMap[selected] || []).filter(p => visibleSet.has(p.prereq))
    : [];
  const selChild = selected
    ? (childMap[selected] || []).filter(c => visibleSet.has(c.child))
    : [];

  return {
    state: {
      selected,
      showOnly,
      positions,
      highlightSet,
      visibleNodes,
      visibleEdges,
      visibleSet,
      viewBox,
      selInfo,
      selPre,
      selChild,
    },
    actions: {
      handleNodeClick,
      setSelected,
      setShowOnly,
    },
  };
}
