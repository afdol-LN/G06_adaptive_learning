// ─── component/admin/SkillModal.jsx ─────────────────────────────────────────
// Modal สำหรับเพิ่ม/แก้ไข Skill ในหน้า Admin
// ใช้ใน: AdminView (Skills tab)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

const TIERS = ['T1', 'T2', 'T3', 'T4', 'T5'];

export default function SkillModal({ skill, allSkills, onSave, onClose }) {
  const [form, setForm] = useState({ ...skill });
  const isNew = !skill.id;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleReq = (id) => {
    const reqs = form.requires.includes(id)
      ? form.requires.filter(r => r !== id)
      : [...form.requires, id];
    set('requires', reqs);
  };

  const handleSave = () => {
    if (!form.name.trim()) return alert('กรุณากรอกชื่อ Skill');
    onSave(form);
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            {isNew ? '➕ เพิ่ม Skill ใหม่' : `✏️ แก้ไข: ${skill.name}`}
          </span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Icon</label>
              <input className="ad-input" value={form.icon}
                onChange={e => set('icon', e.target.value)}
                maxLength={4} style={{ width: 72, textAlign: 'center', fontSize: 22 }} />
            </div>
            <div className="ad-field" style={{ flex: 1 }}>
              <label className="ad-label">ชื่อ Skill *</label>
              <input className="ad-input" value={form.name}
                onChange={e => set('name', e.target.value)} placeholder="เช่น Binary Search" />
            </div>
            <div className="ad-field">
              <label className="ad-label">Tier</label>
              <select className="ad-select" value={form.tier} onChange={e => set('tier', e.target.value)}>
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <select className="ad-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="ad-field">
            <label className="ad-label">Prerequisite Skills (requires)</label>
            <div className="ad-req-grid">
              {allSkills.filter(s => s.id !== skill.id).map(s => (
                <div key={s.id}
                  className={`ad-req-chip ${form.requires.includes(s.id) ? 'selected' : ''}`}
                  onClick={() => toggleReq(s.id)}>
                  {s.icon} {s.name}
                </div>
              ))}
              {allSkills.filter(s => s.id !== skill.id).length === 0 &&
                <span className="ad-muted">ไม่มี Skill อื่น</span>}
            </div>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="ad-btn-primary" onClick={handleSave}>
            {isNew ? '➕ เพิ่ม Skill' : '💾 บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
