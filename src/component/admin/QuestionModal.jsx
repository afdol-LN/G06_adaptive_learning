// ─── component/admin/QuestionModal.jsx ──────────────────────────────────────
// Modal สำหรับเพิ่ม/แก้ไข โจทย์ ในหน้า Admin
// ใช้ใน: AdminView (Skills tab → SkillQuestionsPanel)
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

const DIFFS = ['Easy', 'Easy+', 'Medium', 'Hard'];

export default function QuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState({ ...question, choices: [...question.choices] });
  const isNew = !question.id;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setChoice = (i, v) => {
    const choices = [...form.choices];
    choices[i] = v;
    setForm(f => ({ ...f, choices }));
  };

  const handleSave = () => {
    if (!form.text.trim()) return alert('กรุณากรอกคำถาม');
    if (form.choices.some(c => !c.trim())) return alert('กรุณากรอกตัวเลือกให้ครบ');
    onSave(form);
  };

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">{isNew ? '➕ เพิ่มโจทย์ใหม่' : '✏️ แก้ไขโจทย์'}</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">คำถาม *</label>
            <textarea className="ad-input ad-textarea" value={form.text}
              onChange={e => set('text', e.target.value)}
              placeholder="เช่น Stack ใช้หลักการใด?" rows={3} />
          </div>
          <div className="ad-field-row">
            <div className="ad-field" style={{ flex: 1 }}>
              <label className="ad-label">ระดับความยาก</label>
              <select className="ad-select" value={form.diff} onChange={e => set('diff', e.target.value)}>
                {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
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
            <label className="ad-label">ตัวเลือก (คลิกตัวอักษรเพื่อเลือกคำตอบที่ถูก)</label>
            <div className="ad-choices-edit">
              {form.choices.map((c, i) => (
                <div key={i} className="ad-choice-row">
                  <div className={`ad-choice-letter ${form.correct === i ? 'correct' : ''}`}
                    onClick={() => set('correct', i)}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                  <input className="ad-input" style={{ flex: 1 }} value={c}
                    onChange={e => setChoice(i, e.target.value)}
                    placeholder={`ตัวเลือก ${['A','B','C','D'][i]}`} />
                  {form.correct === i && <span className="ad-correct-mark">✓ ถูก</span>}
                </div>
              ))}
            </div>
            <p className="ad-hint-text">💡 คลิกที่ตัวอักษร A / B / C / D เพื่อเลือกคำตอบที่ถูกต้อง</p>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="ad-btn-primary" onClick={handleSave}>
            {isNew ? '➕ เพิ่มโจทย์' : '💾 บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
