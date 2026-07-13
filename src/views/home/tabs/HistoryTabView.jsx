// ─── views/home/tabs/HistoryTabView.jsx ─────────────────────────────────────
// Tab: Session History (filter, accordion)
// UI only — รับ vm จาก HomeView
// ─────────────────────────────────────────────────────────────────────────────
import { getProgressColor } from '../../../models/skillModel';

const GRADE_FILTERS = ['all', 'great', 'good', 'low'];

export default function HistoryTabView({ vm }) {
  const {
    sessions, historyFilter, topicFilter, openSessions,
    handleHistoryFilter, setTopicFilter, toggleSession,
    gradeLabel, allTopics,
  } = vm;

  const getGradeColor = g =>
    g === 'great' ? '#10b981' : g === 'good' ? '#3b82f6' : '#f59e0b';

  const filtered = sessions.filter(s => {
    const passGrade = historyFilter.has('all') || historyFilter.has(s.grade);
    const passTopic = topicFilter === 'all' || s.title === topicFilter;
    return passGrade && passTopic;
  });

  return (
    <div className="tab-history">
      <div className="section-header">
        <h2 className="section-title">📋 ประวัติการเรียน</h2>
        <p className="section-sub">Session ทั้งหมด {sessions.length} ครั้ง</p>
      </div>

      {/* Filters */}
      <div className="history-filters">
        <div className="filter-group">
          <span className="filter-label">ผลลัพธ์:</span>
          {GRADE_FILTERS.map(g => (
            <button key={g}
              className={`filter-chip ${historyFilter.has(g) ? 'active' : ''}`}
              onClick={() => handleHistoryFilter(g)}>
              {g === 'all' ? 'ทั้งหมด' : gradeLabel(g)}
            </button>
          ))}
        </div>
        <div className="filter-group">
          <span className="filter-label">เรื่อง:</span>
          <select className="filter-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)}>
            {allTopics.map(t => <option key={t} value={t}>{t === 'all' ? 'ทุกเรื่อง' : t}</option>)}
          </select>
        </div>
      </div>

      {/* Session list */}
      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-text">ยังไม่มี session ที่ตรงกับตัวกรอง</div>
        </div>
      )}
      {filtered.map(s => (
        <div key={s.id} className="session-card">
          <div className="session-header" onClick={() => toggleSession(s.id)}>
            <div className="session-title-row">
              <span className="session-title">{s.title}</span>
              <span className="session-date">{s.date}</span>
            </div>
            <div className="session-meta-row">
              <span className="session-grade" style={{ color: getGradeColor(s.grade), background: `${getGradeColor(s.grade)}15`, border: `1px solid ${getGradeColor(s.grade)}40` }}>
                {gradeLabel(s.grade)}
              </span>
              <span className="session-score" style={{ color: getProgressColor(s.score) }}>{s.score}%</span>
              <span className="session-toggle">{openSessions[s.id] ? '▲' : '▼'}</span>
            </div>
          </div>
          {openSessions[s.id] && (
            <div className="session-questions">
              {(s.questions || []).map((q, i) => (
                <div key={i} className={`sq-row ${q.correct ? 'correct' : 'wrong'}`}>
                  <span className="sq-num">Q{i + 1}</span>
                  <span className="sq-text">{q.text}</span>
                  <span className="sq-time">{q.time}</span>
                  <span className="sq-result">{q.correct ? '✓' : '✗'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
