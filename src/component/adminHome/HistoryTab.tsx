import React from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { usePreferences } from '../../context/PreferencesContext';

export default function HistoryTab({
  icon,
  filteredHistory,
  histSearch,
  setHistSearch,
  histGrade,
  setHistGrade,
  gradeLabel,
  getScoreColor
}) {
  const { t } = usePreferences();

  return (
    <div className="ad-tab-history">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t('admin.history.title')}</h1>
        <span className="ad-page-sub">{t('admin.common.foundCount', { count: filteredHistory.length })}</span>
      </div>
      <div className="ad-toolbar">
        <div className="ad-search-wrap">
          <span className="ad-search-icon"><FaMagnifyingGlass /></span>
          <input className="ad-search" placeholder={t('admin.history.search')} value={histSearch} onChange={e => setHistSearch(e.target.value)} />
        </div>
        {['all', 'great', 'good', 'low'].map(g => (
          <button key={g} className={`ad-filter-btn ${histGrade === g ? 'active' : ''}`} onClick={() => setHistGrade(g)}>
            {g === 'all' ? t('admin.common.all') : gradeLabel(g)}
          </button>
        ))}
      </div>
      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('admin.history.col.user')}</th>
              <th>{t('admin.history.col.skill')}</th>
              <th>{t('admin.history.col.date')}</th>
              <th>{t('admin.history.col.correct')}</th>
              <th>{t('admin.history.col.score')}</th>
              <th>{t('admin.history.col.result')}</th>
            </tr>
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
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>{t('admin.history.empty')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
