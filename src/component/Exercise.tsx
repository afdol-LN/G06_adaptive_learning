import { useEffect } from 'react';
import './decorate/Exercise.css';
import './decorate/Tour.css';
import { useExerciseController } from './exercise/controller/useExerciseController';
import { useExerciseGuideController } from './exercise/controller/useExerciseGuideController';
import ExerciseRules from './exercise/component/ExerciseRules';
import CodeBlock from './common/CodeBlock';
import AppLogo from './common/AppLogo';
import {
  FaArrowRight,
  FaArrowRightFromBracket,
  FaChartLine,
  FaCheck,
  FaCircleQuestion,
  FaClipboardCheck,
  FaHouse,
  FaPlay,
  FaSpinner,
  FaTrophy,
  FaXmark,
} from 'react-icons/fa6';
import { usePreferences } from '../context/PreferencesContext';
import { displayProgressPercent, formatProgressLabel } from './home/utils/skillTree';

export default function Exercise() {
  const controller = useExerciseController();
  const { t } = usePreferences();
  const guide = useExerciseGuideController(t);
  const notStarted = t('skill.notStarted');
  const { pauseClock, resumeClock } = controller;

  // Reading the tour/rules or the leave dialog never counts as answer time (adt-learning/docs/adr/0002, 0003)
  const clockPaused = guide.isOpen || controller.exitOpen;
  useEffect(() => {
    if (clockPaused) pauseClock();
    else resumeClock();
  }, [clockPaused, pauseClock, resumeClock]);

  if (controller.isLoading || !controller.question) {
    return (
      <>
        <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
        <div className="wrap">
          <div className="stage">
            <div className="qcard">{t('exercise.loading')}</div>
          </div>
        </div>
      </>
    );
  }

  const question = controller.question;

  // Same number and "not started" rule as the skill-tree node (adt-learning/docs/adr/0001)
  const pct = displayProgressPercent(controller.progress);
  const answeredInSession = controller.progress.attemptCount > controller.progressStart.attemptCount;
  const startLabel = formatProgressLabel(controller.progressStart, notStarted);
  const nowLabel = formatProgressLabel(controller.progress, notStarted);

  // Only a result given for *this* exercise is shown — never while the answer is still being checked
  const revealed = controller.result?.exerciseId === question.exerciseId ? controller.result : null;
  const outcomeClass = revealed ? (revealed.isCorrect ? 'rev-ok' : 'rev-no') : '';
  const canSubmit = question.type === 'CHOICE' ? controller.selected !== null : controller.fillInBlankInput !== '';

  return (
    <>
      <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
      <div className="wrap">
        <div className="topbar">
          <div className="logo">
            <div className="logo-box"><AppLogo /></div>
            <span className="logo-txt">G06 · ALS</span>
            <div className="logo-dot"></div>
            <span className="logo-sub">Adaptive Learning</span>
          </div>
          <div className="topbar-r">
            <button
              type="button"
              className="ex-tool-btn"
              data-tour="ex-exit"
              onClick={controller.requestExit}
              disabled={controller.checking}
              title={t('exercise.exitHint')}
            >
              <FaArrowRightFromBracket aria-hidden />
              <span>{t('exercise.exit')}</span>
            </button>
            <button
              type="button"
              className="ex-tool-btn"
              data-tour="ex-tour-btn"
              onClick={guide.startTour}
              title={t('exercise.guide.tourHint')}
            >
              <FaCircleQuestion aria-hidden />
              <span>{t('exercise.guide.tour')}</span>
            </button>
            <ExerciseRules
              open={guide.rulesOpen}
              onToggle={guide.toggleRules}
              onClose={guide.closeRules}
              questionLimit={controller.questionLimit}
              expectTime={question.expectTime}
            />
            <span className="sess-chip" data-tour="ex-counter">
              {t('exercise.questionN', { n: controller.questionIndex + 1 })}
            </span>
          </div>
        </div>

        <div className="prog-area">
          <div data-tour="ex-progress">
            <div className="prog-row">
              <span className="prog-label">{t('exercise.progress')}</span>
              {answeredInSession && <span className="prog-frac">{startLabel} → {nowLabel}</span>}
              <div className="prog-spacer"></div>
              <span className="prog-pct">{nowLabel}</span>
            </div>
            <div className="prog-track"><div className="prog-fill" style={{ width: `${pct}%` }}></div></div>
          </div>
          <div className="prog-meta" data-tour="ex-meta">
            <span className="prog-exid">{t('exercise.exerciseId', { id: question.exerciseId })}</span>
            <span className="prog-skill">{t('exercise.skill', { name: controller.skillsName })}</span>
          </div>
        </div>

        <div className="stage">
          <div className="qcard" key={question.exerciseId}>
            <div className="card-ribbon"></div>
            <div className="card-body">
              <div className="q-question" data-tour="ex-question">{question.description}</div>

              <CodeBlock code={question.code} language={question.language} />

              {question.type === 'CHOICE' ? (
                <div className={`choices${controller.locked ? ' locked' : ''}`} data-tour="ex-answer">
                  {(question.choices || []).map((choice) => {
                    const outcome = revealed?.choiceId === choice.id ? outcomeClass : '';
                    const stateClass = outcome || (controller.selected === choice.id ? 'sel' : '');
                    return (
                      <div
                        key={choice.id}
                        className={stateClass ? `opt ${stateClass}` : 'opt'}
                        onClick={() => controller.pick(choice.id)}
                        aria-disabled={controller.locked}
                      >
                        <div className="opt-text">{choice.script}</div>
                        {outcome && (
                          <span className="opt-ck">
                            {revealed?.isCorrect ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <input
                  className={outcomeClass ? `fill-blank-input ${outcomeClass}` : 'fill-blank-input'}
                  data-tour="ex-answer"
                  value={controller.fillInBlankInput}
                  onChange={(e) => controller.setFillInBlankInput(e.target.value)}
                  disabled={controller.locked}
                  placeholder={t('exercise.fillPlaceholder')}
                />
              )}
            </div>

            <div className="card-foot">
              <button
                className={controller.checking ? 'btn-next checking' : 'btn-next'}
                data-tour="ex-submit"
                onClick={controller.submit}
                disabled={controller.locked || !canSubmit}
                aria-busy={controller.checking}
              >
                {controller.checking ? (
                  <>
                    <FaSpinner className="spin" aria-hidden />
                    <span>{t('exercise.checking')}</span>
                  </>
                ) : (
                  <>
                    <span>{t('exercise.submit')}</span>
                    <FaArrowRight aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`flash ${revealed && !controller.sessionEnded ? 'in' : 'out'}`}
        style={{ color: revealed?.isCorrect ? 'var(--green)' : 'var(--red)' }}
        role="status"
        aria-live="polite"
      >
        {revealed &&
          (revealed.isCorrect ? (
            <FaCheck title={t('exercise.correct')} />
          ) : (
            <FaXmark title={t('exercise.incorrect')} />
          ))}
      </div>

      {controller.exitOpen && (
        <div className="overlay open" onClick={controller.cancelExit}>
          <div
            className="popup ex-exit-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ex-exit-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ph">
              <div className="ph-title" id="ex-exit-title">{t('exercise.exitConfirm.title')}</div>
              <div className="ph-sub">{t('exercise.exitConfirm.body')}</div>
            </div>
            <div className="pf">
              <button className="btn-home" onClick={controller.cancelExit} autoFocus>
                <span>{t('exercise.exitConfirm.stay')}</span>
              </button>
              <button className="btn-sess" onClick={controller.confirmExit}>
                <FaArrowRightFromBracket aria-hidden />
                <span>{t('exercise.exitConfirm.leave')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`overlay ${controller.sessionEnded ? 'open' : ''}`}>
        <div className="popup">
          <div className="ph">
            <span className="ph-trophy">
              {controller.stopReason === 'mastered' ? <FaTrophy aria-hidden /> : <FaClipboardCheck aria-hidden />}
            </span>
            <div className="ph-title">{t('exercise.done.title')}</div>
            <div className="score-pills">
              <div className="spill sp-cor">
                <FaCheck aria-hidden />
                <span>{t('exercise.done.correct', { count: controller.correctCount })}</span>
              </div>
              {controller.summary && (
                <div className="spill sp-ps">
                  <FaChartLine aria-hidden />
                  {/* session start → end; summary.pLBefore is only "before the last answer" */}
                  <span>{t('exercise.progress')}: {startLabel} → {nowLabel}</span>
                </div>
              )}
            </div>
          </div>
          <div className="pf">
            <button className="btn-home" onClick={controller.goHome}>
              <FaHouse aria-hidden />
              <span>{t('exercise.done.home')}</span>
            </button>
            {controller.summary?.nextRecommendation && (
              <button className="btn-sess" onClick={controller.goHome}>
                <FaPlay aria-hidden />
                <span>{t('exercise.done.next', { name: controller.summary.nextRecommendation.skillsName })}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
