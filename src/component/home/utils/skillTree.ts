import { BranchSkill, GoalNode, SkillProgress } from "../../../models/branchSkillModel";
import { drawnPrerequisiteEdgeKeys } from "../../../utils/prerequisiteEdges";
import {
  NODE_H,
  NODE_W,
  layoutGoalPosition,
  layoutTreePositions,
  treeEndIds,
  type TreeLayoutInput,
} from "../../../utils/skillTreeLayout";

// the layout itself lives in utils/skillTreeLayout — the admin goal workspace draws the same tree
export { NODE_W, NODE_H };

export interface LayoutSkill extends BranchSkill {
  x: number;
  y: number;
}

export interface LayoutGoalNode extends GoalNode {
  x: number;
  y: number;
  /** the skills whose edges run into the goal node — the ends of the tree, see treeEndSkillIds */
  fromSkillIds: number[];
}

const toLayoutInput = (skills: BranchSkill[]): TreeLayoutInput[] =>
  skills.map((s) => ({ id: s.skillId, prerequisiteIds: (s.skillPrequisite || []).map((p) => p.prerequisiteSkillId) }));

// Ends of the tree: skills that no other skill in this tree lists as a prerequisite
export function treeEndSkillIds(skills: BranchSkill[]): number[] {
  return treeEndIds(toLayoutInput(skills));
}

// Prerequisite edges worth drawing (A→C hidden when A→B→C already shows it) — see utils/prerequisiteEdges.
// Key = `${prerequisiteId}-${skillId}`
export function drawnPrerequisiteEdges(skills: BranchSkill[]): Set<string> {
  return drawnPrerequisiteEdgeKeys(toLayoutInput(skills));
}

// The skill tree above stays exactly as it is; the goal node hangs one row below the deepest skill,
// joined only to the ends of the tree and centred under them (adt-learning/docs/adr/0005)
export function layoutGoalNode(goal: GoalNode | null, skills: LayoutSkill[]): LayoutGoalNode | null {
  if (!goal) return null;
  const positions = new Map(skills.map((s) => [s.skillId, { x: s.x, y: s.y }]));
  const placed = layoutGoalPosition(toLayoutInput(skills), positions);
  if (!placed) return null;
  return { ...goal, fromSkillIds: placed.fromIds, x: placed.x, y: placed.y };
}

// "13 Sep 2026" / "13 ก.ย. 2569" — the day the goal was first completed (adt-learning/docs/adr/0005)
export function formatGoalCompletedOn(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

export function layoutSkills(skills: BranchSkill[]): LayoutSkill[] {
  const positions = layoutTreePositions(toLayoutInput(skills));
  return skills.map(s => ({
    ...s,
    x: positions.get(s.skillId)?.x ?? 0,
    y: positions.get(s.skillId)?.y ?? 0,
  }));
}

export function computeUnlockedSkills(skills: BranchSkill[]): Set<number> {
  const unlocked = new Set<number>();
  const progressMap = new Map(skills.map(s => [s.skillId, s.progressPercent]));

  skills.forEach(skill => {
    const reqs = skill.skillPrequisite || [];
    if (reqs.length === 0) {
      unlocked.add(skill.skillId);
    } else {
      const allPassed = reqs.every(req => {
        const parentProgress = progressMap.get(req.prerequisiteSkillId) || 0;
        return parentProgress === 100;
      });
      if (allPassed) {
        unlocked.add(skill.skillId);
      }
    }
  });

  return unlocked;
}

export function canUnlockSkill(skillId: number, skills: BranchSkill[], unlockedSkills: Set<number>): boolean {
  if (unlockedSkills.has(skillId)) return true;
  const node = skills.find(s => s.skillId === skillId);
  if (!node) return false;

  const reqs = node.skillPrequisite || [];
  if (reqs.length === 0) return true;

  const progressMap = new Map(skills.map(s => [s.skillId, s.progressPercent]));
  return reqs.every(req => {
    const parentProgress = progressMap.get(req.prerequisiteSkillId) || 0;
    return parentProgress === 100;
  });
}

// สีคืนค่าเป็น CSS variable (ประกาศใน Home.css พร้อมค่าของธีมมืด)
// ใช้ได้ผ่าน style={{ ... }} เท่านั้น — var() ใช้ไม่ได้ใน presentation attribute ของ SVG
export function getProgressColor(p: number): string {
  if (p === 100) return 'var(--prog-100)';
  if (p >= 75) return 'var(--prog-75)';
  if (p >= 20) return 'var(--prog-20)';
  if (p > 0) return 'var(--prog-1)';
  return 'var(--prog-0)';
}

type NodeState = 'done' | 'open' | 'ready' | 'locked';
const nodePalette = (state: NodeState) => ({
  bg: `var(--node-${state}-bg)`,
  border: `var(--node-${state}-border)`,
  text: `var(--node-${state}-text)`,
  bar: `var(--node-${state}-bar)`,
});

export function getNodeColors(isUnlocked: boolean, canUnlockThis: boolean, progress: number) {
  if (progress === 100) return nodePalette('done');
  if (isUnlocked) return nodePalette('open');
  if (canUnlockThis) return nodePalette('ready');
  return nodePalette('locked');
}

// The goal node is a target, not a practisable skill: "open" colours with a dashed border until complete
export function getGoalNodeColors(isComplete: boolean) {
  return nodePalette(isComplete ? 'done' : 'open');
}

// ใช้ร่วมกันทั้ง skill tree และหน้า Exercise — ทุกหน้าต้องได้ตัวเลขเดียวกัน
export function displayProgressPercent(skill: SkillProgress): number {
  return skill.attemptCount > 0 ? skill.progressPercent : 0;
}

// 100% = P(L) ≥ 0.95 (never rounded up, adt-learning/docs/adr/0004) — the same test the backend uses
// to put a session into review mode, where P(L) stays frozen (adt-learning/docs/adr/0007).
// Such a skill shows "completed" instead of a percentage and a bar.
export function isMastered(skill: SkillProgress): boolean {
  return displayProgressPercent(skill) === 100;
}

// จำนวนข้อที่ตอบแล้วในแบบร่างของทักษะนี้ — 0 = ไม่มีแบบร่างให้ทำต่อ (adt-learning/docs/adr/0003)
export function getDraftCount(skill: { draftAnsweredCount?: number }): number {
  return skill.draftAnsweredCount ?? 0;
}

// notStartedLabel มาจาก t("skill.notStarted") ของ component ที่เรียก
export function formatProgressLabel(skill: SkillProgress, notStartedLabel: string): string {
  return skill.attemptCount > 0 ? `${skill.progressPercent}%` : notStartedLabel;
}
