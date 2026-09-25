import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './decorate/Exercise.css';
import './decorate/Tour.css';
import { useExerciseController } from './exercise/controller/useExerciseController';
import { useExerciseGuideController } from './exercise/controller/useExerciseGuideController';
import ExerciseRules from './exercise/component/ExerciseRules';
import AnswerSheet from './exercise/component/AnswerSheet';
import SessionSummary from './exercise/component/SessionSummary';
import QuestionCard from './common/QuestionCard';
import AppBrand from './common/AppBrand';
import {
  FaArrowRight,
  FaArrowRightFromBracket,
  FaCircleQuestion,
  FaSpinner,
} from 'react-icons/fa6';
import { usePreferences } from '../context/PreferencesContext';
import { displayProgressPercent, formatProgressLabel } from './home/utils/skillTree';

function ExerciseScreen() {
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

  // The sticky progress bar gets its background only once the page has scrolled (Exercise.css .scrolled)
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    // Exercise.css sets overflow on both <html> and <body>, so either can end up the scroller:
    // listen in the capture phase (element scroll events don't bubble) and read both
    const onScroll = () =>
      setScrolled(Math.max(window.scrollY, document.documentElement.scrollTop, document.body.scrollTop) > 0);
    onScroll();
    document.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => document.removeEventListener('scroll', onScroll, { capture: true });
  }, []);

  if (controller.isLoading || !controller.question) {
    return (
      <>
        <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
        <div className="wrap">
          <div className="stage">
            <div className="qc-card ex-loading-card">{t('exercise.loading')}</div>
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
  const canSubmit = question.type === 'CHOICE' ? controller.selected !== null : controller.fillInBlankInput !== '';

  return (
    <>
      <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
      <div className={controller.feedbackOpen ? 'wrap sheet-open' : 'wrap'}>
        <div className="topbar">
          <AppBrand variant="topbar" />
          <div className="topbar-r">
            <button
              type="button"
              className="ex-tool-btn danger"
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

        <div className={scrolled ? 'prog-area scrolled' : 'prog-area'}>
          <div data-tour="ex-progress">
            {/* one line: "Progress · Skill: x", then start → now, then the current value */}
            <div className="prog-row">
              <span className="prog-label">{t('exercise.progress')}</span>
              <span className="prog-skill" data-tour="ex-meta">{t('exercise.skill', { name: controller.skillsName })}</span>
              {answeredInSession && <span className="prog-frac">{startLabel} → {nowLabel}</span>}
              <div className="prog-spacer"></div>
              <span className="prog-pct">{nowLabel}</span>
            </div>
            <div className="prog-track"><div className="prog-fill" style={{ width: `${pct}%` }}></div></div>
          </div>
        </div>

        <div className="stage">
          <QuestionCard
            key={question.exerciseId}
            index={controller.questionIndex}
            total={controller.questionLimit}
            skillName={controller.skillsName}
            level={question.skillLevel}
            type={question.type}
            description={question.description}
            code={question.code}
            language={question.language}
            choices={(question.choices || []).map((c) => ({ key: c.id, script: c.script }))}
            selectedKey={controller.selected}
            onPick={controller.pick}
            fillValue={controller.fillInBlankInput}
            onFillChange={controller.setFillInBlankInput}
            locked={controller.locked}
            reveal={revealed ? { key: revealed.choiceId, isCorrect: revealed.isCorrect } : null}
            tourAttrs={{ question: 'ex-question', answer: 'ex-answer' }}
            footer={
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
            }
          />
        </div>
      </div>

      <AnswerSheet
        feedback={controller.feedback}
        open={controller.feedbackOpen}
        onNext={controller.next}
      />

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

      <SessionSummary
        open={controller.sessionEnded}
        stopReason={controller.stopReason}
        summary={controller.summary}
        skillId={controller.skillId}
        skillsName={controller.skillsName}
        correctCount={controller.correctCount}
        questionLimit={controller.questionLimit}
        progressStart={controller.progressStart}
        progress={controller.progress}
        onHome={controller.goHome}
        onSkillTree={controller.goToSkillTree}
        onStartSkill={controller.startSkill}
        onPractiseAgain={controller.practiseAgain}
      />
    </>
  );
}

// Every navigation to /exercise (from Home, or "practise again" / "next skill" on the summary) is a new
// session: keying on location.key remounts the screen, so no state from the finished one carries over.
export default function Exercise() {
  const location = useLocation();
  return <ExerciseScreen key={location.key} />;
}
