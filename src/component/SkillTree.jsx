import React from "react";
import "./decorate/SkillTree.css";
import {
  useSkillTreeViewModel,
  SKILLS,
  EDGES,
  G07_GOAL_SKILLS,
  NODE_W,
  NODE_H,
  V_GAP,
} from "../view-models/useSkillTreeViewModel";

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
  const { state, actions } = useSkillTreeViewModel();
  const {
    selected,
    showOnly,
    positions,
    highlightSet,
    visibleNodes,
    visibleEdges,
    viewBox,
    selInfo,
    selPre,
    selChild,
  } = state;

  const { handleNodeClick, setSelected, setShowOnly } = actions;

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
                onClick={handleNodeClick}
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