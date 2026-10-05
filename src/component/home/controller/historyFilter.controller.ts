import { useCallback, useMemo, useState } from "react";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import {
  DayGroup,
  SessionGrade,
  SessionTopic,
  dayGroup,
  historyStats,
  sessionGrade,
  sessionScore,
  sessionTime,
  sessionTopic,
} from "../utils/sessionHistory";

export interface TrendPoint {
  sessionId: number;
  time: number;
  score: number;
  session: SessionHistoryItem;
}

export type TopicFilter = "all" | SessionTopic;
export type PeriodFilter = "7" | "30" | "all";
export const GRADES: SessionGrade[] = ["great", "good", "poor"];
export const PERIODS: PeriodFilter[] = ["7", "30", "all"];
const DAY_ORDER: DayGroup[] = ["today", "yesterday", "week", "earlier"];
const DAY_MS = 86_400_000;

// Filter state + everything derived from it for the History tab; the component only lays it out
export function useHistoryFilterController(sessions: SessionHistoryItem[]) {
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [skill, setSkill] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  // empty = every grade (the "all" chip)
  const [grades, setGrades] = useState<Set<SessionGrade>>(new Set());

  const toggleGrade = useCallback((g: SessionGrade | "all") => {
    setGrades((prev) => {
      if (g === "all") return new Set();
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }, []);

  // every skill any practice session covered, for the skill dropdown
  const skillOptions = useMemo(
    () => [...new Set(sessions.flatMap((s) => s.skillNames ?? []))].sort((a, b) => a.localeCompare(b)),
    [sessions],
  );

  const filtered = useMemo(() => {
    const since = period === "all" ? -Infinity : Date.now() - Number(period) * DAY_MS;
    return sessions
      .filter((s) => topic === "all" || sessionTopic(s) === topic)
      .filter((s) => skill === "all" || (s.skillNames ?? []).includes(skill))
      .filter((s) => sessionTime(s) >= since)
      .filter((s) => grades.size === 0 || grades.has(sessionGrade(s)))
      // newest first by the real start time — the API order isn't chronological
      .sort((a, b) => sessionTime(b) - sessionTime(a));
  }, [sessions, topic, skill, period, grades]);

  // "today / yesterday / this week / earlier", each already newest-first, empty groups dropped
  const groups = useMemo(() => {
    const now = new Date();
    return DAY_ORDER.map((key) => ({ key, sessions: filtered.filter((s) => dayGroup(s, now) === key) })).filter(
      (g) => g.sessions.length > 0,
    );
  }, [filtered]);

  // the overview describes what the filters show, so it changes with them
  const stats = useMemo(() => historyStats(filtered), [filtered]);

  // % correct per session, oldest → newest, for the trend chart
  const trend = useMemo(
    () =>
      [...filtered]
        .reverse()
        .map((s) => ({ sessionId: s.sessionId, time: sessionTime(s), score: sessionScore(s), session: s })),
    [filtered],
  );

  return {
    topic,
    setTopic,
    skill,
    setSkill,
    skillOptions,
    period,
    setPeriod,
    grades,
    toggleGrade,
    groups,
    stats,
    trend,
    shownCount: filtered.length,
  };
}
