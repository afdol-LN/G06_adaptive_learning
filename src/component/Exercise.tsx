import React from 'react';
import './decorate/Exercise.css';
import { useExerciseController } from './exercise/controller/useExerciseController';
import CodeBlock from './common/CodeBlock';
import AppLogo from './common/AppLogo';
import { FaChartLine } from 'react-icons/fa6';
import { usePreferences } from '../context/PreferencesContext';
import { displayProgressPercent, formatProgressLabel } from './home/utils/skillTree';

export default function Exercise() {
  const controller = useExerciseController();
  const { t } = usePreferences();
  const notStarted = t('skill.notStarted');

  if (controller.isLoading || !controller.question) {
    return (
      <>
        <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
        <div className="wrap">
          <div className="stage">
            <div className="qcard">กำลังโหลดคำถาม...</div>
          </div>
        </div>
      </>
    );
  }

  // Same number and "not started" rule as the skill-tree node (adt-learning/docs/adr/0001)
  const pct = displayProgressPercent(controller.progress);
  const answeredInSession = controller.progress.attemptCount > controller.progressStart.attemptCount;
  const startLabel = formatProgressLabel(controller.progressStart, notStarted);
  const nowLabel = formatProgressLabel(controller.progress, notStarted);

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
            <span className="sess-chip">ข้อ {controller.questionIndex + 1}</span>
          </div>
        </div>

        <div className="prog-area">
          <div className="prog-row">
            <span className="prog-label">{t('exercise.progress')}</span>
            {answeredInSession && <span className="prog-frac">{startLabel} → {nowLabel}</span>}
            <div className="prog-spacer"></div>
            <span className="prog-pct">{nowLabel}</span>
          </div>
          <div className="prog-track"><div className="prog-fill" style={{ width: `${pct}%` }}></div></div>
          <div className="prog-meta">
            <span className="prog-exid">Exercise ID: {controller.question.exerciseId}</span>
            <span className="prog-skill">Skill: {controller.skillsName}</span>
          </div>
        </div>

        <div className="stage">
          <div className="qcard" key={controller.question.exerciseId}>
            <div className="card-ribbon"></div>
            <div className="card-body">
              <div className="q-question">{controller.question.description}</div>

              <CodeBlock
                code={controller.question.code}
                language={controller.question.language}
              />

              {controller.question.type === 'CHOICE' ? (
                <div className="choices">
                  {(controller.question.choices || []).map((choice) => (
                    <div
                      key={choice.id}
                      className={controller.selected === choice.id ? 'opt sel' : 'opt'}
                      onClick={() => controller.pick(choice.id)}
                    >
                      <div className="opt-text">{choice.script}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <input
                  className="fill-blank-input"
                  value={controller.fillInBlankInput}
                  onChange={(e) => controller.setFillInBlankInput(e.target.value)}
                  disabled={controller.responded}
                  placeholder="พิมพ์คำตอบ..."
                />
              )}
            </div>

            <div className="card-foot">
              <button
                className="btn-next"
                onClick={controller.submit}
                disabled={
                  controller.responded ||
                  (controller.question.type === 'CHOICE' ? controller.selected === null : controller.fillInBlankInput === '')
                }
              >
                <span>ส่งคำตอบ</span><span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flash ${controller.responded ? 'in' : 'out'}`} style={{ color: controller.lastCorrect ? 'var(--green)' : 'var(--red)' }}>
        {controller.lastCorrect === true ? '✓' : controller.lastCorrect === false ? '✗' : ''}
      </div>

      <div className={`overlay ${controller.sessionEnded ? 'open' : ''}`}>
        <div className="popup">
          <div className="ph">
            <span className="ph-trophy">{controller.summary?.pLAfter !== undefined && controller.summary.pLAfter >= 0.95 ? '🏆' : '📝'}</span>
            <div className="ph-title">Session เสร็จแล้ว!</div>
            <div className="score-pills">
              <div className="spill sp-cor"><span>✓</span><span>{controller.correctCount} ถูก</span></div>
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
            <button className="btn-home" onClick={controller.goHome}><span>🏠</span><span>กลับ Home</span></button>
            {controller.summary?.nextRecommendation && (
              <button className="btn-sess" onClick={controller.goHome}>
                <span>▶</span><span>ถัดไป: {controller.summary.nextRecommendation.skillsName}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
