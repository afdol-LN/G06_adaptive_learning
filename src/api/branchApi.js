// ─── api/branchApi.js ───────────────────────────────────────────────────────
// Service functions สำหรับ Branch (สายการเรียน)
// อิงข้อมูลจาก: models/branchModel, models/mockData
// ─────────────────────────────────────────────────────────────────────────────
import { GOALS } from '../models/mockData';

/**
 * ดึงรายการ branch ทั้งหมดของ user
 * @returns {Promise<Branch[]>}
 */
export async function getBranches() {
  try {
    const data = JSON.parse(localStorage.getItem('branches'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * สร้าง branch ใหม่และบันทึกลง localStorage
 * @param {object} branchData - { campus, faculty, major, year, goalId, goalName, goalIcon, exp }
 * @returns {Promise<{ success: boolean, branch?: object, id?: string }>}
 */
export async function createBranch(branchData) {
  const goal = GOALS.find(g => g.id === branchData.goalId);
  const newBranch = {
    id:             `branch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    xp:             0,
    level:          1,
    streak:         0,
    unlockedSkills: [],
    sessions:       [],
    createdAt:      new Date().toISOString(),
    goalName:       goal?.name   || branchData.goalName || '',
    goalIcon:       goal?.icon   || branchData.goalIcon || '🎯',
    goalDesc:       goal?.desc   || branchData.goalDesc || '',
    ...branchData,
  };

  const existing = await getBranches();
  const updated  = [...existing, newBranch];
  localStorage.setItem('branches', JSON.stringify(updated));

  return { success: true, branch: newBranch, id: newBranch.id };
}

/**
 * อัปเดต branch ที่มีอยู่ (xp, unlockedSkills, sessions ฯลฯ)
 * @param {string} branchId
 * @param {object} changes
 * @returns {Promise<{ success: boolean }>}
 */
export async function updateBranch(branchId, changes) {
  const existing = await getBranches();
  const updated  = existing.map(b =>
    b.id === branchId ? { ...b, ...changes } : b
  );
  localStorage.setItem('branches', JSON.stringify(updated));
  return { success: true };
}

/**
 * เปลี่ยน active branch
 * @param {string} branchId
 */
export function setActiveBranch(branchId) {
  localStorage.setItem('activeBranchId', branchId);
}

/**
 * ดึง active branch ID
 * @returns {string|null}
 */
export function getActiveBranchId() {
  return localStorage.getItem('activeBranchId') || null;
}

/**
 * ดึง goals ทั้งหมด
 * @returns {Promise<Goal[]>}
 */
export async function getGoals() {
  // TODO: เปลี่ยนเป็น API call จริง
  return GOALS;
}
