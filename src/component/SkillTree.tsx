import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import "./decorate/SkillTree.css";

// ── G07 Goal Skills ─────────────────────────────────────────────────────────
const G07_GOAL_SKILLS = new Set([
  "SK-007","SK-008","SK-014","SK-019",
  "SK-029","SK-030","SK-031","SK-032","SK-033","SK-034",
]);

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

const NODE_W = 170;
const NODE_H = 68;
const H_GAP  = 30;
const V_GAP  = 100;

const TIER_META = {
  T1: { label: "พื้นฐาน",  icon: "🌱" },
  T2: { label: "กลาง",     icon: "🌿" },
  T3: { label: "ขั้นสูง",  icon: "🌳" },
};

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
    memo[id] = prs.length === 0 ? 0 : 1 + Math.max(...prs.map(p => depth(p.prereq)));
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
      positions[id] = { x: startX + i * (NODE_W + H_GAP), y: d * (NODE_H + V_GAP) };
    });
  }
  return positions;
}

// ── Zoomable canvas ────────────────────────────────────────────────────────────
function ZoomPanCanvas({ children, viewBox }) {
  const svgRef    = useRef(null);
  const isPanning = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const [t, setT] = useState({ x: 0, y: 0, scale: 1 });

  const onWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setT(p => ({ ...p, scale: Math.min(2.5, Math.max(0.4, p.scale * delta)) }));
  }, []);
  const onDown = useCallback(e => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMove = useCallback(e => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x, dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setT(p => ({ ...p, x: p.x + dx, y: p.y + dy }));
  }, []);
  const onUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  return (
    <>
      <svg ref={svgRef} viewBox={viewBox} className="g07-svg"
        onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
        style={{ cursor: isPanning.current ? "grabbing" : "grab" }}>
        <g transform={`translate(${t.x},${t.y}) scale(${t.scale})`}>
          {children}
        </g>
      </svg>
      <div className="g07-zoom-controls">
        <button onClick={() => setT(p => ({ ...p, scale: Math.min(2.5, p.scale * 1.2) }))}>+</button>
        <button onClick={() => setT({ x: 0, y: 0, scale: 1 })}>⟳</button>
        <button onClick={() => setT(p => ({ ...p, scale: Math.max(0.4, p.scale * 0.8) }))}>−</button>
      </div>
    </>
  );
}

// ── Node ───────────────────────────────────────────────────────────────────────
function SkillNode({ id, x, y, selected, dimmed, matched, onClick }) {
  const sk = SKILLS[id];
  const isGoal = G07_GOAL_SKILLS.has(id);
  const cls = [
    "g07-node",
    `g07-node--tier${sk.tier.slice(1)}`,
    isGoal ? "g07-node--goal" : "",
    selected ? "g07-node--selected" : "",
    dimmed ? "g07-node--dimmed" : "",
    matched ? "g07-node--matched" : "",
  ].join(" ");

  return (
    <g className={cls}
       transform={`translate(${x - NODE_W / 2},${y - NODE_H / 2})`}
       onClick={() => onClick(id)}>
      <rect className="g07-node__bg" width={NODE_W} height={NODE_H} rx={12} />
      <rect className="g07-node__accent" width={5} height={NODE_H} rx={2.5} />

      <text x={20} y={17} className="g07-node__tier-icon">{TIER_META[sk.tier].icon}</text>
      <text x={NODE_W - 14} y={17} textAnchor="end" className="g07-node__id">{id.replace("SK-", "#")}</text>

      <text x={20} y={40} className="g07-node__name">
        {sk.name.length > 20 ? sk.name.slice(0, 19) + "…" : sk.name}
      </text>

      <text x={20} y={57} className="g07-node__meta">{sk.tier} · {TIER_META[sk.tier].label}</text>

      {isGoal && (
        <g transform={`translate(${NODE_W - 46}, ${NODE_H - 22})`}>
          <rect width={38} height={16} rx={8} className="g07-goal-chip-bg" />
          <text x={19} y={11} textAnchor="middle" className="g07-goal-chip-txt">GOAL</text>
        </g>
      )}
      {sk.minReq && (
        <g transform={`translate(8, ${NODE_H - 22})`}>
          <rect width={26} height={16} rx={8} className={`g07-req-chip-bg g07-req-chip-bg--${sk.minReq.toLowerCase()}`} />
          <text x={13} y={11} textAnchor="middle" className="g07-req-chip-txt">{sk.minReq}</text>
        </g>
      )}
    </g>
  );
}

function SkillEdge({ x1, y1, x2, y2, highlighted, dimmed }) {
  const cp1y = y1 + V_GAP * 0.5;
  const cp2y = y2 - V_GAP * 0.5;
  const d = `M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`;
  const cls = ["g07-edge", highlighted ? "g07-edge--hl" : "", dimmed ? "g07-edge--dim" : ""].join(" ");
  return <path className={cls} d={d} fill="none" markerEnd="url(#g07arr)" />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function G07SkillTree() {
  const [selected, setSelected] = useState(null);
  const [showOnly, setShowOnly] = useState("all");
  const [query, setQuery] = useState("");

  const prereqMap = useMemo(buildPrereqMap, []);
  const childMap  = useMemo(buildChildMap,  []);
  const depths    = useMemo(() => computeDepths(prereqMap), [prereqMap]);
  const positions = useMemo(() => layoutNodes(depths, prereqMap), [depths, prereqMap]);

  const highlightSet = useMemo(() => {
    if (!selected) return new Set();
    const s = new Set([selected]);
    const q = [selected];
    while (q.length) {
      const cur = q.shift();
      for (const { prereq } of prereqMap[cur] || []) {
        if (!s.has(prereq)) { s.add(prereq); q.push(prereq); }
      }
    }
    for (const { child } of childMap[selected] || []) s.add(child);
    return s;
  }, [selected, prereqMap, childMap]);

  const visibleNodes = useMemo(() => {
    if (showOnly === "goal") return Object.keys(SKILLS).filter(id => G07_GOAL_SKILLS.has(id));
    return Object.keys(SKILLS);
  }, [showOnly]);

  const visibleSet = useMemo(() => new Set(visibleNodes), [visibleNodes]);
  const visibleEdges = useMemo(
    () => EDGES.filter(e => visibleSet.has(e.from) && visibleSet.has(e.to)),
    [visibleSet]
  );

  const matchedSet = useMemo(() => {
    if (!query.trim()) return new Set();
    const q = query.trim().toLowerCase();
    return new Set(
      visibleNodes.filter(id =>
        SKILLS[id].name.toLowerCase().includes(q) || id.toLowerCase().includes(q)
      )
    );
  }, [query, visibleNodes]);

  const viewBox = useMemo(() => {
    const pad = 60;
    const xs = visibleNodes.map(id => positions[id]?.x ?? 0);
    const ys = visibleNodes.map(id => positions[id]?.y ?? 0);
    const x0 = Math.min(...xs) - NODE_W / 2 - pad;
    const y0 = Math.min(...ys) - NODE_H / 2 - pad;
    const x1 = Math.max(...xs) + NODE_W / 2 + pad;
    const y1 = Math.max(...ys) + NODE_H / 2 + pad;
    return `${x0} ${y0} ${x1 - x0} ${y1 - y0}`;
  }, [visibleNodes, positions]);

  function handleClick(id) {
    setSelected(prev => (prev === id ? null : id));
  }

  const selInfo  = selected ? SKILLS[selected] : null;
  const selPre   = selected ? (prereqMap[selected] || []).filter(p => visibleSet.has(p.prereq)) : [];
  const selChild = selected ? (childMap[selected]  || []).filter(c => visibleSet.has(c.child))  : [];

  return (
    <div className="g07-wrap">
      {/* ── Top bar ── */}
      <div className="g07-topbar">
        <div className="g07-topbar-left">
          <span className="g07-title-pill">G07</span>
          <div>
            <div className="g07-title-name">Data Structures</div>
            <div className="g07-title-sub">แผนผังทักษะทั้งหมด</div>
          </div>
        </div>

        <div className="g07-search">
          <span className="g07-search-icon">🔍</span>
          <input
            type="text"
            placeholder="ค้นหาทักษะ..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button className="g07-search-clear" onClick={() => setQuery("")}>✕</button>
          )}
        </div>

        <div className="g07-toggles">
          <button className={`g07-toggle-btn ${showOnly === "all" ? "on" : ""}`}
            onClick={() => { setShowOnly("all"); setSelected(null); }}>
            ทั้งหมด
          </button>
          <button className={`g07-toggle-btn ${showOnly === "goal" ? "on" : ""}`}
            onClick={() => { setShowOnly("goal"); setSelected(null); }}>
            เฉพาะ Goal
          </button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="g07-legend">
        <span className="g07-leg-item"><i className="g07-leg-dot g07-leg-dot--goal" />Goal skill</span>
        <span className="g07-leg-item"><i className="g07-leg-dot g07-leg-dot--t1" />T1 พื้นฐาน</span>
        <span className="g07-leg-item"><i className="g07-leg-dot g07-leg-dot--t2" />T2 กลาง</span>
        <span className="g07-leg-item"><i className="g07-leg-dot g07-leg-dot--t3" />T3 ขั้นสูง</span>
        <span className="g07-leg-hint">💡 คลิกที่ node เพื่อดูรายละเอียด · ลากเพื่อเลื่อน · scroll เพื่อซูม</span>
      </div>

      {/* ── Canvas ── */}
      <div className="g07-canvas">
        <ZoomPanCanvas viewBox={viewBox}>
          <defs>
            <marker id="g07arr" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>

          {visibleEdges.map(({ from, to }) => {
            const fp = positions[from], tp = positions[to];
            if (!fp || !tp) return null;
            const hl  = selected && highlightSet.has(from) && highlightSet.has(to);
            const dim = selected ? !hl : false;
            return (
              <SkillEdge key={`${from}→${to}`}
                x1={fp.x} y1={fp.y + NODE_H / 2}
                x2={tp.x} y2={tp.y - NODE_H / 2}
                highlighted={!!hl} dimmed={!!dim}
              />
            );
          })}

          {visibleNodes.map(id => {
            const p = positions[id];
            if (!p) return null;
            const dim = selected ? !highlightSet.has(id) : (query ? !matchedSet.has(id) : false);
            return (
              <SkillNode key={id} id={id} x={p.x} y={p.y}
                selected={selected === id}
                dimmed={dim}
                matched={!!query && matchedSet.has(id)}
                onClick={handleClick}
              />
            );
          })}
        </ZoomPanCanvas>
      </div>

      {/* ── Detail panel ── */}
      {selected && selInfo && (
        <>
          <div className="g07-detail-overlay" onClick={() => setSelected(null)} />
          <div className="g07-detail">
            <button className="g07-detail-close" onClick={() => setSelected(null)}>✕</button>

            <div className="g07-detail-head">
              <span className="g07-detail-tier-icon">{TIER_META[selInfo.tier].icon}</span>
              <div>
                <div className="g07-detail-id">{selected}</div>
                <div className="g07-detail-name">{selInfo.name}</div>
              </div>
            </div>

            <div className="g07-detail-tags">
              <span className={`g07-tier-tag g07-tier-tag--${selInfo.tier.toLowerCase()}`}>
                {selInfo.tier} · {TIER_META[selInfo.tier].label}
              </span>
              {G07_GOAL_SKILLS.has(selected) && <span className="g07-goal-tag">🎯 G07 Goal</span>}
              {selInfo.minReq && <span className="g07-req-tag">ต้องการระดับ {selInfo.minReq}</span>}
            </div>

            {selPre.length > 0 ? (
              <div className="g07-detail-sec">
                <p className="g07-detail-lbl">ต้องปลดล็อกก่อน</p>
                {selPre.map(({ prereq, minLevel }) => (
                  <div key={prereq} className="g07-detail-row" onClick={() => setSelected(prereq)}>
                    <span className="g07-detail-row-name">{SKILLS[prereq]?.name}</span>
                    <span className={`g07-badge g07-badge--${minLevel.toLowerCase()}`}>{minLevel}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="g07-detail-root">🌱 Root skill — ไม่มี prerequisite</p>
            )}

            {selChild.length > 0 && (
              <div className="g07-detail-sec">
                <p className="g07-detail-lbl">ปลดล็อกต่อได้</p>
                {selChild.map(({ child, minLevel }) => (
                  <div key={child} className="g07-detail-row" onClick={() => setSelected(child)}>
                    <span className="g07-detail-row-name">{SKILLS[child]?.name}</span>
                    <span className={`g07-badge g07-badge--${minLevel.toLowerCase()}`}>{minLevel}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Stats ── */}
      <div className="g07-stats">
        <div className="g07-stat-chip">📚 {Object.keys(SKILLS).length} ทักษะทั้งหมด</div>
        <div className="g07-stat-chip">🎯 {G07_GOAL_SKILLS.size} Goal skills</div>
        <div className="g07-stat-chip">🔗 {EDGES.length} ความเชื่อมโยง</div>
      </div>
    </div>
  );
}