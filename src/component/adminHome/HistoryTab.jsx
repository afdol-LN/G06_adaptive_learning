import React from 'react';

export default function HistoryTab({
  filteredHistory,
  histSearch,
  setHistSearch,
  histGrade,
  setHistGrade,
  gradeLabel,
  getScoreColor
}) {
  return (
    <div className="ad-tab-history">
      <div className="ad-page-header">
        <h1 className="ad-page-title">📋 ประวัติการทำโจทย์ทั้งหมด</h1>
        <span className="ad-page-sub">พบ {filteredHistory.length} รายการ</span>
      </div>
      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon">🔍</span>
          <input className="ad-search" placeholder="ค้นหาชื่อผู้ใช้, ชื่อ Skill..." value={histSearch} onChange={e => setHistSearch(e.target.value)} />
        </div>
        {['all', 'great', 'good', 'low'].map(g => (
          <button key={g} className={`ad-filter-btn ${histGrade === g ? 'active' : ''}`} onClick={() => setHistGrade(g)}>
            {g === 'all' ? 'ทั้งหมด' : gradeLabel(g)}
          </button>
        ))}
      </div>
      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr><th>#</th><th>ผู้ใช้</th><th>Skill</th><th>วันที่</th><th>ถูก/ทั้งหมด</th><th>Score</th><th>ผลลัพธ์</th></tr>
          </thead>
          <tbody>
            {filteredHistory.map((h, i) => (
              <tr key={h.id}>
                <td><span className="ad-mono ad-muted">{i + 1}</span></td>
                <td>
                  <div className="ad-user-cell">
                    <div className="ad-avatar-sm">{h.user[0]}</div>
                    <span className="ad-user-name-sm">{h.user}</span>
                  </div>
                </td>
                <td><span className="ad-skill-name">{h.skill}</span></td>
                <td><span className="ad-muted">{h.date}</span></td>
                <td><span className="ad-mono">{h.correct} / {h.total}</span></td>
                <td><span className="ad-score" style={{ color: getScoreColor(h.score) }}>{h.score}%</span></td>
                <td>
                  <span className={`ad-grade-badge grade-${h.grade}`}>{gradeLabel(h.grade)}</span>
                </td>
              </tr>
            ))}
            {filteredHistory.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>ไม่พบข้อมูล</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}