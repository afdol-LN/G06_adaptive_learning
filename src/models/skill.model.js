/**
 * @file skill.model.js
 * @description Domain Model สำหรับทักษะการเรียนรู้ (SkillNode, Prerequisite & Tier Calculation)
 */

/**
 * @typedef {Object} SkillNode
 * @property {string} id - รหัส Skill (เช่น SK-001)
 * @property {string} name - ชื่อทักษะ
 * @property {string} icon - ไอคอนทักษะ
 * @property {string} tier - รหัสระดับ Tier (T1-T4)
 * @property {string} tierLabel - ชื่อป้าย Tier
 * @property {string} tierColor - สีประจำ Tier
 * @property {number} progress - เปอร์เซ็นต์ความคืบหน้า (0-100)
 * @property {string[]} requires - รายการ ID ของ Skill ที่ต้องผ่านก่อน
 */

export class SkillModel {
  /**
   * สร้างและตรวจสอบความสมบูรณ์ของข้อมูล SkillNode
   * @param {Partial<SkillNode>} data
   * @returns {SkillNode}
   */
  static createSkillNode(data = {}) {
    return {
      id: data.id || '',
      name: data.name || '',
      icon: data.icon || '📘',
      tier: data.tier || 'T1',
      tierLabel: data.tierLabel || 'TIER 0 — Foundation',
      tierColor: data.tierColor || '#6366f1',
      progress: Number(data.progress || 0),
      requires: Array.isArray(data.requires) ? data.requires : [],
    };
  }

  /**
   * ตรวจสอบว่า Skill นี้ถูกปลดล็อก (Unlocked) หรือยังตามรายการ Skill ที่ปลดล็อกแล้ว
   * @param {SkillNode} skill
   * @param {string[]} unlockedSkillIds
   * @returns {boolean}
   */
  static isSkillUnlocked(skill, unlockedSkillIds = []) {
    if (!skill.requires || skill.requires.length === 0) return true;
    const unlockedSet = new Set(unlockedSkillIds);
    return skill.requires.every(reqId => unlockedSet.has(reqId));
  }

  /**
   * ลำดับของ Tier สำหรับการเรียงลำดับ
   */
  static TIER_ORDER = {
    T1: 0,
    T2: 1,
    T3: 2,
    T4: 3,
  };

  /**
   * คืนค่า Tier Order Index
   * @param {string} tier
   * @returns {number}
   */
  static getTierIndex(tier) {
    return SkillModel.TIER_ORDER[tier] ?? 99;
  }
}
