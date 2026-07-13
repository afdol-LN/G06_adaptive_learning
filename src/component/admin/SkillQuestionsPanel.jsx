// ─── component/admin/SkillQuestionsPanel.jsx ────────────────────────────────
// Panel แสดงและจัดการโจทย์ของ Skill ในหน้า Admin
// ใช้ใน: AdminView (Skills tab)
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(s) { return s === 'active' ? '#10b981' : '#94a3b8'; }

export default function SkillQuestionsPanel({
  skill,
  questions,
  onClose,
  onAdd,
  onEdit,
  onToggle,
  onDelete,
}) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">{skill.icon} โจทย์ของ: {skill.name}</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span className="ad-muted">โจทย์ทั้งหมด {questions.length} ข้อ</span>
            <button className="ad-btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={onAdd}>
              ➕ เพิ่มโจทย์
            </button>
          </div>
          {questions.length === 0 && (
            <div className="ad-empty-state">ยังไม่มีโจทย์ กด ➕ เพื่อเพิ่ม</div>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="ad-q-item">
              <div className="ad-q-head">
                <span className="ad-q-num">ข้อ {i + 1}</span>
                <span className={`ad-diff-tag ad-diff-${q.diff.toLowerCase().replace('+','p')}`}>{q.diff}</span>
                <span className="ad-q-status" style={{ color: getStatusColor(q.status) }}>
                  {q.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="ad-btn-sm ad-btn-view" onClick={() => onEdit(q)}>✏️ แก้ไข</button>
                  <button className="ad-btn-sm ad-btn-toggle" onClick={() => onToggle(q.id)}>
                    {q.status === 'active' ? '🔴 ระงับ' : '🟢 เปิดใช้'}
                  </button>
                  <button className="ad-btn-sm ad-btn-del" onClick={() => onDelete(q)}>🗑</button>
                </div>
              </div>
              <div className="ad-q-text">{q.text}</div>
              <div className="ad-q-choices">
                {q.choices.map((c, ci) => (
                  <span key={ci} className={`ad-q-choice ${ci === q.correct ? 'correct' : ''}`}>
                    {['A','B','C','D'][ci]}. {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}
