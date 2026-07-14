import React, { useState } from 'react';
import "../decorate/Adminhome.css";
import { useNavigate } from 'react-router-dom';
import SummaryTab from './SummaryTab';
import UsersTab from './UsersTab';
import SkillTab from './SkillTab';
import HistoryTab from './HistoryTab';

// this is comment from dol naja
// ─── MOCK DATA ───
const MOCK_USERS = [
  { id: 1, name: 'Afdol leenud',  email: 'afdol.leenud@psu.ac.th', faculty: 'ICT', year: 2, goal: 'Data Structures', sessions: 12, avgScore: 74, streak: 4,  lastActive: '2026-03-11', status: 'active'   },
  { id: 2, name: 'Sirin Kaewkla', email: 'sirin.kaew@psu.ac.th',   faculty: 'ICT', year: 3, goal: 'Algorithms',      sessions: 8,  avgScore: 88, streak: 7,  lastActive: '2026-03-12', status: 'active'   },
  { id: 3, name: 'Napat Somboon', email: 'napat.som@psu.ac.th',    faculty: 'ENG', year: 1, goal: 'Python Basics',   sessions: 3,  avgScore: 55, streak: 1,  lastActive: '2026-03-08', status: 'inactive' },
  { id: 4, name: 'Ploy Rattana',  email: 'ploy.rat@psu.ac.th',     faculty: 'SCI', year: 2, goal: 'Data Structures', sessions: 20, avgScore: 92, streak: 14, lastActive: '2026-03-12', status: 'active'   },
  { id: 5, name: 'Krit Jaidee',   email: 'krit.jai@psu.ac.th',     faculty: 'ICT', year: 4, goal: 'Graph Theory',    sessions: 5,  avgScore: 61, streak: 2,  lastActive: '2026-03-09', status: 'inactive' },
];

const MOCK_SKILLS = [
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

const MOCK_QUESTIONS = {
  1: [
    { id: 101, text: 'Python คืออะไร?',                   diff: 'Easy',   status: 'active',   choices: ['ภาษาโปรแกรม', 'ระบบปฏิบัติการ', 'Database', 'Framework'], correct: 0 },
    { id: 102, text: 'เขียน Hello World ใน Python',       diff: 'Easy',   status: 'active',   choices: ['print("Hello World")', 'echo "Hello World"', 'printf("Hello World")', 'console.log("Hello World")'], correct: 0 },
    { id: 103, text: 'comment ใน Python ใช้สัญลักษณ์ใด?', diff: 'Easy',   status: 'inactive', choices: ['#', '//', '/*', '--'], correct: 0 },
  ],
  9: [
    { id: 901, text: 'Stack ใช้หลักการใด?',               diff: 'Easy',   status: 'active',   choices: ['FIFO', 'LIFO', 'FILO', 'Random'], correct: 1 },
    { id: 902, text: 'Queue ใช้หลักการใด?',               diff: 'Easy',   status: 'active',   choices: ['LIFO', 'FILO', 'FIFO', 'Random'], correct: 2 },
    { id: 903, text: 'deque ใน Python คืออะไร?',           diff: 'Medium', status: 'active',   choices: ['Double-ended queue', 'Stack only', 'Priority queue', 'Linked list'], correct: 0 },
    { id: 904, text: 'is_balanced ตรวจสอบอะไร?',          diff: 'Hard',   status: 'inactive', choices: ['bracket สมดุล', 'ความยาว string', 'เรียงลำดับ', 'นับตัวอักษร'], correct: 0 },
  ],
};
MOCK_SKILLS.forEach(s => { if (!MOCK_QUESTIONS[s.id]) MOCK_QUESTIONS[s.id] = []; });

const MOCK_HISTORY = [
  { id: 1, user: 'Afdol leenud',  skill: 'Stack & Queue',     date: '2026-03-11', score: 75, correct: 3, total: 4, grade: 'good'  },
  { id: 2, user: 'Sirin Kaewkla', skill: 'Python Basics',      date: '2026-03-12', score: 100,correct: 3, total: 3, grade: 'great' },
  { id: 3, user: 'Ploy Rattana',  skill: 'Variables & Types',  date: '2026-03-12', score: 92, correct: 4, total: 4, grade: 'great' },
  { id: 4, user: 'Napat Somboon', skill: 'Control Flow',       date: '2026-03-08', score: 50, correct: 2, total: 4, grade: 'low'   },
  { id: 5, user: 'Krit Jaidee',   skill: 'Functions',          date: '2026-03-09', score: 67, correct: 2, total: 3, grade: 'good'  },
  { id: 6, user: 'Afdol leenud',  skill: 'Python Basics',      date: '2026-03-10', score: 90, correct: 3, total: 3, grade: 'great' },
  { id: 7, user: 'Ploy Rattana',  skill: 'Recursion',          date: '2026-03-11', score: 100,correct: 4, total: 4, grade: 'great' },
  { id: 8, user: 'Sirin Kaewkla', skill: 'Stack & Queue',      date: '2026-03-10', score: 88, correct: 3, total: 4, grade: 'great' },
];

const SUMMARY = {
  totalUsers: 5, activeToday: 3, totalSessions: 142, avgScore: 74,
  topSkill: 'Python Basics', weekSessions: [8, 14, 11, 20, 16, 9, 18],
};

const TIERS = ['T1', 'T2', 'T3', 'T4', 'T5'];
const DIFFS = ['Easy', 'Easy+', 'Medium', 'Hard'];
const EMPTY_SKILL = { name: '', icon: '⭐', tier: 'T1', requires: [], userCount: 0, avgProgress: 0, status: 'active' };
const EMPTY_QUESTION = { text: '', diff: 'Easy', status: 'active', choices: ['', '', '', ''], correct: 0 };

// ─── HELPERS ───
function getTierColor(tier) {
  return { T1: '#10b981', T2: '#3b82f6', T3: '#8b5cf6', T4: '#f59e0b', T5: '#0047AB' }[tier] || '#94a3b8';
}
function getScoreColor(s) {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  return '#f59e0b';
}
function getStatusColor(s) { return s === 'active' ? '#10b981' : '#94a3b8'; }
function gradeLabel(g) { return g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง'; }

// ─── CONFIRM DIALOG ───
function ConfirmDialog({ msg, onOk, onCancel }) {
  return (
    <div className="ad-overlay" onClick={onCancel}>
      <div className="ad-confirm" onClick={e => e.stopPropagation()}>
        <div className="ad-confirm-icon">⚠️</div>
        <div className="ad-confirm-msg">{msg}</div>
        <div className="ad-confirm-btns">
          <button className="ad-btn-cancel" onClick={onCancel}>ยกเลิก</button>
          <button className="ad-btn-danger" onClick={onOk}>ยืนยัน ลบ</button>
        </div>
      </div>
    </div>
  );
}

// ─── SKILL MODAL ───
function SkillModal({ skill, allSkills, onSave, onClose }) {
  const [form, setForm] = useState({ ...skill });
  const isNew = !skill.id;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleReq = (id) => {
    const reqs = form.requires.includes(id) ? form.requires.filter(r => r !== id) : [...form.requires, id];
    set('requires', reqs);
  };
  const handleSave = () => {
    if (!form.name.trim()) return alert('กรุณากรอกชื่อ Skill');
    onSave(form);
  };
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">{isNew ? '➕ เพิ่ม Skill ใหม่' : `✏️ แก้ไข: ${skill.name}`}</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Icon</label>
              <input className="ad-input" value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={4} style={{ width: 72, textAlign: 'center', fontSize: 22 }} />
            </div>
            <div className="ad-field" style={{ flex: 1 }}>
              <label className="ad-label">ชื่อ Skill *</label>
              <input className="ad-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="เช่น Binary Search" />
            </div>
            <div className="ad-field">
              <label className="ad-label">Tier</label>
              <select className="ad-select" value={form.tier} onChange={e => set('tier', e.target.value)}>
                {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <select className="ad-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="ad-field">
            <label className="ad-label">Prerequisite Skills (requires)</label>
            <div className="ad-req-grid">
              {allSkills.filter(s => s.id !== skill.id).map(s => (
                <div key={s.id} className={`ad-req-chip ${form.requires.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleReq(s.id)}>
                  {s.icon} {s.name}
                </div>
              ))}
              {allSkills.filter(s => s.id !== skill.id).length === 0 && <span className="ad-muted">ไม่มี Skill อื่น</span>}
            </div>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="ad-btn-primary" onClick={handleSave}>{isNew ? '➕ เพิ่ม Skill' : '💾 บันทึก'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── QUESTION MODAL ───
function QuestionModal({ question, onSave, onClose }) {
  const [form, setForm] = useState({ ...question, choices: [...question.choices] });
  const isNew = !question.id;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setChoice = (i, v) => {
    const choices = [...form.choices];
    choices[i] = v;
    setForm(f => ({ ...f, choices }));
  };
  const handleSave = () => {
    if (!form.text.trim()) return alert('กรุณากรอกคำถาม');
    if (form.choices.some(c => !c.trim())) return alert('กรุณากรอกตัวเลือกให้ครบ');
    onSave(form);
  };
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">{isNew ? '➕ เพิ่มโจทย์ใหม่' : '✏️ แก้ไขโจทย์'}</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">คำถาม *</label>
            <textarea className="ad-input ad-textarea" value={form.text} onChange={e => set('text', e.target.value)} placeholder="เช่น Stack ใช้หลักการใด?" rows={3} />
          </div>
          <div className="ad-field-row">
            <div className="ad-field" style={{ flex: 1 }}>
              <label className="ad-label">ระดับความยาก</label>
              <select className="ad-select" value={form.diff} onChange={e => set('diff', e.target.value)}>
                {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <select className="ad-select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="ad-field">
            <label className="ad-label">ตัวเลือก (เลือกตัวที่ถูกต้อง)</label>
            <div className="ad-choices-edit">
              {form.choices.map((c, i) => (
                <div key={i} className="ad-choice-row">
                  <div className={`ad-choice-letter ${form.correct === i ? 'correct' : ''}`} onClick={() => set('correct', i)}>
                    {['A', 'B', 'C', 'D'][i]}
                  </div>
                  <input className="ad-input" style={{ flex: 1 }} value={c} onChange={e => setChoice(i, e.target.value)} placeholder={`ตัวเลือก ${['A','B','C','D'][i]}`} />
                  {form.correct === i && <span className="ad-correct-mark">✓ ถูก</span>}
                </div>
              ))}
            </div>
            <p className="ad-hint-text">💡 คลิกที่ตัวอักษร A / B / C / D เพื่อเลือกคำตอบที่ถูกต้อง</p>
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
          <button className="ad-btn-primary" onClick={handleSave}>{isNew ? '➕ เพิ่มโจทย์' : '💾 บันทึก'}</button>
        </div>
      </div>
    </div>
  );
}

// ─── USER MODAL ───
function UserModal({ user, onClose }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">👤 ข้อมูลผู้ใช้</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body">
          <div className="ad-user-hero">
            <div className="ad-user-avatar-lg">{user.name[0]}</div>
            <div>
              <div className="ad-user-name-lg">{user.name}</div>
              <div className="ad-user-email-lg">{user.email}</div>
              <span className="ad-status-badge" style={{ background: user.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: getStatusColor(user.status), border: `1px solid ${getStatusColor(user.status)}40` }}>
                {user.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
              </span>
            </div>
          </div>
          <div className="ad-info-grid">
            {[
              { label: 'คณะ',         value: user.faculty        },
              { label: 'ชั้นปี',       value: `ปี ${user.year}`   },
              { label: 'เป้าหมาย',    value: user.goal           },
              { label: 'Sessions',    value: user.sessions       },
              { label: 'Avg Score',   value: `${user.avgScore}%` },
              { label: 'Streak',      value: `${user.streak} วัน`},
              { label: 'ใช้งานล่าสุด', value: user.lastActive    },
            ].map((r, i) => (
              <div key={i} className="ad-info-row">
                <span className="ad-info-label">{r.label}</span>
                <span className="ad-info-value">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-primary" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}

// ─── SKILL QUESTIONS PANEL ───
function SkillQuestionsPanel({ skill, questions, onClose, onAdd, onEdit, onToggle, onDelete }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">{skill.icon} โจทย์ของ: {skill.name}</span>
          <button className="ad-icon-btn" onClick={onClose}>✕</button>
        </div>
        <div className="ad-modal-body" style={{ gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
            <span className="ad-muted">โจทย์ทั้งหมด {questions.length} ข้อ</span>
            <button className="ad-btn-primary" style={{ padding: '7px 14px', fontSize: 12 }} onClick={onAdd}>
              ➕ เพิ่มโจทย์
            </button>
          </div>
          {questions.length === 0 && (
            <div className="ad-empty-state">ยังไม่มีโจทย์ กด ➕ เพื่อเพิ่ม</div>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="ad-q-item">
              <div className="ad-q-head">
                <span className="ad-q-num">ข้อ {i + 1}</span>
                <span className={`ad-diff-tag ad-diff-${q.diff.toLowerCase().replace('+','p')}`}>{q.diff}</span>
                <span className="ad-q-status" style={{ color: getStatusColor(q.status) }}>
                  {q.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  <button className="ad-btn-sm ad-btn-view" onClick={() => onEdit(q)}>✏️ แก้ไข</button>
                  <button className="ad-btn-sm ad-btn-toggle" onClick={() => onToggle(q.id)}>
                    {q.status === 'active' ? '🔴 ระงับ' : '🟢 เปิดใช้'}
                  </button>
                  <button className="ad-btn-sm ad-btn-del" onClick={() => onDelete(q)}>🗑</button>
                </div>
              </div>
              <div className="ad-q-text">{q.text}</div>
              <div className="ad-q-choices">
                {q.choices.map((c, ci) => (
                  <span key={ci} className={`ad-q-choice ${ci === q.correct ? 'correct' : ''}`}>
                    {['A','B','C','D'][ci]}. {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="ad-modal-footer">
          <button className="ad-btn-cancel" onClick={onClose}>ปิด</button>
        </div>
      </div>
    </div>
  );
}

// ─── TABS ───
const TABS = [
  { key: 'summary', label: ' สรุปภาพรวม'   },
  { key: 'users',   label: ' ผู้ใช้งาน'     },
  { key: 'skills',  label: ' จัดการ Skill'  },
  { key: 'history', label: ' ประวัติโจทย์'  },
];

// ─── MAIN ───
export default function AdminHome() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  // Users
  const [users, setUsers] = useState(MOCK_USERS);
  const [userSearch, setUserSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  // Skills
  const [skills, setSkills] = useState(MOCK_SKILLS);
  const [skillSearch, setSkillSearch] = useState('');
  const [editSkill, setEditSkill] = useState(null);
  const [deleteSkill, setDeleteSkill] = useState(null);

  // Questions
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [viewSkillQ, setViewSkillQ] = useState(null);     // skill ที่กำลังดูโจทย์
  const [editQuestion, setEditQuestion] = useState(null); // { skillId, question }
  const [deleteQuestion, setDeleteQuestion] = useState(null); // { skillId, question }

  // History
  const [history] = useState(MOCK_HISTORY);
  const [histSearch, setHistSearch] = useState('');
  const [histGrade, setHistGrade] = useState('all');

  // ── User handlers ──
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.faculty.toLowerCase().includes(userSearch.toLowerCase())
  );
  const toggleUserStatus = (id) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u));
  const deleteUser = (id) => setUsers(prev => prev.filter(u => u.id !== id));

  // ── Skill handlers ──
  const filteredSkills = skills.filter(s =>
    s.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
    s.tier.toLowerCase().includes(skillSearch.toLowerCase())
  );
  const handleSaveSkill = (form) => {
    if (form.id) {
      setSkills(prev => prev.map(s => s.id === form.id ? { ...s, ...form } : s));
    } else {
      const newId = Math.max(...skills.map(s => s.id)) + 1;
      setSkills(prev => [...prev, { ...form, id: newId }]);
      setQuestions(prev => ({ ...prev, [newId]: [] }));
    }
    setEditSkill(null);
  };
  const handleDeleteSkill = () => {
    setSkills(prev => prev.filter(s => s.id !== deleteSkill.id));
    setDeleteSkill(null);
  };
  const toggleSkillStatus = (id) => setSkills(prev => prev.map(s => s.id === id ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s));

  // ── Question handlers ──
  const getSkillQuestions = (skillId) => questions[skillId] || [];

  const handleSaveQuestion = ({ skillId, form }) => {
    setQuestions(prev => {
      const list = prev[skillId] || [];
      if (form.id) {
        return { ...prev, [skillId]: list.map(q => q.id === form.id ? { ...q, ...form } : q) };
      } else {
        const newId = Date.now();
        return { ...prev, [skillId]: [...list, { ...form, id: newId }] };
      }
    });
    setEditQuestion(null);
  };

  const toggleQuestionStatus = (skillId, qId) => {
    setQuestions(prev => ({
      ...prev,
      [skillId]: prev[skillId].map(q => q.id === qId ? { ...q, status: q.status === 'active' ? 'inactive' : 'active' } : q)
    }));
  };

  const handleDeleteQuestion = () => {
    const { skillId, question } = deleteQuestion;
    setQuestions(prev => ({ ...prev, [skillId]: prev[skillId].filter(q => q.id !== question.id) }));
    setDeleteQuestion(null);
  };

  // ── History filter ──
  const filteredHistory = history.filter(h => {
    const matchSearch = h.user.toLowerCase().includes(histSearch.toLowerCase()) || h.skill.toLowerCase().includes(histSearch.toLowerCase());
    const matchGrade  = histGrade === 'all' || h.grade === histGrade;
    return matchSearch && matchGrade;
  });

  // ── Bar chart ──
  const maxBar = Math.max(...SUMMARY.weekSessions);
  const dayLabels = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา'];

  return (
    <div className="ad-app">

      {/* ── NAVBAR ── */}
      <nav className="ad-nav">
        <div className="ad-nav-logo">
          <div className="ad-nav-icon">⚡</div>
          <span className="ad-nav-brand">G06 · ALS</span>
          <span className="ad-nav-badge">Admin</span>
        </div>
        <div className="ad-nav-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`ad-nav-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="ad-nav-logout" onClick={() => navigate('/')}>🚪 ออกจากระบบ</button>
      </nav>

      {/* ── MAIN ── */}
      <main className="ad-main">

        {/* ══ SUMMARY ══ */}
        {activeTab === 'summary' && (
          <SummaryTab 
            SUMMARY={SUMMARY}
            skills={skills}
            users={users}
            getTierColor={getTierColor}
            getScoreColor={getScoreColor}
            getStatusColor={getStatusColor}
            maxBar={maxBar}
            dayLabels={dayLabels}
          />
        )}
        
        {/* ══ USERS ══ */}
        {activeTab === 'users' && (
          <UsersTab 
            users={users}
            userSearch={userSearch}
            setUserSearch={setUserSearch}
            filteredUsers={filteredUsers}
            getScoreColor={getScoreColor}
            getStatusColor={getStatusColor}
            setViewUser={setViewUser}
            toggleUserStatus={toggleUserStatus}
            deleteUser={deleteUser}
          />
        )}
        
        {/* ══ SKILLS ══ */}
        {activeTab === 'skills' && (
          <SkillTab 
            skills={skills}
            skillSearch={skillSearch}
            setSkillSearch={setSkillSearch}
            setEditSkill={setEditSkill}
            EMPTY_SKILL={EMPTY_SKILL}
            filteredSkills={filteredSkills}
            getTierColor={getTierColor}
            getStatusColor={getStatusColor}
            getSkillQuestions={getSkillQuestions}
            setViewSkillQ={setViewSkillQ}
            toggleSkillStatus={toggleSkillStatus}
            setDeleteSkill={setDeleteSkill}
          />
        )}

        {/* ══ HISTORY ══ */}
        {activeTab === 'history' && (
          <HistoryTab 
            filteredHistory={filteredHistory}
            histSearch={histSearch}
            setHistSearch={setHistSearch}
            histGrade={histGrade}
            setHistGrade={setHistGrade}
            gradeLabel={gradeLabel}
            getScoreColor={getScoreColor}
          />
        )}
      </main>

      {/* ── MODALS ── */}
      {viewUser && <UserModal user={viewUser} onClose={() => setViewUser(null)} />}

      {editSkill && (
        <SkillModal skill={editSkill} allSkills={skills} onSave={handleSaveSkill} onClose={() => setEditSkill(null)} />
      )}

      {deleteSkill && (
        <ConfirmDialog msg={`ต้องการลบ Skill "${deleteSkill.name}" ออกจากระบบใช่ไหม?`} onOk={handleDeleteSkill} onCancel={() => setDeleteSkill(null)} />
      )}

      {viewSkillQ && !editQuestion && !deleteQuestion && (
        <SkillQuestionsPanel
          skill={viewSkillQ}
          questions={getSkillQuestions(viewSkillQ.id)}
          onClose={() => setViewSkillQ(null)}
          onAdd={() => setEditQuestion({ skillId: viewSkillQ.id, question: { ...EMPTY_QUESTION, choices: ['', '', '', ''] } })}
          onEdit={(q) => setEditQuestion({ skillId: viewSkillQ.id, question: { ...q } })}
          onToggle={(qId) => toggleQuestionStatus(viewSkillQ.id, qId)}
          onDelete={(q) => setDeleteQuestion({ skillId: viewSkillQ.id, question: q })}
        />
      )}

      {editQuestion && (
        <QuestionModal
          question={editQuestion.question}
          onSave={(form) => handleSaveQuestion({ skillId: editQuestion.skillId, form })}
          onClose={() => setEditQuestion(null)}
        />
      )}

      {deleteQuestion && (
        <ConfirmDialog
          msg={`ต้องการลบโจทย์ "${deleteQuestion.question.text.slice(0, 30)}..." ใช่ไหม?`}
          onOk={handleDeleteQuestion}
          onCancel={() => setDeleteQuestion(null)}
        />
      )}
    </div>
  );
}