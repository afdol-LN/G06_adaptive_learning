import { useState, useMemo } from "react";
import "./decorate/SkillTree.css";

// ── G07 Goal Skills (highlighted differently) ─────────────────────────────────
const G07_GOAL_SKILLS = new Set([
  "SK-007","SK-008","SK-014","SK-019",
  "SK-029","SK-030","SK-031","SK-032","SK-033","SK-034",
]);

// ── All nodes in the G07 full tree ────────────────────────────────────────────
const SKILLS = {
  "SK-001": { name: "Python Fundamentals",       tier: "T1", minReq: null },
  "SK-002": { name: "Basic Input / Output",       tier: "T1", minReq: null },
  "SK-003": { name: "Variables & Data Types",     tier: "T1", minReq: null },
  "SK-004": { name: "Operators & Expressions",    tier: "T1", minReq: null },
  "SK-006": { name: "Control Flow — Conditional", tier: "T1", minReq: null },
  "SK-007": { name: "Control Flow — Loops",       tier: "T1", minReq: "D3" },
  "SK-008": { name: "List",                       tier: "T2", minReq: "D3" },
  "SK-009": { name: "Tuple",                      tier: "T2", minReq: null },
  "SK-010": { name: "Dictionary",                 tier: "T2", minReq: null },
  "SK-012": { name: "Functions — Basic",          tier: "T2", minReq: null },
  "SK-014": { name: "Recursion",                  tier: "T2", minReq: "D2" },
  "SK-019": { name: "OOP — Class & Object",       tier: "T3", minReq: "D2" },
  "SK-021": { name: "OOP — Inheritance",          tier: "T3", minReq: null },
  "SK-027": { name: "Iterators & Protocols",      tier: "T3", minReq: null },
  "SK-029": { name: "Sorting Algorithms",         tier: "T3", minReq: "D3" },
  "SK-030": { name: "Searching Algorithms",       tier: "T3", minReq: "D3" },
  "SK-031": { name: "Complexity (Big-O)",         tier: "T3", minReq: "D2" },
  "SK-032": { name: "Stack & Queue",              tier: "T3", minReq: "D3" },
  "SK-033": { name: "Linked List",                tier: "T3", minReq: "D2" },
  "SK-034": { name: "Tree & BST",                 tier: "T3", minReq: "D2" },
};

// ── All edges (from new_skill_relations.csv, filtered to this node set) ────────
const EDGES = [
  { from: "SK-001", to: "SK-002", lvl: "D1" },
  { from: "SK-001", to: "SK-003", lvl: "D1" },
  { from: "SK-002", to: "SK-003", lvl: "D1" },
  { from: "SK-003", to: "SK-004", lvl: "D1" },
  { from: "SK-003", to: "SK-012", lvl: "D2" },
  { from: "SK-003", to: "SK-014", lvl: "D2" },
  { from: "SK-004", to: "SK-006", lvl: "D2" },
  { from: "SK-004", to: "SK-007", lvl: "D2" },
  { from: "SK-006", to: "SK-007", lvl: "D1" },
  { from: "SK-006", to: "SK-008", lvl: "D2" },
  { from: "SK-006", to: "SK-019", lvl: "D2" },
  { from: "SK-007", to: "SK-008", lvl: "D2" },
  { from: "SK-007", to: "SK-012", lvl: "D2" },
  { from: "SK-007", to: "SK-014", lvl: "D2" },
  { from: "SK-007", to: "SK-029", lvl: "D3" },
  { from: "SK-008", to: "SK-009", lvl: "D2" },
  { from: "SK-008", to: "SK-010", lvl: "D3" },
  { from: "SK-008", to: "SK-019", lvl: "D2" },
  { from: "SK-008", to: "SK-021", lvl: "D3" },
  { from: "SK-009", to: "SK-010", lvl: "D2" },
  { from: "SK-010", to: "SK-027", lvl: "D2" },
  { from: "SK-010", to: "SK-032", lvl: "D3" },
  { from: "SK-010", to: "SK-034", lvl: "D3" },
  { from: "SK-012", to: "SK-027", lvl: "D3" },
  { from: "SK-012", to: "SK-029", lvl: "D3" },
  { from: "SK-012", to: "SK-030", lvl: "D3" },
  { from: "SK-012", to: "SK-034", lvl: "D3" },
  { from: "SK-014", to: "SK-021", lvl: "D2" },
  { from: "SK-014", to: "SK-033", lvl: "D3" },
  { from: "SK-021", to: "SK-030", lvl: "D2" },
  { from: "SK-021", to: "SK-031", lvl: "D3" },
  { from: "SK-027", to: "SK-034", lvl: "D3" },
  { from: "SK-030", to: "SK-031", lvl: "D2" },
  { from: "SK-030", to: "SK-033", lvl: "D3" },
  { from: "SK-031", to: "SK-032", lvl: "D2" },
  { from: "SK-032", to: "SK-033", lvl: "D2" },
];

// ── Layout constants ──────────────────────────────────────────────────────────
const NODE_W = 156;
const NODE_H = 62;
const H_GAP  = 22;
const V_GAP  = 90;

// ── Graph helpers ─────────────────────────────────────────────────────────────
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
    memo[id] = prs.length === 0
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

    // Barycenter sort
    if (d > 0) {
      ids.sort((a, b) => {
        const avg = id => {
          const ps = (prereqMap[id] || []).map(p => p.prereq).filter(p => positions[p]);
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

// ── Sub-components ────────────────────────────────────────────────────────────
function SkillNode({ id, x, y, selected, dimmed, onClick }) {
  const sk   = SKILLS[id];
  const isGoal = G07_GOAL_SKILLS.has(id);
  const cls  = [
    "g07-node",
    `g07-node--tier${sk.tier.slice(1)}`,
    isGoal   ? "g07-node--goal"     : "g07-node--prereq",
    selected ? "g07-node--selected" : "",
    dimmed   ? "g07-node--dimmed"   : "",
  ].join(" ");

  return (
    <g className={cls}
       transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}
       onClick={() => onClick(id)}
       style={{ cursor: "pointer" }}>
      <rect width={NODE_W} height={NODE_H} rx={8} />
      {/* goal badge */}
      {isGoal && (
        <rect x={NODE_W - 36} y={4} width={32} height={14} rx={3}
              className="g07-goal-badge-bg" />
      )}
      {isGoal && (
        <text x={NODE_W - 20} y={11}
              textAnchor="middle" dominantBaseline="middle"
              className="g07-goal-badge-txt">
          G07
        </text>
      )}
      {/* min req badge */}
      {sk.minReq && (
        <rect x={4} y={4} width={24} height={14} rx={3}
              className={`g07-req-bg g07-req-bg--${sk.minReq.toLowerCase()}`} />
      )}
      {sk.minReq && (
        <text x={16} y={11}
              textAnchor="middle" dominantBaseline="middle"
              className="g07-req-txt">
          {sk.minReq}
        </text>
      )}
      <text x={10} y={30} className="g07-node__name">{sk.name}</text>
      <text x={10} y={50} className="g07-node__meta">{id} · {sk.tier}</text>
    </g>
  );
}

function SkillEdge({ x1, y1, x2, y2, lvl, highlighted, dimmed }) {
  const cp1y = y1 + V_GAP * 0.48;
  const cp2y = y2 - V_GAP * 0.48;
  const d    = `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;
  const mx   = (x1 + x2) / 2;
  const my   = (y1 + y2) / 2;
  const cls  = [
    "g07-edge",
    highlighted ? "g07-edge--hl" : "",
    dimmed      ? "g07-edge--dim" : "",
  ].join(" ");
  return (
    <g className={cls}>
      <path d={d} fill="none" markerEnd="url(#g07arr)" />
      <rect x={mx - 13} y={my - 9} width={26} height={18} rx={4}
            className="g07-edge__badge-bg" />
      <text x={mx} y={my} textAnchor="middle" dominantBaseline="middle"
            className="g07-edge__badge-txt">
        {lvl}
      </text>
    </g>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function G07SkillTree() {
  const [selected, setSelected] = useState(null);
  const [showOnly, setShowOnly] = useState("all"); // "all" | "goal"

  const prereqMap = useMemo(buildPrereqMap, []);
  const childMap  = useMemo(buildChildMap,  []);
  const depths    = useMemo(() => computeDepths(prereqMap),      [prereqMap]);
  const positions = useMemo(() => layoutNodes(depths, prereqMap), [depths, prereqMap]);

  // Nodes reachable from selected (highlight paths)
  const highlightSet = useMemo(() => {
    if (!selected) return new Set();
    const s = new Set([selected]);
    // ancestors
    const q = [selected];
    while (q.length) {
      const cur = q.shift();
      for (const { prereq } of prereqMap[cur] || []) {
        if (!s.has(prereq)) { s.add(prereq); q.push(prereq); }
      }
    }
    // direct children
    for (const { child } of childMap[selected] || []) s.add(child);
    return s;
  }, [selected, prereqMap, childMap]);

  const visibleNodes = useMemo(() => {
    if (showOnly === "goal") return Object.keys(SKILLS).filter(id => G07_GOAL_SKILLS.has(id));
    return Object.keys(SKILLS);
  }, [showOnly]);

  const visibleSet  = useMemo(() => new Set(visibleNodes), [visibleNodes]);
  const visibleEdges = useMemo(
    () => EDGES.filter(e => visibleSet.has(e.from) && visibleSet.has(e.to)),
    [visibleSet]
  );

  const viewBox = useMemo(() => {
    const pad = 56;
    const xs  = visibleNodes.map(id => positions[id]?.x ?? 0);
    const ys  = visibleNodes.map(id => positions[id]?.y ?? 0);
    const x0  = Math.min(...xs) - NODE_W / 2 - pad;
    const y0  = Math.min(...ys) - NODE_H / 2 - pad;
    const x1  = Math.max(...xs) + NODE_W / 2 + pad;
    const y1  = Math.max(...ys) + NODE_H / 2 + pad;
    return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
  }, [visibleNodes, positions]);

  function handleClick(id) {
    setSelected(prev => prev === id ? null : id);
  }

  const selInfo   = selected ? SKILLS[selected] : null;
  const selPre    = selected ? (prereqMap[selected] || []).filter(p => visibleSet.has(p.prereq)) : [];
  const selChild  = selected ? (childMap[selected]  || []).filter(c => visibleSet.has(c.child))  : [];

  return (
    <div className="g07-wrap">
      {/* Header */}
      <div className="g07-bar">
        <div className="g07-title">
          <span className="g07-goal-pill">G07</span>
          <span className="g07-title-name">Data Structures — Full Skill Tree</span>
        </div>
        <div className="g07-toggles">
          <button className={`g07-btn ${showOnly==="all"  ?"g07-btn--on":""}`}
                  onClick={() => { setShowOnly("all"); setSelected(null); }}>
            Full tree
          </button>
          <button className={`g07-btn ${showOnly==="goal" ?"g07-btn--on":""}`}
                  onClick={() => { setShowOnly("goal"); setSelected(null); }}>
            Goal skills only
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="g07-legend">
        <span className="g07-leg-swatch g07-leg-swatch--goal"/><span>Goal skill (G07)</span>
        <span className="g07-leg-swatch g07-leg-swatch--prereq"/><span>Prerequisite</span>
        <span className="g07-leg-swatch g07-leg-swatch--t1"/>T1
        <span className="g07-leg-swatch g07-leg-swatch--t2"/>T2
        <span className="g07-leg-swatch g07-leg-swatch--t3"/>T3
        <span style={{marginLeft:8,color:"var(--g07-muted)",fontSize:11}}>
          Badge = min level req for G07
        </span>
      </div>

      {/* SVG */}
      <div className="g07-canvas">
        <svg viewBox={viewBox} width="100%" style={{ display:"block" }}>
          <defs>
            <marker id="g07arr" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </marker>
          </defs>

          {/* Edges */}
          {visibleEdges.map(({ from, to, lvl }) => {
            const fp = positions[from];
            const tp = positions[to];
            if (!fp || !tp) return null;
            const hl  = highlightSet.has(from) && highlightSet.has(to) && selected;
            const dim = selected ? !hl : false;
            return (
              <SkillEdge key={`${from}→${to}`}
                x1={fp.x} y1={fp.y + NODE_H / 2}
                x2={tp.x} y2={tp.y - NODE_H / 2}
                lvl={lvl}
                highlighted={!!hl}
                dimmed={!!dim}
              />
            );
          })}

          {/* Nodes */}
          {visibleNodes.map(id => {
            const p = positions[id];
            if (!p) return null;
            const dim = selected ? !highlightSet.has(id) : false;
            return (
              <SkillNode key={id} id={id} x={p.x} y={p.y}
                selected={selected === id}
                dimmed={dim}
                onClick={handleClick}
              />
            );
          })}
        </svg>
      </div>

      {/* Detail panel */}
      {selected && selInfo && (
        <div className="g07-detail">
          <button className="g07-detail-close" onClick={() => setSelected(null)}>✕</button>
          <div className="g07-detail-head">
            <span className="g07-detail-id">{selected}</span>
            <span className="g07-detail-name">{selInfo.name}</span>
            <span className={`g07-tier g07-tier--${selInfo.tier.toLowerCase()}`}>{selInfo.tier}</span>
            {G07_GOAL_SKILLS.has(selected) && <span className="g07-goal-pill g07-goal-pill--sm">G07 Goal</span>}
          </div>
          {selInfo.minReq && (
            <p className="g07-detail-req">G07 requires: <strong>{selInfo.minReq}</strong></p>
          )}
          {selPre.length > 0 && (
            <div className="g07-detail-sec">
              <p className="g07-detail-lbl">Must unlock first:</p>
              {selPre.map(({ prereq, minLevel }) => (
                <div key={prereq} className="g07-detail-row">
                  <span className="g07-detail-pid">{prereq}</span>
                  <span className="g07-detail-pname">{SKILLS[prereq]?.name}</span>
                  <span className={`g07-badge g07-badge--${minLevel.toLowerCase()}`}>{minLevel}</span>
                </div>
              ))}
            </div>
          )}
          {selChild.length > 0 && (
            <div className="g07-detail-sec">
              <p className="g07-detail-lbl">Unlocks:</p>
              {selChild.map(({ child, minLevel }) => (
                <div key={child} className="g07-detail-row">
                  <span className="g07-detail-pid">{child}</span>
                  <span className="g07-detail-pname">{SKILLS[child]?.name}</span>
                  <span className={`g07-badge g07-badge--${minLevel.toLowerCase()}`}>{minLevel}</span>
                </div>
              ))}
            </div>
          )}
          {selPre.length === 0 && <p className="g07-detail-root">Root skill — ไม่มี prerequisite</p>}
        </div>
      )}

      {/* Stats */}
      <div className="g07-stats">
        <span>{Object.keys(SKILLS).length} total nodes</span>
        <span>{G07_GOAL_SKILLS.size} goal skills</span>
        <span>{EDGES.length} connections</span>
      </div>
    </div>
  );
}