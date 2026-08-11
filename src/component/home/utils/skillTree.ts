import { BranchSkill } from "../../../models/branchSkillModel";

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

export function getProgressColor(p: number): string {
  if (p === 100) return '#0047AB';
  if (p >= 75) return '#3b82f6';
  if (p >= 20) return '#60a5fa';
  if (p > 0) return '#93c5fd';
  return '#cbd5e1';
}

export function getNodeColors(isUnlocked: boolean, canUnlockThis: boolean, progress: number) {
  if (progress === 100) return { bg: '#ecfdf5', border: '#10b981', text: '#047857', bar: '#f0fdf4' };
  if (isUnlocked) return { bg: '#ffffff', border: '#0047AB', text: '#0047AB', bar: '#f0f4ff' };
  if (canUnlockThis) return { bg: '#f0f9ff', border: '#60a5fa', text: '#1d4ed8', bar: '#e0f2fe' };
  return { bg: '#f8fafc', border: '#cbd5e1', text: '#94a3b8', bar: '#f1f5f9' };
}

export function displayProgressPercent(skill: BranchSkill): number {
  return skill.attemptCount > 0 ? skill.progressPercent : 0;
}

export function formatProgressLabel(skill: BranchSkill): string {
  return skill.attemptCount > 0 ? `${skill.progressPercent}%` : 'ยังไม่เริ่ม';
}
