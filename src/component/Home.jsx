import React, { useState, useEffect, useRef, useCallback } from 'react';
import './decorate/Home.css';
import { useNavigate } from 'react-router-dom';

// ─── DATA ───
const USER = { name: 'Afdol leenud', goal: 'Data Structures', avatar: 'A' };

const SKILLS = [
  { id: 1,  name: "Python Basics",      x: 500, y: 50,  requires: [],           progress: 100, icon: "🐍" },
  { id: 2,  name: "Variables & Types",  x: 280, y: 200, requires: [1],          progress: 80,  icon: "📦" },
  { id: 3,  name: "Control Flow",       x: 720, y: 200, requires: [1],          progress: 70,  icon: "🔀" },
  { id: 4,  name: "Functions",          x: 170, y: 350, requires: [2],          progress: 70,  icon: "🔧" },
  { id: 5,  name: "List",               x: 390, y: 350, requires: [2, 3],       progress: 65,  icon: "📋" },
  { id: 6,  name: "Tuple & Set",        x: 610, y: 350, requires: [2, 3],       progress: 50,  icon: "🔗" },
  { id: 7,  name: "Dictionary",         x: 830, y: 350, requires: [3],          progress: 40,  icon: "📖" },
  { id: 8,  name: "Recursion",          x: 170, y: 500, requires: [4],          progress: 30,  icon: "🔁" },
  { id: 9,  name: "Stack & Queue",      x: 390, y: 500, requires: [5, 4],       progress: 20,  icon: "🥞" },
  { id: 10, name: "Linked List",        x: 610, y: 500, requires: [5, 6],       progress: 10,  icon: "⛓️" },
  { id: 11, name: "Hash Table",         x: 830, y: 500, requires: [7],          progress: 5,   icon: "🗂️" },
  { id: 12, name: "Tree",               x: 280, y: 650, requires: [8, 9],       progress: 0,   icon: "🌳" },
  { id: 13, name: "Graph",              x: 720, y: 650, requires: [10, 11],     progress: 0,   icon: "🕸️" },
  { id: 14, name: "Sorting Algorithms", x: 500, y: 650, requires: [9, 10],      progress: 0,   icon: "📊" },
  { id: 15, name: "Data Structure",     x: 500, y: 800, requires: [12, 13, 14], progress: 0,   icon: "🏆" },
];

const SKILL_UNLOCK_DATES = {
  1: '2026-02-10', 2: '2026-02-15', 3: '2026-02-18'
  // 4: '2026-02-22', 5: '2026-02-25', 6: '2026-02-28',
  // 7: '2026-03-02', 8: '2026-03-05', 9: '2026-03-07',
};

const EXERCISES = {
  1:  { title: "Python Basics",          questions: ["Python คืออะไร และทำงานอย่างไร?", "เขียน Hello World ใน Python", "comment ใน Python เขียนอย่างไร?"] },
  2:  { title: "Variables & Types",      questions: ["int, float, str, bool ต่างกันอย่างไร?", "type casting คืออะไร?", "f-string ใช้งานอย่างไร?"] },
  3:  { title: "Control Flow",           questions: ["if/elif/else ใช้งานอย่างไร?", "for loop vs while loop ต่างกัน?", "break, continue, pass ใช้เมื่อไหร่?"] },
  4:  { title: "Functions",              questions: ["*args และ **kwargs คืออะไร?", "lambda function คืออะไร?", "scope และ closure ใน Python คืออะไร?"] },
  5:  { title: "List",                   questions: ["list comprehension คืออะไร?", "slicing ทำงานอย่างไร?", "append vs extend vs insert ต่างกัน?"] },
  6:  { title: "Tuple & Set",            questions: ["tuple immutable หมายความว่าอะไร?", "set operations เช่น union/intersection คืออะไร?", "frozenset ใช้ทำอะไร?"] },
  7:  { title: "Dictionary",             questions: ["dict comprehension คืออะไร?", "defaultdict และ OrderedDict คืออะไร?", "nested dictionary ใช้งานอย่างไร?"] },
  8:  { title: "Recursion",              questions: ["base case คืออะไร?", "เขียน Fibonacci ด้วย recursion", "recursion vs iteration เลือกใช้อย่างไร?"] },
  9:  { title: "Stack & Queue",          questions: ["Stack LIFO คืออะไร?", "Queue FIFO คืออะไร?", "deque ใน Python ใช้งานอย่างไร?"] },
  10: { title: "Linked List",            questions: ["Linked List vs Array ต่างกันอย่างไร?", "เขียน Node class ใน Python", "Doubly Linked List คืออะไร?"] },
  11: { title: "Hash Table",             questions: ["hashing คืออะไร?", "collision resolution คืออะไร?", "Python dict ทำงานอย่างไรภายใน?"] },
  12: { title: "Tree",                   questions: ["Binary Tree คืออะไร?", "DFS vs BFS ต่างกันอย่างไร?", "Binary Search Tree ทำงานอย่างไร?"] },
  13: { title: "Graph",                  questions: ["directed vs undirected graph คืออะไร?", "adjacency list vs matrix คืออะไร?", "Dijkstra algorithm คืออะไร?"] },
  14: { title: "Sorting Algorithms",     questions: ["Bubble Sort ทำงานอย่างไร?", "Merge Sort vs Quick Sort ต่างกัน?", "Time complexity ของ sorting แต่ละตัวคืออะไร?"] },
  15: { title: "Data Structure Mastery", questions: ["เลือก data structure ให้เหมาะกับงานอย่างไร?", "Big O Notation คืออะไร?", "เขียน LRU Cache ด้วย Python"] },
};

const SESSIONS = [
  {
    id: 1, title: 'Variables & Loops', date: '2026-03-05', score: 90, grade: 'great',
    questions: [
      { text: 'ผลลัพธ์ของ x = 10; print(x % 3) คืออะไร?', correct: true,  skill: 'Variables', chosen: '1',          answer: '1',          time: '12s' },
      { text: 'for i in range(2,8,2) พิมพ์อะไร?',          correct: true,  skill: 'Loops',     chosen: '2 4 6',      answer: '2 4 6',      time: '18s' },
    ],
  },
  {
    id: 2, title: 'Functions & Recursion', date: '2026-03-04', score: 65, grade: 'good',
    questions: [
      { text: 'mystery(5) คืนค่าอะไร?', correct: true, skill: 'Recursion', chosen: '120',         answer: '120',         time: '22s' },
      { text: 'Base Case คืออะไร?',      correct: true, skill: 'Recursion', chosen: 'เงื่อนไขหยุด', answer: 'เงื่อนไขหยุด', time: '10s' },
    ],
  },
  {
    id: 3, title: 'Stack & Queue', date: '2026-03-03', score: 50, grade: 'low',
    questions: [
      { text: 'Stack ใช้หลักการ?', correct: true,  skill: 'Stack', chosen: 'LIFO', answer: 'LIFO', time: '9s'  },
      { text: 'Queue ใช้หลักการ?', correct: false, skill: 'Queue', chosen: 'LIFO', answer: 'FIFO', time: '11s' },
    ],
  },
];

const NODE_W = 180;
const NODE_H = 80;

// ─── HELPERS ───
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

// ════════════════════════════════
//   BEHAVIOR ENGINE
// ════════════════════════════════

/**
 * คำนวณ stats จาก sessions + unlocked skills แล้ว classify เป็น class
 *
 * Dimensions (แต่ละตัว 0–100):
 *   accuracy   = เฉลี่ยคะแนน session
 *   speed      = inversed avg time per question (เร็ว → สูง)
 *   consistency= สัดส่วน session ที่ score >= 70
 *   review     = สัดส่วน skill ที่มี progress >= 60 จาก unlocked
 *   streak     = streak (max 30 วัน normalize)
 *
 * Class rules (ดูตาม composite score + pattern):
 *   mastery   → accuracy>=85 && consistency>=80 && review>=70
 *   fast      → speed>=70 && accuracy>=70 && consistency>=60
 *   steady    → consistency>=65 && accuracy>=60
 *   slow      → accuracy>=50 && speed<50
 *   struggler → otherwise (accuracy<50 หรือ consistency<40)
 */
function computeBehavior(sessions, unlockedSkills) {
  if (sessions.length === 0) {
    return { dims: { accuracy: 0, speed: 0, consistency: 0, review: 0, streak: 0 }, cls: 'struggler', score: 0 };
  }

  // accuracy
  const accuracy = sessions.reduce((s, x) => s + x.score, 0) / sessions.length;

  // speed — parse avg time (e.g. "12s" → 12), normalize: 30s = 0%, 5s = 100%
  const allTimes = sessions.flatMap(s => s.questions.map(q => parseInt(q.time) || 15));
  const avgTime  = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;
  const speed    = Math.max(0, Math.min(100, ((30 - avgTime) / 25) * 100));

  // consistency — % sessions with score >= 70
  const consistency = (sessions.filter(s => s.score >= 70).length / sessions.length) * 100;

  // review — % unlocked skills with progress >= 60
  const unlockArr = [...unlockedSkills];
  const reviewSkills = SKILLS.filter(s => unlockArr.includes(s.id));
  const review = reviewSkills.length === 0 ? 0
    : (reviewSkills.filter(s => s.progress >= 60).length / reviewSkills.length) * 100;

  // streak (mock = 4, max 30)
  const streakRaw = 4;
  const streak    = Math.min(100, (streakRaw / 30) * 100);

  const dims = {
    accuracy:    Math.round(accuracy),
    speed:       Math.round(speed),
    consistency: Math.round(consistency),
    review:      Math.round(review),
    streak:      Math.round(streak),
  };

  // composite weighted score
  const score = Math.round(
    dims.accuracy    * 0.30 +
    dims.consistency * 0.25 +
    dims.review      * 0.20 +
    dims.speed       * 0.15 +
    dims.streak      * 0.10
  );

  // classify
  let cls;
  if (dims.accuracy >= 85 && dims.consistency >= 80 && dims.review >= 70) {
    cls = 'mastery';
  } else if (dims.speed >= 70 && dims.accuracy >= 70 && dims.consistency >= 60) {
    cls = 'fast';
  } else if (dims.consistency >= 65 && dims.accuracy >= 60) {
    cls = 'steady';
  } else if (dims.accuracy >= 50 && dims.speed < 50) {
    cls = 'slow';
  } else {
    cls = 'struggler';
  }

  return { dims, cls, score };
}

const BEHAVIOR_META = {
  mastery:   { label: 'Mastery',   emoji: '🏆', color: '#0047AB', bg: '#e8f0fe', border: '#93c5fd', desc: 'เชี่ยวชาญและสม่ำเสมอ — คุณเรียนรู้ได้ครบและแม่นยำมาก' },
  fast:      { label: 'Fast',      emoji: '⚡', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', desc: 'ตอบเร็วและแม่นยำ — แต่ควรทบทวน skill เก่าเพิ่มเติม' },
  steady:    { label: 'Steady',    emoji: '🎯', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'สม่ำเสมอและมั่นคง — เพิ่มความเร็วและทบทวนให้มากขึ้น' },
  slow:      { label: 'Slow',      emoji: '🐢', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'เข้าใจดีแต่ใช้เวลานาน — ฝึกทำโจทย์ให้เร็วขึ้น' },
  struggler: { label: 'Struggler', emoji: '💪', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'ยังต้องฝึกเพิ่ม — ลองทบทวนพื้นฐานและทำ session บ่อยขึ้น' },
};

const DIM_LABELS = {
  accuracy:    { label: 'ความแม่นยำ',   icon: '🎯' },
  speed:       { label: 'ความเร็ว',     icon: '⚡' },
  consistency: { label: 'ความสม่ำเสมอ', icon: '📅' },
  review:      { label: 'การทบทวน',    icon: '🔄' },
  streak:      { label: 'Streak',       icon: '🔥' },
};

// ─── EXERCISE CONFIRM MODAL ───
function ExerciseConfirmModal({ skill, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon-wrap">
          <span className="confirm-icon">{skill.icon}</span>
        </div>
        <h2 className="confirm-title">เริ่มทำ Exercise?</h2>
        <p className="confirm-desc">
          คุณต้องการเริ่มทำ Exercise<br />
          <strong>{skill.name}</strong> ใช่หรือไม่?
        </p>
        <div className="confirm-progress-row">
          <div className="confirm-progress-track">
            <div className="confirm-progress-fill"
              style={{ width: `${skill.progress}%`, background: getProgressColor(skill.progress) }} />
          </div>
          <span className="confirm-progress-pct" style={{ color: getProgressColor(skill.progress) }}>
            {skill.progress}%
          </span>
        </div>
        <div className="confirm-btn-row">
          <button className="confirm-btn-cancel" onClick={onCancel}>ไม่ใช่</button>
          <button className="confirm-btn-ok"     onClick={onConfirm}>✅ ใช่ เริ่มเลย!</button>
        </div>
      </div>
    </div>
  );
}

// ─── ZOOMABLE SVG ───
function ZoomableSVG({ children, viewBox, className }) {
  const svgRef    = useRef(null);
  const isPanning = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * delta)) }));
  }, []);

  const onMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
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

// ─── SKILL TREE SVG ───
function SkillTreeSVG({ unlocked, canUnlockFn, onNodeClick, selected, hovered, setHovered, zoomable = false }) {
  const getNodeById = (id) => SKILLS.find(s => s.id === id);

  const getEdgeColor = (fromId, toId) => {
    if (unlocked.has(fromId) && unlocked.has(toId)) return '#0047AB';
    if (unlocked.has(fromId)) return '#60a5fa';
    return '#cbd5e1';
  };

  const isRelatedEdge = (fromId, toId) => {
    if (!selected) return false;
    return fromId === selected.id || toId === selected.id;
  };

  const inner = (
    <>
      <defs>
        <pattern id="dots-cobalt" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#c2d3e0" />
        </pattern>
      </defs>
      <rect width="1000" height="900" fill="url(#dots-cobalt)" />

      {SKILLS.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(reqId) && unlocked.has(skill.id);
        const color    = getEdgeColor(reqId, skill.id);
        const x1 = from.x, y1 = from.y + NODE_H / 2;
        const x2 = skill.x, y2 = skill.y - NODE_H / 2;
        const my = (y1 + y2) / 2;
        return (
          <g key={`edge-${reqId}-${skill.id}`}>
            <path d={`M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`}
              fill="none" stroke={color}
              strokeWidth={isActive ? 2 : 1.5}
              strokeDasharray={isActive ? 'none' : '6,4'}
              strokeOpacity={selected ? 0.15 : (isActive ? 1 : 0.5)} />
            {isActive && !selected && (
              <circle cx={(x1 + x2) / 2} cy={my} r={3.5} fill={color} opacity={0.8} />
            )}
          </g>
        );
      }))}

      {selected && SKILLS.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || !isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(reqId) && unlocked.has(skill.id);
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
            <circle cx={(x1 + x2) / 2} cy={my} r={4.5} fill={hc} opacity={0.9} />
            <circle cx={x2} cy={y2 + 4} r={3} fill={hc} opacity={0.7} />
          </g>
        );
      }))}

      {SKILLS.map(skill => {
        const isUnlocked    = unlocked.has(skill.id);
        const canUnlockThis = canUnlockFn(skill);
        const isSelected    = selected?.id === skill.id;
        const isHov         = hovered === skill.id;
        const isRelated     = !selected || isSelected
          || skill.requires.includes(selected?.id)
          || SKILLS.some(s => s.id === selected?.id && s.requires.includes(skill.id));
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
            <rect x={nx + 8} y={ny + 2} width={NODE_W - 16} height={3} rx={1.5} fill={border} opacity={0.25} />
            <rect x={nx + 2} y={ny + NODE_H - 10} width={NODE_W - 4} height={7} rx={3.5} fill={bar} />
            <rect x={nx + 2} y={ny + NODE_H - 10}
              width={Math.max(0, (NODE_W - 4) * skill.progress / 100)}
              height={7} rx={3.5} fill={pColor} opacity={0.9} />
            <text x={nx + 28} y={skill.y - 8} textAnchor="middle" dominantBaseline="central" fontSize={24}>
              {skill.icon}
            </text>
            <text x={nx + NODE_W / 2 + 12} y={skill.y - 10} textAnchor="middle" dominantBaseline="central"
              fontSize={15} fontWeight="700" fill={text}>
              {skill.name}
            </text>
            {!isUnlocked && !canUnlockThis
              ? <text x={skill.x} y={skill.y + 12} textAnchor="middle" dominantBaseline="central" fontSize={11} fill="#94a3b8">🔒 ล็อก</text>
              : <text x={skill.x} y={skill.y + 12} textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="700" fill={pColor}>{skill.progress}%</text>
            }
          </g>
        );
      })}
    </>
  );

  if (zoomable) {
    return <ZoomableSVG viewBox="0 0 1000 900" className="skill-tree-svg">{inner}</ZoomableSVG>;
  }
  return <svg viewBox="0 0 1000 900" className="skill-tree-svg">{inner}</svg>;
}

// ─── NEXT EXERCISE PICKER ───
function NextExercisePicker({ unlocked, canUnlockFn, onGo, onClose }) {
  const [picked, setPicked] = useState(null);
  const available = SKILLS.filter(s => unlocked.has(s.id) || canUnlockFn(s));

  return (
    <div className="ex-picker-overlay" onClick={onClose}>
      <div className="ex-picker-modal" onClick={e => e.stopPropagation()}>
        <div className="ex-picker-header">
          <span className="ex-picker-title">🎯 เลือกเรื่องที่จะทำ Exercise</span>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
        <p className="ex-picker-hint">เลือกได้ 1 เรื่อง (เฉพาะที่ปลดล็อกแล้วหรือพร้อมปลดล็อก)</p>
        <div className="ex-picker-list">
          {available.map(s => (
            <div key={s.id}
              className={`ex-picker-item ${picked?.id === s.id ? 'selected' : ''}`}
              onClick={() => setPicked(s)}>
              <span className="ex-picker-icon">{s.icon}</span>
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
          {picked ? `Go Exercise: ${picked.icon} ${picked.name} →` : 'เลือกเรื่องก่อนแล้วกด Go'}
        </button>
      </div>
    </div>
  );
}

// ─── SKILL SIDE PANEL ───
function SkillSidePanel({ selected, setSelected, unlocked, canUnlockFn, onStartExercise }) {
  if (!selected) return null;
  const skill = SKILLS.find(s => s.id === selected.id);
  if (!skill) return null;

  const prereqNodes = skill.requires.map(id => SKILLS.find(s => s.id === id)).filter(Boolean);
  const nextNodes   = SKILLS.filter(s => s.requires.includes(skill.id));
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
        <div className="progress-row">
          <div className="progress-track">
            <div className="progress-fill"
              style={{ width: `${skill.progress}%`, background: getProgressColor(skill.progress) }} />
          </div>
          <span className="progress-pct" style={{ color: getProgressColor(skill.progress) }}>
            {skill.progress}%
          </span>
        </div>
        <p className="side-panel-status">
          {isUnlocked ? '✅ ปลดล็อกแล้ว' : canDo ? '🔵 พร้อมปลดล็อก' : '🔒 ยังล็อกอยู่'}
        </p>
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">📥 มาจาก (Prerequisite)</p>
        {prereqNodes.length === 0
          ? <p className="side-panel-empty">— ไม่มี (จุดเริ่มต้น)</p>
          : prereqNodes.map(n => (
            <div key={n.id} className="node-row" onClick={() => setSelected(n)}>
              <span>{n.icon}</span>
              <span className="node-row-name">{n.name}</span>
              <span className="node-row-pct" style={{ color: getProgressColor(n.progress) }}>{n.progress}%</span>
            </div>
          ))}
      </div>

      <div className="side-panel-section">
        <p className="side-panel-label">📤 ต่อไป (Unlocks)</p>
        {nextNodes.length === 0
          ? <p className="side-panel-empty">— ไม่มี (จุดสิ้นสุด 🏆)</p>
          : nextNodes.map(n => (
            <div key={n.id} className="node-row" onClick={() => setSelected(n)}>
              <span>{n.icon}</span>
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
          {isUnlocked ? '📖 ไปทำ Exercise →' : canDo ? '🔓 ปลดล็อก + Exercise →' : '🔒 ยังทำไม่ได้'}
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE TAB ───
function ProfileTab({ unlocked }) {
  const behavior = computeBehavior(SESSIONS, unlocked);
  const meta     = BEHAVIOR_META[behavior.cls];

  const daysInMonth = 31;
  const startDow    = new Date('2026-03-01').getDay();
  const calDays     = Array.from({ length: startDow }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const skillsByDate = {};
  Object.entries(SKILL_UNLOCK_DATES).forEach(([id, date]) => {
    if (!skillsByDate[date]) skillsByDate[date] = [];
    skillsByDate[date].push(parseInt(id));
  });

  return (
    <div className="tab-profile">
      <div className="profile-container">

        {/* ── HERO ── */}
        <div className="profile-hero">
          <div className="profile-avatar-lg">{USER.avatar}</div>
          <div className="profile-info-main">
            <div className="profile-name">{USER.name}</div>
            <div className="profile-email">{USER.name.replace(' ', '.').toLowerCase()}@psu.ac.th</div>
            <div className="profile-goal">🧱 เป้าหมาย: {USER.goal}</div>
          </div>
          <div className="profile-skill-count">
            <div className="profile-skill-count-label">Skills ปลดล็อก</div>
            <div className="profile-skill-count-num">{Object.keys(SKILL_UNLOCK_DATES).length}</div>
            <div className="profile-skill-count-sub">จาก {SKILLS.length} ทั้งหมด</div>
          </div>
        </div>

        {/* ── BEHAVIOR CARD (full width) ── */}
        <div className="behavior-card" style={{ background: meta.bg, borderColor: meta.border }}>
          {/* Class Badge */}
          <div className="behavior-class-header">
            <div className="behavior-class-badge" style={{ background: meta.color }}>
              <span className="bcb-emoji">{meta.emoji}</span>
              <span className="bcb-label">{meta.label} Learner</span>
            </div>
            <div className="behavior-score-wrap">
              <div className="behavior-score-ring" style={{ '--ring-color': meta.color }}>
                <span className="behavior-score-num" style={{ color: meta.color }}>{behavior.score}</span>
                <span className="behavior-score-sub">/ 100</span>
              </div>
            </div>
          </div>

          <p className="behavior-desc" style={{ color: meta.color }}>{meta.desc}</p>

          {/* Dimension Bars */}
          <div className="behavior-dims">
            {Object.entries(behavior.dims).map(([key, val]) => {
              const dm = DIM_LABELS[key];
              return (
                <div key={key} className="behavior-dim-row">
                  <span className="bdim-icon">{dm.icon}</span>
                  <span className="bdim-label">{dm.label}</span>
                  <div className="bdim-track">
                    <div className="bdim-fill" style={{ width: `${val}%`, background: meta.color }} />
                    {/* threshold markers */}
                    <div className="bdim-marker" style={{ left: '50%' }} />
                    <div className="bdim-marker" style={{ left: '70%' }} />
                  </div>
                  <span className="bdim-val" style={{ color: meta.color }}>{val}%</span>
                </div>
              );
            })}
          </div>

          {/* Class legend */}
          <div className="behavior-class-legend">
            {Object.entries(BEHAVIOR_META).map(([key, m]) => (
              <div key={key} className={`bcl-item ${behavior.cls === key ? 'active' : ''}`}
                style={behavior.cls === key ? { background: m.color, color: '#fff', borderColor: m.color } : {}}>
                {m.emoji} {m.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── GRID ROW 1 ── */}
        <div className="profile-grid">
          <div className="profile-card">
            <div className="profile-card-title">👤 ข้อมูลส่วนตัว</div>
            {[
              { label: 'ชื่อ-นามสกุล', value: USER.name },
              { label: 'อีเมล',         value: `${USER.name.replace(' ', '.').toLowerCase()}@psu.ac.th` },
              { label: 'คณะ',           value: 'ICT' },
              { label: 'ชั้นปี',         value: 'ปี 2' },
              { label: 'เป้าหมาย',      value: USER.goal },
              { label: 'เข้าร่วม',      value: 'ก.พ. 2026' },
            ].map((r, i) => (
              <div key={i} className="profile-info-row">
                <span className="profile-info-label">{r.label}</span>
                <span className="profile-info-value">{r.value}</span>
              </div>
            ))}
          </div>

          <div className="profile-card">
            <div className="profile-card-title">📅 ปฏิทินกิจกรรม (มี.ค. 2026)</div>
            <div className="cal-grid">
              {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => (
                <div key={d} className="cal-header">{d}</div>
              ))}
              {calDays.map((day, i) => {
                const dateStr    = day ? `2026-03-${String(day).padStart(2, '0')}` : null;
                const hasSkill   = dateStr && skillsByDate[dateStr];
                const hasSession = day && SESSIONS.some(s => s.date === dateStr);
                return (
                  <div key={i} className={`cal-day ${!day ? 'empty' : ''} ${hasSkill || hasSession ? 'has-activity' : ''}`}>
                    {day && <span className="cal-day-num">{day}</span>}
                    {hasSkill && skillsByDate[dateStr].map(id => {
                      const sk = SKILLS.find(s => s.id === id);
                      return <span key={id} title={sk?.name} className="cal-dot skill-dot" />;
                    })}
                    {hasSession && <span className="cal-dot session-dot" title="Session" />}
                  </div>
                );
              })}
            </div>
            <div className="cal-legend">
              <span className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: '#0047AB' }} /> ปลดล็อก Skill
              </span>
              <span className="cal-legend-item">
                <span className="cal-legend-dot" style={{ background: '#059669' }} /> ทำ Session
              </span>
            </div>
          </div>
        </div>

        {/* ── GRID ROW 2 ── */}
        <div className="profile-grid">
          <div className="profile-card" style={{ gridColumn: '1 / -1' }}>
            <div className="profile-card-title">🔓 ประวัติการปลดล็อก Skill</div>
            <div className="unlock-timeline">
              {Object.entries(SKILL_UNLOCK_DATES)
                .sort((a, b) => new Date(b[1]) - new Date(a[1]))
                .map(([id, date]) => {
                  const sk = SKILLS.find(s => s.id === parseInt(id));
                  return sk ? (
                    <div key={id} className="unlock-item">
                      <span className="unlock-icon">{sk.icon}</span>
                      <div className="unlock-info">
                        <div className="unlock-name">{sk.name}</div>
                        <div className="unlock-date">🗓 {date}</div>
                      </div>
                      <span className="unlock-pct" style={{ color: getProgressColor(sk.progress) }}>
                        {sk.progress}%
                      </span>
                    </div>
                  ) : null;
                })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── MAIN ───
export default function HomeNew() {
  const [activeTab,        setActiveTab]        = useState('Home');
  const [unlocked,         setUnlocked]         = useState(new Set([1]));
  const [selected,         setSelected]         = useState(null);
  const [hovered,          setHovered]          = useState(null);
  const [historyFilter,    setHistoryFilter]    = useState(new Set(['all']));
  const [topicFilter,      setTopicFilter]      = useState('all');
  const [openSessions,     setOpenSessions]     = useState({});
  const [twText,           setTwText]           = useState('');
  const [showCursor,       setShowCursor]       = useState(true);
  const [showPicker,       setShowPicker]       = useState(false);
  const [showProfileMenu,  setShowProfileMenu]  = useState(false);
  const [confirmSkill,     setConfirmSkill]     = useState(null);

  const profileMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let i = 0; setTwText(''); setShowCursor(true);
    const timer = setInterval(() => {
      setTwText(USER.name.substring(0, i + 1));
      i++;
      if (i >= USER.name.length) { clearInterval(timer); setTimeout(() => setShowCursor(false), 1500); }
    }, 70);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handle = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const canUnlock = (skill) => {
    if (unlocked.has(skill.id)) return false;
    return skill.requires.every(r => unlocked.has(r));
  };

  const handleNodeClick  = (skill) => setSelected(prev => prev?.id === skill.id ? null : skill);
  const handleStartExercise   = (skill) => setConfirmSkill(skill);
  const handleConfirmExercise = () => { setConfirmSkill(null); navigate('/exercise'); };
  const handleCancelExercise  = () => setConfirmSkill(null);
  const toggleSession = (id) => setOpenSessions(prev => ({ ...prev, [id]: !prev[id] }));
  const gradeLabel = (g) => g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง';
  const allTopics = ['all', ...Array.from(new Set(SESSIONS.map(s => s.title)))];
  const handleGoPicker = (skill) => { setShowPicker(false); setConfirmSkill(skill); };

  const handleHistoryFilter = (filter) => {
    setHistoryFilter(prev => {
      const next = new Set(prev);
      if (filter === 'all') return new Set(['all']);
      next.delete('all');
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next.size === 0 ? new Set(['all']) : next;
    });
  };

  const renderSessionCard = (s) => (
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
          {s.questions.map((q, qi) => (
            <div key={qi} className="q-item">
              <div className={`q-icon ${q.correct ? 'correct' : 'wrong'}`}>{q.correct ? '✓' : '✗'}</div>
              <div className="q-body">
                <div className="q-text">ข้อ {qi + 1}: {q.text}</div>
                <div className="q-meta">🏷 {q.skill} · ⏱ {q.time}</div>
                {q.correct
                  ? <span className="ans-correct">✓ ถูกต้อง</span>
                  : <span>
                      <span className="ans-wrong">คำตอบคุณ: {q.chosen}</span>
                      <span className="ans-arrow"> → </span>
                      <span className="ans-correct">เฉลย: {q.answer}</span>
                    </span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const switchTab = (tab) => { setActiveTab(tab); setSelected(null); };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-logo">
          <div className="nav-logo-icon">⚡</div>
          <span className="nav-logo-text">G06 · ALS</span>
        </div>
        <div className="nav-tabs">
          {[
            { key: 'Home',      label: 'Home'       },
            { key: 'SkillTree', label: 'Skill Tree'  },
            { key: 'History',   label: 'History'    },
            { key: 'Profile',   label: 'Profile'    },
          ].map(t => (
            <button key={t.key} className={`nav-tab ${activeTab === t.key ? 'active' : ''}`}
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
                  <div className="dropdown-email">{USER.name.replace(' ', '.').toLowerCase()}@psu.ac.th</div>
                </div>
              </div>
              <div className="dropdown-sep" />
              <button className="dropdown-item" onClick={() => { switchTab('Profile'); setShowProfileMenu(false); }}>👤 Profile</button>
              <div className="dropdown-sep" />
              <button className="dropdown-item danger" onClick={() => navigate('/')}>🚪 Log Out</button>
            </div>
          )}
        </div>
      </nav>

      <div className="content">
        {activeTab === 'Home' && (
          <div className="tab-home">
            <div className="tab-home-main">
              <div className="home-top">
                <div className="home-hero">
                  <div className="home-hero-avatar">{USER.avatar}</div>
                  <div className="home-hero-info">
                    <div className="home-greeting">ยินดีต้อนรับกลับ 👋</div>
                    <h1 className="home-username">{twText}{showCursor && <span className="cursor" />}</h1>
                    <div className="home-goal">เป้าหมาย: <span className="goal-badge">🧱 {USER.goal}</span></div>
                  </div>
                </div>
                <div className="stats-grid">
                  {[
                    { num: `${unlocked.size}`, label: 'Skills Unlocked', cls: 'gold'   },
                    { num: '12',               label: 'Sessions Done',   cls: 'green'  },
                    { num: '4',                label: 'Day Streak 🔥',   cls: 'blue'   },
                    { num: '74%',              label: 'Avg Score',       cls: 'purple' },
                  ].map((s, i) => (
                    <div key={i} className={`stat-card ${s.cls}`}>
                      <div className="stat-num">{s.num}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="section-label">🌳 Skill Tree — คลิกที่โหนดเพื่อดูรายละเอียด</div>
              </div>
              <div className="home-tree-wrap">
                <SkillTreeSVG unlocked={unlocked} canUnlockFn={canUnlock}
                  onNodeClick={handleNodeClick} selected={selected} hovered={hovered}
                  setHovered={setHovered} zoomable={false} />
              </div>
              <div className="home-next-ex-bar">
                <button className="btn-next-exercise" onClick={() => setShowPicker(true)}>
                  ⚡ Next Exercise — เลือกเรื่องที่จะทำ
                </button>
              </div>
              <div className="home-sessions">
                <div className="section-label">📋 Recent Sessions</div>
                <div className="session-list">{SESSIONS.map(renderSessionCard)}</div>
              </div>
            </div>
            <SkillSidePanel selected={selected} setSelected={setSelected}
              unlocked={unlocked} canUnlockFn={canUnlock} onStartExercise={handleStartExercise} />
          </div>
        )}

        {activeTab === 'SkillTree' && (
          <div className="tab-skill-tree">
            <div className="tree-main">
              <SkillTreeSVG unlocked={unlocked} canUnlockFn={canUnlock}
                onNodeClick={handleNodeClick} selected={selected} hovered={hovered}
                setHovered={setHovered} zoomable={true} />
            </div>
            <SkillSidePanel selected={selected} setSelected={setSelected}
              unlocked={unlocked} canUnlockFn={canUnlock} onStartExercise={handleStartExercise} />
          </div>
        )}

        {activeTab === 'History' && (
          <div className="tab-history">
            <div className="history-header">
              <h2 className="history-title">Session History</h2>
              <div className="history-filter">
                <select className="filter-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
                  {allTopics.map(topic => <option key={topic} value={topic}>{topic === 'all' ? 'ทุกเรื่อง' : topic}</option>)}
                </select>
                {['all', 'great', 'good', 'low'].map(f => (
                  <button key={f} className={`filter-btn ${historyFilter.has(f) ? 'active' : ''}`}
                    onClick={() => handleHistoryFilter(f)}>
                    {f === 'all' ? 'ทั้งหมด' : gradeLabel(f)}
                  </button>
                ))}
              </div>
            </div>
            <div className="history-list">
              {SESSIONS.filter(s => {
                const gradeMatch = historyFilter.has('all') || historyFilter.has(s.grade);
                const topicMatch = topicFilter === 'all' || s.title === topicFilter;
                return gradeMatch && topicMatch;
              }).map(renderSessionCard)}
            </div>
          </div>
        )}

        {activeTab === 'Profile' && <ProfileTab unlocked={unlocked} />}
      </div>

      {showPicker && (
        <NextExercisePicker unlocked={unlocked} canUnlockFn={canUnlock}
          onGo={handleGoPicker} onClose={() => setShowPicker(false)} />
      )}

      {confirmSkill && (
        <ExerciseConfirmModal skill={confirmSkill}
          onConfirm={handleConfirmExercise} onCancel={handleCancelExercise} />
      )}
    </div>
  );
}
