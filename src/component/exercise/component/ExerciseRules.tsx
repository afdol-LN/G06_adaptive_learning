import { useEffect, useRef } from 'react';
import { FaListCheck } from 'react-icons/fa6';
import { usePreferences } from '../../../context/PreferencesContext';

interface ExerciseRulesProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  /** from /session/start — never hard-coded here */
  questionLimit: number | null;
  /** seconds; null when the question has no set time */
  expectTime: number | null;
}

// Rules button + the card it drops down, top right of the Exercise topbar (adt-learning/docs/adr/0002).
// Every line states something the backend or KT engine actually enforces — keep it that way.
export default function ExerciseRules({ open, onToggle, onClose, questionLimit, expectTime }: ExerciseRulesProps) {
  const { t } = usePreferences();
  const wrapRef = useRef<HTMLDivElement>(null);

  // close on a click outside the button/card, or on Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div className="ex-rules" ref={wrapRef}>
      <button
        type="button"
        className={`ex-tool-btn${open ? ' on' : ''}`}
        data-tour="ex-rules-btn"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="ex-rules-card"
        title={t('exercise.guide.rulesHint')}
      >
        <FaListCheck aria-hidden />
        <span>{t('exercise.guide.rules')}</span>
      </button>

      {open && (
        <div className="ex-rules-card" id="ex-rules-card" role="dialog" aria-label={t('exercise.rules.title')}>
          <div className="ex-rules-title">{t('exercise.rules.title')}</div>
          <ol className="ex-rules-list">
            <li>{t('exercise.rules.length', { max: questionLimit ?? '—' })}</li>
            <li>{t('exercise.rules.final')}</li>
            <li>
              {t('exercise.rules.time')}
              {expectTime ? (
                <span className="ex-rules-note">{t('exercise.rules.timeThis', { sec: expectTime })}</span>
              ) : null}
            </li>
            <li>{t('exercise.rules.progress')}</li>
            <li>{t('exercise.rules.draft')}</li>
          </ol>
        </div>
      )}
    </div>
  );
}
