import { GoalWorkspace, WorkspaceSkill } from "../../../../../models/goalModel";

/** ตรงกับ MAX_GENERATE_COUNT ใน aiDraft.service.ts ฝั่ง backend */
export const MAX_GENERATE_COUNT = 20;

/** จำนวนข้อที่ให้ AI ร่าง = ที่ยังขาด (หักร่างที่ค้างแล้ว) อย่างน้อย 1 */
export function missingDraftCount(workspace: GoalWorkspace, skill: WorkspaceSkill): number {
  const missing =
    workspace.minExercisesPerSkill - skill.activeExerciseCount - skill.pendingDraftCount;
  return Math.min(MAX_GENERATE_COUNT, Math.max(missing, 1));
}
