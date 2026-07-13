// ─── views/home/tabs/ProfileTabView.jsx ─────────────────────────────────────
// Tab: Profile — ข้อมูลผู้ใช้และ branch ทั้งหมด
// UI only — รับ vm จาก HomeView
// ─────────────────────────────────────────────────────────────────────────────
import { getProgressColor } from '../../../models/skillModel';

export default function ProfileTabView({ vm }) {
  const { USER, activeBranch, branches, sessions, enrichedSkills, appCtx } = vm;

  const completedSkills = enrichedSkills.filter(s => s.progress > 0).length;
  const totalSkills     = enrichedSkills.length;
  const avgScore        = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
    : 0;

  return (
    <div className="tab-profile">
      <div className="section-header">
        <h2 className="section-title">👤 โปรไฟล์</h2>
      </div>

      {/* Avatar + Name */}
      <div className="profile-hero">
        <div className="profile-avatar-xl">{USER.avatar}</div>
        <div className="profile-name">{USER.name}</div>
        <div className="profile-role">Student · PSU</div>
      </div>

      {/* User info */}
      <div className="profile-info-grid">
        {[
          { label: 'คณะ',     value: USER.faculty  || '—' },
          { label: 'สาขา',    value: USER.major    || '—' },
          { label: 'ชั้นปี',   value: USER.year     || '—' },
          { label: 'วิทยาเขต', value: USER.campus  || '—' },
        ].map((r, i) => (
          <div key={i} className="profile-info-row">
            <span className="profile-info-label">{r.label}</span>
            <span className="profile-info-value">{r.value}</span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-row" style={{ marginTop: 16 }}>
        {[
          { label: 'Level',    value: activeBranch?.level || 1,                  icon: '⭐' },
          { label: 'XP',       value: (activeBranch?.xp || 0).toLocaleString(),  icon: '✨' },
          { label: 'Sessions', value: sessions.length,                            icon: '📋' },
          { label: 'Avg Score',value: `${avgScore}%`,                             icon: '🎯' },
          { label: 'Skills',   value: `${completedSkills}/${totalSkills}`,        icon: '🌳' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <span className="stat-icon">{s.icon}</span>
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* All branches */}
      <div className="section-title" style={{ marginTop: 24, marginBottom: 12 }}>สายการเรียนทั้งหมด</div>
      <div className="branch-list">
        {branches.map(b => {
          const isActive = b.id === activeBranch?.id;
          return (
            <div key={b.id}
              className={`branch-card ${isActive ? 'active' : ''}`}
              onClick={() => appCtx?.switchBranch?.(b.id)}>
              <div className="branch-icon">{b.goalIcon}</div>
              <div className="branch-info">
                <div className="branch-name">{b.goalName}</div>
                <div className="branch-meta">{b.campus} · {b.major} · {b.year}</div>
                <div className="branch-stats">
                  ⭐ Level {b.level} · ✨ {b.xp} XP · 🔥 {b.streak} วัน
                </div>
              </div>
              {isActive && <span className="branch-active-badge">✓ ใช้งานอยู่</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
