import { BranchSkill, SkillProgress } from "../../../models/branchSkillModel";

export const NODE_W = 260;
export const NODE_H = 120;

export interface LayoutSkill extends BranchSkill {
  x: number;
  y: number;
}

export function layoutSkills(skills: BranchSkill[]): LayoutSkill[] {
  const byId = Object.fromEntries(skills.map(s => [s.skillId, s]));

  const depth: Record<number, number> = {};
  const visiting = new Set<number>();
  function getDepth(id: number): number {
    if (depth[id] !== undefined) return depth[id];
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const node = byId[id];
    if (!node) { visiting.delete(id); return depth[id] = 0; }
    const reqs = node.skillPrequisite || [];
    if (reqs.length === 0) { visiting.delete(id); return depth[id] = 0; }
    const d = 1 + Math.max(...reqs.map(r => byId[r.prerequisiteSkillId] ? getDepth(r.prerequisiteSkillId) : 0));
    visiting.delete(id);
    return depth[id] = d;
  }
  skills.forEach(s => getDepth(s.skillId));

  const layers: Record<number, number[]> = {};
  skills.forEach(s => {
    const d = depth[s.skillId];
    (layers[d] = layers[d] || []).push(s.skillId);
  });

  const positions: Record<number, { x: number; y: number }> = {};
  const sortedLayerKeys = Object.keys(layers).map(Number).sort((a, b) => a - b);

  sortedLayerKeys.forEach(d => {
    const ids = layers[d];
    if (d > 0) {
      ids.sort((a, b) => {
        const avgX = (id: number) => {
          const parents = (byId[id]?.skillPrequisite || []).filter(r => positions[r.prerequisiteSkillId]);
          if (!parents.length) return 0;
          return parents.reduce((s, r) => s + positions[r.prerequisiteSkillId].x, 0) / parents.length;
        };
        return avgX(a) - avgX(b);
      });
    }
    const total = ids.length * NODE_W + (ids.length - 1) * 70;
    const startX = -total / 2 + NODE_W / 2;
    ids.forEach((id, i) => {
      positions[id] = {
        x: startX + i * (NODE_W + 50),
        y: d * (NODE_H + 130),
      };
    });
  });

  return skills.map(s => ({
    ...s,
    x: positions[s.skillId]?.x ?? 0,
    y: positions[s.skillId]?.y ?? 0,
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

// ใช้ร่วมกันทั้ง skill tree และหน้า Exercise — ทุกหน้าต้องได้ตัวเลขเดียวกัน
export function displayProgressPercent(skill: SkillProgress): number {
  return skill.attemptCount > 0 ? skill.progressPercent : 0;
}

// notStartedLabel มาจาก t("skill.notStarted") ของ component ที่เรียก
export function formatProgressLabel(skill: SkillProgress, notStartedLabel: string): string {
  return skill.attemptCount > 0 ? `${skill.progressPercent}%` : notStartedLabel;
}
