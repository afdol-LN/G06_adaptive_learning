// ─── component/NextExercisePicker.jsx ───────────────────────────────────────
// Picker สำหรับเลือก skill ที่จะทำ Exercise ถัดไป
// ใช้ใน: HomeView
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { getProgressColor } from '../models/skillModel';

export default function NextExercisePicker({ skills, unlocked, canUnlockFn, onGo, onClose }) {
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
        <button
          className={`btn-go-exercise ${picked ? 'active' : 'inactive'}`}
          disabled={!picked}
          onClick={() => picked && onGo(picked)}>
          {picked ? `Go Exercise: ${picked.name} →` : 'เลือกเรื่องก่อนแล้วกด Go'}
        </button>
      </div>
    </div>
  );
}
