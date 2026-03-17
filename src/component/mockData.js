// ─── mockData.js ──────────────────────────────────────────────────────────────
// PSU ALS — mock data ที่จำลอง activity สมจริง
// ใช้กับ HomeNew.jsx + HomeNew.css (Cobalt Sky theme)
// ─────────────────────────────────────────────────────────────────────────────

// ── Tier metadata ─────────────────────────────────────────────────────────────
const TIER_META = {
  T1: { label: 'Foundation',   color: '#059669', bgColor: '#ecfdf5' },
  T2: { label: 'Core',         color: '#2563eb', bgColor: '#eff6ff' },
  T3: { label: 'Advanced',     color: '#7c3aed', bgColor: '#f5f3ff' },
  T4: { label: 'Specialized',  color: '#dc2626', bgColor: '#fef2f2' },
};

// ── Skill definitions (SK-xxx → G07 Data Structures tree) ────────────────────
// requires = prerequisite skill IDs
// progress = 0-100 (simulated user progress)
// icon, tierLabel, tierColor มาจาก TIER_META
export const SKILLS = [
  // T1 — Foundation
  { id: 'SK-001', name: 'Python Fundamentals',       tier: 'T1', icon: '🐍', requires: [],              progress: 100 },
  { id: 'SK-002', name: 'Basic I/O',                 tier: 'T1', icon: '⌨️', requires: ['SK-001'],       progress: 100 },
  { id: 'SK-003', name: 'Variables & Data Types',    tier: 'T1', icon: '📦', requires: ['SK-001','SK-002'], progress: 100 },
  { id: 'SK-004', name: 'Operators & Expressions',   tier: 'T1', icon: '➕', requires: ['SK-003'],       progress: 82  },
  { id: 'SK-006', name: 'Control Flow — Conditional',tier: 'T1', icon: '🔀', requires: ['SK-004'],       progress: 74  },
  // T2 — Core
  { id: 'SK-007', name: 'Loops',                     tier: 'T2', icon: '🔁', requires: ['SK-006','SK-004'], progress: 61 },
  { id: 'SK-008', name: 'List',                      tier: 'T2', icon: '📋', requires: ['SK-006','SK-007'], progress: 45 },
  { id: 'SK-009', name: 'Tuple',                     tier: 'T2', icon: '🔒', requires: ['SK-008'],       progress: 20  },
  { id: 'SK-010', name: 'Dictionary',                tier: 'T2', icon: '📖', requires: ['SK-008','SK-009'], progress: 0 },
  { id: 'SK-012', name: 'Functions — Basic',         tier: 'T2', icon: '🔧', requires: ['SK-007','SK-003'], progress: 30 },
  // T3 — Advanced (G07 goal skills)
  { id: 'SK-014', name: 'Recursion',                 tier: 'T3', icon: '🌀', requires: ['SK-007','SK-003'], progress: 0 },
  { id: 'SK-019', name: 'OOP — Class & Object',      tier: 'T3', icon: '🏗️', requires: ['SK-008','SK-006'], progress: 0 },
  { id: 'SK-021', name: 'OOP — Inheritance',         tier: 'T3', icon: '🧬', requires: ['SK-008','SK-014'], progress: 0 },
  { id: 'SK-027', name: 'Iterators & Protocols',     tier: 'T3', icon: '🔄', requires: ['SK-010','SK-012'], progress: 0 },
  { id: 'SK-029', name: 'Sorting Algorithms',        tier: 'T3', icon: '📊', requires: ['SK-012','SK-007'], progress: 0 },
  { id: 'SK-030', name: 'Searching Algorithms',      tier: 'T3', icon: '🔍', requires: ['SK-012','SK-021'], progress: 0 },
  { id: 'SK-031', name: 'Complexity (Big-O)',        tier: 'T3', icon: '⏱️', requires: ['SK-021','SK-030'], progress: 0 },
  { id: 'SK-032', name: 'Stack & Queue',             tier: 'T3', icon: '📚', requires: ['SK-010','SK-031'], progress: 0 },
  { id: 'SK-033', name: 'Linked List',               tier: 'T3', icon: '🔗', requires: ['SK-032','SK-030'], progress: 0 },
  { id: 'SK-034', name: 'Tree & BST',                tier: 'T3', icon: '🌲', requires: ['SK-010','SK-027'], progress: 0 },
].map(s => ({
  ...s,
  tierLabel: TIER_META[s.tier].label,
  tierColor: TIER_META[s.tier].color,
}));

// ── Helper: get skill tree for goal ──────────────────────────────────────────
export function getSkillTreeForGoal(goalId) {
  // จะ return skills ที่เกี่ยวกับ goal นั้น ๆ
  // ตอนนี้มีแค่ G07 Data Structures
  return SKILLS;
}

// ── Mock Sessions (14 sessions จำลอง progress จริง) ──────────────────────────
// เรียงจากเก่าสุดก่อน → ล่าสุดสุดท้าย
export const MOCK_SESSIONS = [
  {
    id: 1,
    title: 'Python Fundamentals',
    date: '12 ม.ค. 2568',
    score: 92,
    grade: 'great',
    skillId: 'SK-001',
    questions: [
      { text: 'Python เป็น interpreted หรือ compiled language?', skill: 'SK-001', time: '18s', correct: true,  chosen: 'Interpreted',        answer: 'Interpreted' },
      { text: 'ไฟล์ Python มีนามสกุลอะไร?',                      skill: 'SK-001', time: '12s', correct: true,  chosen: '.py',                answer: '.py' },
      { text: 'print(type(42)) แสดงผลอะไร?',                    skill: 'SK-001', time: '25s', correct: true,  chosen: "<class 'int'>",       answer: "<class 'int'>" },
      { text: 'ข้อใดเป็น comment ที่ถูกต้อง?',                   skill: 'SK-001', time: '14s', correct: false, chosen: '// comment',         answer: '# comment' },
      { text: 'Python ใช้ indentation แทนอะไร?',                 skill: 'SK-001', time: '20s', correct: true,  chosen: 'Curly braces {}',    answer: 'Curly braces {}' },
    ],
  },
  {
    id: 2,
    title: 'Basic I/O',
    date: '14 ม.ค. 2568',
    score: 88,
    grade: 'great',
    skillId: 'SK-002',
    questions: [
      { text: 'input() ใน Python 3 return ค่าชนิดอะไร?',         skill: 'SK-002', time: '22s', correct: true,  chosen: 'str',                answer: 'str' },
      { text: 'print("a","b",sep="-") แสดงผลอะไร?',             skill: 'SK-002', time: '30s', correct: true,  chosen: 'a-b',                answer: 'a-b' },
      { text: 'x = int(input()) จะเกิดอะไรถ้า user พิมพ์ "abc"?', skill: 'SK-002', time: '28s', correct: false, chosen: 'None',              answer: 'ValueError' },
      { text: 'print(end="!") เปลี่ยนอะไร?',                     skill: 'SK-002', time: '19s', correct: true,  chosen: 'ตัวท้าย',           answer: 'ตัวท้าย' },
      { text: 'f-string คืออะไร?',                               skill: 'SK-002', time: '16s', correct: true,  chosen: 'string formatting',  answer: 'string formatting' },
    ],
  },
  {
    id: 3,
    title: 'Variables & Data Types',
    date: '17 ม.ค. 2568',
    score: 96,
    grade: 'great',
    skillId: 'SK-003',
    questions: [
      { text: 'x = 3.14 ชนิดข้อมูลของ x คืออะไร?',              skill: 'SK-003', time: '15s', correct: true,  chosen: 'float',              answer: 'float' },
      { text: 'ชื่อตัวแปรใดไม่ถูกต้อง?',                          skill: 'SK-003', time: '18s', correct: true,  chosen: '2name',              answer: '2name' },
      { text: 'bool("") คืออะไร?',                               skill: 'SK-003', time: '24s', correct: true,  chosen: 'False',              answer: 'False' },
      { text: 'a = b = c = 5; b = 10; print(a) = ?',            skill: 'SK-003', time: '35s', correct: true,  chosen: '5',                  answer: '5' },
      { text: 'type(None) คืออะไร?',                             skill: 'SK-003', time: '20s', correct: true,  chosen: 'NoneType',           answer: 'NoneType' },
    ],
  },
  {
    id: 4,
    title: 'Operators & Expressions',
    date: '20 ม.ค. 2568',
    score: 76,
    grade: 'good',
    skillId: 'SK-004',
    questions: [
      { text: '7 % 3 = ?',                                       skill: 'SK-004', time: '12s', correct: true,  chosen: '1',                  answer: '1' },
      { text: '2 ** 10 = ?',                                     skill: 'SK-004', time: '20s', correct: true,  chosen: '1024',               answer: '1024' },
      { text: '10 // 3 = ?',                                     skill: 'SK-004', time: '22s', correct: true,  chosen: '3',                  answer: '3' },
      { text: 'x=5; x+=3; x*=2; print(x) = ?',                  skill: 'SK-004', time: '40s', correct: false, chosen: '11',                 answer: '16' },
      { text: 'bool(0.0) = ?',                                   skill: 'SK-004', time: '28s', correct: false, chosen: 'True',               answer: 'False' },
    ],
  },
  {
    id: 5,
    title: 'Operators & Expressions',
    date: '21 ม.ค. 2568',
    score: 84,
    grade: 'great',
    skillId: 'SK-004',
    questions: [
      { text: '7 % 3 = ?',                                       skill: 'SK-004', time: '10s', correct: true,  chosen: '1',                  answer: '1' },
      { text: 'x=5; x+=3; x*=2; print(x) = ?',                  skill: 'SK-004', time: '30s', correct: true,  chosen: '16',                 answer: '16' },
      { text: 'bool([]) = ?',                                     skill: 'SK-004', time: '18s', correct: true,  chosen: 'False',              answer: 'False' },
      { text: '5 == "5" = ?',                                    skill: 'SK-004', time: '15s', correct: true,  chosen: 'False',              answer: 'False' },
      { text: 'not (True and False) = ?',                        skill: 'SK-004', time: '22s', correct: false, chosen: 'False',              answer: 'True' },
    ],
  },
  {
    id: 6,
    title: 'Control Flow — Conditional',
    date: '24 ม.ค. 2568',
    score: 68,
    grade: 'good',
    skillId: 'SK-006',
    questions: [
      { text: 'x=15; if x<10: print("A") elif x<20: print("B") else: print("C")',
                                                                  skill: 'SK-006', time: '35s', correct: true,  chosen: 'B',                  answer: 'B' },
      { text: 'result = "even" if 5%2==0 else "odd" = ?',        skill: 'SK-006', time: '28s', correct: true,  chosen: 'odd',                answer: 'odd' },
      { text: 'if x == y == 3 เป็น valid Python ไหม?',           skill: 'SK-006', time: '25s', correct: false, chosen: 'ไม่ valid',          answer: 'valid' },
      { text: 'x=3,y=3; if x==y==3 แสดงอะไร?',                  skill: 'SK-006', time: '30s', correct: false, chosen: 'Error',              answer: 'yes' },
      { text: 'elif มีไว้ทำอะไร?',                               skill: 'SK-006', time: '18s', correct: true,  chosen: 'เงื่อนไขเพิ่มเติม', answer: 'เงื่อนไขเพิ่มเติม' },
    ],
  },
  {
    id: 7,
    title: 'Control Flow — Conditional',
    date: '26 ม.ค. 2568',
    score: 80,
    grade: 'good',
    skillId: 'SK-006',
    questions: [
      { text: 'if x == y == 3 เป็น valid Python ไหม?',           skill: 'SK-006', time: '22s', correct: true,  chosen: 'valid',              answer: 'valid' },
      { text: 'x=3,y=3; if x==y==3 แสดงอะไร?',                  skill: 'SK-006', time: '28s', correct: true,  chosen: 'yes',                answer: 'yes' },
      { text: 'ternary operator ใน Python เขียนยังไง?',           skill: 'SK-006', time: '30s', correct: false, chosen: 'x ? y : z',          answer: 'y if x else z' },
      { text: 'elif หลาย elif ได้ไหม?',                           skill: 'SK-006', time: '14s', correct: true,  chosen: 'ได้',                answer: 'ได้' },
      { text: 'pass ใน if block ทำอะไร?',                        skill: 'SK-006', time: '20s', correct: true,  chosen: 'ไม่ทำอะไร',         answer: 'ไม่ทำอะไร' },
    ],
  },
  {
    id: 8,
    title: 'Loops',
    date: '29 ม.ค. 2568',
    score: 56,
    grade: 'low',
    skillId: 'SK-007',
    questions: [
      { text: 'for i in range(3): print(i) แสดงอะไร?',           skill: 'SK-007', time: '20s', correct: true,  chosen: '0 1 2',              answer: '0 1 2' },
      { text: 'while loop ต่างจาก for loop ยังไง?',               skill: 'SK-007', time: '35s', correct: false, chosen: 'เหมือนกัน',         answer: 'while ใช้ condition' },
      { text: 'break ทำอะไร?',                                   skill: 'SK-007', time: '18s', correct: true,  chosen: 'หยุด loop',          answer: 'หยุด loop' },
      { text: 'continue ทำอะไร?',                                skill: 'SK-007', time: '22s', correct: false, chosen: 'หยุด loop',          answer: 'ข้ามรอบนี้' },
      { text: 'nested loop 3×3 วนกี่รอบ?',                       skill: 'SK-007', time: '28s', correct: false, chosen: '6',                  answer: '9' },
    ],
  },
  {
    id: 9,
    title: 'Loops',
    date: '31 ม.ค. 2568',
    score: 68,
    grade: 'good',
    skillId: 'SK-007',
    questions: [
      { text: 'continue ทำอะไร?',                                skill: 'SK-007', time: '18s', correct: true,  chosen: 'ข้ามรอบนี้',        answer: 'ข้ามรอบนี้' },
      { text: 'nested loop 3×3 วนกี่รอบ?',                       skill: 'SK-007', time: '22s', correct: true,  chosen: '9',                  answer: '9' },
      { text: 'range(1,10,2) = ?',                               skill: 'SK-007', time: '30s', correct: false, chosen: '[1,2,3,4,5]',        answer: '[1,3,5,7,9]' },
      { text: 'for i in enumerate(["a","b"]) i = ?',             skill: 'SK-007', time: '35s', correct: true,  chosen: '(0,"a"),(1,"b")',    answer: '(0,"a"),(1,"b")' },
      { text: 'while True loop หยุดได้ด้วยอะไร?',                skill: 'SK-007', time: '20s', correct: true,  chosen: 'break',              answer: 'break' },
    ],
  },
  {
    id: 10,
    title: 'Loops',
    date: '2 ก.พ. 2568',
    score: 72,
    grade: 'good',
    skillId: 'SK-007',
    questions: [
      { text: 'range(1,10,2) = ?',                               skill: 'SK-007', time: '25s', correct: true,  chosen: '[1,3,5,7,9]',        answer: '[1,3,5,7,9]' },
      { text: 'for...else ทำงานยังไง?',                           skill: 'SK-007', time: '40s', correct: false, chosen: 'else ทำงานถ้า error','answer': 'else ทำงานถ้าไม่มี break' },
      { text: 'zip() ใช้ทำอะไร?',                                skill: 'SK-007', time: '28s', correct: true,  chosen: 'จับคู่ iterator',    answer: 'จับคู่ iterator' },
      { text: 'list comprehension เร็วกว่า for loop ไหม?',       skill: 'SK-007', time: '32s', correct: true,  chosen: 'เร็วกว่า',           answer: 'เร็วกว่า' },
      { text: 'ลบรายการ while loop ที่ loop อยู่ปลอดภัยไหม?',    skill: 'SK-007', time: '35s', correct: false, chosen: 'ปลอดภัย',           answer: 'ไม่ปลอดภัย' },
    ],
  },
  {
    id: 11,
    title: 'List',
    date: '5 ก.พ. 2568',
    score: 44,
    grade: 'low',
    skillId: 'SK-008',
    questions: [
      { text: 'a = [1,2,3]; a[-1] = ?',                          skill: 'SK-008', time: '18s', correct: true,  chosen: '3',                  answer: '3' },
      { text: 'a.append(4) vs a + [4] ต่างกันยังไง?',            skill: 'SK-008', time: '45s', correct: false, chosen: 'เหมือนกัน',         answer: 'append แก้ in-place' },
      { text: 'sorted(a) vs a.sort() ต่างกันยังไง?',             skill: 'SK-008', time: '40s', correct: false, chosen: 'เหมือนกัน',         answer: 'sorted return ใหม่' },
      { text: 'b = a; b.append(9); a = ?',                       skill: 'SK-008', time: '38s', correct: false, chosen: 'ไม่เปลี่ยน',        answer: 'เปลี่ยนด้วย (same ref)' },
      { text: 'a[1:3] ของ [10,20,30,40] = ?',                   skill: 'SK-008', time: '25s', correct: true,  chosen: '[20,30]',            answer: '[20,30]' },
    ],
  },
  {
    id: 12,
    title: 'List',
    date: '7 ก.พ. 2568',
    score: 52,
    grade: 'low',
    skillId: 'SK-008',
    questions: [
      { text: 'a.append(4) vs a + [4] ต่างกันยังไง?',            skill: 'SK-008', time: '35s', correct: true,  chosen: 'append แก้ in-place','answer': 'append แก้ in-place' },
      { text: 'sorted(a) vs a.sort() ต่างกันยังไง?',             skill: 'SK-008', time: '30s', correct: true,  chosen: 'sorted return ใหม่', answer: 'sorted return ใหม่' },
      { text: 'b = a; b.append(9); a = ?',                       skill: 'SK-008', time: '35s', correct: false, chosen: 'ไม่เปลี่ยน',        answer: 'เปลี่ยนด้วย (same ref)' },
      { text: 'a.insert(1,99) กับ [10,20,30] = ?',               skill: 'SK-008', time: '28s', correct: true,  chosen: '[10,99,20,30]',      answer: '[10,99,20,30]' },
      { text: 'a.pop() vs a.pop(0) ต่างกันยังไง?',               skill: 'SK-008', time: '32s', correct: false, chosen: 'เหมือนกัน',         answer: 'pop() ท้าย pop(0) หัว' },
    ],
  },
  {
    id: 13,
    title: 'Functions — Basic',
    date: '10 ก.พ. 2568',
    score: 60,
    grade: 'good',
    skillId: 'SK-012',
    questions: [
      { text: 'def add(a, b=10): return a+b; add(5) = ?',       skill: 'SK-012', time: '28s', correct: true,  chosen: '15',                 answer: '15' },
      { text: '*args เก็บค่าในรูปแบบใด?',                        skill: 'SK-012', time: '30s', correct: true,  chosen: 'tuple',              answer: 'tuple' },
      { text: '**kwargs เก็บค่าในรูปแบบใด?',                    skill: 'SK-012', time: '25s', correct: false, chosen: 'list',               answer: 'dict' },
      { text: 'ฟังก์ชันที่ไม่มี return คืนค่าอะไร?',             skill: 'SK-012', time: '22s', correct: true,  chosen: 'None',               answer: 'None' },
      { text: 'lambda x: x*2 คืออะไร?',                         skill: 'SK-012', time: '20s', correct: false, chosen: 'สร้าง class',        answer: 'anonymous function' },
    ],
  },
  {
    id: 14,
    title: 'List (ทบทวน)',
    date: '12 ก.พ. 2568',
    score: 48,
    grade: 'low',
    skillId: 'SK-008',
    questions: [
      { text: 'b = a; b.append(9); a = ?',                       skill: 'SK-008', time: '38s', correct: false, chosen: 'ไม่เปลี่ยน',        answer: 'เปลี่ยนด้วย (same ref)' },
      { text: 'a.pop() vs a.pop(0) ต่างกันยังไง?',               skill: 'SK-008', time: '30s', correct: true,  chosen: 'pop() ท้าย pop(0) หัว','answer': 'pop() ท้าย pop(0) หัว' },
      { text: 'a.extend([4,5]) vs a.append([4,5]) ต่างกันยังไง?',skill: 'SK-008', time: '42s', correct: false, chosen: 'เหมือนกัน',         answer: 'extend แตก element' },
      { text: '[x*2 for x in range(4)] = ?',                     skill: 'SK-008', time: '32s', correct: true,  chosen: '[0,2,4,6]',          answer: '[0,2,4,6]' },
      { text: 'copy() vs deepcopy() ต่างกันยังไง?',              skill: 'SK-008', time: '45s', correct: false, chosen: 'เหมือนกัน',         answer: 'deepcopy คัดลอก nested ด้วย' },
    ],
  },
];

// ── Mock User Profile ─────────────────────────────────────────────────────────
export const MOCK_USER_PROFILE = {
  fname:  'Afdol',
  lname:  'Leenud',
  email:  'afdol.l@student.psu.ac.th',
  avatar: 'A',
};

// ── Mock Active Branch ────────────────────────────────────────────────────────
// unlocked skills คำนวณจาก sessions ที่ทำไปแล้ว
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
  // Skills ที่ progress ≥ threshold ถือว่า unlocked
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

// ── Computed stats helpers ────────────────────────────────────────────────────

/**
 * คำนวณ skill progress จาก sessions
 * return Map<skillId, progress 0–100>
 */
export function computeSkillProgress(sessions) {
  const counts = {}; // skillId → { correct, total }
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

/**
 * คำนวณ unlocked skills จากความก้าวหน้าใน sessions
 * skill unlock ได้ถ้า progress >= 60 ใน skill นั้น
 */
export function computeUnlockedSkills(sessions, skills) {
  const prog = computeSkillProgress(sessions);
  const unlocked = new Set();
  for (const sk of skills) {
    // root skills (ไม่มี requires) unlock ถ้ามี progress หรือเป็น base
    if (sk.requires.length === 0) {
      if ((prog[sk.id] ?? sk.progress) >= 0) unlocked.add(sk.id);
    } else {
      const p = prog[sk.id] ?? sk.progress;
      if (p >= 60) unlocked.add(sk.id);
    }
  }
  return unlocked;
}

// ── Calendar activity data (สร้างจาก sessions) ───────────────────────────────
export function buildCalendarActivity(sessions) {
  const activity = {};
  for (const s of sessions) {
    // parse date string เช่น "12 ม.ค. 2568"
    const key = s.date;
    if (!activity[key]) activity[key] = { sessions: 0, skills: new Set() };
    activity[key].sessions += 1;
    activity[key].skills.add(s.skillId);
  }
  return activity;
}
