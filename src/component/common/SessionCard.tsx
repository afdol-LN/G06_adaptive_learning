import React, { useState } from "react";
import { SessionHistoryItem } from "../../models/sessionHistoryModel";

interface SessionCardProps {
  session: SessionHistoryItem;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const [isOpen, setIsOpen] = useState(false);

  const correctCount = session.questions.filter((q) => q.isCorrect).length;
  const totalCount = session.questions.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  let grade = "poor";
  let gradeLabel = "ต้องปรับปรุง";
  if (score >= 80) {
    grade = "great";
    gradeLabel = "ดีมาก";
  } else if (score >= 55) {
    grade = "good";
    gradeLabel = "ดี";
  }

  const dateStr = session.startTime
    ? new Date(session.startTime).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const title = session.isPretest ? "Pretest / แบบทดสอบก่อนเรียน" : "แบบฝึกหัดทักษะ";

  return (
    <div className="session-card">
      <div className="session-head" onClick={() => setIsOpen(!isOpen)}>
        <div className="session-head-left">
          <div className="session-num">#{session.sessionId}</div>
          <div>
            <div className="session-title">{title}</div>
            <div className="session-meta">
              {dateStr} · {totalCount} ข้อ
            </div>
          </div>
        </div>
        <div className="session-head-right">
          <span className={`score-badge ${grade}`}>
            {score}% · {gradeLabel}
          </span>
          <span className={`chevron ${isOpen ? "open" : ""}`}>▾</span>
        </div>
      </div>
      {isOpen && (
        <div className="session-body">
          {session.questions.map((q, qi) => {
            const timeDiff = q.startTime && q.endTime
              ? Math.round((new Date(q.endTime).getTime() - new Date(q.startTime).getTime()) / 1000)
              : 0;
            return (
              <div key={q.id || qi} className="q-item">
                <div className={`q-icon ${q.isCorrect ? "correct" : "wrong"}`}>
                  {q.isCorrect ? "✓" : "✗"}
                </div>
                <div className="q-body">
                  <div className="q-text">
                    ข้อ {qi + 1}: {q.questionText}
                  </div>
                  <div className="q-meta">
                    เวลา: {timeDiff} วินาที
                  </div>
                  {q.isCorrect ? (
                    <span className="ans-correct">✓ ถูกต้อง</span>
                  ) : (
                    <span>
                      <span className="ans-wrong">คำตอบคุณ: {q.chosenAnswer || "—"}</span>
                      <span className="ans-arrow"> → </span>
                      <span className="ans-correct">เฉลย: {q.correctAnswer}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default SessionCard;
