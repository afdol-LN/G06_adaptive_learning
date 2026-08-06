import React from 'react';
import {
  FaChartPie,
  FaUsers,
  FaCircleCheck,
  FaClipboardList,
  FaBullseye,
  FaTree,
  FaTrophy,
  FaCalendarDays,
  FaFire,
} from 'react-icons/fa6';

export default function SummaryTab({ 
  SUMMARY, 
  skills, 
  users, 
  getTierColor, 
  getScoreColor, 
  getStatusColor, 
  maxBar, 
  dayLabels 
}) {
  return (
    <div className="ad-tab-summary">
      <div className="ad-page-header">
        <h1 className="ad-page-title"><FaChartPie /> สรุปภาพรวมระบบ</h1>
        <span className="ad-page-sub">ข้อมูล ณ วันที่ 12 มี.ค. 2026</span>
      </div>
      <div className="ad-kpi-grid">
        {[
          { label: 'ผู้ใช้ทั้งหมด',    value: SUMMARY.totalUsers,     icon: <FaUsers />, color: '#0047AB' },
          { label: 'Active วันนี้',    value: SUMMARY.activeToday,    icon: <FaCircleCheck />, color: '#10b981' },
          { label: 'Sessions ทั้งหมด', value: SUMMARY.totalSessions,  icon: <FaClipboardList />, color: '#8b5cf6' },
          { label: 'คะแนนเฉลี่ย',      value: `${SUMMARY.avgScore}%`, icon: <FaBullseye />, color: '#f59e0b' },
          { label: 'Skills ในระบบ',    value: skills.length,          icon: <FaTree />, color: '#3b82f6' },
          { label: 'Skill ยอดนิยม',    value: SUMMARY.topSkill,       icon: <FaTrophy />, color: '#0047AB' },
        ].map((k, i) => (
          <div key={i} className="ad-kpi-card">
            <div className="ad-kpi-icon" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
            <div className="ad-kpi-info">
              <div className="ad-kpi-value" style={{ color: k.color }}>{k.value}</div>
              <div className="ad-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ad-chart-row">
        <div className="ad-card">
          <div className="ad-card-title"><FaCalendarDays /> Sessions รายวัน (สัปดาห์นี้)</div>
          <div className="ad-bar-chart">
            {SUMMARY.weekSessions.map((v, i) => (
              <div key={i} className="ad-bar-col">
                <div className="ad-bar-val">{v}</div>
                <div className="ad-bar-wrap">
                  <div className="ad-bar-fill" style={{ height: `${(v / maxBar) * 100}%` }} />
                </div>
                <div className="ad-bar-lbl">{dayLabels[i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-card">
          <div className="ad-card-title"><FaTree /> ความคืบหน้า Skill (Top 6)</div>
          <div className="ad-skill-progress-list">
            {[...skills].sort((a, b) => b.avgProgress - a.avgProgress).slice(0, 6).map(s => (
              <div key={s.id} className="ad-sp-row">
                <span className="ad-sp-icon">{s.icon}</span>
                <span className="ad-sp-name">{s.name}</span>
                <div className="ad-sp-bar-wrap">
                  <div className="ad-sp-bar" style={{ width: `${s.avgProgress}%`, background: getTierColor(s.tier) }} />
                </div>
                <span className="ad-sp-pct" style={{ color: getTierColor(s.tier) }}>{s.avgProgress}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ad-card">
        <div className="ad-card-title"><FaUsers /> กิจกรรมผู้ใช้ล่าสุด</div>
        <table className="ad-table">
          <thead><tr><th>ผู้ใช้</th><th>คณะ</th><th>Sessions</th><th>Avg Score</th><th>Streak</th><th>ใช้งานล่าสุด</th><th>สถานะ</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>
                  <div className="ad-user-cell">
                    <div className="ad-avatar-sm">{u.name[0]}</div>
                    <div><div className="ad-user-name-sm">{u.name}</div><div className="ad-user-email-sm">{u.email}</div></div>
                  </div>
                </td>
                <td><span className="ad-faculty-tag">{u.faculty}</span></td>
                <td><span className="ad-mono">{u.sessions}</span></td>
                <td><span className="ad-score" style={{ color: getScoreColor(u.avgScore) }}>{u.avgScore}%</span></td>
                <td><span className="ad-mono"><FaFire /> {u.streak}</span></td>
                <td><span className="ad-muted">{u.lastActive}</span></td>
                <td><span className="ad-status-dot" style={{ background: getStatusColor(u.status) }} /><span className="ad-muted">{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}