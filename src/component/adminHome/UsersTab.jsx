import React from 'react';

export default function UsersTab({
  users,
  userSearch,
  setUserSearch,
  filteredUsers,
  getScoreColor,
  getStatusColor,
  setViewUser,
  toggleUserStatus,
  deleteUser
}) {
  return (
    <div className="ad-tab-users">
      <div className="ad-page-header">
        <h1 className="ad-page-title">👥 จัดการผู้ใช้งาน</h1>
        <span className="ad-page-sub">ผู้ใช้ทั้งหมด {users.length} คน</span>
      </div>
      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon">🔍</span>
          <input className="ad-search" placeholder="ค้นหาชื่อ, อีเมล, คณะ..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
        </div>
        <div className="ad-toolbar-info">พบ <strong>{filteredUsers.length}</strong> รายการ</div>
      </div>
      <div className="ad-user-grid">
        {filteredUsers.map(u => (
          <div key={u.id} className="ad-user-card">
            <div className="ad-user-card-top">
              <div className="ad-avatar-md">{u.name[0]}</div>
              <div className="ad-user-card-info">
                <div className="ad-user-card-name">{u.name}</div>
                <div className="ad-user-card-email">{u.email}</div>
                <span className="ad-status-badge" style={{ background: u.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: getStatusColor(u.status), border: `1px solid ${getStatusColor(u.status)}40` }}>
                  {u.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                </span>
              </div>
            </div>
            <div className="ad-user-card-stats">
              <div className="ad-stat-mini"><div className="ad-stat-mini-val">{u.sessions}</div><div className="ad-stat-mini-lbl">Sessions</div></div>
              <div className="ad-stat-mini"><div className="ad-stat-mini-val" style={{ color: getScoreColor(u.avgScore) }}>{u.avgScore}%</div><div className="ad-stat-mini-lbl">Avg Score</div></div>
              <div className="ad-stat-mini"><div className="ad-stat-mini-val">🔥{u.streak}</div><div className="ad-stat-mini-lbl">Streak</div></div>
            </div>
            <div className="ad-user-card-meta">
              <span>🏫 {u.faculty} ปี {u.year}</span>
              <span>🎯 {u.goal}</span>
            </div>
            <div className="ad-user-card-actions">
              <button className="ad-btn-sm ad-btn-view" onClick={() => setViewUser(u)}>👁 ดูข้อมูล</button>
              <button className="ad-btn-sm ad-btn-toggle" onClick={() => toggleUserStatus(u.id)}>
                {u.status === 'active' ? '🔴 ระงับ' : '🟢 เปิดใช้'}
              </button>
              <button className="ad-btn-sm ad-btn-del" onClick={() => { if (window.confirm(`ลบผู้ใช้ "${u.name}"?`)) deleteUser(u.id); }}>🗑 ลบ</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}