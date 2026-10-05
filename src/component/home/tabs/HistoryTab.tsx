import React from "react";
import { FaBullseye, FaCircleQuestion, FaLayerGroup, FaStopwatch } from "react-icons/fa6";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TKey } from "../../../i18n";
import { SessionCard } from "../../common/SessionCard";
import { StatCard } from "../../common/StatCard";
import { HistoryTrendChart } from "../component/HistoryTrendChart";
import {
  GRADES,
  PERIODS,
  PeriodFilter,
  TopicFilter,
  useHistoryFilterController,
} from "../controller/historyFilter.controller";
import type { DayGroup, SessionGrade } from "../utils/sessionHistory";

const GRADE_KEYS: Record<SessionGrade, TKey> = {
  great: "grade.great",
  good: "grade.good",
  poor: "grade.poor",
};
const PERIOD_KEYS: Record<PeriodFilter, TKey> = {
  "7": "history.period.7",
  "30": "history.period.30",
  all: "history.period.all",
};
const GROUP_KEYS: Record<DayGroup, TKey> = {
  today: "history.group.today",
  yesterday: "history.group.yesterday",
  week: "history.group.week",
  earlier: "history.group.earlier",
};

interface HistoryTabProps {
  sessions: SessionHistoryItem[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ sessions }) => {
  const { t } = usePreferences();
  const c = useHistoryFilterController(sessions);

  return (
    <div className="tab-history">
      <div className="history-header">
        <h2 className="history-title">{t("history.title", { count: sessions.length })}</h2>
      </div>

      {/* overview of what the filters currently show */}
      <div className="history-stats">
        <StatCard icon={<FaLayerGroup />} value={c.stats.sessions} title={t("history.stats.sessions")} />
        <StatCard icon={<FaCircleQuestion />} value={c.stats.questions} title={t("history.stats.questions")} />
        <StatCard icon={<FaBullseye />} value={`${c.stats.accuracy}%`} title={t("history.stats.accuracy")} />
        <StatCard
          icon={<FaStopwatch />}
          value={c.stats.avgSeconds === null ? "—" : t("history.stats.seconds", { sec: c.stats.avgSeconds })}
          title={t("history.stats.avgTime")}
        />
      </div>

      <HistoryTrendChart points={c.trend} />

      <div className="history-filter" data-tour="tour-history-filter">
        <select
          className="filter-select"
          value={c.topic}
          onChange={(e) => c.setTopic(e.target.value as TopicFilter)}
          aria-label={t("history.allTypes")}
        >
          <option value="all">{t("history.allTypes")}</option>
          <option value="pretest">{t("session.type.pretest")}</option>
          <option value="practice">{t("session.type.practice")}</option>
        </select>
        {c.skillOptions.length > 0 && (
          <select
            className="filter-select"
            value={c.skill}
            onChange={(e) => c.setSkill(e.target.value)}
            aria-label={t("history.allSkills")}
          >
            <option value="all">{t("history.allSkills")}</option>
            {c.skillOptions.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        )}
        <div className="filter-group" role="group" aria-label={t("history.period.label")}>
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              className={`filter-btn ${c.period === p ? "active" : ""}`}
              aria-pressed={c.period === p}
              onClick={() => c.setPeriod(p)}
            >
              {t(PERIOD_KEYS[p])}
            </button>
          ))}
        </div>
        <div className="filter-group" role="group" aria-label={t("history.grade.label")}>
          <button
            type="button"
            className={`filter-btn ${c.grades.size === 0 ? "active" : ""}`}
            aria-pressed={c.grades.size === 0}
            onClick={() => c.toggleGrade("all")}
          >
            {t("history.all")}
          </button>
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              className={`filter-btn ${c.grades.has(g) ? "active" : ""}`}
              aria-pressed={c.grades.has(g)}
              onClick={() => c.toggleGrade(g)}
            >
              {t(GRADE_KEYS[g])}
            </button>
          ))}
        </div>
      </div>

      <div className="history-list" data-tour="tour-history-list">
        {c.shownCount === 0 ? (
          <p className="empty-note lg">{t("history.empty")}</p>
        ) : (
          c.groups.map((g) => (
            <section key={g.key} className="history-group">
              <h3 className="history-group-label">{t(GROUP_KEYS[g.key])}</h3>
              {g.sessions.map((s) => (
                <SessionCard key={s.sessionId} session={s} />
              ))}
            </section>
          ))
        )}
      </div>
    </div>
  );
};
export default HistoryTab;
