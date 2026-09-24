// GET /branch/:branchId/recommendation — ตรงกับ RecommendedSkillDto ของ backend
// frontend ใช้แค่ skillId ระบุโหนด; ห้ามเอา pL ไปแสดงหรือคำนวณเป็นตัวเลขให้นักศึกษา (ADR 0001)
export interface RecommendedSkill {
  skillId: number;
  skillCode: string;
  skillsName: string;
  tier: string;
  pL: number;
}
