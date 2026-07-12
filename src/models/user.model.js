/**
 * @file user.model.js
 * @description Domain Models สำหรับข้อมูลผู้ใช้และสาขาวิชา/เป้าหมายการเรียนรู้ (UserProfile & Branch)
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} fname - ชื่อจริง
 * @property {string} lname - นามสกุล
 * @property {string} gender - เพศ
 * @property {string} dob - วันเกิด
 * @property {string} username - ชื่อผู้ใช้
 */

/**
 * @typedef {Object} Branch
 * @property {string} id - รหัสสาขาวิชา/โปรไฟล์การเรียนรู้ที่ไม่ซ้ำกัน
 * @property {string} campus - วิทยาเขต
 * @property {string} faculty - คณะ
 * @property {string} major - สาขาวิชา
 * @property {string} year - ชั้นปี
 * @property {string} goalId - รหัสเป้าหมายการเรียนรู้
 * @property {string} goalName - ชื่อเป้าหมาย
 * @property {string} goalIcon - ไอคอนเป้าหมาย
 * @property {number} exp - ค่าประสบการณ์เริ่มต้น/เป้าหมาย
 * @property {number} xp - ประสบการณ์สะสมในปัจจุบัน
 * @property {number} level - ระดับเลเวลปัจจุบัน
 * @property {number} streak - จำนวนวันสะสมต่อเนื่อง
 * @property {string[]} unlockedSkills - รายการ ID ของทักษะที่ปลดล็อกแล้ว
 * @property {Array<Object>} sessions - รายการประวัติการทำโจทย์/แบบทดสอบ
 * @property {string} createdAt - วันและเวลาที่สร้าง Branch (ISO format)
 */

export class UserModel {
  /**
   * สร้างออบเจ็กต์ UserProfile ที่ถูกตรวจสอบและจัดรูปแบบแล้ว
   * @param {Partial<UserProfile>} data
   * @returns {UserProfile}
   */
  static createUserProfile(data = {}) {
    return {
      fname: data.fname || '',
      lname: data.lname || '',
      gender: data.gender || '',
      dob: data.dob || '',
      username: data.username || '',
    };
  }

  /**
   * สร้างออบเจ็กต์ Branch ใหม่พร้อมกำหนดค่าเริ่มต้นที่ถูกต้อง
   * @param {Partial<Branch>} data
   * @returns {Branch}
   */
  static createBranch(data = {}) {
    return {
      id: data.id || `branch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      campus: data.campus || '',
      faculty: data.faculty || '',
      major: data.major || '',
      year: data.year || '',
      goalId: data.goalId || '',
      goalName: data.goalName || '',
      goalIcon: data.goalIcon || '🎯',
      exp: Number(data.exp || 0),
      xp: Number(data.xp || 0),
      level: Number(data.level || 1),
      streak: Number(data.streak || 0),
      unlockedSkills: Array.isArray(data.unlockedSkills) ? data.unlockedSkills : [],
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      createdAt: data.createdAt || new Date().toISOString(),
    };
  }

  /**
   * คำนวณความคืบหน้า (Percentage) ของเลเวลและ XP
   * @param {number} xp
   * @param {number} level
   * @returns {{ levelProgress: number, nextLevelXp: number }}
   */
  static calculateLevelProgress(xp, level) {
    const nextLevelXp = level * 100;
    const currentLevelBaseXp = (level - 1) * 100;
    const xpInLevel = Math.max(0, xp - currentLevelBaseXp);
    const levelProgress = Math.min(100, Math.round((xpInLevel / 100) * 100));
    return { levelProgress, nextLevelXp };
  }


  static 
}
