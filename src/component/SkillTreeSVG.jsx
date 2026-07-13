// ─── component/SkillTreeSVG.jsx ─────────────────────────────────────────────
// Skill Tree SVG renderer — แสดง node และ edge ของ skill tree
// ใช้ใน: HomeTabView (แบบ fit-to-frame) และ SkillTreeTabView (แบบ zoomable)
// ─────────────────────────────────────────────────────────────────────────────
import ZoomableSVG from './ZoomableSVG';
import { getProgressColor, getNodeColors } from '../models/skillModel';

const NODE_W = 260;
const NODE_H = 120;

// ── Layout: จัดตำแหน่ง node แบบ tiered grid ─────────────────────────────────
export function layoutSkills(skills) {
  const byId = Object.fromEntries(skills.map(s => [s.id, s]));

  const depth = {};
  function getDepth(id) {
    if (depth[id] !== undefined) return depth[id];
    const node = byId[id];
    if (!node || node.requires.length === 0) return (depth[id] = 0);
    depth[id] = 1 + Math.max(...node.requires.map(r => byId[r] ? getDepth(r) : 0));
    return depth[id];
  }
  skills.forEach(s => getDepth(s.id));

  const layers = {};
  skills.forEach(s => {
    const d = depth[s.id];
    (layers[d] = layers[d] || []).push(s.id);
  });

  const positions = {};
  const sortedLayerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);

  sortedLayerKeys.forEach(d => {
    const ids = layers[d];
    if (d > 0) {
      ids.sort((a, b) => {
        const avgX = id => {
          const parents = (byId[id]?.requires || []).filter(r => positions[r]);
          if (!parents.length) return 0;
          return parents.reduce((s, r) => s + positions[r].x, 0) / parents.length;
        };
        return avgX(a) - avgX(b);
      });
    }
    const total  = ids.length * NODE_W + (ids.length - 1) * 70;
    const startX = -total / 2 + NODE_W / 2;
    ids.forEach((id, i) => {
      positions[id] = {
        x: startX + i * (NODE_W + 50),
        y: d * (NODE_H + 130),
      };
    });
  });

  return skills.map(s => ({ ...s, x: positions[s.id].x, y: positions[s.id].y }));
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function SkillTreeSVG({
  skills,
  unlocked,
  canUnlockFn,
  onNodeClick,
  selected,
  hovered,
  setHovered,
  zoomable = false,
}) {
  const getNodeById  = id => skills.find(s => s.id === id);
  const getEdgeColor = (fromId, toId) => {
    if (unlocked.has(toId)) return '#0047AB';
    const toNode = getNodeById(toId);
    if (toNode && canUnlockFn(toNode)) return '#60a5fa';
    return '#cbd5e1';
  };
  const isRelatedEdge = (fromId, toId) =>
    selected && (fromId === selected.id || toId === selected.id);

  const minX = Math.min(...skills.map(s => s.x || 0)) - NODE_W / 2 - 40;
  const minY = Math.min(...skills.map(s => s.y || 0)) - NODE_H / 2 - 40;
  const maxX = Math.max(...skills.map(s => s.x || 0)) + NODE_W / 2 + 40;
  const maxY = Math.max(...skills.map(s => s.y || 0)) + NODE_H / 2 + 40;
  const svgWidth  = maxX - minX;
  const svgHeight = maxY - minY;

  const inner = (
    <>
      <defs>
        <pattern id="dots-cobalt" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#c2d3e0" />
        </pattern>
      </defs>
      <rect x={minX} y={minY} width={svgWidth} height={svgHeight} fill="url(#dots-cobalt)" />

      {/* Dim edges */}
      {skills.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(skill.id);
        const color    = getEdgeColor(reqId, skill.id);
        const x1 = from.x, y1 = from.y + NODE_H / 2;
        const x2 = skill.x, y2 = skill.y - NODE_H / 2;
        const midY = y1 + (y2 - y1) / 2;
        const path = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;
        return (
          <path key={`edge-${reqId}-${skill.id}`}
            d={path} fill="none" stroke={color}
            strokeWidth={isActive ? 2 : 1}
            strokeLinejoin="round"
            strokeDasharray={isActive ? 'none' : '4,4'}
            strokeOpacity={selected ? 0.08 : (isActive ? 0.85 : 0.3)} />
        );
      }))}

      {/* Highlighted edges */}
      {selected && skills.map(skill => skill.requires.map(reqId => {
        const from = getNodeById(reqId);
        if (!from || !isRelatedEdge(reqId, skill.id)) return null;
        const isActive = unlocked.has(skill.id);
        const x1 = from.x, y1 = from.y + NODE_H / 2;
        const x2 = skill.x, y2 = skill.y - NODE_H / 2;
        const midY = y1 + (y2 - y1) / 2;
        const path = `M${x1},${y1} L${x1},${midY} L${x2},${midY} L${x2},${y2}`;
        const hc = reqId === selected.id ? '#0047AB' : '#10b981';
        return (
          <g key={`edge-rel-${reqId}-${skill.id}`}>
            <path d={path} fill="none" stroke={hc} strokeWidth={7} strokeOpacity={0.15}
              strokeLinecap="round" strokeLinejoin="round" />
            <path d={path} fill="none" stroke={hc}
              strokeWidth={isActive ? 2.6 : 2.2} strokeLinejoin="round"
              strokeDasharray={isActive ? 'none' : '5,4'}
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
        const nx     = skill.x - NODE_W / 2;
        const ny     = skill.y - NODE_H / 2;
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
            <text x={nx + 28} y={skill.y - 12} textAnchor="middle" dominantBaseline="central" fontSize={32}>
              {skill.icon}
            </text>

            {/* Name */}
            <text x={nx + NODE_W / 2 + 14} y={skill.y - 10}
              textAnchor="middle" dominantBaseline="central"
              fontSize={19} fontWeight="700" fill={text}>
              {skill.name.length > 18 ? skill.name.slice(0, 17) + '…' : skill.name}
            </text>

            {/* Level / Elo / lock */}
            {!isUnlocked && !canUnlockThis
              ? <text x={skill.x} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                  fontSize={15} fill="#94a3b8">🔒 ล็อก</text>
              : <>
                  <text x={skill.x - 28} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                    fontSize={11} fontWeight="700" fill={pColor}>Lv.{skill.level}</text>
                  <text x={skill.x + 28} y={skill.y + 18} textAnchor="middle" dominantBaseline="central"
                    fontSize={11} fill="#64748b">Elo {skill.elo?.toLocaleString()}</text>
                </>
            }
          </g>
        );
      })}
    </>
  );

  const viewBox = `${minX} ${minY} ${svgWidth} ${svgHeight}`;
  if (zoomable) {
    return <ZoomableSVG viewBox={viewBox} className="skill-tree-svg">{inner}</ZoomableSVG>;
  }
  return (
    <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet"
      className="skill-tree-svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      {inner}
    </svg>
  );
}
