import { useEffect, useRef } from 'react';
import { FaArrowRight, FaCheck, FaClipboardCheck, FaXmark } from 'react-icons/fa6';
import { usePreferences } from '../../../context/PreferencesContext';
import { displayProgressPercent, formatProgressLabel } from '../../home/utils/skillTree';
import type { AnswerFeedback } from '../controller/useExerciseController';

// = the .ex-sheet transform transition in Exercise.css
const SLIDE_UP_MS = 320;

interface AnswerSheetProps {
  feedback: AnswerFeedback | null;
  open: boolean;
  onNext: () => void;
}

// Slides up from the bottom once an answer is checked: right/wrong, how Progress moved, and "next".
export default function AnswerSheet({ feedback, open, onNext }: AnswerSheetProps) {
  const { t } = usePreferences();
  const nextRef = useRef<HTMLButtonElement>(null);
  // width is driven here, not through React state, so the jump to the start value can skip the transition
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fill = fillRef.current;
    if (!open || !feedback || !fill) return;
    nextRef.current?.focus(); // Enter goes on without reaching for the mouse
    // jump to the old Progress instantly — otherwise the bar would first animate from wherever
    // the previous answer left it (0 on the first answer) and then turn back
    fill.style.transition = 'none';
    fill.style.width = `${displayProgressPercent(feedback.before)}%`;
    void fill.offsetWidth; // commit the start width before the transition comes back
    fill.style.transition = '';
    // wait for the sheet to finish sliding up, then the bar moves over 1.5s (Exercise.css).
    // A timer, not rAF: rAF never fires while the tab isn't painting, which would freeze the bar
    const id = setTimeout(() => {
      fill.style.width = `${displayProgressPercent(feedback.after)}%`;
    }, SLIDE_UP_MS);
    return () => clearTimeout(id);
  }, [open, feedback]);

  const notStarted = t('skill.notStarted');
  const before = feedback ? displayProgressPercent(feedback.before) : 0;
  const after = feedback ? displayProgressPercent(feedback.after) : 0;
  // both sides are the backend's truncated Progress, so the difference needs no rounding up
  const delta = Math.round((after - before) * 100) / 100;
  const tone = feedback?.isCorrect ? 'ok' : 'bad';

  return (
    <div
      className={`ex-sheet ${tone} ${open ? 'open' : ''}`}
      role="status"
      aria-live="polite"
      aria-hidden={!open}
    >
      {feedback && (
        <div className="ex-sheet-inner">
          <span className="ex-sheet-icon" aria-hidden>
            {feedback.isCorrect ? <FaCheck /> : <FaXmark />}
          </span>
          <div className="ex-sheet-body">
            <div className="ex-sheet-title">
              {feedback.isCorrect ? t('exercise.correct') : t('exercise.incorrect')}
            </div>
            <div className="ex-sheet-progress">
              <span className="ex-sheet-plabel">{t('exercise.progress')}</span>
              <span className="ex-sheet-pvals">
                {formatProgressLabel(feedback.before, notStarted)} → {formatProgressLabel(feedback.after, notStarted)}
              </span>
              {delta !== 0 && (
                <span className={`ex-sheet-delta ${delta > 0 ? 'up' : 'down'}`}>
                  {delta > 0 ? '+' : ''}{delta}%
                </span>
              )}
            </div>
            <div className="ex-sheet-track">
              {/* where the bar was: after a drop the lost part stays faintly visible behind the fill */}
              <div className="ex-sheet-ghost" style={{ width: `${before}%` }} />
              <div ref={fillRef} className="ex-sheet-fill" />
            </div>
          </div>
          <button ref={nextRef} type="button" className="ex-sheet-next" onClick={onNext}>
            {feedback.isLast ? (
              <>
                <FaClipboardCheck aria-hidden />
                <span>{t('exercise.seeSummary')}</span>
              </>
            ) : (
              <>
                <span>{t('exercise.next')}</span>
                <FaArrowRight aria-hidden />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
