// ─── viewModels/usePretestViewModel.jsx ─────────────────────────────────────
// Pretest ViewModel — จัดการ quiz state ทั้งหมด
// คืนค่าพร้อมใช้ให้ PretestView
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const QUESTIONS = [
  {
    skill: 'Variables', diff: 1, diffLabel: 'ง่าย', diffColor: '#4caf7d',
    text: 'ผลลัพธ์ของโค้ดต่อไปนี้คืออะไร?',
    code: ['x = 10', 'y = 3', 'print(x % y)'],
    choices: ['0', '1', '3', '3.33'], answer: 1,
  },
  {
    skill: 'Loops', diff: 2, diffLabel: 'พื้นฐาน', diffColor: '#6ac08f',
    text: 'Loop ต่อไปนี้จะพิมพ์ค่าอะไรออกมา?',
    code: ['for i in range(2, 8, 2):', '    print(i, end=" ")'],
    choices: ['2 4 6', '2 4 6 8', '0 2 4 6', '2 3 4 5 6 7'], answer: 0,
  },
  {
    skill: 'Functions', diff: 3, diffLabel: 'กลาง', diffColor: '#e8c96a',
    text: 'ฟังก์ชันต่อไปนี้จะคืนค่าอะไรเมื่อเรียก mystery(5)?',
    code: ['def mystery(n):', '    if n <= 1:', '        return 1', '    return n * mystery(n - 1)'],
    choices: ['5', '15', '120', '25'], answer: 2,
  },
  {
    skill: 'Sort/Search', diff: 4, diffLabel: 'ยาก', diffColor: '#e8a03c',
    text: 'Binary Search มีเงื่อนไขสำคัญอะไรในการใช้งาน และ Time Complexity คือเท่าไร?',
    code: null,
    choices: [
      'Array ไม่จำเป็นต้อง sorted — O(n)',
      'Array ต้องเป็น sorted — O(log n)',
      'Array ต้องเป็น sorted — O(n²)',
      'Array ใด ๆ ก็ได้ — O(log n)',
    ], answer: 1,
  },
  {
    skill: 'Graph', diff: 4, diffLabel: 'ยาก', diffColor: '#e8a03c',
    text: 'ข้อแตกต่างหลักระหว่าง BFS และ DFS คืออะไร?',
    code: null,
    choices: [
      'BFS ใช้ Stack, DFS ใช้ Queue',
      'BFS ใช้ Queue ค้นหาทีละระดับ, DFS ใช้ Stack ลงลึกก่อน',
      'BFS เร็วกว่า DFS เสมอ',
      'ไม่มีความแตกต่าง ใช้แทนกันได้',
    ], answer: 1,
  },
];

// ── Code syntax highlighter ──────────────────────────────────────────────────
export function highlightCode(line) {
  const KWS = ['def','return','if','else','elif','for','in','while','import','from',
                'class','True','False','None','and','or','not','print','range','append','pop','len'];
  let h = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  h = h.replace(/(#[^]*)$/, '<span class="code-cm">$1</span>');
  const strPlaceholders = [];
  h = h.replace(/(\"(?:[^\"\\]|\\.)*\"|'(?:[^'\\]|\\.)*')/g, match => {
    strPlaceholders.push(match);
    return `\x00STR${strPlaceholders.length - 1}\x00`;
  });
  h = h.replace(new RegExp(`\\b(${KWS.join('|')})\\b`, 'g'), '<span class="code-kw">$1</span>');
  h = h.replace(/\b(\d+)\b/g, '<span class="code-num">$1</span>');
  h = h.replace(/\x00STR(\d+)\x00/g, (_, i) =>
    `<span class="code-str">${strPlaceholders[parseInt(i)]}</span>`);
  return { __html: h };
}

// ── Main Hook ─────────────────────────────────────────────────────────────────
export function usePretestViewModel() {
  const navigate = useNavigate();
  const [currentScreen,  setCurrentScreen]  = useState('intro');
  const [currentQIndex,  setCurrentQIndex]  = useState(0);
  const [answers,        setAnswers]        = useState(new Array(QUESTIONS.length).fill(null));
  const [showModal,      setShowModal]      = useState(false);
  const [score,          setScore]          = useState({ correct: 0, total: QUESTIONS.length, pct: 0 });

  const currentQ     = QUESTIONS[currentQIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const progressPct  = Math.round((answeredCount / QUESTIONS.length) * 100);

  const startQuiz = () => setCurrentScreen('quiz');

  const selectChoice = choiceIndex => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = choiceIndex;
    setAnswers(newAnswers);
  };

  const advance = () => {
    if (currentQIndex === QUESTIONS.length - 1) {
      const correctCount = answers.reduce(
        (sum, ans, i) => sum + (ans === QUESTIONS[i].answer ? 1 : 0), 0
      );
      const pct = Math.round((correctCount / QUESTIONS.length) * 100);
      setScore({ correct: correctCount, total: QUESTIONS.length, pct });
      setCurrentScreen('done');
    } else {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (answers[currentQIndex] === null) { setShowModal(true); return; }
    advance();
  };

  const confirmSkip = () => { setShowModal(false); advance(); };
  const goDashboard = () => navigate('/home');

  return {
    QUESTIONS, currentScreen, currentQIndex, answers, showModal, score,
    currentQ, answeredCount, progressPct,
    startQuiz, selectChoice, handleNext, confirmSkip, goDashboard, highlightCode,
    setShowModal,
  };
}
