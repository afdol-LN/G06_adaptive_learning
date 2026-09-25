import type { ReactNode } from 'react';
import {
  FaArrowRotateRight,
  FaBoxOpen,
  FaChartLine,
  FaCheck,
  FaCircleCheck,
  FaClipboardCheck,
  FaFlagCheckered,
  FaHouse,
  FaPlay,
  FaTrophy,
} from 'react-icons/fa6';
import { usePreferences } from '../../../context/PreferencesContext';
import type { RecommendedSkill, SessionSummary as Summary, SubmitAnswerResponse } from '../../../models/sessionModel';
import type { SkillProgress } from '../../../models/branchSkillModel';
import { displayProgressPercent, formatProgressLabel } from '../../home/utils/skillTree';
import { ANIMATIONS } from '../../../utils/animations';

type StopReason = NonNullable<SubmitAnswerResponse['stopReason']>;

interface SessionSummaryProps {
  open: boolean;
  /** the session reviewed a skill already at 100% — P(L) stayed frozen (adt-learning/docs/adr/0007) */
  reviewing: boolean;
  stopReason: SubmitAnswerResponse['stopReason'];
  summary: Summary | null;
  skillId: number | null;
  skillsName: string;
  correctCount: number;
  questionLimit: number | null;
  progressStart: SkillProgress;
  progress: SkillProgress;
  onHome: () => void;
  onSkillTree: () => void;
  onStartSkill: (skill: RecommendedSkill) => void;
  onPractiseAgain: () => void;
}

// 2 decimals, like every other Progress number (never computed from pL here — both sides come from the backend)
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * End-of-session popup. The backend ends a session for one of three reasons (session.service.ts,
 * checked in this order) and each one tells the student something different:
 *  - mastered:  Progress reached 100% — celebrate, move on
 *  - completed: all questions of the round answered, not at 100% yet — encourage, practise again
 *  - exhausted: the skill ran out of unanswered questions — not the student's fault, practise again or move on
 */
export default function SessionSummary({
  open,
  reviewing,
  stopReason,
  summary,
  skillId,
  skillsName,
  correctCount,
  questionLimit,
  progressStart,
  progress,
  onHome,
  onSkillTree,
  onStartSkill,
  onPractiseAgain,
}: SessionSummaryProps) {
  const { t } = usePreferences();
  const reason: StopReason = stopReason ?? 'completed';
  const notStarted = t('skill.notStarted');

  const before = displayProgressPercent(progressStart);
  const after = displayProgressPercent(progress);
  const gained = round2(after - before);

  // recommendNextSkill can hand back the skill just practised — then "next" would only repeat it
  const next = summary?.nextRecommendation && summary.nextRecommendation.skillId !== skillId
    ? summary.nextRecommendation
    : null;
  const goalDone = summary?.goalCompleted ?? null;

  let icon: ReactNode;
  let title: string;
  let sub: string;
  if (reviewing) {
    // a review never ends as 'mastered' (the backend skips that check) and never moves Progress
    icon = <span className="ph-trophy ph-trophy--done"><FaCircleCheck aria-hidden /></span>;
    title = reason === 'exhausted'
      ? t('exercise.end.review.exhaustedTitle', { name: skillsName })
      : t('exercise.end.review.title', { count: questionLimit ?? correctCount });
    sub = t('exercise.end.review.sub');
  } else if (reason === 'mastered') {
    icon = (
      <>
        {/* mounted when the session ends, so the animation plays from the start */}
        {open && (
          <iframe
            className="ph-trophy-anim"
            src={ANIMATIONS.trophy}
            title="trophy animation"
            aria-hidden
            tabIndex={-1}
            sandbox="allow-scripts allow-same-origin"
          />
        )}
        {/* "reduce motion" users get the static trophy instead (switched in CSS) */}
        <span className="ph-trophy ph-trophy-fallback"><FaTrophy aria-hidden /></span>
      </>
    );
    title = t('exercise.end.mastered.title', { name: skillsName });
    sub = t('exercise.end.mastered.sub');
  } else if (reason === 'exhausted') {
    icon = <span className="ph-trophy ph-trophy--muted"><FaBoxOpen aria-hidden /></span>;
    title = t('exercise.end.exhausted.title', { name: skillsName });
    sub = t('exercise.end.exhausted.sub');
  } else {
    icon = <span className="ph-trophy"><FaClipboardCheck aria-hidden /></span>;
    title = t('exercise.end.completed.title', { count: questionLimit ?? correctCount });
    sub = gained > 0
      ? t('exercise.end.completed.subUp', { delta: gained, remain: round2(100 - after) })
      : t('exercise.end.completed.subFlat');
  }

  const homeBtn = (
    <button className="btn-home" onClick={onHome}>
      <FaHouse aria-hidden />
      <span>{t('exercise.done.home')}</span>
    </button>
  );
  const againBtn = (primary: boolean) => (
    <button className={primary ? 'btn-sess' : 'btn-home'} onClick={onPractiseAgain}>
      <FaArrowRotateRight aria-hidden />
      <span>{t('exercise.end.again')}</span>
    </button>
  );
  const nextBtn = next && (
    <button className="btn-sess" onClick={() => onStartSkill(next)}>
      <FaPlay aria-hidden />
      <span>{t('exercise.done.next', { name: next.skillsName })}</span>
    </button>
  );

  let actions: ReactNode;
  if (goalDone) {
    actions = (
      <>
        {homeBtn}
        <button className="btn-sess" onClick={onSkillTree}>
          <FaFlagCheckered aria-hidden />
          <span>{t('exercise.goalDone.cta')}</span>
        </button>
      </>
    );
  } else if (reason === 'mastered') {
    actions = <>{homeBtn}{nextBtn}</>;
  } else if (reason === 'exhausted' || reviewing) {
    // practising again is the fallback when there is nowhere else to go
    actions = <>{homeBtn}{againBtn(!next)}{nextBtn}</>;
  } else {
    actions = <>{homeBtn}{againBtn(true)}</>;
  }

  return (
    <div className={`overlay ${open ? 'open' : ''}`}>
      {/* full-screen fireworks only for a real win; mounted on open so it plays from the start */}
      {open && reason === 'mastered' && (
        <div className="session-end-layer" aria-hidden>
          <iframe
            className="session-end-anim"
            src={ANIMATIONS.sessionEnd}
            title="session complete animation"
            tabIndex={-1}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      )}
      <div className={`popup sum-${reason}`} role="dialog" aria-modal="true" aria-labelledby="sum-title">
        <div className="ph">
          {icon}
          <div className="ph-title" id="sum-title">{title}</div>
          <div className="ph-sub">{sub}</div>
          <div className="score-pills">
            <div className="spill sp-cor">
              <FaCheck aria-hidden />
              <span>{t('exercise.done.correct', { count: correctCount })}</span>
            </div>
            {reviewing ? (
              <div className="spill sp-cor">
                <FaCircleCheck aria-hidden />
                <span>{t('skill.mastered')}</span>
              </div>
            ) : (
              <div className="spill sp-ps">
                <FaChartLine aria-hidden />
                {/* session start → end; summary.pLBefore is only "before the last answer" */}
                <span>
                  {t('exercise.progress')}: {formatProgressLabel(progressStart, notStarted)} → {formatProgressLabel(progress, notStarted)}
                </span>
              </div>
            )}
          </div>
          {/* This answer completed the branch's goal (adt-learning/docs/adr/0005) */}
          {goalDone && (
            <div className="ph-goal" role="status">
              <FaFlagCheckered aria-hidden />
              <span>{t('exercise.goalDone.title', { name: goalDone.goalName })}</span>
            </div>
          )}
        </div>
        <div className="pf">{actions}</div>
      </div>
    </div>
  );
}
