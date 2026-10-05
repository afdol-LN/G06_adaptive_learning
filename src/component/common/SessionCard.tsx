import React, { useState } from "react";
import {
  FaArrowRotateRight,
  FaBan,
  FaBoxOpen,
  FaChartLine,
  FaCheck,
  FaChevronDown,
  FaFlagCheckered,
  FaStopwatch,
  FaTrophy,
  FaXmark,
} from "react-icons/fa6";
import { SessionHistoryItem, SessionQuestionHistory } from "../../models/sessionHistoryModel";
import { usePreferences } from "../../context/PreferencesContext";
import type { TKey } from "../../i18n";
import { answerSeconds, sessionEnd, sessionGrade, sessionScore, SessionEnd } from "../home/utils/sessionHistory";
import CodeBlock from "./CodeBlock";

// why the session ended — icon, label, colour tone
const END_META: Record<SessionEnd, { icon: React.ReactNode; key: TKey; tone: string }> = {
  mastered: { icon: <FaTrophy aria-hidden />, key: "session.end.mastered", tone: "ok" },
  completed: { icon: <FaFlagCheckered aria-hidden />, key: "session.end.completed", tone: "mid" },
  exhausted: { icon: <FaBoxOpen aria-hidden />, key: "session.end.exhausted", tone: "muted" },
  review: { icon: <FaArrowRotateRight aria-hidden />, key: "session.end.review", tone: "ok" },
  abandoned: { icon: <FaBan aria-hidden />, key: "session.end.abandoned", tone: "muted" },
};

// Progress numbers come from the backend (2 decimals, truncated); only their difference is taken here
const round2 = (n: number) => Math.round(n * 100) / 100;

interface SessionCardProps {
  session: SessionHistoryItem;
  /** start with the questions shown (the admin session popup) */
  defaultOpen?: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export const SessionCard: React.FC<SessionCardProps> = ({ session, defaultOpen = false }) => {
  const { t, locale } = usePreferences();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [onlyWrong, setOnlyWrong] = useState(false);

  const totalCount = session.questions.length;
  const correctCount = session.questions.filter((q) => q.isCorrect).length;
  const wrongCount = totalCount - correctCount;
  const score = sessionScore(session);
  const grade = sessionGrade(session);

  const dateStr = session.startTime
    ? new Date(session.startTime).toLocaleString(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const skillNames = session.skillNames ?? [];
  const title = session.isPretest
    ? t("session.type.pretest")
    : skillNames.length > 0
      ? t("session.type.practiceSkill", { skill: skillNames.join(", ") })
      : t("session.type.practice");

  // keep each question's real number when only the wrong ones are shown
  const shown = session.questions
    .map((q, i) => ({ q, n: i + 1 }))
    .filter(({ q }) => !onlyWrong || !q.isCorrect);

  const toggle = () => setIsOpen((o) => !o);

  const end = sessionEnd(session);
  const before = session.progressBefore ?? null;
  const after = session.progressAfter ?? null;
  const delta = before !== null && after !== null ? round2(after - before) : null;

  return (
    // "session-card--" prefix: Adminhome.css owns global .grade-great/.grade-good with a light fill
    <div className={`session-card session-card--${grade}`}>
      <div
        className="session-head"
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <div className="session-head-left">
          <div>
            <div className="session-title">
              {title}
              {session.inProgress && <span className="session-draft-badge">{t("session.inProgress")}</span>}
            </div>
            <div className="session-meta">
              {dateStr} · {t("session.questionCount", { count: totalCount })}
            </div>
            {(end || after !== null) && (
              <div className="session-tags">
                {end && (
                  <span className={`session-end ${END_META[end].tone}`}>
                    {END_META[end].icon}
                    {t(END_META[end].key)}
                  </span>
                )}
                {after !== null && end !== "review" && (
                  <span className="session-progress">
                    <FaChartLine aria-hidden />
                    {t("exercise.progress")}{" "}
                    {before !== null ? `${before}% → ${after}%` : `${after}%`}
                    {delta !== null && delta !== 0 && (
                      <span className={`session-delta ${delta > 0 ? "up" : "down"}`}>
                        {delta > 0 ? "+" : ""}{delta}%
                      </span>
                    )}
                  </span>
                )}
              </div>
            )}
            {/* one dot per answer, in order — the whole session at a glance without opening it */}
            <div
              className="session-dots"
              role="img"
              aria-label={t("session.dotsAria", { correct: correctCount, total: totalCount })}
            >
              {session.questions.map((q, i) => (
                <span key={q.id || i} className={`session-dot ${q.isCorrect ? "ok" : "bad"}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="session-head-right">
          <span className={`score-badge ${grade}`}>
            {score}% · {t(`grade.${grade}`)}
          </span>
          <span className={`chevron ${isOpen ? "open" : ""}`}><FaChevronDown aria-hidden /></span>
        </div>
      </div>

      {isOpen && (
        <div className="session-body">
          {wrongCount > 0 && (
            <div className="q-filter" role="group">
              <button
                type="button"
                className={`filter-btn ${!onlyWrong ? "active" : ""}`}
                aria-pressed={!onlyWrong}
                onClick={() => setOnlyWrong(false)}
              >
                {t("session.allQuestions", { count: totalCount })}
              </button>
              <button
                type="button"
                className={`filter-btn ${onlyWrong ? "active" : ""}`}
                aria-pressed={onlyWrong}
                onClick={() => setOnlyWrong(true)}
              >
                {t("session.onlyWrong", { count: wrongCount })}
              </button>
            </div>
          )}
          {shown.map(({ q, n }) => (
            <QuestionRow key={q.id || n} q={q} n={n} />
          ))}
        </div>
      )}
    </div>
  );
};

// One answered question: result, time, and — for a choice question — every option with the
// student's pick and the key marked, the way the Exercise screen showed it
const QuestionRow: React.FC<{ q: SessionQuestionHistory; n: number }> = ({ q, n }) => {
  const { t } = usePreferences();
  const sec = answerSeconds(q);
  const hasChoices = q.choices && q.choices.length > 0;

  return (
    <div className="q-item">
      <div className={`q-icon ${q.isCorrect ? "correct" : "wrong"}`}>
        {q.isCorrect ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
      </div>
      <div className="q-body">
        <div className="q-text">
          {t("session.questionN", { n })} {q.questionText}
          {q.skillLevel != null && <span className="q-level">{t("question.level", { level: q.skillLevel })}</span>}
        </div>
        {q.code && <CodeBlock code={q.code} language={q.language} />}
        {sec !== null && (
          <div className="q-meta">
            <FaStopwatch aria-hidden />{" "}
            {q.expectTime
              ? t("session.timeVsExpected", { sec, expected: q.expectTime })
              : t("session.time", { sec })}
            {/* time used against the expected time; over it turns the bar orange */}
            {q.expectTime ? (
              <span className="q-time-track" aria-hidden>
                <span
                  className={`q-time-fill ${sec > q.expectTime ? "over" : ""}`}
                  style={{ width: `${Math.min(100, (sec / q.expectTime) * 100)}%` }}
                />
              </span>
            ) : null}
          </div>
        )}
        {hasChoices ? (
          <ul className="q-choices">
            {q.choices.map((c, i) => {
              const picked = q.chosenAnswer === c.script;
              const cls = c.isAnswer ? "is-key" : picked ? "is-wrong-pick" : "";
              return (
                <li key={c.id} className={`q-choice ${cls}`}>
                  <span className="q-choice-letter">{LETTERS[i] ?? i + 1}</span>
                  <span className="q-choice-text">{c.script}</span>
                  {/* red on a wrong pick, green when the pick was the key */}
                  {picked && <span className={`q-choice-tag ${c.isAnswer ? "key" : ""}`}>{t("session.yourPick")}</span>}
                  {c.isAnswer && (
                    <span className="q-choice-tag key">
                      <FaCheck aria-hidden /> {t("session.keyTag")}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : q.isCorrect ? (
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
};

export default SessionCard;
