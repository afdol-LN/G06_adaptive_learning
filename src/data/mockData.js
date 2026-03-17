// ─── AUTO-GENERATED FROM PSU_ALS_Master_Data.xlsx ───
// Skills: 44  |  Goals: 8  |  Prereq relations: 74

// ── GOALS ────────────────────────────────────────────────────────
export const GOALS = [
  { id: 'G01', name: 'Software Dev Intern',  group: 'Career',      icon: '💻', desc: 'พัฒนาแอปและระบบซอฟต์แวร์',           skillCount: 13 },
  { id: 'G02', name: 'Data Analyst Intern',  group: 'Career',      icon: '📊', desc: 'วิเคราะห์ข้อมูลด้วย Python & Pandas', skillCount: 11 },
  { id: 'G06', name: 'Intro Programming',    group: 'Academic',    icon: '🚀', desc: 'พื้นฐานการเขียนโปรแกรม Python',       skillCount: 9  },
  { id: 'G07', name: 'Data Structures',      group: 'Academic',    icon: '🧱', desc: 'โครงสร้างข้อมูลและอัลกอริทึม',         skillCount: 10 },
  { id: 'G10', name: 'Contest (ICPC)',        group: 'Competitive', icon: '🏆', desc: 'เตรียมสอบแข่งขัน ICPC',               skillCount: 10 },
  { id: 'G11', name: 'Freelance Python',     group: 'Competitive', icon: '💼', desc: 'Python สำหรับงาน Freelance',           skillCount: 10 },
  { id: 'G12', name: 'Cybersecurity',        group: 'Specialized', icon: '🔐', desc: 'Python สำหรับ Security & Crypto',      skillCount: 8  },
  { id: 'G15', name: 'Portfolio Project',    group: 'Specialized', icon: '🎨', desc: 'สร้าง Portfolio ด้วย Python',          skillCount: 8  },
];

// ── SKILLS ───────────────────────────────────────────────────────
// requires[] = รายการ skillId ที่ต้องผ่านก่อน
export const SKILLS = [
  { id: 'SK-001', name: 'Computer & Python Fundamentals', icon: '🐍', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: [] },
  { id: 'SK-002', name: 'Basic Input / Output',           icon: '⌨️', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: [] },
  { id: 'SK-003', name: 'Variables & Data Types',         icon: '📦', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: ['SK-001','SK-002'] },
  { id: 'SK-004', name: 'Operators & Expressions',        icon: '➕', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: ['SK-003'] },
  { id: 'SK-005', name: 'String Operations',              icon: '🔤', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: ['SK-003'] },
  { id: 'SK-006', name: 'Control Flow — Conditional',     icon: '🔀', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: ['SK-004'] },
  { id: 'SK-007', name: 'Control Flow — Loops',           icon: '🔁', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0, requires: ['SK-004','SK-006'] },
  { id: 'SK-008', name: 'List',                           icon: '📋', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-003','SK-007'] },
  { id: 'SK-009', name: 'Tuple',                          icon: '🔗', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: [] },
  { id: 'SK-010', name: 'Dictionary',                     icon: '📖', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-003','SK-007'] },
  { id: 'SK-011', name: 'Set',                            icon: '🎯', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: [] },
  { id: 'SK-012', name: 'Functions — Basic',              icon: '🔧', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-006','SK-007'] },
  { id: 'SK-013', name: 'Scope & Namespace',              icon: '🏷️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-012'] },
  { id: 'SK-014', name: 'Recursion',                      icon: '♻️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-012','SK-013'] },
  { id: 'SK-015', name: 'Lambda & HOF',                   icon: '🌀', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-008','SK-012'] },
  { id: 'SK-016', name: 'Modules & Packages',             icon: '📦', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-012'] },
  { id: 'SK-017', name: 'File I/O',                       icon: '📁', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-005','SK-012'] },
  { id: 'SK-018', name: 'Exception Handling',             icon: '⚠️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0, requires: ['SK-006','SK-012'] },
  { id: 'SK-019', name: 'OOP — Class & Object',           icon: '🏗️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-010','SK-012'] },
  { id: 'SK-020', name: 'OOP — Encapsulation',            icon: '🔒', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-019'] },
  { id: 'SK-021', name: 'OOP — Inheritance',              icon: '🧬', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-019','SK-020'] },
  { id: 'SK-022', name: 'OOP — Polymorphism & Abstract',  icon: '🎭', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: [] },
  { id: 'SK-023', name: 'Magic Methods (Dunder)',          icon: '✨', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: [] },
  { id: 'SK-024', name: 'Comprehensions & Generators',    icon: '⚙️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-007','SK-008','SK-015'] },
  { id: 'SK-025', name: 'Decorators',                     icon: '🎀', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: [] },
  { id: 'SK-026', name: 'Regular Expressions',            icon: '🔍', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-005','SK-016'] },
  { id: 'SK-027', name: 'Iterators & Protocols',          icon: '🔄', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: [] },
  { id: 'SK-028', name: 'Type Hints & Documentation',     icon: '📝', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-012','SK-019'] },
  { id: 'SK-029', name: 'Sorting Algorithms',             icon: '📊', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-008','SK-014'] },
  { id: 'SK-030', name: 'Searching Algorithms',           icon: '🔎', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-007','SK-008'] },
  { id: 'SK-031', name: 'Complexity Analysis (Big-O)',    icon: '📐', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-014','SK-029','SK-030'] },
  { id: 'SK-032', name: 'Stack & Queue',                  icon: '🥞', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-008','SK-019'] },
  { id: 'SK-033', name: 'Linked List',                    icon: '⛓️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-019','SK-032'] },
  { id: 'SK-034', name: 'Tree & BST',                     icon: '🌳', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0, requires: ['SK-014','SK-033'] },
  { id: 'SK-035', name: 'Graph (BFS/DFS)',                icon: '🕸️', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-010','SK-032','SK-034'] },
  { id: 'SK-036', name: 'Dynamic Programming',            icon: '⚡', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-008','SK-014','SK-031'] },
  { id: 'SK-037', name: 'NumPy',                          icon: '🔢', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-008','SK-015','SK-031'] },
  { id: 'SK-038', name: 'Pandas',                         icon: '🐼', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-010','SK-017','SK-037'] },
  { id: 'SK-039', name: 'Data Visualization',             icon: '📈', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-037','SK-038'] },
  { id: 'SK-042', name: 'HTTP & API Concepts',            icon: '🌐', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-010','SK-016'] },
  { id: 'SK-044', name: 'Testing (unittest/pytest)',      icon: '🧪', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-012','SK-018','SK-019'] },
  { id: 'SK-045', name: 'Socket & Network Programming',  icon: '🔌', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-016','SK-018','SK-042'] },
  { id: 'SK-046', name: 'Cryptography & Security Basics',icon: '🔐', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-026','SK-045'] },
  { id: 'SK-047', name: 'OS Interaction & Automation',   icon: '🤖', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0, requires: ['SK-016','SK-017'] },
];

// ── GOAL → SKILLS map ────────────────────────────────────────────
// goalId → [{ skillId, minLevel }]
export const GOAL_SKILLS = {
  'G01': [
    { skillId: 'SK-003', minLevel: 'D3' }, { skillId: 'SK-004', minLevel: 'D3' },
    { skillId: 'SK-006', minLevel: 'D3' }, { skillId: 'SK-007', minLevel: 'D3' },
    { skillId: 'SK-008', minLevel: 'D3' }, { skillId: 'SK-010', minLevel: 'D2' },
    { skillId: 'SK-012', minLevel: 'D3' }, { skillId: 'SK-013', minLevel: 'D2' },
    { skillId: 'SK-016', minLevel: 'D2' }, { skillId: 'SK-017', minLevel: 'D2' },
    { skillId: 'SK-018', minLevel: 'D2' }, { skillId: 'SK-019', minLevel: 'D2' },
    { skillId: 'SK-020', minLevel: 'D2' },
  ],
  'G02': [
    { skillId: 'SK-003', minLevel: 'D3' }, { skillId: 'SK-005', minLevel: 'D2' },
    { skillId: 'SK-007', minLevel: 'D3' }, { skillId: 'SK-008', minLevel: 'D3' },
    { skillId: 'SK-010', minLevel: 'D3' }, { skillId: 'SK-012', minLevel: 'D3' },
    { skillId: 'SK-017', minLevel: 'D3' }, { skillId: 'SK-026', minLevel: 'D2' },
    { skillId: 'SK-037', minLevel: 'D2' }, { skillId: 'SK-038', minLevel: 'D3' },
    { skillId: 'SK-039', minLevel: 'D2' },
  ],
  'G06': [
    { skillId: 'SK-001', minLevel: 'D2' }, { skillId: 'SK-002', minLevel: 'D2' },
    { skillId: 'SK-003', minLevel: 'D2' }, { skillId: 'SK-004', minLevel: 'D2' },
    { skillId: 'SK-005', minLevel: 'D2' }, { skillId: 'SK-006', minLevel: 'D2' },
    { skillId: 'SK-007', minLevel: 'D2' }, { skillId: 'SK-008', minLevel: 'D2' },
    { skillId: 'SK-012', minLevel: 'D2' },
  ],
  'G07': [
    { skillId: 'SK-007', minLevel: 'D3' }, { skillId: 'SK-008', minLevel: 'D3' },
    { skillId: 'SK-014', minLevel: 'D2' }, { skillId: 'SK-019', minLevel: 'D2' },
    { skillId: 'SK-029', minLevel: 'D3' }, { skillId: 'SK-030', minLevel: 'D3' },
    { skillId: 'SK-031', minLevel: 'D2' }, { skillId: 'SK-032', minLevel: 'D3' },
    { skillId: 'SK-033', minLevel: 'D2' }, { skillId: 'SK-034', minLevel: 'D2' },
  ],
  'G10': [
    { skillId: 'SK-008', minLevel: 'D4' }, { skillId: 'SK-010', minLevel: 'D3' },
    { skillId: 'SK-014', minLevel: 'D4' }, { skillId: 'SK-029', minLevel: 'D4' },
    { skillId: 'SK-030', minLevel: 'D4' }, { skillId: 'SK-031', minLevel: 'D4' },
    { skillId: 'SK-032', minLevel: 'D3' }, { skillId: 'SK-034', minLevel: 'D3' },
    { skillId: 'SK-035', minLevel: 'D3' }, { skillId: 'SK-036', minLevel: 'D3' },
  ],
  'G11': [
    { skillId: 'SK-012', minLevel: 'D3' }, { skillId: 'SK-016', minLevel: 'D3' },
    { skillId: 'SK-017', minLevel: 'D3' }, { skillId: 'SK-018', minLevel: 'D3' },
    { skillId: 'SK-019', minLevel: 'D3' }, { skillId: 'SK-020', minLevel: 'D2' },
    { skillId: 'SK-026', minLevel: 'D2' }, { skillId: 'SK-028', minLevel: 'D3' },
    { skillId: 'SK-042', minLevel: 'D3' }, { skillId: 'SK-047', minLevel: 'D2' },
  ],
  'G12': [
    { skillId: 'SK-012', minLevel: 'D3' }, { skillId: 'SK-016', minLevel: 'D3' },
    { skillId: 'SK-017', minLevel: 'D3' }, { skillId: 'SK-018', minLevel: 'D3' },
    { skillId: 'SK-026', minLevel: 'D3' }, { skillId: 'SK-045', minLevel: 'D2' },
    { skillId: 'SK-046', minLevel: 'D2' }, { skillId: 'SK-047', minLevel: 'D2' },
  ],
  'G15': [
    { skillId: 'SK-012', minLevel: 'D3' }, { skillId: 'SK-016', minLevel: 'D3' },
    { skillId: 'SK-019', minLevel: 'D3' }, { skillId: 'SK-020', minLevel: 'D3' },
    { skillId: 'SK-021', minLevel: 'D2' }, { skillId: 'SK-024', minLevel: 'D2' },
    { skillId: 'SK-028', minLevel: 'D3' }, { skillId: 'SK-044', minLevel: 'D2' },
  ],
};

// ── PREREQ flat list ─────────────────────────────────────────────
export const PREREQS = [
  { skillId: 'SK-003', prereqId: 'SK-001', minLevel: 'D1' },
  { skillId: 'SK-003', prereqId: 'SK-002', minLevel: 'D1' },
  { skillId: 'SK-004', prereqId: 'SK-003', minLevel: 'D1' },
  { skillId: 'SK-005', prereqId: 'SK-003', minLevel: 'D2' },
  { skillId: 'SK-006', prereqId: 'SK-004', minLevel: 'D2' },
  { skillId: 'SK-007', prereqId: 'SK-004', minLevel: 'D2' },
  { skillId: 'SK-007', prereqId: 'SK-006', minLevel: 'D1' },
  { skillId: 'SK-008', prereqId: 'SK-003', minLevel: 'D2' },
  { skillId: 'SK-008', prereqId: 'SK-007', minLevel: 'D2' },
  { skillId: 'SK-010', prereqId: 'SK-003', minLevel: 'D2' },
  { skillId: 'SK-010', prereqId: 'SK-007', minLevel: 'D2' },
  { skillId: 'SK-012', prereqId: 'SK-006', minLevel: 'D2' },
  { skillId: 'SK-012', prereqId: 'SK-007', minLevel: 'D2' },
  { skillId: 'SK-013', prereqId: 'SK-012', minLevel: 'D2' },
  { skillId: 'SK-014', prereqId: 'SK-012', minLevel: 'D3' },
  { skillId: 'SK-014', prereqId: 'SK-013', minLevel: 'D2' },
  { skillId: 'SK-015', prereqId: 'SK-008', minLevel: 'D2' },
  { skillId: 'SK-015', prereqId: 'SK-012', minLevel: 'D3' },
  { skillId: 'SK-016', prereqId: 'SK-012', minLevel: 'D2' },
  { skillId: 'SK-017', prereqId: 'SK-005', minLevel: 'D2' },
  { skillId: 'SK-017', prereqId: 'SK-012', minLevel: 'D2' },
  { skillId: 'SK-018', prereqId: 'SK-006', minLevel: 'D2' },
  { skillId: 'SK-018', prereqId: 'SK-012', minLevel: 'D2' },
  { skillId: 'SK-019', prereqId: 'SK-010', minLevel: 'D2' },
  { skillId: 'SK-019', prereqId: 'SK-012', minLevel: 'D3' },
  { skillId: 'SK-020', prereqId: 'SK-019', minLevel: 'D2' },
  { skillId: 'SK-021', prereqId: 'SK-019', minLevel: 'D3' },
  { skillId: 'SK-021', prereqId: 'SK-020', minLevel: 'D2' },
  { skillId: 'SK-024', prereqId: 'SK-007', minLevel: 'D3' },
  { skillId: 'SK-024', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-024', prereqId: 'SK-015', minLevel: 'D2' },
  { skillId: 'SK-026', prereqId: 'SK-005', minLevel: 'D3' },
  { skillId: 'SK-026', prereqId: 'SK-016', minLevel: 'D2' },
  { skillId: 'SK-028', prereqId: 'SK-012', minLevel: 'D3' },
  { skillId: 'SK-028', prereqId: 'SK-019', minLevel: 'D2' },
  { skillId: 'SK-029', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-029', prereqId: 'SK-014', minLevel: 'D2' },
  { skillId: 'SK-030', prereqId: 'SK-007', minLevel: 'D3' },
  { skillId: 'SK-030', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-031', prereqId: 'SK-014', minLevel: 'D2' },
  { skillId: 'SK-031', prereqId: 'SK-029', minLevel: 'D2' },
  { skillId: 'SK-031', prereqId: 'SK-030', minLevel: 'D2' },
  { skillId: 'SK-032', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-032', prereqId: 'SK-019', minLevel: 'D2' },
  { skillId: 'SK-033', prereqId: 'SK-019', minLevel: 'D3' },
  { skillId: 'SK-033', prereqId: 'SK-032', minLevel: 'D2' },
  { skillId: 'SK-034', prereqId: 'SK-014', minLevel: 'D3' },
  { skillId: 'SK-034', prereqId: 'SK-033', minLevel: 'D2' },
  { skillId: 'SK-035', prereqId: 'SK-010', minLevel: 'D3' },
  { skillId: 'SK-035', prereqId: 'SK-032', minLevel: 'D3' },
  { skillId: 'SK-035', prereqId: 'SK-034', minLevel: 'D2' },
  { skillId: 'SK-036', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-036', prereqId: 'SK-014', minLevel: 'D3' },
  { skillId: 'SK-036', prereqId: 'SK-031', minLevel: 'D3' },
  { skillId: 'SK-037', prereqId: 'SK-008', minLevel: 'D3' },
  { skillId: 'SK-037', prereqId: 'SK-015', minLevel: 'D2' },
  { skillId: 'SK-037', prereqId: 'SK-031', minLevel: 'D2' },
  { skillId: 'SK-038', prereqId: 'SK-010', minLevel: 'D3' },
  { skillId: 'SK-038', prereqId: 'SK-017', minLevel: 'D2' },
  { skillId: 'SK-038', prereqId: 'SK-037', minLevel: 'D2' },
  { skillId: 'SK-039', prereqId: 'SK-037', minLevel: 'D2' },
  { skillId: 'SK-039', prereqId: 'SK-038', minLevel: 'D2' },
  { skillId: 'SK-042', prereqId: 'SK-010', minLevel: 'D3' },
  { skillId: 'SK-042', prereqId: 'SK-016', minLevel: 'D2' },
  { skillId: 'SK-044', prereqId: 'SK-012', minLevel: 'D3' },
  { skillId: 'SK-044', prereqId: 'SK-018', minLevel: 'D3' },
  { skillId: 'SK-044', prereqId: 'SK-019', minLevel: 'D2' },
  { skillId: 'SK-045', prereqId: 'SK-016', minLevel: 'D3' },
  { skillId: 'SK-045', prereqId: 'SK-018', minLevel: 'D3' },
  { skillId: 'SK-045', prereqId: 'SK-042', minLevel: 'D2' },
  { skillId: 'SK-046', prereqId: 'SK-026', minLevel: 'D2' },
  { skillId: 'SK-046', prereqId: 'SK-045', minLevel: 'D2' },
  { skillId: 'SK-047', prereqId: 'SK-016', minLevel: 'D3' },
  { skillId: 'SK-047', prereqId: 'SK-017', minLevel: 'D3' },
];

// ── Helpers ──────────────────────────────────────────────────────

// คืน skills ทั้งหมดที่ goal นั้นต้องการ (รวม ancestors)
export function getSkillTreeForGoal(goalId) {
  const goalSkillIds = new Set((GOAL_SKILLS[goalId] || []).map(e => e.skillId));
  const needed = new Set(goalSkillIds);
  let changed = true;
  while (changed) {
    changed = false;
    PREREQS.forEach(p => {
      if (needed.has(p.skillId) && !needed.has(p.prereqId)) {
        needed.add(p.prereqId);
        changed = true;
      }
    });
  }
  return SKILLS.filter(s => needed.has(s.id));
}

// skillId ที่ goal นั้น require (ไม่รวม ancestor)
export function getGoalSkillIds(goalId) {
  return new Set((GOAL_SKILLS[goalId] || []).map(e => e.skillId));
}

export const TIER_ORDER = { T1: 0, T2: 1, T3: 2, T4: 3 };