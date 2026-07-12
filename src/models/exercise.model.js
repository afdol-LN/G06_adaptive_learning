/**
 * @file exercise.model.js
 * @description Domain Model สำหรับโจทย์คำถามและประวัติการทำแบบทดสอบ (Question, SessionRecord & PretestResult)
 */

/**
 * @typedef {Object} QuestionChoice
 * @property {string} id - ตัวเลือก (A, B, C, D)
 * @property {string} text - ข้อความตัวเลือก
 */

/**
 * @typedef {Object} Question
 * @property {string} id - รหัสข้อสอบ
 * @property {string} skillId - รหัส Skill ที่โจทย์นี้สังกัด
 * @property {string} prompt - โจทย์คำถาม
 * @property {QuestionChoice[]} choices - ตัวเลือกตอบ
 * @property {string} correctChoice - คำตอบที่ถูกต้อง (เช่น 'A')
 * @property {string} explanation - คำอธิบายเฉลย
 */

/**
 * @typedef {Object} SessionRecord
 * @property {string} id - รหัสรอบการทำโจทย์
 * @property {string} skillId - ทักษะที่ทำ
 * @property {number} score - คะแนนที่ได้
 * @property {number} total - จำนวนข้อทั้งหมด
 * @property {number} xpEarned - XP ที่ได้รับ
 * @property {string} completedAt - เวลาที่ทำเสร็จ (ISO String)
 */

export class ExerciseModel {
  /**
   * สร้างออบเจ็กต์ Question
   * @param {Partial<Question>} data
   * @returns {Question}
   */
  static createQuestion(data = {}) {
    return {
      id: data.id || `q_${Date.now()}`,
      skillId: data.skillId || 'SK-001',
      prompt: data.prompt || '',
      choices: Array.isArray(data.choices) ? data.choices : [],
      correctChoice: data.correctChoice || 'A',
      explanation: data.explanation || '',
    };
  }

  /**
   * สร้างออบเจ็กต์บันทึกผลการทำโจทย์
   * @param {Partial<SessionRecord>} data
   * @returns {SessionRecord}
   */
  static createSessionRecord(data = {}) {
    return {
      id: data.id || `session_${Date.now()}`,
      skillId: data.skillId || '',
      score: Number(data.score || 0),
      total: Number(data.total || 0),
      xpEarned: Number(data.xpEarned || 0),
      completedAt: data.completedAt || new Date().toISOString(),
    };
  }
}
