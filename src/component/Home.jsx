import React, { useState, useEffect, useRef, useCallback } from 'react';
import './decorate/Home.css';
import { useNavigate } from 'react-router-dom';
import {
  SKILLS,
  getSkillTreeForGoal,
  MOCK_SESSIONS,
  MOCK_USER_PROFILE,
  MOCK_ACTIVE_BRANCH,
  MOCK_BRANCHES,
  computeSkillProgress,
  computeUnlockedSkills,
  getSkillLevel,
  getSkillElo,
  ELO_RANGES,
} from './mockData';
import { GOAL_SKILLS, PREREQS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import CreateBranchModal from './CreateBranchModal';
import dagre from 'dagre';

// ─── LAYOUT ────────────────────────────────────────────────────────────────
const NODE_W = 220;
const NODE_H = 100;

function layoutSkills(skills) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, marginx: 10, marginy: 10 });
  g.setDefaultEdgeLabel(() => ({}));
  skills.forEach(s => g.setNode(s.id, { width: NODE_W, height: NODE_H }));
  skills.forEach(s => s.requires.forEach(r => {
    if (skills.find(sk => sk.id === r)) g.setEdge(r, s.id);
  }));
  dagre.layout(g);
  return skills.map(s => {
    const node = g.node(s.id);
    return { ...s, x: node.x, y: node.y };
  });
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
function getProgressColor(p) {
  if (p === 100) return '#0047AB';
  if (p >= 60)   return '#3b82f6';
  if (p >= 20)   return '#60a5fa';
  if (p > 0)     return '#93c5fd';
  return '#cbd5e1';
}

function getNodeColors(isUnlocked, canUnlockThis, progress) {
  if (progress === 100) return { bg: '#ecfdf5', border: '#10b981', text: '#047857', bar: '#f0fdf4' };
  if (isUnlocked)       return { bg: '#ffffff', border: '#0047AB', text: '#0047AB', bar: '#f0f4ff' };
  if (canUnlockThis)    return { bg: '#f0f9ff', border: '#60a5fa', text: '#1d4ed8', bar: '#e0f2fe' };
  return                       { bg: '#f8fafc', border: '#cbd5e1', text: '#94a3b8', bar: '#f1f5f9' };
}

// ─── BEHAVIOR ENGINE ────────────────────────────────────────────────────────
function computeBehavior(sessions, unlockedSkills) {
  if (sessions.length === 0) {
    return { dims: { time: 0, streak: 0, momentum: 0 }, cls: 'struggler', score: 0, avgTime: 0 };
  }

  let totalQuestions = 0;
  let totalSessionTime = 0;
  let sumTimeScore = 0;
  let sumStreakScore = 0;
  let sumMomentumScore = 0;

  sessions.forEach(s => {
    let c = 0, w = 0, exp = 0, act = 0;
    s.questions.forEach(q => {
      if (q.correct) c++; else w++;
      act += parseInt(q.time) || 15;
      exp += 15; // default expect_time
      totalQuestions++;
    });
    totalSessionTime += act;

    const ratio = act > 0 ? (exp / act) : 1;
    const tScore = (Math.max(0.5, Math.min(ratio, 2.0)) - 0.5) / 1.5;
    const sScore = (c + w) > 0 ? (c / (c + w)) : 0;
    const mScore = Math.max(0, Math.min((c - w + 5) / 10, 1.0));

    sumTimeScore += tScore;
    sumStreakScore += sScore;
    sumMomentumScore += mScore;
  });

  const avgTime = totalQuestions > 0 ? totalSessionTime / totalQuestions : 0;
  const tFinal = sumTimeScore / sessions.length;
  const sFinal = sumStreakScore / sessions.length;
  const mFinal = sumMomentumScore / sessions.length;

  const score = Math.round((tFinal * 0.50 + sFinal * 0.30 + mFinal * 0.20) * 100);
  const dims = {
    time: Math.round(tFinal * 100),
    streak: Math.round(sFinal * 100),
    momentum: Math.round(mFinal * 100),
  };

  let cls = 'struggler';
  if (score >= 80) cls = 'mastery';
  else if (score >= 60) {
    if (dims.time - dims.streak >= 15) cls = 'fast';
    else if (dims.streak - dims.time >= 15) cls = 'slow';
    else cls = 'steady';
  }
  else if (score >= 40) cls = 'slow';

  return { dims, cls, score, avgTime: Math.round(avgTime) };
}

const BEHAVIOR_META = {
  mastery:   { label: 'Mastery',   emoji: '', color: '#0047AB', bg: '#e8f0fe', border: '#93c5fd', desc: 'เชี่ยวชาญและสม่ำเสมอ — คุณเรียนรู้ได้ครบและแม่นยำมาก' },
  fast:      { label: 'Fast',      emoji: '', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', desc: 'ตอบเร็วและแม่นยำ — แต่ควรทบทวน skill เก่าเพิ่มเติม' },
  steady:    { label: 'Steady',    emoji: '', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'สม่ำเสมอและมั่นคง — เพิ่มความเร็วและทบทวนให้มากขึ้น' },
  slow:      { label: 'Slow',      emoji: '', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'เข้าใจดีแต่ใช้เวลานาน — ฝึกทำโจทย์ให้เร็วขึ้น' },
  struggler: { label: 'Struggler', emoji: '', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'ยังต้องฝึกเพิ่ม — ลองทบทวนพื้นฐานและทำ session บ่อยขึ้น' },
};

const DIM_LABELS = {
  time:     { label: 'Time Score',     icon: '' },
  streak:   { label: 'Correct Score',   icon: '' },
  momentum: { label: 'Momentum Score', icon: '' },
};

// ─── EXERCISE CONFIRM MODAL ─────────────────────────────────────────────────
function ExerciseConfirmModal({ skill, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon-wrap"><span>{skill.icon}</span></div>
        <h2 className="confirm-title">เริ่มทำ Exercise?</h2>
        <p className="confirm-desc">คุณต้องการเริ่มทำ Exercise<br /><strong>{skill.name}</strong> ใช่หรือไม่?</p>
        <div className="confirm-progress-row">
          <div className="confirm-progress-track">
            <div className="confirm-progress-fill"
              style={{ width: `${skill.progress}%`, background: getProgressColor(skill.progress) }} />
          </div>
          <span className="confirm-progress-pct"
            style={{ color: getProgressColor(skill.progress) }}>{skill.progress}%</span>
        </div>
        <div className="confirm-btn-row">
          <button className="confirm-btn-cancel" onClick={onCancel}>ไม่ใช่</button>
          <button className="confirm-btn-ok" onClick={onConfirm}>ใช่ เริ่มเลย!</button>
        </div>
      </div>
    </div>
  );
}

// ─── ZOOMABLE SVG ───────────────────────────────────────────────────────────
function ZoomableSVG({ children, viewBox, className }) {
  const svgRef    = useRef(null);
  const isPanning = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const onWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * delta)) }));
  }, []);
  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);
  const onMouseMove = useCallback(e => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x, dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);
  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <svg ref={svgRef} viewBox={viewBox} className={className}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      style={{ cursor: 'grab' }}>
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
        {children}
      </g>
    </svg>
  );
}

// ─── SKILL TREE SVG ─────────────────────────────────────────────────────────
function SkillTreeSVG({ skills, unlocked, canUnlockFn, onNodeClick, selected, hovered, setHovered, zoomable = false }) {
  const getNodeById = id => skills.find(s => s.id === id);
  const getEdgeColor = (fromId, toId) => {
    if (unlocked.has(toId)) return '#0047AB';
    const toNode = getNodeById(toId);
    if (toNode && canUnlockFn(toNode)) return '#60a5fa';
    return '#cbd5e1';
  };
  const isRelatedEdge = (fromId, toId) =>
    selected && (fromId === selected.id || toId === selected.id);

  const minY      = Math.min(...skills.map(s => s.y || 0));
  const svgHeight = Math.max(...skills.map(s => s.y || 60)) - minY + NODE_H + 40;
  const svgWidth  = Math.max(...skills.map(s => s.x || 0)) + NODE_W + 100;

  const inner = (
    <>
      <defs>
        <pattern id="dots-cobalt" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#c2d3e0" />
        </pattern>
      </defs>
      <rect width={svgWidth} height={svgHeight} fill="url(#dots-cobalt)" />

      {/* Dim edges */}
      {skills.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(skill.id);
        const color    = getEdgeColor(reqId, skill.id);
        const x1 = from.x, y1 = from.y + NODE_H / 2;
        const x2 = skill.x, y2 = skill.y - NODE_H / 2;
        const my = (y1 + y2) / 2;
        return (
          <path key={`edge-${reqId}-${skill.id}`}
            d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
            fill="none" stroke={color}
            strokeWidth={isActive ? 2 : 1.5}
            strokeDasharray={isActive ? 'none' : '6,4'}
            strokeOpacity={selected ? 0.15 : (isActive ? 1 : 0.5)} />
        );
      }))}

      {/* Highlighted edges */}
      {selected && skills.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || !isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(skill.id);
        const x1 = from.x, y1 = from.y + NODE_H / 2;
        const x2 = skill.x, y2 = skill.y - NODE_H / 2;
        const my = (y1 + y2) / 2;
        const hc = reqId === selected.id ? '#0047AB' : '#10b981';
        return (
          <g key={`edge-rel-${reqId}-${skill.id}`}>
            <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
              fill="none" stroke={hc} strokeWidth={8} strokeOpacity={0.15} strokeLinecap="round" />
            <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
              fill="none" stroke={hc}
              strokeWidth={isActive ? 3 : 2.5}
              strokeDasharray={isActive ? 'none' : '6,4'}
              strokeOpacity={1} strokeLinecap="round" />
          </g>
        );
      }))}

      {/* Nodes */}
      {skills.map(skill => {
        const isUnlocked    = unlocked.has(skill.id);
        const canUnlockThis = canUnlockFn(skill);
        const isSelected    = selected?.id === skill.id;
        const isHov         = hovered === skill.id;
        const isRelated     = !selected || isSelected
          || skill.requires.includes(selected?.id)
          || skills.some(s => s.id === selected?.id && s.requires.includes(skill.id));
        const { bg, border, text, bar } = getNodeColors(isUnlocked, canUnlockThis, skill.progress);
        const nx = skill.x - NODE_W / 2, ny = skill.y - NODE_H / 2;
        const pColor = getProgressColor(skill.progress);

        return (
          <g key={skill.id}
            className={`tree-node ${isUnlocked || canUnlockThis ? 'clickable' : 'locked'}`}
            onClick={e => { e.stopPropagation(); onNodeClick(skill); }}
            onMouseEnter={() => setHovered(skill.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: selected && !isRelated ? 0.25 : 1, transition: 'opacity .2s' }}>

            {canUnlockThis && (
              <rect x={nx - 4} y={ny - 4} width={NODE_W + 8} height={NODE_H + 8} rx={11}
                fill="none" stroke="#60a5fa" strokeWidth={2} className="pulse-ring-blue" />
            )}
            {isSelected && (
              <rect x={nx - 4} y={ny - 4} width={NODE_W + 8} height={NODE_H + 8} rx={11}
                fill="none" stroke="#0047AB" strokeWidth={2.5} opacity={0.9} />
            )}
            {isHov && !isSelected && (
              <rect x={nx - 3} y={ny - 3} width={NODE_W + 6} height={NODE_H + 6} rx={10}
                fill="none" stroke={border} strokeWidth={1.5} opacity={0.5} />
            )}
            <rect x={nx} y={ny} width={NODE_W} height={NODE_H} rx={8}
              fill={bg} stroke={isSelected ? '#0047AB' : border}
              strokeWidth={isSelected ? 2.5 : 1.5}
              style={{ filter: isUnlocked ? 'drop-shadow(0 2px 6px rgba(0,71,171,0.10))' : 'none' }} />

            {/* Progress bar */}
            <rect x={nx + 2} y={ny + NODE_H - 10} width={NODE_W - 4} height={7} rx={3.5} fill={bar} />
            <rect x={nx + 2} y={ny + NODE_H - 10}
              width={Math.max(0, (NODE_W - 4) * skill.progress / 100)}
              height={7} rx={3.5} fill={pColor} opacity={0.9} />

            {/* Icon */}
            <text x={nx + 28} y={skill.y - 12} textAnchor="middle" dominantBaseline="central" fontSize={26}>
              {skill.icon}
            </text>

            {/* Name */}
            <text x={nx + NODE_W / 2 + 14} y={skill.y - 10}
              textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight="700" fill={text}>
              {skill.name.length > 18 ? skill.name.slice(0, 17) + '…' : skill.name}
            </text>

            {/* Level / Elo / lock */}
            {!isUnlocked && !canUnlockThis
              ? <text x={skill.x} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                  fontSize={13} fill="#94a3b8">🔒 ล็อก</text>
              : <>
                  <text x={skill.x - 28} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                    fontSize={11} fontWeight="700" fill={pColor}>Lv.{skill.level}</text>
                  <text x={skill.x + 28} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                    fontSize={11} fill="#64748b">Elo {skill.elo.toLocaleString()}</text>
                </>
            }
          </g>
        );
      })}
    </>
  );

  const viewBox = `0 0 ${svgWidth} ${svgHeight}`;
  if (zoomable) {
    return <ZoomableSVG viewBox={viewBox} className="skill-tree-svg">{inner}</ZoomableSVG>;
  }
  return (
    <svg viewBox={viewBox} className="skill-tree-svg" style={{ minWidth: '100%', minHeight: '100%' }}>
      {inner}
    </svg>
  );
}

// ─── NEXT EXERCISE PICKER ───────────────────────────────────────────────────
function NextExercisePicker({ skills, unlocked, canUnlockFn, onGo, onClose }) {
  const [picked, setPicked] = useState(null);
  const available = skills.filter(s => unlocked.has(s.id) || canUnlockFn(s));
  return (
    <div className="ex-picker-overlay" onClick={onClose}>
      <div className="ex-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="ex-picker-header">
          <span className="ex-picker-title">เลือกเรื่องที่จะทำ Exercise</span>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <p className="ex-picker-hint">เลือกได้ 1 เรื่อง (เฉพาะที่ปลดล็อกแล้วหรือพร้อมปลดล็อก)</p>
        <div className="ex-picker-list">
          {available.map(s => (
            <div key={s.id}
              className={`ex-picker-item ${picked?.id === s.id ? 'selected' : ''}`}
              onClick={() => setPicked(s)}>
              <div className="ex-picker-info">
                <span className="ex-picker-name">{s.name}</span>
                <span className="ex-picker-prog" style={{ color: getProgressColor(s.progress) }}>{s.progress}%</span>
              </div>
              {picked?.id === s.id && <span className="ex-picker-check">✓</span>}
            </div>
          ))}
        </div>
        <button className={`btn-go-exercise ${picked ? 'active' : 'inactive'}`}
          disabled={!picked} onClick={() => picked && onGo(picked)}>
          {picked ? `Go Exercise: ${picked.name} →` : 'เลือกเรื่องก่อนแล้วกด Go'}
        </button>
      </div>
    </div>
  );
}

// ─── SKILL SIDE PANEL ───────────────────────────────────────────────────────
function SkillSidePanel({ selected, setSelected, skills, unlocked, canUnlockFn, onStartExercise }) {
  if (!selected) return null;
  const skill = skills.find(s => s.id === selected.id);
  if (!skill) return null;
  const prereqNodes = skill.requires.map(id => skills.find(s => s.id === id)).filter(Boolean);
  const nextNodes   = skills.filter(s => s.requires.includes(skill.id));
  const isUnlocked  = unlocked.has(skill.id);
  const canDo       = canUnlockFn(skill);
  return (
    <div className="side-panel">
      <div className="side-panel-section">
        <div className="side-panel-top-row">
          <span className="side-panel-icon">{skill.icon}</span>
          <button className="btn-close" onClick={() => setSelected(null)}>✕</button>
        </div>
        <div className="side-panel-title">{skill.name}</div>
        <div style={{ fontSize: '11px', color: skill.tierColor, fontWeight: '600', marginBottom: '6px' }}>
          {skill.tierLabel}
        </div>
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${skill.progress}%`, background: getProgressColor(skill.progress) }} />
          </div>
          <span className="progress-pct" style={{ color: getProgressColor(skill.progress) }}>{skill.progress}%</span>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '6px', marginBottom: '4px' }}>
          <span style={{
            fontSize: '11px', fontWeight: '700', padding: '2px 8px',
            background: getProgressColor(skill.progress) + '18',
            border: `1px solid ${getProgressColor(skill.progress)}44`,
            color: getProgressColor(skill.progress), borderRadius: '99px',
          }}>Level {skill.level}</span>
          <span style={{
            fontSize: '11px', fontWeight: '600', padding: '2px 8px',
            background: '#f1f5f9', border: '1px solid #e2e8f0',
            color: '#475569', borderRadius: '99px',
          }}>Elo {skill.elo?.toLocaleString() ?? '—'}</span>
        </div>
        <p className="side-panel-status">
          {isUnlocked ? 'ปลดล็อกแล้ว' : canDo ? 'พร้อมปลดล็อก' : 'ยังล็อกอยู่'}
        </p>
      </div>
      <div className="side-panel-section">
        <p className="side-panel-label">มาจาก (Prerequisite)</p>
        {prereqNodes.length === 0
          ? <p className="side-panel-empty">— ไม่มี (จุดเริ่มต้น)</p>
          : prereqNodes.map(n => (
            <div key={n.id} className="node-row" onClick={() => setSelected(n)}>
              <span className="node-row-name">{n.name}</span>
              <span className="node-row-pct" style={{ color: getProgressColor(n.progress) }}>{n.progress}%</span>
            </div>
          ))}
      </div>
      <div className="side-panel-section">
        <p className="side-panel-label">ต่อไป (Unlocks)</p>
        {nextNodes.length === 0
          ? <p className="side-panel-empty">— ไม่มี (จุดสิ้นสุด)</p>
          : nextNodes.map(n => (
            <div key={n.id} className="node-row" onClick={() => setSelected(n)}>
              <span className="node-row-name">{n.name}</span>
              <span className="node-row-pct" style={{ color: getProgressColor(n.progress) }}>{n.progress}%</span>
            </div>
          ))}
      </div>
      <div className="side-panel-section">
        <button
          className={`btn-exercise ${isUnlocked ? 'unlocked' : canDo ? 'can-unlock' : 'disabled'}`}
          disabled={!isUnlocked && !canDo}
          onClick={() => onStartExercise(skill)}>
          {isUnlocked ? 'ไปทำ Exercise →' : canDo ? 'ปลดล็อก + Exercise →' : 'ยังทำไม่ได้'}
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ────────────────────────────────────────────thou────────────
function ProfileTab({ unlocked, sessions, USER }) {
  const behavior = computeBehavior(sessions, unlocked);
  const meta     = BEHAVIOR_META[behavior.cls];
  return (
    <div className="tab-profile">
      <div className="profile-container">
        <div className="profile-hero">
          <div className="profile-avatar-lg">{USER.avatar}</div>
          <div className="profile-info-main">
            <div className="profile-name">{USER.name}</div>
            <div className="profile-goal">เป้าหมาย: {USER.goal}</div>
          </div>
          <div className="profile-skill-count">
            <div className="profile-skill-count-label">Skills ปลดล็อก</div>
            <div className="profile-skill-count-num">{unlocked.size}</div>
          </div>
        </div>

        <div className="behavior-card" style={{ background: meta.bg, borderColor: meta.border }}>
          <div className="behavior-class-header">
            <div className="behavior-class-badge" style={{ background: meta.color }}>
              <span className="bcb-emoji">{meta.emoji}</span>
              <span className="bcb-label">{meta.label} Learner</span>
            </div>
            <div className="behavior-score-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div className="behavior-score-ring" style={{ '--ring-color': meta.color }}>
                <span className="behavior-score-num" style={{ color: meta.color }}>{behavior.score}</span>
                <span className="behavior-score-sub">/ 100</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '600', color: meta.color }}>คะแนนพฤติกรรม</span>
            </div>
          </div>
          <p className="behavior-desc" style={{ color: meta.color }}>{meta.desc}</p>
          <div className="behavior-dims">
            <div className="behavior-dim-row" style={{ padding: '8px 0', borderBottom: '1px solid #e2e8f0', marginBottom: '8px' }}>
              <span className="bdim-icon" style={{ fontSize: '18px' }}>⏱️</span>
              <span className="bdim-label" style={{ fontWeight: '600', color: '#334155' }}>เวลาไขโจทย์เฉลี่ย</span>
              <span className="bdim-val" style={{ marginLeft: 'auto', fontWeight: '800', color: meta.color }}>{behavior.avgTime} วินาที / ข้อ</span>
            </div>
            {Object.entries(behavior.dims).map(([key, val]) => {
              const dm = DIM_LABELS[key];
              return (
                <div key={key} className="behavior-dim-row">
                  <span className="bdim-icon">{dm.icon}</span>
                  <span className="bdim-label">{dm.label}</span>
                  <div className="bdim-track">
                    <div className="bdim-fill" style={{ width: `${val}%`, background: meta.color }} />
                    <div className="bdim-marker" style={{ left: '50%' }} />
                    <div className="bdim-marker" style={{ left: '70%' }} />
                  </div>
                  <span className="bdim-val" style={{ color: meta.color }}>{val}%</span>
                </div>
              );
            })}
          </div>
          <div className="behavior-class-legend">
            {Object.entries(BEHAVIOR_META).map(([k, m]) => (
              <span key={k} className={`bcl-item ${behavior.cls === k ? 'active' : ''}`}
                style={behavior.cls === k ? { background: m.color, color: '#fff', borderColor: m.color } : {}}>
                {m.emoji} {m.label}
              </span>
            ))}
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card-title">ข้อมูลส่วนตัว</div>
            {[
              { label: 'ชื่อ-นามสกุล', value: USER.name },
              { label: 'คณะ',          value: USER.faculty  || '-' },
              { label: 'สาขา',         value: USER.major    || '-' },
              { label: 'ชั้นปี',        value: USER.year     || '-' },
              { label: 'วิทยาเขต',     value: USER.campus   || '-' },
              { label: 'เป้าหมาย',     value: USER.goal },
            ].map((r, i) => (
              <div key={i} className="profile-info-row">
                <span className="profile-info-label">{r.label}</span>
                <span className="profile-info-value">{r.value}</span>
              </div>
            ))}
          </div>

          {/* Session summary */}
          <div className="profile-card">
            <div className="profile-card-title">สถิติ Session</div>
            {[
              { label: 'Sessions ทั้งหมด', value: `${sessions.length} ครั้ง` },
              { label: 'คะแนนเฉลี่ย',      value: sessions.length ? `${Math.round(sessions.reduce((s,x)=>s+x.score,0)/sessions.length)}%` : '-' },
              { label: 'Session ดีเยี่ยม',  value: `${sessions.filter(s=>s.grade==='great').length} ครั้ง` },
              { label: 'Skills ที่ฝึกแล้ว',  value: `${new Set(sessions.map(s=>s.skillId)).size} skills` },
              { label: 'โจทย์ที่ตอบทั้งหมด', value: `${sessions.reduce((s,x)=>s+x.questions.length,0)} ข้อ` },
              { label: 'ถูกต้อง',            value: `${sessions.reduce((s,x)=>s+x.questions.filter(q=>q.correct).length,0)} ข้อ` },
              { label: 'ความแม่นยำรวม',    value: `${behavior.dims.streak}%` },
            ].map((r, i) => (
              <div key={i} className="profile-info-row">
                <span className="profile-info-label">{r.label}</span>
                <span className="profile-info-value">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
export default function HomeNew() {
  const navigate = useNavigate();
  const appCtx = useApp();

  const branches     = appCtx?.branches?.length > 0 ? appCtx.branches : MOCK_BRANCHES;
  const activeBranch = appCtx?.activeBranch || branches[0];
  const userProfile  = appCtx?.userProfile || MOCK_USER_PROFILE;

  const USER = {
    name:    `${userProfile.fname} ${userProfile.lname}`,
    goal:    activeBranch.goalName,
    avatar:  userProfile.fname[0].toUpperCase(),
    faculty: activeBranch.faculty,
    major:   activeBranch.major,
    year:    activeBranch.year,
    campus:  activeBranch.campus,
  };

  // ── Skills + layout ─────────────────────────────────────────
  const rawSkills = getSkillTreeForGoal(activeBranch.goalId);

  // คำนวณ progress จาก sessions จริง
  const sessionProg = computeSkillProgress(activeBranch.sessions);
  const enrichedSkills = rawSkills.map(s => ({
    ...s,
    progress: sessionProg[s.id] ?? s.progress,
    level: getSkillLevel({ ...s, progress: sessionProg[s.id] ?? s.progress }),
    elo:   getSkillElo({ ...s, progress: sessionProg[s.id] ?? s.progress }),
  }));
  const treeSkills = layoutSkills(enrichedSkills);

  // ── Unlocked skills (คำนวณอัตโนมัติจาก sessions + threshold 60%) ─
  // const [unlocked, setUnlocked] = useState(() =>
  //   computeUnlockedSkills(activeBranch.sessions, enrichedSkills)
  // );
  const [unlocked, setUnlocked] = useState(() => {
    const set = new Set();
    enrichedSkills.forEach(s => {
      if (s.progress > 0) set.add(s.id);
    });
    return set;
  });
  const sessions = activeBranch.sessions;

  const [activeTab,       setActiveTab]       = useState('Home');
  const [selected,        setSelected]        = useState(null);
  const [hovered,         setHovered]         = useState(null);
  const [showPicker,      setShowPicker]      = useState(false);
  const [confirmSkill,    setConfirmSkill]    = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGoalMenu,    setShowGoalMenu]    = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [twText,          setTwText]          = useState('');
  const [showCursor,      setShowCursor]      = useState(true);
  const [historyFilter,   setHistoryFilter]   = useState(new Set(['all']));
  const [topicFilter,     setTopicFilter]     = useState('all');
  const [openSessions,    setOpenSessions]    = useState({});

  const profileMenuRef = useRef(null);
  const goalMenuRef    = useRef(null);

  // Typewriter effect
  useEffect(() => {
    let i = 0; setTwText(''); setShowCursor(true);
    const timer = setInterval(() => {
      setTwText(USER.name.substring(0, i + 1)); i++;
      if (i >= USER.name.length) { clearInterval(timer); setTimeout(() => setShowCursor(false), 1500); }
    }, 70);
    return () => clearInterval(timer);
  }, [USER.name]);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = e => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) setShowProfileMenu(false);
      // Wait to handle goal menu below since it may trigger CreateBranchModal
      if (goalMenuRef.current    && !goalMenuRef.current.contains(e.target) && !e.target.closest('.create-branch-modal'))    setShowGoalMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const canUnlock = skill => {
    if (unlocked.has(skill.id)) return false;
    const parentReqs = PREREQS.filter(p => p.skillId === skill.id);
    if (parentReqs.length === 0) return true;
    return parentReqs.every(req => {
      const parentSkill = enrichedSkills.find(p => p.id === req.prereqId);
      const reqLvl = parseInt(req.minLevel.replace(/\D/g, ''), 10) || 1;
      return parentSkill && parentSkill.level >= reqLvl;
    });
  };

  const handleNodeClick       = skill => setSelected(prev => prev?.id === skill.id ? null : skill);
  const handleStartExercise   = skill => setConfirmSkill(skill);
  const handleConfirmExercise = () => { setConfirmSkill(null); navigate('/exercise'); };
  const handleCancelExercise  = () => setConfirmSkill(null);
  const handleGoPicker        = skill => { setShowPicker(false); setConfirmSkill(skill); };
  const toggleSession         = id => setOpenSessions(prev => ({ ...prev, [id]: !prev[id] }));
  const gradeLabel            = g => g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง';
  const switchTab             = tab => { setActiveTab(tab); setSelected(null); };

  const handleHistoryFilter = filter => {
    setHistoryFilter(prev => {
      const next = new Set(prev);
      if (filter === 'all') return new Set(['all']);
      next.delete('all');
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next.size === 0 ? new Set(['all']) : next;
    });
  };

  const allTopics = ['all', ...Array.from(new Set(sessions.map(s => s.title)))];

  const renderSessionCard = s => (
    <div key={s.id} className="session-card">
      <div className="session-head" onClick={() => toggleSession(s.id)}>
        <div className="session-head-left">
          <div className="session-num">#{s.id}</div>
          <div>
            <div className="session-title">{s.title}</div>
            <div className="session-meta">{s.date} · {s.questions.length} ข้อ</div>
          </div>
        </div>
        <div className="session-head-right">
          <span className={`score-badge ${s.grade}`}>{s.score}% · {gradeLabel(s.grade)}</span>
          <span className={`chevron ${openSessions[s.id] ? 'open' : ''}`}>▾</span>
        </div>
      </div>
      {openSessions[s.id] && (
        <div className="session-body">
          {s.questions.map((q, qi) => {
            const skillName = enrichedSkills.find(sk => sk.id === q.skill)?.name || q.skill;
            return (
              <div key={qi} className="q-item">
                <div className={`q-icon ${q.correct ? 'correct' : 'wrong'}`}>{q.correct ? '✓' : '✗'}</div>
                <div className="q-body">
                  <div className="q-text">ข้อ {qi + 1}: {q.text}</div>
                  <div className="q-meta">เรื่อง: {skillName} · เวลา: {q.time}</div>
                  {q.correct
                    ? <span className="ans-correct">✓ ถูกต้อง</span>
                    : <span>
                        <span className="ans-wrong">คำตอบคุณ: {q.chosen}</span>
                        <span className="ans-arrow"> → </span>
                        <span className="ans-correct">เฉลย: {q.answer}</span>
                      </span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // ── Computed stats ─────────────────────────────────────────
  const requiredGoalSkills = GOAL_SKILLS[activeBranch.goalId] || [];
  let totalReqElo = 0;
  let totalUserElo = 0;
  
  requiredGoalSkills.forEach(req => {
    const minLvl = parseInt(req.minLevel.replace(/\D/g, ''), 10) || 1;
    const reqElo = ELO_RANGES[minLvl].min;
    const userElo = enrichedSkills.find(s => s.id === req.skillId)?.elo || 1200;
    
    const baseElo = 1200;
    const reqSpread = Math.max(0, reqElo - baseElo);
    const userSpread = Math.max(0, userElo - baseElo);
    
    totalReqElo += reqSpread;
    totalUserElo += Math.min(userSpread, reqSpread);
  });
  
  const goalProgressPct = totalReqElo > 0 ? Math.round((totalUserElo / totalReqElo) * 100) : 0;

  return (
    <div className="app">
      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="nav-logo-text">PSU · ALS</span>

          {/* Goal switcher */}
          <div ref={goalMenuRef} style={{ position: 'relative', marginLeft: '8px' }}>
            <button onClick={() => setShowGoalMenu(v => !v)} style={{
              fontSize: '12px', fontWeight: '600', color: '#0047AB',
              background: 'rgba(0,71,171,0.08)', border: '1px solid rgba(0,71,171,0.2)',
              borderRadius: '99px', padding: '3px 10px', cursor: 'pointer',
              whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px',
            }}>
              {activeBranch.goalName}
              <span style={{ fontSize: '10px' }}>▾</span>
            </button>
            {showGoalMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0,
                minWidth: '220px', background: '#fff',
                border: '1px solid #c2d3e0', borderRadius: '14px',
                boxShadow: '0 8px 32px rgba(0,71,171,0.13)', zIndex: 300, overflow: 'hidden',
              }}>
                {branches.map(b => (
                  <button key={b.id} onClick={() => { if (appCtx?.switchBranch) appCtx.switchBranch(b.id); setShowGoalMenu(false); }} style={{
                    width: '100%', padding: '10px 14px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                    background: b.id === activeBranch.id ? '#e8f0fe' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                    borderBottom: '1px solid #f1f5f9', fontFamily: 'inherit',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{b.goalName}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.campus} · ปี {b.year}</div>
                    </div>
                    {b.id === activeBranch.id && (
                      <span style={{ marginLeft: 'auto', color: '#0047AB', fontSize: '12px' }}>✓</span>
                    )}
                  </button>
                ))}
                <button onClick={() => { setShowCreateModal(true); setShowGoalMenu(false); }} style={{
                  width: '100%', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: '#f8fafc', border: 'none', cursor: 'pointer', textAlign: 'left',
                  color: '#0047AB', fontWeight: '700'
                }}>
                  <span style={{ fontSize: '18px' }}>+</span>
                  <span style={{ fontSize: '13px' }}>เพิ่มเป้าหมายใหม่</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="nav-tabs">
          {[
            { key: 'Home',      label: 'Home' },
            { key: 'SkillTree', label: 'Skill Tree' },
            { key: 'History',   label: 'History' },
            { key: 'Profile',   label: 'Profile' },
          ].map(t => (
            <button key={t.key}
              className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
              onClick={() => switchTab(t.key)}>{t.label}</button>
          ))}
        </div>

        <div className="nav-user-wrapper" ref={profileMenuRef}>
          <button className="nav-user" onClick={() => setShowProfileMenu(v => !v)}>
            <div className="nav-user-avatar">{USER.avatar}</div>
            <span className="nav-user-name">{USER.name}</span>
            <span className={`nav-chevron ${showProfileMenu ? 'open' : ''}`}>▾</span>
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{USER.avatar}</div>
                <div>
                  <div className="dropdown-name">{USER.name}</div>
                  <div className="dropdown-email">{activeBranch.goalName}</div>
                </div>
              </div>
              <div className="dropdown-sep" />
              <button className="dropdown-item" onClick={() => { switchTab('Profile'); setShowProfileMenu(false); }}>
                Profile
              </button>
              <div className="dropdown-sep" />
              <button className="dropdown-item danger" onClick={() => navigate('/')}>Log Out</button>
            </div>
          )}
        </div>
      </nav>

      {/* ─── CONTENT ────────────────────────────────────────── */}
      <div className="content">

        {/* HOME TAB */}
        {activeTab === 'Home' && (
          <div className="tab-home">
            <div className="tab-home-main">
              <div className="home-top">
                {/* Hero */}
                <div className="home-hero">
                  <div className="home-hero-avatar">{USER.avatar}</div>
                  <div className="home-hero-info">
                    <div className="home-greeting">ยินดีต้อนรับกลับ</div>
                    <h1 className="home-username">
                      {twText}{showCursor && <span className="cursor" />}
                    </h1>
                    <div className="home-goal">
                      เป้าหมาย: <span className="goal-badge">{activeBranch.goalName}</span>
                    </div>
                  </div>
                </div>

                {/* Stats grid */}
                <div className="stats-grid">
                  {[
                    { num: `${unlocked.size}`,          label: 'Skills Unlocked', cls: 'gold'   },
                    { num: `${sessions.length}`,         label: 'Sessions Done',   cls: 'green'  },
                    { num: `${activeBranch.streak}`,    label: 'Day Streak',      cls: 'blue'   },
                    { num: `${goalProgressPct}%`,        label: 'Goal Progress',   cls: 'purple' },
                  ].map((s, i) => (
                    <div key={i} className={`stat-card ${s.cls}`}>
                      <div className="stat-num">{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Progress summary */}
                <div style={{
                  background: '#f0f9ff', border: '1px solid #bae6fd',
                  borderRadius: '12px', padding: '12px 16px', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0369a1' }}>
                    Progress โดยรวม
                  </span>
                  {enrichedSkills.filter(s => s.progress > 0).map(s => (
                    <div key={s.id} 
                      onClick={() => handleNodeClick(s)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}
                      title={`Skill: ${s.name}\nElo: ${s.elo.toLocaleString()}\nProgress: ${s.progress}%`}
                    >
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                        {s.name.length > 12 ? s.name.substring(0, 10) + '…' : s.name}
                      </span>
                      <div style={{
                        width: '40px', height: '6px', background: '#e0f2fe',
                        borderRadius: '3px', overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${s.progress}%`, height: '100%',
                          background: getProgressColor(s.progress), borderRadius: '3px',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="section-label">Skill Tree — คลิกที่โหนดเพื่อดูรายละเอียด</div>
              </div>

              {/* Tree */}
              <div className="home-tree-wrap" style={{ height: '520px', overflow: 'hidden', position: 'relative' }}>
                <SkillTreeSVG skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
                  onNodeClick={handleNodeClick} selected={selected} hovered={hovered}
                  setHovered={setHovered} zoomable={true} />
                <button 
                  onClick={(e) => { e.stopPropagation(); switchTab('SkillTree'); }}
                  style={{
                    position: 'absolute', bottom: '16px', right: '16px',
                    background: '#fff', border: '1px solid #c2d3e0', borderRadius: '8px',
                    width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 10
                  }}
                  title="ขยายเต็มจอ"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0047AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                  </svg>
                </button>
              </div>

              {/* Next exercise */}
              <div className="home-next-ex-bar">
                <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
                  Next Exercise — เลือกเรื่องที่จะทำ
                </button>
              </div>

              {/* Recent sessions (last 5) */}
              <div className="home-sessions">
                <div className="section-label">📋 Session ล่าสุด</div>
                {sessions.length === 0
                  ? <p style={{ color: '#94a3b8', textAlign: 'center', padding: '24px' }}>
                      ยังไม่มี session — เริ่มทำ Exercise ได้เลย!
                    </p>
                  : <div className="session-list">
                      {[...sessions].reverse().slice(0, 5).map(renderSessionCard)}
                    </div>
                }
              </div>
            </div>

            <SkillSidePanel selected={selected} setSelected={setSelected}
              skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
              onStartExercise={handleStartExercise} />
          </div>
        )}

        {/* SKILL TREE TAB */}
        {activeTab === 'SkillTree' && (
          <div className="tab-skill-tree">
            <div className="tree-main">
              <SkillTreeSVG skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
                onNodeClick={handleNodeClick} selected={selected} hovered={hovered}
                setHovered={setHovered} zoomable={true} />
            </div>
            <SkillSidePanel selected={selected} setSelected={setSelected}
              skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
              onStartExercise={handleStartExercise} />
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'History' && (
          <div className="tab-history">
            <div className="history-header">
              <h2 className="history-title">Session History ({sessions.length} sessions)</h2>
              <div className="history-filter">
                <select className="filter-select" value={topicFilter}
                  onChange={e => setTopicFilter(e.target.value)}>
                  {allTopics.map(t => (
                    <option key={t} value={t}>{t === 'all' ? 'ทุกเรื่อง' : t}</option>
                  ))}
                </select>
                {['all','great','good','low'].map(f => (
                  <button key={f}
                    className={`filter-btn ${historyFilter.has(f) ? 'active' : ''}`}
                    onClick={() => handleHistoryFilter(f)}>
                    {f === 'all' ? 'ทั้งหมด' : gradeLabel(f)}
                  </button>
                ))}
              </div>
            </div>
            <div className="history-list">
              {sessions
                .filter(s => {
                  const gm = historyFilter.has('all') || historyFilter.has(s.grade);
                  const tm = topicFilter === 'all' || s.title === topicFilter;
                  return gm && tm;
                })
                .reverse()
                .map(renderSessionCard)}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <ProfileTab unlocked={unlocked} sessions={sessions} USER={USER} />
        )}
      </div>

     {/* ─── MODALS ─────────────────────────────────────────── */}
{showPicker && (
  <NextExercisePicker skills={treeSkills} unlocked={unlocked} canUnlockFn={canUnlock}
    onGo={handleGoPicker} onClose={() => setShowPicker(false)} />
)}
{confirmSkill && (
  <ExerciseConfirmModal skill={confirmSkill}
    onConfirm={handleConfirmExercise} onCancel={handleCancelExercise} />
)}
{showCreateModal && (
  <CreateBranchModal onClose={() => setShowCreateModal(false)} />
)}
    </div>
  );
}