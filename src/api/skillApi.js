// ─── api/skillApi.js ────────────────────────────────────────────────────────
// Service functions สำหรับ Skill Tree และ Sessions
// อิงข้อมูลจาก: models/mockData
// ─────────────────────────────────────────────────────────────────────────────
import {
  SKILLS,
  GOAL_SKILLS,
  getSkillLevel,
  getSkillElo,
  computeSkillProgress,
} from '../models/mockData';

/**
 * ดึง skill tree สำหรับ goalId ที่กำหนด
 * @param {string} goalId
 * @returns {Promise<Skill[]>}
 */
export async function getSkillTree(goalId) {
  // TODO: เปลี่ยนเป็น API call จริง: GET /api/skills?goalId=G07
  const goalSkillIds = new Set(
    (GOAL_SKILLS[goalId] || []).map(g => g.skillId)
  );

  // ถ้า goalId มีใน GOAL_SKILLS ให้ filter, ถ้าไม่มีคืนทั้งหมด
  const skills = goalSkillIds.size > 0
    ? SKILLS.filter(s => goalSkillIds.has(s.id))
    : SKILLS;

  return skills;
}

/**
 * ดึง session history ของ branch
 * @param {string} branchId
 * @returns {Promise<Session[]>}
 */
export async function getSessionHistory(branchId) {
  // TODO: เปลี่ยนเป็น API call จริง: GET /api/sessions?branchId=xxx
  try {
    const branches = JSON.parse(localStorage.getItem('branches')) || [];
    const branch   = branches.find(b => b.id === branchId);
    return branch?.sessions || [];
  } catch {
    return [];
  }
}

/**
 * บันทึก session ใหม่หลังทำ Exercise เสร็จ
 * @param {string} branchId
 * @param {object} sessionData - { skillId, title, questions, score, grade }
 * @returns {Promise<{ success: boolean }>}
 */
export async function saveSession(branchId, sessionData) {
  // TODO: เปลี่ยนเป็น API call จริง: POST /api/sessions
  try {
    const branches = JSON.parse(localStorage.getItem('branches')) || [];
    const updated  = branches.map(b => {
      if (b.id !== branchId) return b;
      const newSession = {
        id:   (b.sessions?.length || 0) + 1,
        date: new Date().toLocaleDateString('th-TH'),
        ...sessionData,
      };
      return { ...b, sessions: [...(b.sessions || []), newSession] };
    });
    localStorage.setItem('branches', JSON.stringify(updated));
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * คำนวณ enriched skills (progress + level + elo) จาก sessions
 * @param {Skill[]} rawSkills
 * @param {Session[]} sessions
 * @returns {EnrichedSkill[]}
 */
export function enrichSkills(rawSkills, sessions) {
  const sessionProg = computeSkillProgress(sessions);
  return rawSkills.map(s => {
    const progress = sessionProg[s.id] ?? s.progress;
    return {
      ...s,
      progress,
      level: getSkillLevel({ ...s, progress }),
      elo:   getSkillElo({ ...s, progress }),
    };
  });
}

/**
 * ดึง questions สำหรับ skill ที่กำหนด
 * @param {string} skillId
 * @returns {Promise<Question[]>}
 */
export async function getQuestionsForSkill(skillId) {
  // TODO: เปลี่ยนเป็น API call จริง: GET /api/questions?skillId=SK-008
  return [];
}
