import { SessionHistoryItem, SessionQuestionHistory } from "../../../models/sessionHistoryModel";
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

/** มิตินิสัยการเรียน — แสดงบน radar เท่านั้น ไม่นับในคะแนนพฤติกรรม */
export type HabitDim = 'consistency' | 'growth';

export const HABIT_LABEL_KEYS: Record<HabitDim, TKey> = {
  consistency: 'profile.dim.consistency',
  growth: 'profile.dim.growth',
};

/** ชื่อแกนแบบสั้นบน radar */
export const RADAR_LABEL_KEYS: Record<BehaviorDim | HabitDim, TKey> = {
  time: 'profile.radar.time',
  streak: 'profile.radar.streak',
  momentum: 'profile.radar.momentum',
  consistency: 'profile.radar.consistency',
  growth: 'profile.radar.growth',
};

/** ความสม่ำเสมอ = จำนวนวันที่เข้ามาฝึกในช่วงนี้ ÷ จำนวนวัน */
export const CONSISTENCY_WINDOW_DAYS = 14;

const localDayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/**
 * consistency — % ของ 14 วันล่าสุด (รวมวันนี้) ที่มีการเริ่ม session อย่างน้อย 1 ครั้ง
 *   = จำนวนวัน (ตามปฏิทินเครื่องผู้ใช้) ที่มี session ÷ 14 × 100
 * growth — % ของ session ฝึกที่ Progress เพิ่มขึ้น
 *   = จำนวน session ที่ progressAfter > progressBefore ÷ จำนวน session ที่นับได้ × 100
 *   ไม่นับ: pretest, session ที่ไม่มี progressBefore/After, และการทบทวน (progressBefore ≥ 100)
 *   ไม่มี session ที่นับได้เลย → 0
 */
export function computeHabits(sessions: SessionHistoryItem[], now = new Date()): Record<HabitDim, number> {
  const windowStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (CONSISTENCY_WINDOW_DAYS - 1));
  const activeDays = new Set<string>();
  let eligible = 0;
  let improved = 0;

  sessions.forEach(s => {
    const started = new Date(s.startTime);
    if (!Number.isNaN(started.getTime()) && started >= windowStart && started <= now) {
      activeDays.add(localDayKey(started));
    }

    const before = s.progressBefore;
    const after = s.progressAfter;
    if (s.isPretest || before == null || after == null || before >= 100) return;
    eligible++;
    if (after > before) improved++;
  });

  return {
    consistency: Math.round((activeDays.size / CONSISTENCY_WINDOW_DAYS) * 100),
    growth: eligible > 0 ? Math.round((improved / eligible) * 100) : 0,
  };
}

export interface BehaviorResult {
  dims: Record<BehaviorDim, number>;
  cls: BehaviorClass;
  score: number;
  avgTime: number;
}

// เวลาที่คาดเมื่อข้อนั้นไม่มี expectTime — ค่าเดียวกับ default ตอนสร้างโจทย์ (draft.validator.ts)
const DEFAULT_EXPECT_SEC = 60;
// เพดานเวลาต่อข้อ กันข้อที่เปิดค้างไว้ดึงค่าเฉลี่ยทั้งหมด — เท่ากับรายงาน PDF
const MAX_ANSWER_SEC = 600;
// ตอบผิดได้คะแนนเวลาไม่เกินนี้ ไม่ให้รางวัลกับการเดาเร็ว ๆ
const WRONG_TIME_CAP = 0.7;

/** วินาทีที่ใช้ตอบข้อนี้ (ตัดเพดานแล้ว) หรือ null ถ้าไม่มีเวลาบันทึก */
function answerSeconds(q: SessionQuestionHistory): number | null {
  const start = q.startTime ? new Date(q.startTime).getTime() : NaN;
  const end = q.endTime ? new Date(q.endTime).getTime() : NaN;
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null;
  return Math.min((end - start) / 1000, MAX_ANSWER_SEC);
}

/**
 * คะแนนเวลา 0–1 ของข้อเดียว จาก r = เวลาที่คาด ÷ เวลาจริง
 * r ≤ 0.25 → 0, r = 1 (ทันเวลาพอดี) → 0.7, r ≥ 1.5 → 1 — เส้นตรงระหว่างจุด
 */
function questionTimeScore(r: number): number {
  if (r <= 0.25) return 0;
  if (r < 1) return ((r - 0.25) / 0.75) * 0.7;
  if (r < 1.5) return 0.7 + ((r - 1) / 0.5) * 0.3;
  return 1;
}

/**
 * คะแนนพฤติกรรมการเรียน (การ์ดพฤติกรรมในหน้า Profile)
 *
 * มิติ (แต่ละมิติ 0–100):
 *   time     = ค่าเฉลี่ยของ questionTimeScore ทุกข้อที่มีเวลาบันทึก
 *              ต่อข้อ: r = expectTime ÷ min(เวลาจริง, 600 วิ)  (ไม่มี expectTime → ใช้ 60 วิ)
 *              ตอบผิดได้ไม่เกิน 0.7
 *   streak   = ค่าเฉลี่ยราย session ของ (ข้อถูก ÷ ข้อทั้งหมด)  — ชื่อ key เดิม แต่คือ "ความถูกต้อง"
 *   momentum = ค่าเฉลี่ยราย session ของ clamp((ถูก − ผิด + 5) ÷ 10, 0, 1)
 *              ถูกมากกว่าผิด ≥ 5 ข้อ → 1, เท่ากัน → 0.5, ผิดมากกว่าถูก ≥ 5 ข้อ → 0
 *
 * score = time × 0.5 + streak × 0.3 + momentum × 0.2  (×100, ปัดเศษ)
 *
 * กลุ่มผู้เรียน (cls):
 *   score ≥ 80            → mastery
 *   60 ≤ score < 80       → fast   ถ้า time − streak ≥ 15
 *                           slow   ถ้า streak − time ≥ 15
 *                           steady ถ้าต่างกันไม่ถึง 15
 *   40 ≤ score < 60       → slow
 *   score < 40            → struggler
 *
 * avgTime = เวลาเฉลี่ยต่อข้อ (วินาที) ของข้อที่มีเวลาบันทึก หลังตัดเพดาน 600 วิ
 * consistency / growth อยู่ใน computeHabits — ไม่นับใน score
 */
export function computeBehavior(sessions: SessionHistoryItem[]): BehaviorResult {
  if (sessions.length === 0) {
    return { dims: { time: 0, streak: 0, momentum: 0 }, cls: 'struggler', score: 0, avgTime: 0 };
  }

  let timedQuestions = 0;
  let totalAnswerTime = 0;
  let sumTimeScore = 0;
  let sumStreakScore = 0;
  let sumMomentumScore = 0;

  sessions.forEach(s => {
    let c = 0, w = 0;
    s.questions.forEach(q => {
      if (q.isCorrect) c++; else w++;

      // ข้อที่ไม่มีเวลาบันทึกไม่นับในคะแนนเวลา (ไม่ใช่เดาว่าใช้ 15 วินาที)
      const actual = answerSeconds(q);
      if (actual === null) return;
      const expected = q.expectTime && q.expectTime > 0 ? q.expectTime : DEFAULT_EXPECT_SEC;
      const score = questionTimeScore(expected / Math.max(actual, 1));
      sumTimeScore += q.isCorrect ? score : Math.min(score, WRONG_TIME_CAP);
      totalAnswerTime += actual;
      timedQuestions++;
    });

    // ความถูกต้องของ session นี้ = ถูก ÷ ทั้งหมด
    const sScore = (c + w) > 0 ? (c / (c + w)) : 0;
    // ความต่อเนื่อง = (ถูก − ผิด + 5) ÷ 10 จำกัดในช่วง 0–1
    const mScore = Math.max(0, Math.min((c - w + 5) / 10, 1.0));

    sumStreakScore += sScore;
    sumMomentumScore += mScore;
  });

  // คะแนนเวลาเฉลี่ยทุกข้อ (ไม่ใช่ราย session) — session 2 ข้อไม่มีน้ำหนักเท่า session 20 ข้อ
  const avgTime = timedQuestions > 0 ? totalAnswerTime / timedQuestions : 0;
  const tFinal = timedQuestions > 0 ? sumTimeScore / timedQuestions : 0;
  const sFinal = sumStreakScore / sessions.length;
  const mFinal = sumMomentumScore / sessions.length;

  // ถ่วงน้ำหนัก: เวลา 50% · ความถูกต้อง 30% · ความต่อเนื่อง 20%
  const score = Math.round((tFinal * 0.50 + sFinal * 0.30 + mFinal * 0.20) * 100);
  const dims = {
    time: Math.round(tFinal * 100),
    streak: Math.round(sFinal * 100),
    momentum: Math.round(mFinal * 100),
  };

  // ช่วง 60–79 แยกตามว่าด้านเวลาหรือด้านความถูกต้องนำอีกด้านอยู่ ≥ 15 คะแนน
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
