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
