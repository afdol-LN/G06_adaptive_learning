/**
 * @file skillService.js
 * @description Service Layer สำหรับดึงและคำนวณข้อมูลทักษะ (Skill Tree & Progression)
 */
import { SKILLS, GOALS, getSkillTreeForGoal, getSkillLevel, getSkillElo } from '../data/mockData';
import { SkillModel } from '../models/skill.model';

export class SkillService {
  /**
   * ดึงรายการ Goals ทั้งหมด
   * @returns {Array}
   */
  static getAllGoals() {
    return GOALS;
  }

  /**
   * ค้นหา Goal ตาม ID
   * @param {string} goalId
   * @returns {Object | null}
   */
  static getGoalById(goalId) {
    return GOALS.find(g => g.id === goalId) || null;
  }

  /**
   * ดึง Skills ทั้งหมดในระบบ
   * @returns {Array}
   */
  static getAllSkills() {
    return SKILLS;
  }

  /**
   * ดึงรายการ Skills ตามเป้าหมาย (Goal ID)
   * @param {string} goalId
   * @returns {Array}
   */
  static getSkillsForGoal(goalId) {
    if (!goalId) return SKILLS;
    return getSkillTreeForGoal(goalId);
  }

  /**
   * คำนวณความคืบหน้าของ Skills และสถานะการปลดล็อก (Unlocked / Locked) ตาม Branch ที่เลือก
   * @param {string} goalId
   * @param {string[]} unlockedSkillIds
   * @returns {Array}
   */
  static getEnrichedSkills(goalId, unlockedSkillIds = []) {
    const skills = SkillService.getSkillsForGoal(goalId);
    return skills.map(skill => {
      const isUnlocked = SkillModel.isSkillUnlocked(skill, unlockedSkillIds);
      const elo = getSkillElo(skill);
      const level = getSkillLevel(skill);
      return {
        ...skill,
        isUnlocked,
        elo,
        level,
      };
    });
  }
}
