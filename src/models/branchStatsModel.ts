export interface BranchStats {
  skillsUnlockedCount: number;
  sessionsCount: number;
  dayStreak: number;
  /** Goal progress — the same numbers the goal node shows (adt-learning/docs/adr/0005) */
  goalProgressPercent: number;
  goalMasteredCount: number;
  goalRequiredCount: number;
  goalComplete: boolean;
}


export interface BranchBaseState{
  skillId: number;
  skillsName: string;
  totalPercent: number;
  /** ประสบการณ์ที่กรอก (expForGoal) เทียบกับ tier ของ skill */
  basePercent: number;
  /** ความถูกต้องและความเร็วในข้อ pretest ของ skill นี้ */
  pretestPercent: number;
  /** สาขาเกี่ยวกับคอมพิวเตอร์ / ชั้นปี 2 ขึ้นไป */
  profilePercent: number;
  /** ส่วนที่ถูกตัดเพราะชนเพดาน pL0 (0 ถ้าไม่ชน) */
  capPercent: number;
  correct: number;
  answered: number;
}
