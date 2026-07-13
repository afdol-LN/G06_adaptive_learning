// ─── component/admin/UserModal.jsx ──────────────────────────────────────────
// Modal แสดงข้อมูลผู้ใช้ ในหน้า Admin
// ใช้ใน: AdminView (Users tab)
// ─────────────────────────────────────────────────────────────────────────────

function getStatusColor(s) { return s === 'active' ? '#10b981' : '#94a3b8'; }
function getScoreColor(s) {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  return '#f59e0b';
}

export default function UserModal({ user, onClose }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">👤 ข้อมูลผู้ใช้</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-user-hero">
            <div className="ad-user-avatar-lg">{user.name[0]}</div>
            <div>
              <div className="ad-user-name-lg">{user.name}</div>
              <div className="ad-user-email-lg">{user.email}</div>
              <span className="ad-status-badge" style={{
                background: user.status === 'active' ? '#ecfdf5' : '#f1f5f9',
                color: getStatusColor(user.status),
                border: `1px solid ${getStatusColor(user.status)}40`,
              }}>
                {user.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
              </span>
            </div>
          </div>
          <div className="ad-info-grid">
            {[
              { label: 'คณะ',          value: user.faculty           },
              { label: 'ชั้นปี',        value: `ปี ${user.year}`      },
              { label: 'เป้าหมาย',     value: user.goal              },
              { label: 'Sessions',     value: user.sessions           },
              { label: 'Avg Score',    value: `${user.avgScore}%`     },
              { label: 'Streak',       value: `${user.streak} วัน`    },
              { label: 'ใช้งานล่าสุด', value: user.lastActive         },
            ].map((r, i) => (
              <div key={i} className="ad-info-row">
                <span className="ad-info-label">{r.label}</span>
                <span className="ad-info-value">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-primary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}
