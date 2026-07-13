// ─── component/SkillSidePanel.jsx ───────────────────────────────────────────
// Side panel แสดงรายละเอียด skill ที่เลือก
// ใช้ใน: HomeTabView และ SkillTreeTabView
// ─────────────────────────────────────────────────────────────────────────────
import { getProgressColor } from '../models/skillModel';

export default function SkillSidePanel({
  selected,
  setSelected,
  skills,
  unlocked,
  canUnlockFn,
  onStartExercise,
}) {
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
