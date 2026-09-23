import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import type { TKey } from "../../../i18n";

export type BehaviorClass = 'mastery' | 'fast' | 'steady' | 'slow' | 'struggler';
export type BehaviorDim = 'time' | 'streak' | 'momentum';

// สีอ้าง token --beh-* ใน Home.css (มีค่าแยกของธีมมืด) ส่วนข้อความอยู่ใน i18n
export const BEHAVIOR_META: Record<BehaviorClass, { color: string; labelKey: TKey; descKey: TKey }> = {
  mastery:   { color: 'var(--beh-mastery)',   labelKey: 'behavior.mastery',   descKey: 'behavior.mastery.desc' },
  fast:      { color: 'var(--beh-fast)',      labelKey: 'behavior.fast',      descKey: 'behavior.fast.desc' },
  steady:    { color: 'var(--beh-steady)',    labelKey: 'behavior.steady',    descKey: 'behavior.steady.desc' },
  slow:      { color: 'var(--beh-slow)',      labelKey: 'behavior.slow',      descKey: 'behavior.slow.desc' },
  struggler: { color: 'var(--beh-struggler)', labelKey: 'behavior.struggler', descKey: 'behavior.struggler.desc' },
};

export const DIM_LABEL_KEYS: Record<BehaviorDim, TKey> = {
  time: 'profile.dim.time',
  streak: 'profile.dim.streak',
  momentum: 'profile.dim.momentum',
};

export interface BehaviorResult {
  dims: Record<BehaviorDim, number>;
  cls: BehaviorClass;
  score: number;
  avgTime: number;
}

export function computeBehavior(sessions: SessionHistoryItem[]): BehaviorResult {
  if (sessions.length === 0) {
    return { dims: { time: 0, streak: 0, momentum: 0 }, cls: 'struggler', score: 0, avgTime: 0 };
  }

  let totalQuestions = 0;
  let totalSessionTime = 0;
  let sumTimeScore = 0;
  let sumStreakScore = 0;
  let sumMomentumScore = 0;

  sessions.forEach(s => {
    let c = 0, w = 0, exp = 0, act = 0;
    s.questions.forEach(q => {
      if (q.isCorrect) c++; else w++;

      const start = q.startTime ? new Date(q.startTime).getTime() : 0;
      const end = q.endTime ? new Date(q.endTime).getTime() : 0;
      const timeSpent = (start && end) ? Math.round((end - start) / 1000) : 15;

      act += timeSpent || 15;
      exp += 15; // default expected time per exercise question
      totalQuestions++;
    });
    totalSessionTime += act;

    const ratio = act > 0 ? (exp / act) : 1;
    const tScore = (Math.max(0.5, Math.min(ratio, 2.0)) - 0.5) / 1.5;
    const sScore = (c + w) > 0 ? (c / (c + w)) : 0;
    const mScore = Math.max(0, Math.min((c - w + 5) / 10, 1.0));

    sumTimeScore += tScore;
    sumStreakScore += sScore;
    sumMomentumScore += mScore;
  });

  const avgTime = totalQuestions > 0 ? totalSessionTime / totalQuestions : 0;
  const tFinal = sumTimeScore / sessions.length;
  const sFinal = sumStreakScore / sessions.length;
  const mFinal = sumMomentumScore / sessions.length;

  const score = Math.round((tFinal * 0.50 + sFinal * 0.30 + mFinal * 0.20) * 100);
  const dims = {
    time: Math.round(tFinal * 100),
    streak: Math.round(sFinal * 100),
    momentum: Math.round(mFinal * 100),
  };

  let cls: BehaviorClass = 'struggler';
  if (score >= 80) cls = 'mastery';
  else if (score >= 60) {
    if (dims.time - dims.streak >= 15) cls = 'fast';
    else if (dims.streak - dims.time >= 15) cls = 'slow';
    else cls = 'steady';
  }
  else if (score >= 40) cls = 'slow';

  return { dims, cls, score, avgTime: Math.round(avgTime) };
}
