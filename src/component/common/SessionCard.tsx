import React, { useState } from "react";
import { FaCheck, FaChevronDown, FaXmark } from "react-icons/fa6";
import { SessionHistoryItem } from "../../models/sessionHistoryModel";
import { usePreferences } from "../../context/PreferencesContext";

interface SessionCardProps {
  session: SessionHistoryItem;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { t, locale } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);

  const correctCount = session.questions.filter((q) => q.isCorrect).length;
  const totalCount = session.questions.length;
  const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  const grade = score >= 80 ? "great" : score >= 55 ? "good" : "poor";
  const gradeLabel = t(`grade.${grade}`);

  const dateStr = session.startTime
    ? new Date(session.startTime).toLocaleDateString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const title = session.isPretest ? t("session.type.pretest") : t("session.type.practice");

  return (
    <div className="session-card">
      <div className="session-head" onClick={() => setIsOpen(!isOpen)}>
        <div className="session-head-left">
          <div className="session-num">#{session.sessionId}</div>
          <div>
            <div className="session-title">{title}</div>
            <div className="session-meta">
              {dateStr} · {t("session.questionCount", { count: totalCount })}
            </div>
          </div>
        </div>
        <div className="session-head-right">
          <span className={`score-badge ${grade}`}>
            {score}% · {gradeLabel}
          </span>
          <span className={`chevron ${isOpen ? "open" : ""}`}><FaChevronDown aria-hidden /></span>
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
                  {q.isCorrect ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
                </div>
                <div className="q-body">
                  <div className="q-text">
                    {t("session.questionN", { n: qi + 1 })} {q.questionText}
                  </div>
                  <div className="q-meta">{t("session.time", { sec: timeDiff })}</div>
                  {q.isCorrect ? (
                    <span className="ans-correct"><FaCheck aria-hidden /> {t("session.correct")}</span>
                  ) : (
                    <span>
                      <span className="ans-wrong">{t("session.yourAnswer", { answer: q.chosenAnswer || "—" })}</span>
                      <span className="ans-arrow"> → </span>
                      <span className="ans-correct">{t("session.answerKey", { answer: q.correctAnswer })}</span>
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
