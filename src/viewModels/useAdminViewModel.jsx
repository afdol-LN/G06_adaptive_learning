// ─── viewModels/useAdminViewModel.jsx ───────────────────────────────────────
// Admin ViewModel — จัดการ state และ business logic ทั้งหมดของหน้า Admin
// คืนค่าพร้อมใช้ให้ AdminView
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';

// ── Admin Mock Data (เฉพาะหน้า admin, ไม่ใช่ข้อมูล skill tree ของ user) ──────
const MOCK_USERS = [
  { id: 1, name: 'Afdol leenud',  email: 'afdol.leenud@psu.ac.th', faculty: 'ICT', year: 2, goal: 'Data Structures', sessions: 12, avgScore: 74, streak: 4,  lastActive: '2026-03-11', status: 'active'   },
  { id: 2, name: 'Sirin Kaewkla', email: 'sirin.kaew@psu.ac.th',   faculty: 'ICT', year: 3, goal: 'Algorithms',      sessions: 8,  avgScore: 88, streak: 7,  lastActive: '2026-03-12', status: 'active'   },
  { id: 3, name: 'Napat Somboon', email: 'napat.som@psu.ac.th',    faculty: 'ENG', year: 1, goal: 'Python Basics',   sessions: 3,  avgScore: 55, streak: 1,  lastActive: '2026-03-08', status: 'inactive' },
  { id: 4, name: 'Ploy Rattana',  email: 'ploy.rat@psu.ac.th',     faculty: 'SCI', year: 2, goal: 'Data Structures', sessions: 20, avgScore: 92, streak: 14, lastActive: '2026-03-12', status: 'active'   },
  { id: 5, name: 'Krit Jaidee',   email: 'krit.jai@psu.ac.th',     faculty: 'ICT', year: 4, goal: 'Graph Theory',    sessions: 5,  avgScore: 61, streak: 2,  lastActive: '2026-03-09', status: 'inactive' },
];

const INITIAL_SKILLS = [
  { id: 1,  name: 'Python Basics',      icon: '🐍', tier: 'T1', requires: [],         userCount: 48, avgProgress: 88, status: 'active' },
  { id: 2,  name: 'Variables & Types',  icon: '📦', tier: 'T1', requires: [1],        userCount: 45, avgProgress: 82, status: 'active' },
  { id: 3,  name: 'Control Flow',       icon: '🔀', tier: 'T1', requires: [1],        userCount: 40, avgProgress: 75, status: 'active' },
  { id: 4,  name: 'Functions',          icon: '🔧', tier: 'T2', requires: [2],        userCount: 35, avgProgress: 68, status: 'active' },
  { id: 5,  name: 'List',               icon: '📋', tier: 'T2', requires: [2, 3],     userCount: 32, avgProgress: 60, status: 'active' },
  { id: 6,  name: 'Tuple & Set',        icon: '🔗', tier: 'T2', requires: [2, 3],     userCount: 28, avgProgress: 52, status: 'active' },
  { id: 7,  name: 'Dictionary',         icon: '📖', tier: 'T2', requires: [3],        userCount: 26, avgProgress: 48, status: 'active' },
  { id: 8,  name: 'Recursion',          icon: '🔁', tier: 'T3', requires: [4],        userCount: 20, avgProgress: 38, status: 'active' },
  { id: 9,  name: 'Stack & Queue',      icon: '🥞', tier: 'T3', requires: [5, 4],     userCount: 18, avgProgress: 30, status: 'active' },
  { id: 10, name: 'Linked List',        icon: '⛓️', tier: 'T3', requires: [5, 6],     userCount: 14, avgProgress: 22, status: 'active' },
  { id: 11, name: 'Hash Table',         icon: '🗂️', tier: 'T3', requires: [7],        userCount: 12, avgProgress: 18, status: 'active' },
  { id: 12, name: 'Tree',               icon: '🌳', tier: 'T4', requires: [8, 9],     userCount: 8,  avgProgress: 10, status: 'active' },
  { id: 13, name: 'Graph',              icon: '🕸️', tier: 'T4', requires: [10, 11],   userCount: 6,  avgProgress: 8,  status: 'active' },
  { id: 14, name: 'Sorting Algorithms', icon: '📊', tier: 'T4', requires: [9, 10],    userCount: 7,  avgProgress: 9,  status: 'active' },
  { id: 15, name: 'Data Structure',     icon: '🏆', tier: 'T5', requires: [12,13,14], userCount: 2,  avgProgress: 3,  status: 'active' },
];

const INITIAL_QUESTIONS = {
  1: [
    { id: 101, text: 'Python คืออะไร?',                  diff: 'Easy',   status: 'active',   choices: ['ภาษาโปรแกรม', 'ระบบปฏิบัติการ', 'Database', 'Framework'], correct: 0 },
    { id: 102, text: 'เขียน Hello World ใน Python',       diff: 'Easy',   status: 'active',   choices: ['print("Hello World")', 'echo "Hello World"', 'printf("Hello World")', 'console.log("Hello World")'], correct: 0 },
    { id: 103, text: 'comment ใน Python ใช้สัญลักษณ์ใด?', diff: 'Easy',   status: 'inactive', choices: ['#', '//', '/*', '--'], correct: 0 },
  ],
  9: [
    { id: 901, text: 'Stack ใช้หลักการใด?',   diff: 'Easy',   status: 'active',   choices: ['FIFO', 'LIFO', 'FILO', 'Random'],                                     correct: 1 },
    { id: 902, text: 'Queue ใช้หลักการใด?',   diff: 'Easy',   status: 'active',   choices: ['LIFO', 'FILO', 'FIFO', 'Random'],                                     correct: 2 },
    { id: 903, text: 'deque ใน Python คืออะไร?', diff: 'Medium', status: 'active', choices: ['Double-ended queue', 'Stack only', 'Priority queue', 'Linked list'], correct: 0 },
    { id: 904, text: 'is_balanced ตรวจสอบอะไร?', diff: 'Hard',  status: 'inactive',choices: ['bracket สมดุล', 'ความยาว string', 'เรียงลำดับ', 'นับตัวอักษร'],      correct: 0 },
  ],
};

const MOCK_HISTORY = [
  { id: 1, user: 'Afdol leenud',  skill: 'Stack & Queue',    date: '2026-03-11', score: 75,  correct: 3, total: 4, grade: 'good'  },
  { id: 2, user: 'Sirin Kaewkla', skill: 'Python Basics',     date: '2026-03-12', score: 100, correct: 3, total: 3, grade: 'great' },
  { id: 3, user: 'Ploy Rattana',  skill: 'Variables & Types', date: '2026-03-12', score: 92,  correct: 4, total: 4, grade: 'great' },
  { id: 4, user: 'Napat Somboon', skill: 'Control Flow',      date: '2026-03-08', score: 50,  correct: 2, total: 4, grade: 'low'   },
  { id: 5, user: 'Krit Jaidee',   skill: 'Functions',         date: '2026-03-09', score: 67,  correct: 2, total: 3, grade: 'good'  },
  { id: 6, user: 'Afdol leenud',  skill: 'Python Basics',     date: '2026-03-10', score: 90,  correct: 3, total: 3, grade: 'great' },
  { id: 7, user: 'Ploy Rattana',  skill: 'Recursion',         date: '2026-03-11', score: 100, correct: 4, total: 4, grade: 'great' },
  { id: 8, user: 'Sirin Kaewkla', skill: 'Stack & Queue',     date: '2026-03-10', score: 88,  correct: 3, total: 4, grade: 'great' },
];

const SUMMARY = {
  totalUsers: 5, activeToday: 3, totalSessions: 142, avgScore: 74,
  topSkill: 'Python Basics', weekSessions: [8, 14, 11, 20, 16, 9, 18],
};

const EMPTY_SKILL    = { name: '', icon: '⭐', tier: 'T1', requires: [], userCount: 0, avgProgress: 0, status: 'active' };
const EMPTY_QUESTION = { text: '', diff: 'Easy', status: 'active', choices: ['', '', '', ''], correct: 0 };

// ── Helpers ──────────────────────────────────────────────────────────────────
export const getTierColor = tier =>
  ({ T1: '#10b981', T2: '#3b82f6', T3: '#8b5cf6', T4: '#f59e0b', T5: '#0047AB' }[tier] || '#94a3b8');
export const getScoreColor  = s => s >= 80 ? '#10b981' : s >= 60 ? '#3b82f6' : '#f59e0b';
export const getStatusColor = s => s === 'active' ? '#10b981' : '#94a3b8';
export const gradeLabel     = g => g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง';

// ── Main Hook ─────────────────────────────────────────────────────────────────
export function useAdminViewModel() {
  const [adminTab,  setAdminTab]  = useState('summary');
  const [users,     setUsers]     = useState(MOCK_USERS);
  const [skills,    setSkills]    = useState(() => {
    const q = { ...INITIAL_QUESTIONS };
    INITIAL_SKILLS.forEach(s => { if (!q[s.id]) q[s.id] = []; });
    return INITIAL_SKILLS;
  });
  const [questions, setQuestions] = useState(() => {
    const q = { ...INITIAL_QUESTIONS };
    INITIAL_SKILLS.forEach(s => { if (!q[s.id]) q[s.id] = []; });
    return q;
  });
  const [history]  = useState(MOCK_HISTORY);

  // ── Modal / panel state ──
  const [skillModal,     setSkillModal]     = useState(null);
  const [questionModal,  setQuestionModal]  = useState(null);
  const [userModal,      setUserModal]      = useState(null);
  const [qPanel,         setQPanel]         = useState(null);
  const [confirm,        setConfirm]        = useState(null);

  // ── Search / filter ──
  const [userSearch,  setUserSearch]  = useState('');
  const [skillSearch, setSkillSearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState({ user: 'all', grade: 'all' });

  // ── Skill CRUD ──
  const handleSkillSave = form => {
    const isNew = !form.id;
    if (isNew) {
      const newSkill = { ...form, id: Date.now(), userCount: 0, avgProgress: 0 };
      setSkills(prev => [...prev, newSkill]);
      setQuestions(prev => ({ ...prev, [newSkill.id]: [] }));
    } else {
      setSkills(prev => prev.map(s => s.id === form.id ? form : s));
    }
    setSkillModal(null);
  };

  const handleSkillDelete = s => {
    setConfirm({
      msg: `ลบ Skill "${s.name}" และโจทย์ทั้งหมดหรือไม่?`,
      onOk: () => {
        setSkills(prev => prev.filter(sk => sk.id !== s.id));
        setQuestions(prev => { const q = { ...prev }; delete q[s.id]; return q; });
        setConfirm(null);
        if (qPanel?.id === s.id) setQPanel(null);
      },
    });
  };

  const handleSkillToggle = id => {
    setSkills(prev => prev.map(s =>
      s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
    ));
  };

  // ── Question CRUD ──
  const handleQSave = (skillId, form) => {
    const isNew = !form.id;
    setQuestions(prev => {
      const q = { ...prev };
      if (isNew) {
        const newQ = { ...form, id: Date.now() };
        q[skillId] = [...(q[skillId] || []), newQ];
      } else {
        q[skillId] = (q[skillId] || []).map(x => x.id === form.id ? form : x);
      }
      return q;
    });
    setQuestionModal(null);
  };

  const handleQDelete = (skillId, q) => {
    setConfirm({
      msg: `ลบโจทย์ "${q.text.slice(0, 30)}..." หรือไม่?`,
      onOk: () => {
        setQuestions(prev => ({
          ...prev,
          [skillId]: prev[skillId].filter(x => x.id !== q.id),
        }));
        setConfirm(null);
      },
    });
  };

  const handleQToggle = (skillId, qId) => {
    setQuestions(prev => ({
      ...prev,
      [skillId]: prev[skillId].map(q =>
        q.id === qId ? { ...q, status: q.status === 'active' ? 'inactive' : 'active' } : q
      ),
    }));
  };

  // ── User toggle ──
  const handleUserToggle = id => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u
    ));
  };

  // ── Filtered lists ──
  const filteredUsers  = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );
  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase())
  );
  const filteredHistory = history.filter(h =>
    (historyFilter.user  === 'all' || h.user  === historyFilter.user)  &&
    (historyFilter.grade === 'all' || h.grade === historyFilter.grade)
  );
  const historyUsers  = ['all', ...Array.from(new Set(history.map(h => h.user)))];
  const historyGrades = ['all', 'great', 'good', 'low'];

  return {
    // State
    adminTab, users: filteredUsers, skills: filteredSkills, allSkills: skills,
    questions, history: filteredHistory, summary: SUMMARY,
    userSearch, skillSearch, historyFilter,
    historyUsers, historyGrades,
    // Modals
    skillModal, questionModal, userModal, qPanel, confirm,
    // Modal toggles
    openSkillModal:    s => setSkillModal(s || EMPTY_SKILL),
    closeSkillModal:   () => setSkillModal(null),
    openQModal:        q => setQuestionModal(q || EMPTY_QUESTION),
    closeQModal:       () => setQuestionModal(null),
    openUserModal:     u => setUserModal(u),
    closeUserModal:    () => setUserModal(null),
    openQPanel:        s => setQPanel(s),
    closeQPanel:       () => setQPanel(null),
    closeConfirm:      () => setConfirm(null),
    // Setters
    setAdminTab, setUserSearch, setSkillSearch, setHistoryFilter,
    // Handlers
    handleSkillSave, handleSkillDelete, handleSkillToggle,
    handleQSave, handleQDelete, handleQToggle, handleUserToggle,
    confirm, setConfirm,
    // Helpers
    getTierColor, getScoreColor, getStatusColor, gradeLabel,
  };
}
