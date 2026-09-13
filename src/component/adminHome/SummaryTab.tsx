import React from 'react';
import {
  FaUsers,
  FaCircleCheck,
  FaClipboardList,
  FaBullseye,
  FaTree,
  FaTrophy,
  FaCalendarDays,
  FaFire,
} from 'react-icons/fa6';
import { usePreferences } from '../../context/PreferencesContext';
import { statusKey } from '../../utils/adminUi';

// --kpi = สีของการ์ด (token ใน Adminhome.css มีค่าแยกของธีมมืด) — พื้นไอคอนผสมจากสีนี้ใน CSS
const kpiVar = (color: string) => ({ '--kpi': color } as React.CSSProperties);

export default function SummaryTab({
  icon,
  SUMMARY,
  skills,
  users,
  getTierColor,
  getScoreColor,
  getStatusColor,
  maxBar,
  dayLabels
}) {
  const { t, locale } = usePreferences();
  const today = new Date().toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const kpis = [
    { label: t('admin.summary.kpi.users'),       value: SUMMARY.totalUsers,     icon: <FaUsers />,         color: 'var(--accent)' },
    { label: t('admin.summary.kpi.activeToday'), value: SUMMARY.activeToday,    icon: <FaCircleCheck />,   color: 'var(--green)' },
    { label: t('admin.summary.kpi.sessions'),    value: SUMMARY.totalSessions,  icon: <FaClipboardList />, color: 'var(--purple)' },
    { label: t('admin.summary.kpi.avgScore'),    value: `${SUMMARY.avgScore}%`, icon: <FaBullseye />,      color: 'var(--orange)' },
    { label: t('admin.summary.kpi.skills'),      value: skills.length,          icon: <FaTree />,          color: 'var(--blue)' },
    { label: t('admin.summary.kpi.topSkill'),    value: SUMMARY.topSkill,       icon: <FaTrophy />,        color: 'var(--accent)' },
  ];

  return (
    <div className="ad-tab-summary">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t('admin.summary.title')}</h1>
        <span className="ad-page-sub">{t('admin.summary.asOf', { date: today })}</span>
      </div>
      <div className="ad-kpi-grid">
        {kpis.map((k, i) => (
          <div key={i} className="ad-kpi-card" style={kpiVar(k.color)}>
            <div className="ad-kpi-icon">{k.icon}</div>
            <div className="ad-kpi-info">
              <div className="ad-kpi-value">{k.value}</div>
              <div className="ad-kpi-label">{k.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="ad-chart-row">
        <div className="ad-card">
          <div className="ad-card-title"><FaCalendarDays /> {t('admin.summary.dailySessions')}</div>
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
          <div className="ad-card-title"><FaTree /> {t('admin.summary.skillProgress')}</div>
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
        <div className="ad-card-title"><FaUsers /> {t('admin.summary.recentActivity')}</div>
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t('admin.summary.col.user')}</th>
              <th>{t('admin.summary.col.faculty')}</th>
              <th>{t('admin.summary.col.sessions')}</th>
              <th>{t('admin.summary.col.avgScore')}</th>
              <th>{t('admin.summary.col.streak')}</th>
              <th>{t('admin.summary.col.lastActive')}</th>
              <th>{t('admin.common.status')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const sk = statusKey(u.status);
              return (
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
                  <td><span className="ad-status-dot" style={{ background: getStatusColor(u.status) }} /><span className="ad-muted">{sk ? t(sk) : u.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
