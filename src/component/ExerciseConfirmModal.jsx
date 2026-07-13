// ─── component/ExerciseConfirmModal.jsx ──────────────────────────────────────
// Modal ยืนยันก่อนเริ่มทำ Exercise
// ใช้ใน: HomeView
// ─────────────────────────────────────────────────────────────────────────────
import { getProgressColor } from '../models/skillModel';

export default function ExerciseConfirmModal({ skill, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="confirm-icon-wrap"><span>{skill.icon}</span></div>
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
