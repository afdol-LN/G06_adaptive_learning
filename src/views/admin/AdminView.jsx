// ─── views/admin/AdminView.jsx ───────────────────────────────────────────────
// Admin page — layout + tab routing, UI only
// Logic: src/viewModels/useAdminViewModel.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useAdminViewModel, getTierColor, getScoreColor, getStatusColor, gradeLabel } from '../../viewModels/useAdminViewModel';
import SkillModal         from '../../component/admin/SkillModal';
import QuestionModal      from '../../component/admin/QuestionModal';
import UserModal          from '../../component/admin/UserModal';
import SkillQuestionsPanel from '../../component/admin/SkillQuestionsPanel';
import ConfirmDialog      from '../../component/ConfirmDialog';
import '../../component/decorate/Adminhome.css';

const ADMIN_TABS = [
  { id: 'summary', icon: '📊', label: 'Summary'   },
  { id: 'users',   icon: '👥', label: 'ผู้ใช้'     },
  { id: 'skills',  icon: '🌳', label: 'Skills'     },
  { id: 'history', icon: '📋', label: 'ประวัติ'    },
];

export default function AdminView() {
  const vm = useAdminViewModel();
  const {
    adminTab, setAdminTab, summary, users, skills, allSkills, questions, history,
    userSearch, setUserSearch, skillSearch, setSkillSearch,
    historyFilter, setHistoryFilter, historyUsers, historyGrades,
    skillModal, questionModal, userModal, qPanel, confirm,
    openSkillModal, closeSkillModal, openQModal, closeQModal,
    openUserModal, closeUserModal, openQPanel, closeQPanel, closeConfirm,
    handleSkillSave, handleSkillDelete, handleSkillToggle,
    handleQSave, handleQDelete, handleQToggle, handleUserToggle,
  } = vm;

  return (
    <div className="ad-root">
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside className="ad-sidebar">
        <div className="ad-brand">
          <div className="ad-brand-icon">⚡</div>
          <div className="ad-brand-text">
            <div className="ad-brand-name">PSU · ALS</div>
            <div className="ad-brand-role">Admin Panel</div>
          </div>
        </div>
        <nav className="ad-nav">
          {ADMIN_TABS.map(t => (
            <button key={t.id}
              className={`ad-nav-item ${adminTab === t.id ? 'active' : ''}`}
              onClick={() => setAdminTab(t.id)}>
              <span className="ad-nav-icon">{t.icon}</span>
              <span className="ad-nav-label">{t.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="ad-main">
        {/* ── SUMMARY ── */}
        {adminTab === 'summary' && (
          <div className="ad-section">
            <div className="ad-section-header">
              <h2 className="ad-section-title">📊 Dashboard Summary</h2>
            </div>
            <div className="ad-stats-grid">
              {[
                { label: 'ผู้ใช้ทั้งหมด',    value: summary.totalUsers,    icon: '👥', color: '#0047AB' },
                { label: 'Active วันนี้',     value: summary.activeToday,   icon: '🟢', color: '#10b981' },
                { label: 'Sessions ทั้งหมด',  value: summary.totalSessions, icon: '📋', color: '#7c3aed' },
                { label: 'Avg Score',         value: `${summary.avgScore}%`, icon: '🎯', color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="ad-stat-card" style={{ borderTopColor: s.color }}>
                  <div className="ad-stat-icon">{s.icon}</div>
                  <div className="ad-stat-value" style={{ color: s.color }}>{s.value}</div>
                  <div className="ad-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="ad-top-skill">
              <span className="ad-muted">Top Skill:</span>
              <strong>{summary.topSkill}</strong>
            </div>
          </div>
        )}

        {/* ── USERS ── */}
        {adminTab === 'users' && (
          <div className="ad-section">
            <div className="ad-section-header">
              <h2 className="ad-section-title">👥 จัดการผู้ใช้</h2>
              <input className="ad-search" placeholder="🔍 ค้นหาชื่อหรืออีเมล..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <table className="ad-table">
              <thead>
                <tr>{['ชื่อ', 'คณะ / ปี', 'เป้าหมาย', 'Sessions', 'Avg Score', 'Streak', 'ใช้งานล่าสุด', 'สถานะ', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td><div className="ad-user-name">{u.name}</div><div className="ad-user-email">{u.email}</div></td>
                    <td>{u.faculty} · ปี {u.year}</td>
                    <td>{u.goal}</td>
                    <td>{u.sessions}</td>
                    <td style={{ color: getScoreColor(u.avgScore), fontWeight: 700 }}>{u.avgScore}%</td>
                    <td>{u.streak} วัน</td>
                    <td>{u.lastActive}</td>
                    <td><span className="ad-status-pill" style={{ color: getStatusColor(u.status), background: `${getStatusColor(u.status)}18`, border: `1px solid ${getStatusColor(u.status)}40` }}>
                      {u.status === 'active' ? '🟢' : '⚫'} {u.status}
                    </span></td>
                    <td className="ad-action-cell">
                      <button className="ad-btn-sm ad-btn-view" onClick={() => openUserModal(u)}>ดู</button>
                      <button className="ad-btn-sm ad-btn-toggle" onClick={() => handleUserToggle(u.id)}>
                        {u.status === 'active' ? 'ระงับ' : 'เปิด'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── SKILLS ── */}
        {adminTab === 'skills' && (
          <div className="ad-section">
            <div className="ad-section-header">
              <h2 className="ad-section-title">🌳 จัดการ Skills</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="ad-search" placeholder="🔍 ค้นหา Skill..."
                  value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
                <button className="ad-btn-primary" onClick={() => openSkillModal(null)}>➕ เพิ่ม Skill</button>
              </div>
            </div>
            <table className="ad-table">
              <thead>
                <tr>{['Skill', 'Tier', 'Requires', 'Users', 'Avg Progress', 'สถานะ', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {skills.map(s => (
                  <tr key={s.id}>
                    <td><span className="ad-skill-icon">{s.icon}</span> {s.name}</td>
                    <td><span className="ad-tier-badge" style={{ color: getTierColor(s.tier), background: `${getTierColor(s.tier)}18` }}>{s.tier}</span></td>
                    <td>{s.requires.map(r => allSkills.find(x => x.id === r)?.name || r).join(', ') || '—'}</td>
                    <td>{s.userCount}</td>
                    <td style={{ color: getScoreColor(s.avgProgress), fontWeight: 700 }}>{s.avgProgress}%</td>
                    <td><span style={{ color: getStatusColor(s.status) }}>{s.status === 'active' ? '🟢 Active' : '⚫ Inactive'}</span></td>
                    <td className="ad-action-cell">
                      <button className="ad-btn-sm ad-btn-view" onClick={() => openQPanel(s)}>โจทย์ ({(questions[s.id] || []).length})</button>
                      <button className="ad-btn-sm ad-btn-view" onClick={() => openSkillModal(s)}>✏️</button>
                      <button className="ad-btn-sm ad-btn-toggle" onClick={() => handleSkillToggle(s.id)}>
                        {s.status === 'active' ? '🔴' : '🟢'}
                      </button>
                      <button className="ad-btn-sm ad-btn-del" onClick={() => handleSkillDelete(s)}>🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── HISTORY ── */}
        {adminTab === 'history' && (
          <div className="ad-section">
            <div className="ad-section-header">
              <h2 className="ad-section-title">📋 ประวัติการทำโจทย์</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="ad-select"
                  value={historyFilter.user}
                  onChange={e => setHistoryFilter(f => ({ ...f, user: e.target.value }))}>
                  {historyUsers.map(u => <option key={u} value={u}>{u === 'all' ? 'ทุกคน' : u}</option>)}
                </select>
                <select className="ad-select"
                  value={historyFilter.grade}
                  onChange={e => setHistoryFilter(f => ({ ...f, grade: e.target.value }))}>
                  {historyGrades.map(g => <option key={g} value={g}>{g === 'all' ? 'ทุกผล' : gradeLabel(g)}</option>)}
                </select>
              </div>
            </div>
            <table className="ad-table">
              <thead>
                <tr>{['ผู้ใช้', 'Skill', 'วันที่', 'คะแนน', 'ถูก/ทั้งหมด', 'ผล', ''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {history.map(h => (
                  <tr key={h.id}>
                    <td>{h.user}</td>
                    <td>{h.skill}</td>
                    <td>{h.date}</td>
                    <td style={{ color: getScoreColor(h.score), fontWeight: 700 }}>{h.score}%</td>
                    <td>{h.correct}/{h.total}</td>
                    <td><span style={{ color: h.grade === 'great' ? '#10b981' : h.grade === 'good' ? '#3b82f6' : '#f59e0b' }}>{gradeLabel(h.grade)}</span></td>
                    <td><button className="ad-btn-sm ad-btn-view">รายละเอียด</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {skillModal && (
        <SkillModal skill={skillModal} allSkills={allSkills}
          onSave={handleSkillSave} onClose={closeSkillModal} />
      )}
      {qPanel && (
        <SkillQuestionsPanel
          skill={qPanel} questions={questions[qPanel.id] || []}
          onClose={closeQPanel}
          onAdd={() => openQModal(null)}
          onEdit={q => openQModal(q)}
          onToggle={qId => handleQToggle(qPanel.id, qId)}
          onDelete={q => handleQDelete(qPanel.id, q)} />
      )}
      {questionModal && qPanel && (
        <QuestionModal question={questionModal}
          onSave={form => handleQSave(qPanel.id, form)}
          onClose={closeQModal} />
      )}
      {userModal && <UserModal user={userModal} onClose={closeUserModal} />}
      {confirm && (
        <ConfirmDialog msg={confirm.msg} onOk={confirm.onOk} onCancel={closeConfirm} />
      )}
    </div>
  );
}
