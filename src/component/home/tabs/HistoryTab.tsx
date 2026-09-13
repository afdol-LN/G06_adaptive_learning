import React, { useState } from "react";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TKey } from "../../../i18n";
import { SessionCard } from "../../common/SessionCard";

type Topic = "all" | "pretest" | "practice";
type Grade = "great" | "good" | "poor";

const TOPIC_KEYS: Record<Exclude<Topic, "all">, TKey> = {
  pretest: "session.type.pretest",
  practice: "session.type.practice",
};
const GRADE_KEYS: Record<Grade, TKey> = {
  great: "grade.great",
  good: "grade.good",
  poor: "grade.poor",
};

interface HistoryTabProps {
  sessions: SessionHistoryItem[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ sessions }) => {
  const { t } = usePreferences();
  const [topicFilter, setTopicFilter] = useState<Topic>("all");
  const [historyFilter, setHistoryFilter] = useState<Set<string>>(new Set(["all"]));

  const handleHistoryFilter = (filter: string) => {
    setHistoryFilter((prev) => {
      const next = new Set(prev);
      if (filter === "all") {
        next.clear();
        next.add("all");
      } else {
        next.delete("all");
        if (next.has(filter)) {
          next.delete(filter);
          if (next.size === 0) next.add("all");
        } else {
          next.add(filter);
        }
      }
      return next;
    });
  };

  const getSessionGrade = (s: SessionHistoryItem): Grade => {
    const correctCount = s.questions.filter((q) => q.isCorrect).length;
    const totalCount = s.questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    if (score >= 80) return "great";
    if (score >= 55) return "good";
    return "poor"; // matches SessionCard
  };

  const getSessionTopic = (s: SessionHistoryItem): Exclude<Topic, "all"> =>
    s.isPretest ? "pretest" : "practice";

  const filteredSessions = sessions.filter((s) => {
    const gm = historyFilter.has("all") || historyFilter.has(getSessionGrade(s));
    const tm = topicFilter === "all" || getSessionTopic(s) === topicFilter;
    return gm && tm;
  });

  return (
    <div className="tab-history">
      <div className="history-header">
        <h2 className="history-title">{t("history.title", { count: sessions.length })}</h2>
        <div className="history-filter" data-tour="tour-history-filter">
          <select
            className="filter-select"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value as Topic)}
          >
            <option value="all">{t("history.allTypes")}</option>
            <option value="pretest">{t(TOPIC_KEYS.pretest)}</option>
            <option value="practice">{t(TOPIC_KEYS.practice)}</option>
          </select>
          {(["all", "great", "good", "poor"] as const).map((f) => (
            <button
              key={f}
              className={`filter-btn ${historyFilter.has(f) ? "active" : ""}`}
              aria-pressed={historyFilter.has(f)}
              onClick={() => handleHistoryFilter(f)}
            >
              {f === "all" ? t("history.all") : t(GRADE_KEYS[f])}
            </button>
          ))}
        </div>
      </div>
      <div className="history-list" data-tour="tour-history-list">
        {filteredSessions.length === 0 ? (
          <p className="empty-note lg">{t("history.empty")}</p>
        ) : (
          [...filteredSessions].reverse().map((s) => (
            <SessionCard key={s.sessionId} session={s} />
          ))
        )}
      </div>
    </div>
  );
};
export default HistoryTab;
