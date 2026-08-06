import { SessionHistoryItem } from "../../../models/sessionHistoryModel";

export const BEHAVIOR_META = {
  mastery: { label: 'Mastery', color: '#0047AB', bg: '#e8f0fe', border: '#93c5fd', desc: 'เชี่ยวชาญและสม่ำเสมอ — คุณเรียนรู้ได้ครบและแม่นยำมาก' },
  fast: { label: 'Fast', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', desc: 'ตอบเร็วและแม่นยำ — แต่ควรทบทวน skill เก่าเพิ่มเติม' },
  steady: { label: 'Steady', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'สม่ำเสมอและมั่นคง — เพิ่มความเร็วและทบทวนให้มากขึ้น' },
  slow: { label: 'Slow', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'เข้าใจดีแต่ใช้เวลานาน — ฝึกทำโจทย์ให้เร็วขึ้น' },
  struggler: { label: 'Struggler', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'ยังต้องฝึกเพิ่ม — ลองทบทวนพื้นฐานและทำ session บ่อยขึ้น' },
};

export const DIM_LABELS = {
  time: { label: 'Time Score', icon: '' },
  streak: { label: 'Correct Score', icon: '' },
  momentum: { label: 'Momentum Score', icon: '' },
};

export interface BehaviorResult {
  dims: {
    time: number;
    streak: number;
    momentum: number;
  };
  cls: keyof typeof BEHAVIOR_META;
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

  let cls: keyof typeof BEHAVIOR_META = 'struggler';
  if (score >= 80) cls = 'mastery';
  else if (score >= 60) {
    if (dims.time - dims.streak >= 15) cls = 'fast';
    else if (dims.streak - dims.time >= 15) cls = 'slow';
    else cls = 'steady';
  }
  else if (score >= 40) cls = 'slow';

  return { dims, cls, score, avgTime: Math.round(avgTime) };
}
