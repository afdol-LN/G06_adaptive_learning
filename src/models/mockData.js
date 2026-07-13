// ─── models/mockData.js ────────────────────────────────────────────────────
// รวม mock data ทั้งหมดไว้ที่เดียว (DRY)
// เดิมกระจายอยู่ใน src/component/mockData.js + src/data/mockData.js
// ─────────────────────────────────────────────────────────────────────────────

// ── TIER metadata ─────────────────────────────────────────────────────────────
const TIER_META = {
  T1: { label: 'Foundation',  color: '#059669', bgColor: '#ecfdf5' },
  T2: { label: 'Core',        color: '#2563eb', bgColor: '#eff6ff' },
  T3: { label: 'Advanced',    color: '#7c3aed', bgColor: '#f5f3ff' },
  T4: { label: 'Specialized', color: '#dc2626', bgColor: '#fef2f2' },
};

// ── GOALS ─────────────────────────────────────────────────────────────────────
export const GOALS = [
  { id: 'G01', name: 'Software Dev Intern', group: 'Career',      icon: '💻', desc: 'พัฒนาแอปและระบบซอฟต์แวร์',           skillCount: 13 },
  { id: 'G02', name: 'Data Analyst Intern', group: 'Career',      icon: '📊', desc: 'วิเคราะห์ข้อมูลด้วย Python & Pandas', skillCount: 11 },
  { id: 'G06', name: 'Intro Programming',   group: 'Academic',    icon: '🚀', desc: 'พื้นฐานการเขียนโปรแกรม Python',       skillCount: 9  },
  { id: 'G07', name: 'Data Structures',     group: 'Academic',    icon: '🧱', desc: 'โครงสร้างข้อมูลและอัลกอริทึม',         skillCount: 10 },
  { id: 'G10', name: 'Contest (ICPC)',       group: 'Competitive', icon: '🏆', desc: 'เตรียมสอบแข่งขัน ICPC',               skillCount: 10 },
  { id: 'G11', name: 'Freelance Python',    group: 'Competitive', icon: '💼', desc: 'Python สำหรับงาน Freelance',           skillCount: 10 },
  { id: 'G12', name: 'Cybersecurity',       group: 'Specialized', icon: '🔐', desc: 'Python สำหรับ Security & Crypto',      skillCount: 8  },
  { id: 'G15', name: 'Portfolio Project',   group: 'Specialized', icon: '🎨', desc: 'สร้าง Portfolio ด้วย Python',          skillCount: 8  },
];

// ── SKILLS (44 skills รวมทุก tier) ───────────────────────────────────────────
export const SKILLS = [
  { id: 'SK-001', name: 'Computer & Python Fundamentals', icon: '🐍', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: [] },
  { id: 'SK-002', name: 'Basic Input / Output',           icon: '⌨️', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: [] },
  { id: 'SK-003', name: 'Variables & Data Types',         icon: '📦', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: ['SK-001','SK-002'] },
  { id: 'SK-004', name: 'Operators & Expressions',        icon: '➕', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: ['SK-003'] },
  { id: 'SK-005', name: 'String Operations',              icon: '🔤', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: ['SK-003'] },
  { id: 'SK-006', name: 'Control Flow — Conditional',     icon: '🔀', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: ['SK-004'] },
  { id: 'SK-007', name: 'Control Flow — Loops',           icon: '🔁', tier: 'T1', tierLabel: 'TIER 0 — Foundation',        tierColor: '#6366f1', progress: 0,   requires: ['SK-004','SK-006'] },
  { id: 'SK-008', name: 'List',                           icon: '📋', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-003','SK-007'] },
  { id: 'SK-009', name: 'Tuple',                          icon: '🔗', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: [] },
  { id: 'SK-010', name: 'Dictionary',                     icon: '📖', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-003','SK-007'] },
  { id: 'SK-011', name: 'Set',                            icon: '🎯', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: [] },
  { id: 'SK-012', name: 'Functions — Basic',              icon: '🔧', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-006','SK-007'] },
  { id: 'SK-013', name: 'Scope & Namespace',              icon: '🏷️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-012'] },
  { id: 'SK-014', name: 'Recursion',                      icon: '♻️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-012','SK-013'] },
  { id: 'SK-015', name: 'Lambda & HOF',                   icon: '🌀', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-008','SK-012'] },
  { id: 'SK-016', name: 'Modules & Packages',             icon: '📦', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-012'] },
  { id: 'SK-017', name: 'File I/O',                       icon: '📁', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-005','SK-012'] },
  { id: 'SK-018', name: 'Exception Handling',             icon: '⚠️', tier: 'T2', tierLabel: 'TIER 1–2 — Core / Functions', tierColor: '#0047AB', progress: 0,   requires: ['SK-006','SK-012'] },
  { id: 'SK-019', name: 'OOP — Class & Object',           icon: '🏗️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-010','SK-012'] },
  { id: 'SK-020', name: 'OOP — Encapsulation',            icon: '🔒', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-019'] },
  { id: 'SK-021', name: 'OOP — Inheritance',              icon: '🧬', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-019','SK-020'] },
  { id: 'SK-022', name: 'OOP — Polymorphism & Abstract',  icon: '🎭', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: [] },
  { id: 'SK-023', name: 'Magic Methods (Dunder)',          icon: '✨', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: [] },
  { id: 'SK-024', name: 'Comprehensions & Generators',    icon: '⚙️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-007','SK-008','SK-015'] },
  { id: 'SK-025', name: 'Decorators',                     icon: '🎀', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: [] },
  { id: 'SK-026', name: 'Regular Expressions',            icon: '🔍', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-005','SK-016'] },
  { id: 'SK-027', name: 'Iterators & Protocols',          icon: '🔄', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: [] },
  { id: 'SK-028', name: 'Type Hints & Documentation',     icon: '📝', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-012','SK-019'] },
  { id: 'SK-029', name: 'Sorting Algorithms',             icon: '📊', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-008','SK-014'] },
  { id: 'SK-030', name: 'Searching Algorithms',           icon: '🔎', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-007','SK-008'] },
  { id: 'SK-031', name: 'Complexity Analysis (Big-O)',    icon: '📐', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-014','SK-029','SK-030'] },
  { id: 'SK-032', name: 'Stack & Queue',                  icon: '🥞', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-008','SK-019'] },
  { id: 'SK-033', name: 'Linked List',                    icon: '⛓️', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-019','SK-032'] },
  { id: 'SK-034', name: 'Tree & BST',                     icon: '🌳', tier: 'T3', tierLabel: 'TIER 3 — Advanced',          tierColor: '#059669', progress: 0,   requires: ['SK-014','SK-033'] },
  { id: 'SK-035', name: 'Graph (BFS/DFS)',                icon: '🕸️', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-010','SK-032','SK-034'] },
  { id: 'SK-036', name: 'Dynamic Programming',            icon: '⚡', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-008','SK-014','SK-031'] },
  { id: 'SK-037', name: 'NumPy',                          icon: '🔢', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-008','SK-015','SK-031'] },
  { id: 'SK-038', name: 'Pandas',                         icon: '🐼', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-010','SK-017','SK-037'] },
  { id: 'SK-039', name: 'Data Visualization',             icon: '📈', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-037','SK-038'] },
  { id: 'SK-042', name: 'HTTP & API Concepts',            icon: '🌐', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-010','SK-016'] },
  { id: 'SK-044', name: 'Testing (unittest/pytest)',      icon: '🧪', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-012','SK-018','SK-019'] },
  { id: 'SK-045', name: 'Socket & Network Programming',  icon: '🔌', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-016','SK-018','SK-042'] },
  { id: 'SK-046', name: 'Cryptography & Security Basics',icon: '🔐', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-026','SK-045'] },
  { id: 'SK-047', name: 'OS Interaction & Automation',   icon: '🤖', tier: 'T4', tierLabel: 'TIER 4 — Specialized',       tierColor: '#d97706', progress: 0,   requires: ['SK-016','SK-017'] },
];

// ── GOAL → SKILLS map ─────────────────────────────────────────────────────────
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
    { skillId: 'SK-015', minLevel: 'D2' }, { skillId: 'SK-037', minLevel: 'D3' },
    { skillId: 'SK-038', minLevel: 'D3' }, { skillId: 'SK-039', minLevel: 'D2' },
    { skillId: 'SK-031', minLevel: 'D2' },
  ],
  'G06': [
    { skillId: 'SK-001', minLevel: 'D3' }, { skillId: 'SK-002', minLevel: 'D2' },
    { skillId: 'SK-003', minLevel: 'D3' }, { skillId: 'SK-004', minLevel: 'D3' },
    { skillId: 'SK-005', minLevel: 'D2' }, { skillId: 'SK-006', minLevel: 'D3' },
    { skillId: 'SK-007', minLevel: 'D3' }, { skillId: 'SK-012', minLevel: 'D2' },
    { skillId: 'SK-018', minLevel: 'D2' },
  ],
  'G07': [
    { skillId: 'SK-007', minLevel: 'D3' }, { skillId: 'SK-008', minLevel: 'D3' },
    { skillId: 'SK-014', minLevel: 'D2' }, { skillId: 'SK-019', minLevel: 'D2' },
    { skillId: 'SK-029', minLevel: 'D3' }, { skillId: 'SK-030', minLevel: 'D3' },
    { skillId: 'SK-031', minLevel: 'D2' }, { skillId: 'SK-032', minLevel: 'D3' },
    { skillId: 'SK-033', minLevel: 'D2' }, { skillId: 'SK-034', minLevel: 'D2' },
  ],
  'G10': [
    { skillId: 'SK-007', minLevel: 'D3' }, { skillId: 'SK-008', minLevel: 'D3' },
    { skillId: 'SK-010', minLevel: 'D3' }, { skillId: 'SK-014', minLevel: 'D3' },
    { skillId: 'SK-029', minLevel: 'D3' }, { skillId: 'SK-030', minLevel: 'D3' },
    { skillId: 'SK-031', minLevel: 'D3' }, { skillId: 'SK-032', minLevel: 'D3' },
    { skillId: 'SK-035', minLevel: 'D3' }, { skillId: 'SK-036', minLevel: 'D3' },
  ],
  'G11': [
    { skillId: 'SK-003', minLevel: 'D3' }, { skillId: 'SK-007', minLevel: 'D3' },
    { skillId: 'SK-008', minLevel: 'D3' }, { skillId: 'SK-012', minLevel: 'D3' },
    { skillId: 'SK-016', minLevel: 'D2' }, { skillId: 'SK-017', minLevel: 'D2' },
    { skillId: 'SK-018', minLevel: 'D2' }, { skillId: 'SK-042', minLevel: 'D2' },
    { skillId: 'SK-044', minLevel: 'D2' }, { skillId: 'SK-047', minLevel: 'D2' },
  ],
  'G12': [
    { skillId: 'SK-005', minLevel: 'D2' }, { skillId: 'SK-016', minLevel: 'D2' },
    { skillId: 'SK-018', minLevel: 'D2' }, { skillId: 'SK-026', minLevel: 'D2' },
    { skillId: 'SK-042', minLevel: 'D2' }, { skillId: 'SK-044', minLevel: 'D2' },
    { skillId: 'SK-045', minLevel: 'D2' }, { skillId: 'SK-046', minLevel: 'D2' },
  ],
  'G15': [
    { skillId: 'SK-008', minLevel: 'D2' }, { skillId: 'SK-010', minLevel: 'D2' },
    { skillId: 'SK-012', minLevel: 'D3' }, { skillId: 'SK-016', minLevel: 'D2' },
    { skillId: 'SK-017', minLevel: 'D2' }, { skillId: 'SK-019', minLevel: 'D2' },
    { skillId: 'SK-039', minLevel: 'D2' }, { skillId: 'SK-042', minLevel: 'D2' },
  ],
};

// ── PREREQS map ───────────────────────────────────────────────────────────────
export const PREREQS = SKILLS.flatMap(skill =>
  skill.requires.map(prereqId => ({
    skillId: skill.id,
    prereqId,
    minLevel: 'D1',
  }))
);

// ── Mock User Profile ─────────────────────────────────────────────────────────
export const MOCK_USER_PROFILE = {
  fname:  'Afdol',
  lname:  'Leenud',
  email:  'afdol.l@student.psu.ac.th',
  avatar: 'A',
};

// ── Mock Sessions ─────────────────────────────────────────────────────────────
export const MOCK_SESSIONS = [
  {
    id: 1, title: 'Python Fundamentals', date: '12 ม.ค. 2568', score: 92, grade: 'great', skillId: 'SK-001',
    questions: [
      { text: 'Python เป็น interpreted หรือ compiled language?', skill: 'SK-001', time: '18s', correct: true,  chosen: 'Interpreted',     answer: 'Interpreted' },
      { text: 'ไฟล์ Python มีนามสกุลอะไร?',                      skill: 'SK-001', time: '12s', correct: true,  chosen: '.py',             answer: '.py' },
      { text: 'print(type(42)) แสดงผลอะไร?',                    skill: 'SK-001', time: '25s', correct: true,  chosen: "<class 'int'>",   answer: "<class 'int'>" },
      { text: 'ข้อใดเป็น comment ที่ถูกต้อง?',                   skill: 'SK-001', time: '14s', correct: false, chosen: '// comment',      answer: '# comment' },
      { text: 'Python ใช้ indentation แทนอะไร?',                 skill: 'SK-001', time: '20s', correct: true,  chosen: 'Curly braces {}', answer: 'Curly braces {}' },
    ],
  },
  {
    id: 2, title: 'Basic I/O', date: '14 ม.ค. 2568', score: 88, grade: 'great', skillId: 'SK-002',
    questions: [
      { text: 'input() ใน Python 3 return ค่าชนิดอะไร?', skill: 'SK-002', time: '22s', correct: true,  chosen: 'str',              answer: 'str' },
      { text: 'print("a","b",sep="-") แสดงผลอะไร?',       skill: 'SK-002', time: '30s', correct: true,  chosen: 'a-b',              answer: 'a-b' },
      { text: 'x = int(input()) user พิมพ์ "abc"?',        skill: 'SK-002', time: '28s', correct: false, chosen: 'None',             answer: 'ValueError' },
      { text: 'print(end="!") เปลี่ยนอะไร?',               skill: 'SK-002', time: '19s', correct: true,  chosen: 'ตัวท้าย',        answer: 'ตัวท้าย' },
      { text: 'f-string คืออะไร?',                         skill: 'SK-002', time: '16s', correct: true,  chosen: 'string formatting', answer: 'string formatting' },
    ],
  },
  {
    id: 3, title: 'Variables & Data Types', date: '17 ม.ค. 2568', score: 96, grade: 'great', skillId: 'SK-003',
    questions: [
      { text: 'x = 3.14 ชนิดข้อมูลของ x คืออะไร?', skill: 'SK-003', time: '15s', correct: true, chosen: 'float',  answer: 'float' },
      { text: 'ชื่อตัวแปรใดไม่ถูกต้อง?',              skill: 'SK-003', time: '18s', correct: true, chosen: '2name', answer: '2name' },
      { text: 'bool("") คืออะไร?',                   skill: 'SK-003', time: '24s', correct: true, chosen: 'False', answer: 'False' },
      { text: 'a=b=c=5;b=10;print(a)=?',              skill: 'SK-003', time: '35s', correct: true, chosen: '5',     answer: '5' },
      { text: 'type(None) คืออะไร?',                  skill: 'SK-003', time: '20s', correct: true, chosen: 'NoneType', answer: 'NoneType' },
    ],
  },
  {
    id: 4, title: 'Operators & Expressions', date: '20 ม.ค. 2568', score: 76, grade: 'good', skillId: 'SK-004',
    questions: [
      { text: '7 % 3 = ?',                      skill: 'SK-004', time: '12s', correct: true,  chosen: '1',    answer: '1' },
      { text: '2 ** 10 = ?',                     skill: 'SK-004', time: '20s', correct: true,  chosen: '1024', answer: '1024' },
      { text: '10 // 3 = ?',                     skill: 'SK-004', time: '22s', correct: true,  chosen: '3',    answer: '3' },
      { text: 'x=5;x+=3;x*=2;print(x)=?',       skill: 'SK-004', time: '40s', correct: false, chosen: '11',   answer: '16' },
      { text: 'bool(0.0) = ?',                   skill: 'SK-004', time: '28s', correct: false, chosen: 'True', answer: 'False' },
    ],
  },
  {
    id: 5, title: 'Operators & Expressions', date: '21 ม.ค. 2568', score: 84, grade: 'great', skillId: 'SK-004',
    questions: [
      { text: '7 % 3 = ?',              skill: 'SK-004', time: '10s', correct: true,  chosen: '1',     answer: '1' },
      { text: 'x=5;x+=3;x*=2;print(x)', skill: 'SK-004', time: '30s', correct: true,  chosen: '16',    answer: '16' },
      { text: 'bool([]) = ?',            skill: 'SK-004', time: '18s', correct: true,  chosen: 'False', answer: 'False' },
      { text: '5 == "5" = ?',            skill: 'SK-004', time: '15s', correct: true,  chosen: 'False', answer: 'False' },
      { text: 'not (True and False)=?',  skill: 'SK-004', time: '22s', correct: false, chosen: 'False', answer: 'True' },
    ],
  },
];

// ── Mock Active Branch ────────────────────────────────────────────────────────
export const MOCK_ACTIVE_BRANCH = {
  id:             'branch-g07',
  goalId:         'G07',
  goalName:       'Data Structures',
  goalIcon:       '🌲',
  faculty:        'วิทยาศาสตร์และเทคโนโลยี',
  major:          'ICT',
  year:           '2',
  campus:         'หาดใหญ่',
  streak:         4,
  xp:             1240,
  level:          7,
  unlockedSkills: ['SK-001','SK-002','SK-003'],
  sessions:       MOCK_SESSIONS,
};

// ── Mock All Branches ─────────────────────────────────────────────────────────
export const MOCK_BRANCHES = [
  MOCK_ACTIVE_BRANCH,
  {
    id:             'branch-g01',
    goalId:         'G01',
    goalName:       'Intro to Programming',
    goalIcon:       '🐍',
    faculty:        'วิทยาศาสตร์และเทคโนโลยี',
    major:          'ICT',
    year:           '1',
    campus:         'หาดใหญ่',
    streak:         0,
    xp:             380,
    level:          3,
    unlockedSkills: ['SK-001','SK-002','SK-003','SK-004'],
    sessions:       [],
  },
];

// ── ELO Ranges ────────────────────────────────────────────────────────────────
export const ELO_RANGES = {
  1: { min: 1200, max: 1349 },
  2: { min: 1350, max: 1499 },
  3: { min: 1500, max: 1649 },
  4: { min: 1650, max: 1799 },
  5: { min: 1800, max: 1950 },
};

// ── Helper Functions ──────────────────────────────────────────────────────────

/** คำนวณ skill level จาก progress */
export function getSkillLevel(skill) {
  if (skill.progress === 100) return 5;
  const map = { T1: 1, T2: 2, T3: 3, T4: 4 };
  return map[skill.tier] ?? 1;
}

/** Seeded random สำหรับ ELO (ค่าเดิมทุก render) */
function seededRand(seed, min, max) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.round(min + r * (max - min));
}

/** คำนวณ ELO จาก skill */
export function getSkillElo(skill) {
  const level = getSkillLevel(skill);
  const { min, max } = ELO_RANGES[level];
  const seed = parseInt(skill.id.replace(/\D/g, ''), 10) || 1;
  return seededRand(seed, min, max);
}

/** คำนวณ skill progress จาก sessions (return Map<skillId, 0-100>) */
export function computeSkillProgress(sessions) {
  const counts = {};
  for (const s of sessions) {
    for (const q of s.questions) {
      if (!counts[q.skill]) counts[q.skill] = { correct: 0, total: 0 };
      counts[q.skill].total   += 1;
      counts[q.skill].correct += q.correct ? 1 : 0;
    }
  }
  const result = {};
  for (const [id, c] of Object.entries(counts)) {
    result[id] = Math.round((c.correct / c.total) * 100);
  }
  return result;
}

/** คำนวณ unlocked skills จาก progress (threshold 60%) */
export function computeUnlockedSkills(sessions, skills) {
  const prog = computeSkillProgress(sessions);
  const unlocked = new Set();
  for (const sk of skills) {
    if (sk.requires.length === 0) {
      if ((prog[sk.id] ?? sk.progress) >= 0) unlocked.add(sk.id);
    } else {
      if ((prog[sk.id] ?? sk.progress) >= 60) unlocked.add(sk.id);
    }
  }
  return unlocked;
}

/** Return skills ที่เกี่ยวข้องกับ goalId */
export function getSkillTreeForGoal(goalId) {
  // TODO: filter ตาม GOAL_SKILLS[goalId] จริงๆ ตอน backend พร้อม
  return SKILLS;
}
