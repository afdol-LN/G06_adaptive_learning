import React, { useState } from 'react';
import './decorate/AdminHome.css';
import { useNavigate } from 'react-router-dom';
// ============================================================================
// ─── DATA REQUIREMENTS & SCHEMA DOCUMENTATION (สำหรับเชื่อมต่อ API / Backend) ───
// ============================================================================
// ด้านล่างคือรายละเอียดโครงสร้างข้อมูลที่แต่ละส่วนในหน้า Admin Home ต้องการใช้
// ทีมพัฒนาสามารถเชื่อมต่อ API เพื่อดึงข้อมูลมาแทนที่ State พื้นฐานของแต่ละส่วนได้
//
// 1. สถิติภาพรวมระบบ (Summary Overview Data) - ใช้ในแท็บ "สรุปภาพรวม"
//    โครงสร้าง Object ที่ต้องการ:
//    {
//      totalUsers: number,     // จำนวนผู้ใช้งานทั้งหมดในระบบ
//      activeToday: number,    // จำนวนผู้ใช้ที่เข้าใช้งานวันนี้
//      totalSessions: number,  // จำนวนการฝึกฝน / เซสชันทั้งหมด
//      avgScore: number,       // คะแนนเฉลี่ยรวมของผู้เรียน (%)
//      topSkill: string,       // ชื่อ Skill ที่ได้รับความนิยมสูงสุด
//      weekSessions: number[]  // จำนวนเซสชัน 7 วันล่าสุด [จันทร์, อังคาร, พุธ, พฤหัส, ศุกร์, เสาร์, อาทิตย์]
//    }
//
// 2. ข้อมูลผู้ใช้งาน (Users Data) - ใช้ในแท็บ "ผู้ใช้งาน" และตารางกิจกรรมล่าสุด
//    โครงสร้าง Array<User> โดยแต่ละ User Object ประกอบด้วย:
//    {
//      id: number | string,    // รหัสผู้ใช้
//      name: string,           // ชื่อ-นามสกุล
//      email: string,          // อีเมลผู้ใช้
//      faculty: string,        // คณะ (เช่น 'ICT', 'ENG', 'SCI')
//      year: number,           // ชั้นปี
//      goal: string,           // เป้าหมายการเรียนรู้ปัจจุบัน
//      sessions: number,       // จำนวนรอบที่เข้าฝึกฝน
//      avgScore: number,       // คะแนนเฉลี่ยของผู้ใช้ (%)
//      streak: number,         // จำนวนวันต่อเนื่องที่เข้าใช้งาน
//      lastActive: string,     // วันที่เข้าใช้งานล่าสุด (YYYY-MM-DD)
//      status: 'active' | 'inactive' // สถานะบัญชี
//    }
//
// 3. ข้อมูลทักษะ / บทเรียน (Skills Data) - ใช้ในแท็บ "จัดการ Skill" และความคืบหน้า Skill
//    โครงสร้าง Array<Skill> โดยแต่ละ Skill Object ประกอบด้วย:
//    {
//      id: number | string,    // รหัส Skill
//      name: string,           // ชื่อ Skill
//      icon: string,           // ไอคอน (Emoji)
//      tier: string,           // ระดับ Tier ('T1', 'T2', 'T3', 'T4', 'T5')
//      requires: number[],     // รายการ id ของ Skill ที่เป็น prerequisite
//      userCount: number,      // จำนวนผู้เรียนที่กำลังฝึก Skill นี้
//      avgProgress: number,    // ความคืบหน้าเฉลี่ย (%)
//      status: 'active' | 'inactive' // สถานะการเปิดใช้งาน
//    }
//
// 4. ข้อมูลคลังโจทย์ (Questions Data) - ใช้เมื่อคลิกดู/จัดการโจทย์ในแต่ละ Skill
//    โครงสร้าง Object Map { [skillId: number]: Array<Question> } โดยแต่ละ Question ประกอบด้วย:
//    {
//      id: number | string,    // รหัสคำถาม
//      text: string,           // ข้อความคำถาม
//      diff: 'Easy' | 'Easy+' | 'Medium' | 'Hard', // ระดับความยาก
//      status: 'active' | 'inactive',              // สถานะโจทย์
//      choices: string[],      // ตัวเลือก 4 ข้อ [A, B, C, D]
//      correct: number         // index ของข้อที่ถูกต้อง (0=A, 1=B, 2=C, 3=D)
//    }
//
// 5. ประวัติการทำโจทย์ (Attempt History Data) - ใช้ในแท็บ "ประวัติโจทย์"
//    โครงสร้าง Array<AttemptLog> โดยแต่ละ Object ประกอบด้วย:
//    {
//      id: number | string,    // รหัสประวัติ
//      user: string,           // ชื่อผู้ทำโจทย์
//      skill: string,          // ชื่อทักษะที่ทำ
//      date: string,           // วันที่ทำโจทย์ (YYYY-MM-DD)
//      score: number,          // คะแนนร้อยละ (%)
//      correct: number,        // จำนวนข้อที่ถูก
//      total: number,          // จำนวนข้อทั้งหมด
//      grade: 'great' | 'good' | 'low' // เกณฑ์ประเมิน
//    }
// ============================================================================

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

// // ─── SKILL MODAL ───
// function SkillModal({ skill, allSkills, onSave, onClose }) {
//   const [form, setForm] = useState({ ...skill });
//   const isNew = !skill.id;
//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
//   const toggleReq = (id) => {
//     const reqs = form.requires.includes(id) ? form.requires.filter(r => r !== id) : [...form.requires, id];
//     set('requires', reqs);
//   };
//   const handleSave = () => {
//     if (!form.name.trim()) return alert('กรุณากรอกชื่อ Skill');
//     onSave(form);
//   };
//   return (
//     <div className="ad-overlay" onClick={onClose}>
//       <div className="ad-modal" onClick={e => e.stopPropagation()}>
//         <div className="ad-modal-header">
//           <span className="ad-modal-title">{isNew ? '➕ เพิ่ม Skill ใหม่' : `✏️ แก้ไข: ${skill.name}`}</span>
//           <button className="ad-icon-btn" onClick={onClose}>✕</button>
//         </div>
//         <div className="ad-modal-body">
//           <div className="ad-field-row">
//             <div className="ad-field">
//               <label className="ad-label">Icon</label>
//               <input className="ad-input" value={form.icon} onChange={e => set('icon', e.target.value)} maxLength={4} style={{ width: 72, textAlign: 'center', fontSize: 22 }} />
//             </div>
//             <div className="ad-field" style={{ flex: 1 }}>
//               <label className="ad-label">ชื่อ Skill *</label>
//               <input className="ad-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="เช่น Binary Search" />
//             </div>
//             <div className="ad-field">
//               <label className="ad-label">Tier</label>
//               <select className="ad-select" value={form.tier} onChange={e => set('tier', e.target.value)}>
//                 {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
//               </select>
//             </div>
//             <div className="ad-field">
//               <label className="ad-label">สถานะ</label>
//               <select className="ad-select" value={form.status} onChange={e => set('status', e.target.value)}>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
//           <div className="ad-field">
//             <label className="ad-label">Prerequisite Skills (requires)</label>
//             <div className="ad-req-grid">
//               {allSkills.filter(s => s.id !== skill.id).map(s => (
//                 <div key={s.id} className={`ad-req-chip ${form.requires.includes(s.id) ? 'selected' : ''}`} onClick={() => toggleReq(s.id)}>
//                   {s.icon} {s.name}
//                 </div>
//               ))}
//               {allSkills.filter(s => s.id !== skill.id).length === 0 && <span className="ad-muted">ไม่มี Skill อื่น</span>}
//             </div>
//           </div>
//         </div>
//         <div className="ad-modal-footer">
//           <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
//           <button className="ad-btn-primary" onClick={handleSave}>{isNew ? '➕ เพิ่ม Skill' : '💾 บันทึก'}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── QUESTION MODAL ───
// function QuestionModal({ question, onSave, onClose }) {
//   const [form, setForm] = useState({ ...question, choices: [...question.choices] });
//   const isNew = !question.id;
//   const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
//   const setChoice = (i, v) => {
//     const choices = [...form.choices];
//     choices[i] = v;
//     setForm(f => ({ ...f, choices }));
//   };
//   const handleSave = () => {
//     if (!form.text.trim()) return alert('กรุณากรอกคำถาม');
//     if (form.choices.some(c => !c.trim())) return alert('กรุณากรอกตัวเลือกให้ครบ');
//     onSave(form);
//   };
//   return (
//     <div className="ad-overlay" onClick={onClose}>
//       <div className="ad-modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
//         <div className="ad-modal-header">
//           <span className="ad-modal-title">{isNew ? '➕ เพิ่มโจทย์ใหม่' : '✏️ แก้ไขโจทย์'}</span>
//           <button className="ad-icon-btn" onClick={onClose}>✕</button>
//         </div>
//         <div className="ad-modal-body">
//           <div className="ad-field">
//             <label className="ad-label">คำถาม *</label>
//             <textarea className="ad-input ad-textarea" value={form.text} onChange={e => set('text', e.target.value)} placeholder="เช่น Stack ใช้หลักการใด?" rows={3} />
//           </div>
//           <div className="ad-field-row">
//             <div className="ad-field" style={{ flex: 1 }}>
//               <label className="ad-label">ระดับความยาก</label>
//               <select className="ad-select" value={form.diff} onChange={e => set('diff', e.target.value)}>
//                 {DIFFS.map(d => <option key={d} value={d}>{d}</option>)}
//               </select>
//             </div>
//             <div className="ad-field">
//               <label className="ad-label">สถานะ</label>
//               <select className="ad-select" value={form.status} onChange={e => set('status', e.target.value)}>
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//               </select>
//             </div>
//           </div>
//           <div className="ad-field">
//             <label className="ad-label">ตัวเลือก (เลือกตัวที่ถูกต้อง)</label>
//             <div className="ad-choices-edit">
//               {form.choices.map((c, i) => (
//                 <div key={i} className="ad-choice-row">
//                   <div className={`ad-choice-letter ${form.correct === i ? 'correct' : ''}`} onClick={() => set('correct', i)}>
//                     {['A', 'B', 'C', 'D'][i]}
//                   </div>
//                   <input className="ad-input" style={{ flex: 1 }} value={c} onChange={e => setChoice(i, e.target.value)} placeholder={`ตัวเลือก ${['A','B','C','D'][i]}`} />
//                   {form.correct === i && <span className="ad-correct-mark">✓ ถูก</span>}
//                 </div>
//               ))}
//             </div>
//             <p className="ad-hint-text">💡 คลิกที่ตัวอักษร A / B / C / D เพื่อเลือกคำตอบที่ถูกต้อง</p>
//           </div>
//         </div>
//         <div className="ad-modal-footer">
//           <button className="ad-btn-cancel" onClick={onClose}>ยกเลิก</button>
//           <button className="ad-btn-primary" onClick={handleSave}>{isNew ? '➕ เพิ่มโจทย์' : '💾 บันทึก'}</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// ─── USER MODAL ───
function UserModal({ user, onClose }) {
  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={e => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">ข้อมูลผู้ใช้</span>
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
              { label: 'ชื่อ', value: user.name },
              { label: 'คณะ', value: user.faculty },
              { label: 'ชั้นปี', value: `ปี ${user.year}` },
              // { label: 'เป้าหมาย',    value: user.goal           },
              // { label: 'Sessions',    value: user.sessions       },
              // { label: 'Avg Score',   value: `${user.avgScore}%` },
              // { label: 'Streak',      value: `${user.streak} วัน`},
              { label: 'ตำแหน่ง', value: user.role },
              { label: 'ใช้งานล่าสุด', value: user.lastActive },
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

  // ─── 1. สรุปภาพรวม (Summary State) ───
  // ต้องการข้อมูล Object: { totalUsers, activeToday, totalSessions, avgScore, topSkill, weekSessions: number[] }
  const [summary, setSummary] = useState({
    totalUsers: 0,
    activeToday: 0,
    totalSessions: 0,
    avgScore: 0,
    topSkill: '-',
    weekSessions: [0, 0, 0, 0, 0, 0, 0],
  });

  // ─── 2. ผู้ใช้งาน (Users State) ───
  // ต้องการข้อมูล Array<User>: [{ id, name, email, faculty, year, goal, sessions, avgScore, streak, lastActive, status }]
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [viewUser, setViewUser] = useState(null);

  // ─── 3. ทักษะ/บทเรียน (Skills State) ───
  // ต้องการข้อมูล Array<Skill>: [{ id, name, icon, tier, requires, userCount, avgProgress, status }]
  const [skills, setSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [editSkill, setEditSkill] = useState(null);
  const [deleteSkill, setDeleteSkill] = useState(null);

  // ─── 4. คำถาม/โจทย์ (Questions State) ───
  // ต้องการข้อมูล Object Map: { [skillId]: Array<{ id, text, diff, status, choices, correct }> }
  const [questions, setQuestions] = useState({});
  const [viewSkillQ, setViewSkillQ] = useState(null);     // skill ที่กำลังดูโจทย์
  const [editQuestion, setEditQuestion] = useState(null); // { skillId, question }
  const [deleteQuestion, setDeleteQuestion] = useState(null); // { skillId, question }

  // ─── 5. ประวัติการทำโจทย์ (History State) ───
  // ต้องการข้อมูล Array<AttemptLog>: [{ id, user, skill, date, score, correct, total, grade }]
  const [history] = useState([]);
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
  const maxBar = Math.max(...summary.weekSessions, 1);
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
          <div className="ad-tab-summary">
            <div className="ad-page-header">
              <h1 className="ad-page-title">📊 สรุปภาพรวมระบบ</h1>
              <span className="ad-page-sub">ข้อมูล ณ วันที่ 12 มี.ค. 2026</span>
            </div>
            <div className="ad-kpi-grid">
              {[
                { label: 'ผู้ใช้ทั้งหมด',    value: summary.totalUsers,     icon: '👥', color: '#0047AB' },
                { label: 'Active วันนี้',    value: summary.activeToday,    icon: '🟢', color: '#10b981' },
                { label: 'Sessions ทั้งหมด', value: summary.totalSessions,  icon: '📋', color: '#8b5cf6' },
                { label: 'คะแนนเฉลี่ย',      value: `${summary.avgScore}%`, icon: '🎯', color: '#f59e0b' },
                { label: 'Skills ในระบบ',    value: skills.length,          icon: '🌳', color: '#3b82f6' },
                { label: 'Skill ยอดนิยม',    value: summary.topSkill,       icon: '🏆', color: '#0047AB' },
              ].map((k, i) => (
                <div key={i} className="ad-kpi-card">
                  <div className="ad-kpi-icon" style={{ background: `${k.color}15`, color: k.color }}>{k.icon}</div>
                  <div className="ad-kpi-info">
                    <div className="ad-kpi-value" style={{ color: k.color }}>{k.value}</div>
                    <div className="ad-kpi-label">{k.label}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="ad-chart-row">
              <div className="ad-card">
                <div className="ad-card-title">📅 Sessions รายวัน (สัปดาห์นี้)</div>
                <div className="ad-bar-chart">
                  {summary.weekSessions.map((v, i) => (
                    <div key={i} className="ad-bar-col">
                      <div className="ad-bar-val">{v}</div>
                      <div className="ad-bar-wrap">
                        <div className="ad-bar-fill" style={{ height: `${(v / maxBar) * 100}%` }} />
                      </div>
                      <div className="ad-bar-lbl">{dayLabels[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="ad-card">
                <div className="ad-card-title">🌳 ความคืบหน้า Skill (Top 6)</div>
                <div className="ad-skill-progress-list">
                  {skills.length === 0 && (
                    <div className="ad-empty-state" style={{ padding: 24, textAlign: 'center', color: 'var(--muted)' }}>
                      ยังไม่มีข้อมูล Skill ในระบบ
                    </div>
                  )}
                  {[...skills].sort((a, b) => b.avgProgress - a.avgProgress).slice(0, 6).map(s => (
                    <div key={s.id} className="ad-sp-row">
                      <span className="ad-sp-icon">{s.icon}</span>
                      <span className="ad-sp-name">{s.name}</span>
                      <div className="ad-sp-bar-wrap">
                        <div className="ad-sp-bar" style={{ width: `${s.avgProgress}%`, background: getTierColor(s.tier) }} />
                      </div>
                      <span className="ad-sp-pct" style={{ color: getTierColor(s.tier) }}>{s.avgProgress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="ad-card">
              <div className="ad-card-title">👥 กิจกรรมผู้ใช้ล่าสุด</div>
              <table className="ad-table">
                <thead><tr><th>ผู้ใช้</th><th>คณะ</th><th>Sessions</th><th>Avg Score</th><th>Streak</th><th>ใช้งานล่าสุด</th><th>สถานะ</th></tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div className="ad-user-cell">
                          <div className="ad-avatar-sm">{u.name[0]}</div>
                          <div><div className="ad-user-name-sm">{u.name}</div><div className="ad-user-email-sm">{u.email}</div></div>
                        </div>
                      </td>
                      <td><span className="ad-faculty-tag">{u.faculty}</span></td>
                      <td><span className="ad-mono">{u.sessions}</span></td>
                      <td><span className="ad-score" style={{ color: getScoreColor(u.avgScore) }}>{u.avgScore}%</span></td>
                      <td><span className="ad-mono">🔥 {u.streak}</span></td>
                      <td><span className="ad-muted">{u.lastActive}</span></td>
                      <td><span className="ad-status-dot" style={{ background: getStatusColor(u.status) }} /><span className="ad-muted">{u.status}</span></td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                        ยังไม่มีข้อมูลกิจกรรมผู้ใช้งานล่าสุด
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ USERS ══ */}
        {activeTab === 'users' && (
          <div className="ad-tab-users">
            <div className="ad-page-header">
              <h1 className="ad-page-title">👥 จัดการผู้ใช้งาน</h1>
              <span className="ad-page-sub">ผู้ใช้ทั้งหมด {users.length} คน</span>
            </div>
            <div className="ad-toolbar">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">🔍</span>
                <input className="ad-search" placeholder="ค้นหาชื่อ, อีเมล, คณะ..." value={userSearch} onChange={e => setUserSearch(e.target.value)} />
              </div>
              <div className="ad-toolbar-info">พบ <strong>{filteredUsers.length}</strong> รายการ</div>
            </div>
            <div className="ad-user-grid">
              {filteredUsers.map(u => (
                <div key={u.id} className="ad-user-card">
                  <div className="ad-user-card-top">
                    <div className="ad-avatar-md">{u.name[0]}</div>
                    <div className="ad-user-card-info">
                      <div className="ad-user-card-name">{u.name}</div>
                      <div className="ad-user-card-email">{u.email}</div>
                      <span className="ad-status-badge" style={{ background: u.status === 'active' ? '#ecfdf5' : '#f1f5f9', color: getStatusColor(u.status), border: `1px solid ${getStatusColor(u.status)}40` }}>
                        {u.status === 'active' ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="ad-user-card-stats">
                    <div className="ad-stat-mini"><div className="ad-stat-mini-val">{u.sessions}</div><div className="ad-stat-mini-lbl">Sessions</div></div>
                    <div className="ad-stat-mini"><div className="ad-stat-mini-val" style={{ color: getScoreColor(u.avgScore) }}>{u.avgScore}%</div><div className="ad-stat-mini-lbl">Avg Score</div></div>
                    <div className="ad-stat-mini"><div className="ad-stat-mini-val">🔥{u.streak}</div><div className="ad-stat-mini-lbl">Streak</div></div>
                  </div>
                  <div className="ad-user-card-meta">
                    <span>🏫 {u.faculty} ปี {u.year}</span>
                    <span>🎯 {u.goal}</span>
                  </div>
                  <div className="ad-user-card-actions">
                    <button className="ad-btn-sm ad-btn-view" onClick={() => setViewUser(u)}>👁 ดูข้อมูล</button>
                    <button className="ad-btn-sm ad-btn-toggle" onClick={() => toggleUserStatus(u.id)}>
                      {u.status === 'active' ? '🔴 ระงับ' : '🟢 เปิดใช้'}
                    </button>
                    <button className="ad-btn-sm ad-btn-del" onClick={() => { if (window.confirm(`ลบผู้ใช้ "${u.name}"?`)) deleteUser(u.id); }}>🗑 ลบ</button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="ad-empty-state" style={{ padding: 48, textAlign: 'center', color: 'var(--muted)', gridColumn: '1 / -1' }}>
                  ไม่พบข้อมูลผู้ใช้งาน
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══ SKILLS ══ */}
        {activeTab === 'skills' && (
          <div className="ad-tab-skills">
            <div className="ad-page-header">
              <h1 className="ad-page-title">🌳 จัดการ Skill</h1>
              <span className="ad-page-sub">Skill ทั้งหมด {skills.length} รายการ</span>
            </div>
            <div className="ad-toolbar">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">🔍</span>
                <input className="ad-search" placeholder="ค้นหาชื่อ Skill, Tier..." value={skillSearch} onChange={e => setSkillSearch(e.target.value)} />
              </div>
              <button className="ad-btn-primary ad-btn-add" onClick={() => setEditSkill({ ...EMPTY_SKILL })}>➕ เพิ่ม Skill ใหม่</button>
            </div>
            <div className="ad-card">
              <table className="ad-table">
                <thead>
                  <tr><th>Skill</th><th>Tier</th><th>สถานะ</th><th>Requires</th><th>ผู้ใช้</th><th>Avg Progress</th><th>โจทย์</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredSkills.map(s => (
                    <tr key={s.id}>
                      <td>
                        <div className="ad-skill-cell">
                          <span className="ad-skill-icon">{s.icon}</span>
                          <span className="ad-skill-name">{s.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="ad-tier-badge" style={{ background: `${getTierColor(s.tier)}18`, color: getTierColor(s.tier), border: `1px solid ${getTierColor(s.tier)}40` }}>{s.tier}</span>
                      </td>
                      <td>
                        <span className="ad-status-dot" style={{ background: getStatusColor(s.status) }} />
                        <span className="ad-muted">{s.status}</span>
                      </td>
                      <td>
                        <div className="ad-req-tags">
                          {s.requires.length === 0
                            ? <span className="ad-muted">—</span>
                            : s.requires.map(rid => { const rs = skills.find(x => x.id === rid); return rs ? <span key={rid} className="ad-req-tag">{rs.icon} {rs.name}</span> : null; })
                          }
                        </div>
                      </td>
                      <td><span className="ad-mono">{s.userCount}</span></td>
                      <td>
                        <div className="ad-prog-cell">
                          <div className="ad-prog-track"><div className="ad-prog-fill" style={{ width: `${s.avgProgress}%`, background: getTierColor(s.tier) }} /></div>
                          <span className="ad-prog-pct" style={{ color: getTierColor(s.tier) }}>{s.avgProgress}%</span>
                        </div>
                      </td>
                      <td>
                        <button className="ad-btn-sm" style={{ borderColor: 'rgba(139,92,246,0.3)', color: '#8b5cf6' }}
                          onClick={() => setViewSkillQ(s)}>
                          📝 {getSkillQuestions(s.id).length} ข้อ
                        </button>
                      </td>
                      <td>
                        <div className="ad-action-btns">
                          <button className="ad-btn-sm ad-btn-view" onClick={() => setEditSkill({ ...s })}>✏️ แก้ไข</button>
                          <button className="ad-btn-sm ad-btn-toggle" onClick={() => toggleSkillStatus(s.id)}>
                            {s.status === 'active' ? '🔴 ระงับ' : '🟢 เปิด'}
                          </button>
                          <button className="ad-btn-sm ad-btn-del" onClick={() => setDeleteSkill(s)}>🗑 ลบ</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSkills.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
                        ยังไม่มีข้อมูล Skill ในระบบ กด "➕ เพิ่ม Skill ใหม่" เพื่อสร้างทักษะ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {activeTab === 'history' && (
          <div className="ad-tab-history">
            <div className="ad-page-header">
              <h1 className="ad-page-title">📋 ประวัติการทำโจทย์ทั้งหมด</h1>
              <span className="ad-page-sub">พบ {filteredHistory.length} รายการ</span>
            </div>
            <div className="ad-toolbar">
              <div className="ad-search-wrap">
                <span className="ad-search-icon">🔍</span>
                <input className="ad-search" placeholder="ค้นหาชื่อผู้ใช้, ชื่อ Skill..." value={histSearch} onChange={e => setHistSearch(e.target.value)} />
              </div>
              {['all', 'great', 'good', 'low'].map(g => (
                <button key={g} className={`ad-filter-btn ${histGrade === g ? 'active' : ''}`} onClick={() => setHistGrade(g)}>
                  {g === 'all' ? 'ทั้งหมด' : gradeLabel(g)}
                </button>
              ))}
            </div>
            <div className="ad-card">
              <table className="ad-table">
                <thead>
                  <tr><th>#</th><th>ผู้ใช้</th><th>Skill</th><th>วันที่</th><th>ถูก/ทั้งหมด</th><th>Score</th><th>ผลลัพธ์</th></tr>
                </thead>
                <tbody>
                  {filteredHistory.map((h, i) => (
                    <tr key={h.id}>
                      <td><span className="ad-mono ad-muted">{i + 1}</span></td>
                      <td>
                        <div className="ad-user-cell">
                          <div className="ad-avatar-sm">{h.user[0]}</div>
                          <span className="ad-user-name-sm">{h.user}</span>
                        </div>
                      </td>
                      <td><span className="ad-skill-name">{h.skill}</span></td>
                      <td><span className="ad-muted">{h.date}</span></td>
                      <td><span className="ad-mono">{h.correct} / {h.total}</span></td>
                      <td><span className="ad-score" style={{ color: getScoreColor(h.score) }}>{h.score}%</span></td>
                      <td>
                        <span className={`ad-grade-badge grade-${h.grade}`}>{gradeLabel(h.grade)}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>ไม่พบข้อมูล</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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
