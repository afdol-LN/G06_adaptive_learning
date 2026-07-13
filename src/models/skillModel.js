// ─── models/skillModel.js ──────────────────────────────────────────────────
// รวม constants ที่เกี่ยวกับ Skill ทั้งหมดไว้ที่เดียว (DRY)
// ใช้ใน: InformationView, CreateBranchModal, HomeView, ProfileTabView
// ─────────────────────────────────────────────────────────────────────────────

// ── ระดับประสบการณ์ของผู้ใช้ (เคยซ้ำในทั้ง InformationForm และ CreateBranchModal) ──
export const EXP_DATA = {
  1: {
    level: 'Level 1 — Novice',
    title: 'มือใหม่หัดเขียนโค้ด',
    desc: 'เพิ่งเริ่มต้นศึกษาการเขียนโปรแกรม อาจเคยเห็นโค้ดบ้างแต่ยังไม่มีประสบการณ์จริง',
    badges: ['ยังไม่มีประสบการณ์', 'เรียนครั้งแรก'],
    color: '#e05c5c',
  },
  2: {
    level: 'Level 2 — Beginner',
    title: 'เริ่มต้นเขียนโปรแกรม',
    desc: 'เคยเรียน Python เบื้องต้นมาบ้าง รู้จัก variable, loop, if-else แต่ยังไม่มั่นใจในการเขียนฟังก์ชัน',
    badges: ['Variables', 'Loops', 'Conditions'],
    color: '#e8a03c',
  },
  3: {
    level: 'Level 3 — Intermediate',
    title: 'เขียนโปรแกรมได้บ้าง',
    desc: 'เขียน Python ได้คล่องพอสมควร เข้าใจ OOP, function, list/dict และเคยทำโปรเจกต์ขนาดเล็กมาแล้ว',
    badges: ['OOP', 'Functions', 'Data Structures'],
    color: '#0047AB',
  },
  4: {
    level: 'Level 4 — Advanced',
    title: 'เขียนโปรแกรมได้ดี',
    desc: 'มีประสบการณ์การเขียน Python อย่างจริงจัง เข้าใจ algorithms, complexity และทำงานกับ library ต่างๆ ได้',
    badges: ['Algorithms', 'Libraries', 'Complexity'],
    color: '#82C8E5',
  },
  5: {
    level: 'Level 5 — Expert',
    title: 'เชี่ยวชาญการเขียนโปรแกรม',
    desc: 'เขียน Python ขั้นสูงได้อย่างคล่องแคล่ว มีประสบการณ์ real-world, open source หรือทำงานมาแล้ว',
    badges: ['Advanced Python', 'Real-world', 'Professional'],
    color: '#38b874',
  },
};

// ── หมวดหมู่ของ Goal (เคยซ้ำในทั้ง InformationForm และ CreateBranchModal) ──
export const GROUP_LABELS = {
  Career:      'Career',
  Academic:    'Academic',
  Competitive: 'Competitive',
  Specialized: 'Specialized',
};

// ── Tier metadata ──────────────────────────────────────────────────────────
export const TIER_META = {
  T1: { label: 'Foundation',  color: '#059669', bgColor: '#ecfdf5' },
  T2: { label: 'Core',        color: '#2563eb', bgColor: '#eff6ff' },
  T3: { label: 'Advanced',    color: '#7c3aed', bgColor: '#f5f3ff' },
  T4: { label: 'Specialized', color: '#dc2626', bgColor: '#fef2f2' },
};

// ── ประเภทพฤติกรรมการเรียนรู้ ──────────────────────────────────────────────
export const BEHAVIOR_META = {
  mastery:   { label: 'Mastery',   emoji: '', color: '#0047AB', bg: '#e8f0fe', border: '#93c5fd', desc: 'เชี่ยวชาญและสม่ำเสมอ — คุณเรียนรู้ได้ครบและแม่นยำมาก' },
  fast:      { label: 'Fast',      emoji: '', color: '#059669', bg: '#ecfdf5', border: '#6ee7b7', desc: 'ตอบเร็วและแม่นยำ — แต่ควรทบทวน skill เก่าเพิ่มเติม' },
  steady:    { label: 'Steady',    emoji: '', color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', desc: 'สม่ำเสมอและมั่นคง — เพิ่มความเร็วและทบทวนให้มากขึ้น' },
  slow:      { label: 'Slow',      emoji: '', color: '#d97706', bg: '#fffbeb', border: '#fde68a', desc: 'เข้าใจดีแต่ใช้เวลานาน — ฝึกทำโจทย์ให้เร็วขึ้น' },
  struggler: { label: 'Struggler', emoji: '', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', desc: 'ยังต้องฝึกเพิ่ม — ลองทบทวนพื้นฐานและทำ session บ่อยขึ้น' },
};

// ── Label สำหรับ Behavior Dimension ──────────────────────────────────────────
export const DIM_LABELS = {
  time:     { label: 'Time Score',     icon: '' },
  streak:   { label: 'Correct Score',  icon: '' },
  momentum: { label: 'Momentum Score', icon: '' },
};

// ── ELO range per level ──────────────────────────────────────────────────────
export const ELO_RANGES = {
  0: { min: 1200, max: 1299 },
  1: { min: 1200, max: 1349 },
  2: { min: 1350, max: 1499 },
  3: { min: 1500, max: 1699 },
  4: { min: 1700, max: 1899 },
  5: { min: 1900, max: 2100 },
};

// ── Helper: แปลง progress → level ────────────────────────────────────────────
export function getSkillLevel(skill) {
  if (skill.progress >= 90) return 5;
  if (skill.progress >= 70) return 4;
  if (skill.progress >= 50) return 3;
  if (skill.progress >= 30) return 2;
  if (skill.progress > 0)  return 1;
  return 0;
}

// ── Helper: แปลง progress → ELO ──────────────────────────────────────────────
export function getSkillElo(skill) {
  const lvl = getSkillLevel(skill);
  const range = ELO_RANGES[lvl];
  if (!range) return 1200;
  const within = (skill.progress % 20) / 20;
  return Math.round(range.min + within * (range.max - range.min));
}

// ── Helper: progress → color ──────────────────────────────────────────────────
export function getProgressColor(p) {
  if (p === 100) return '#0047AB';
  if (p >= 60)   return '#3b82f6';
  if (p >= 20)   return '#60a5fa';
  if (p > 0)     return '#93c5fd';
  return '#cbd5e1';
}

// ── Helper: ประเมิน node colors ──────────────────────────────────────────────
export function getNodeColors(isUnlocked, canUnlockThis, progress) {
  if (progress === 100) return { bg: '#ecfdf5', border: '#10b981', text: '#047857', bar: '#f0fdf4' };
  if (isUnlocked)       return { bg: '#ffffff', border: '#0047AB', text: '#0047AB', bar: '#f0f4ff' };
  if (canUnlockThis)    return { bg: '#f0f9ff', border: '#60a5fa', text: '#1d4ed8', bar: '#e0f2fe' };
  return                       { bg: '#f8fafc', border: '#cbd5e1', text: '#94a3b8', bar: '#f1f5f9' };
}

// ── Grade label helper ────────────────────────────────────────────────────────
export const gradeLabel = (g) =>
  g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง';
