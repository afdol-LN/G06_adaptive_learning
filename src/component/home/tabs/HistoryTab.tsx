import React, { useState } from "react";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { SessionCard } from "../../common/SessionCard";

interface HistoryTabProps {
  sessions: SessionHistoryItem[];
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ sessions }) => {
  const [topicFilter, setTopicFilter] = useState("all");
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

  const getSessionGrade = (s: SessionHistoryItem): string => {
    const correctCount = s.questions.filter((q) => q.isCorrect).length;
    const totalCount = s.questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    if (score >= 80) return "great";
    if (score >= 55) return "good";
    return "poor"; // matches SessionCard
  };

  const getSessionTitle = (s: SessionHistoryItem): string => {
    return s.isPretest ? "Pretest / แบบทดสอบก่อนเรียน" : "แบบฝึกหัดทักษะ";
  };

  const allTopics = ["all", "Pretest / แบบทดสอบก่อนเรียน", "แบบฝึกหัดทักษะ"];

  const gradeLabel = (g: string) => {
    if (g === "great") return "ดีมาก";
    if (g === "good") return "ดี";
    return "ต้องปรับปรุง";
  };

  const filteredSessions = sessions.filter((s) => {
    const grade = getSessionGrade(s);
    const title = getSessionTitle(s);

    const gm = historyFilter.has("all") || historyFilter.has(grade);
    const tm = topicFilter === "all" || title === topicFilter;
    return gm && tm;
  });

  return (
    <div className="tab-history">
      <div className="history-header">
        <h2 className="history-title">Session History ({sessions.length} sessions)</h2>
        <div className="history-filter">
          <select
            className="filter-select"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            {allTopics.map((t) => (
              <option key={t} value={t}>
                {t === "all" ? "ทุกประเภท" : t}
              </option>
            ))}
          </select>
          {["all", "great", "good", "poor"].map((f) => (
            <button
              key={f}
              className={`filter-btn ${historyFilter.has(f) ? "active" : ""}`}
              onClick={() => handleHistoryFilter(f)}
            >
              {f === "all" ? "ทั้งหมด" : gradeLabel(f)}
            </button>
          ))}
        </div>
      </div>
      <div className="history-list">
        {filteredSessions.length === 0 ? (
          <p style={{ color: "#94a3b8", textAlign: "center", padding: "48px" }}>
            ไม่พบประวัติเซสชันที่ตรงตามเงื่อนไขตัวกรอง
          </p>
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
