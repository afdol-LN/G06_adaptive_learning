// ─── component/ConfirmDialog.jsx ────────────────────────────────────────────
// Generic confirm/delete dialog — ใช้ได้ทั่วทั้งแอป
// ใช้ใน: AdminView (ลบ skill, ลบ question)
// ─────────────────────────────────────────────────────────────────────────────

export default function ConfirmDialog({ msg, onOk, onCancel, okLabel = 'ยืนยัน ลบ', cancelLabel = 'ยกเลิก' }) {
  return (
    <div className="ad-overlay" onClick={onCancel}>
      <div className="ad-confirm" onClick={e => e.stopPropagation()}>
        <div className="ad-confirm-icon">⚠️</div>
        <div className="ad-confirm-msg">{msg}</div>
        <div className="ad-confirm-btns">
          <button className="ad-btn-cancel" onClick={onCancel}>{cancelLabel}</button>
          <button className="ad-btn-danger" onClick={onOk}>{okLabel}</button>
        </div>
      </div>
    </div>
  );
}
