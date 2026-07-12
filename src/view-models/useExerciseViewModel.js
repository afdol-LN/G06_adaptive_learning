/**
 * @file useExerciseViewModel.js
 * @description ViewModel สำหรับ Exercise จัดการสถานะคำถาม การตรวจคำตอบ Streak สถิติ และ Popup สรุปผล
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const SESSION = {
  id: 3,
  label: 'Session 3',
  skillName: 'Stack (SK-008)',
  skillTier: 'Tier 2',
  goalName: 'Data Structures',
  questions: [
    {
      diff: 1,
      dLbl: 'Easy',
      tier: 'T2',
      text: 'Stack ใช้หลักการใดในการจัดการข้อมูล?',
      choices: [
        'FIFO — First In First Out',
        'LIFO — Last In First Out',
        'FILO — First In Last Out',
        'Random access order',
      ],
      correct: 1,
      hint: 'คิดถึงกองจาน — จานที่วางทีหลังจะหยิบออกก่อนเสมอ',
    },
    {
      diff: 2,
      dLbl: 'Easy+',
      tier: 'T2',
      text: 'Code ต่อไปนี้แสดงผลอะไร?',
      code: `stack = []\nstack.<span class="fn">append</span>(<span class="nm">10</span>)\nstack.<span class="fn">append</span>(<span class="nm">20</span>)\nstack.<span class="fn">append</span>(<span class="nm">30</span>)\n<span class="fn">print</span>(stack.<span class="fn">pop</span>())`,
      choices: ['10', '20', '30', '[10, 20, 30]'],
      correct: 2,
      hint: 'list.pop() โดยไม่ระบุ index จะดึง element ตัวสุดท้ายออกเสมอ',
    },
    {
      diff: 3,
      dLbl: 'Medium',
      tier: 'T2',
      text: 'Stack ถูกนำไปใช้งานใน use case ใดต่อไปนี้?',
      choices: [
        'Print queue ของ printer',
        'Browser back-button history',
        'Message queue ของ LINE',
        'Waiting list ระบบจองตั๋ว',
      ],
      correct: 1,
      hint: 'กด back บน browser = ย้อนกลับหน้าล่าสุด — เหมือน pop จาก stack',
    },
    {
      diff: 4,
      dLbl: 'Hard',
      tier: 'T2',
      text: 'function ต่อไปนี้ทำงานอะไร?',
      code: `<span class="kw">def</span> <span class="fn">is_balanced</span>(s: <span class="tp">str</span>) -> <span class="tp">bool</span>:\n    stack = []\n    pairs = {<span class="st">')'</span>: <span class="st">'('</span>, <span class="st">']'</span>: <span class="st">'['</span>, <span class="st">'}'</span>: <span class="st">'{'</span>}\n    <span class="kw">for</span> ch <span class="kw">in</span> s:\n        <span class="kw">if</span> ch <span class="kw">in</span> <span class="st">'([{'</span>:\n            stack.<span class="fn">append</span>(ch)\n        <span class="kw">elif</span> ch <span class="kw">in</span> pairs:\n            <span class="kw">if not</span> stack <span class="kw">or</span> stack[-<span class="nm">1</span>] != pairs[ch]:\n                <span class="kw">return False</span>\n            stack.<span class="fn">pop</span>()\n    <span class="kw">return</span> <span class="fn">len</span>(stack) == <span class="nm">0</span>`,
      choices: [
        'นับจำนวน bracket ใน string',
        'ตรวจว่า bracket สมดุลหรือไม่',
        'แปลง string เป็น stack โดยตรง',
        'เรียงลำดับ bracket ใน string',
      ],
      correct: 1,
      hint: 'สังเกต pairs dict กับการ pop() เมื่อเจอ closing bracket — classic balanced bracket check',
    },
  ],
};

export const SKILL_UPDATES = [
  {
    ico: '📚',
    name: 'Stack (SK-008)',
    tier: 'T2',
    plA: 0.1,
    plB: 0.65,
    lvA: 0,
    lvB: 2,
    verdict: 'UP',
    req: 2,
  },
];

export const NEXT_SESS = {
  id: 4,
  skill: 'Queue (SK-009)',
  tier: 'Tier 2',
  qs: 5,
  goal: 'Data Structures',
  priority: 'Priority #1',
  reason: 'Stack lv2 ✓ → unlock Queue prerequisite',
};

export function useExerciseViewModel() {
  const navigate = useNavigate();
  const total = SESSION.questions.length;

  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState(new Array(total).fill(null));
  const [hints, setHints] = useState(new Array(total).fill(false));
  const [selected, setSelected] = useState(null);
  const [responded, setResponded] = useState(false);

  const [stats, setStats] = useState({ correct: 0, streak: 0 });
  const [flash, setFlash] = useState({ show: false, type: '' });
  const [confetti, setConfetti] = useState([]);

  const [screens, setScreens] = useState({ result: false, nextSess: false });

  const q = SESSION.questions[cur];
  const pct = Math.round((cur / total) * 100);
  const ps = Math.round((stats.correct / total) * 100);

  const triggerConfetti = () => {
    const cols = ['#0047AB', '#82C8E5', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
    const particles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      bg: cols[Math.floor(Math.random() * cols.length)],
      dur: 1.6 + Math.random() * 2.2,
      del: Math.random() * 0.8,
      round: Math.random() > 0.5,
    }));
    setConfetti(particles);
  };

  const showPopup = finalCorrect => {
    setScreens(prev => ({ ...prev, result: true }));
    if (finalCorrect / total >= 0.7) {
      triggerConfetti();
    }
  };

  const pick = i => {
    if (responded) return;
    setSelected(i);
  };

  const showHint = () => {
    const newHints = [...hints];
    newHints[cur] = true;
    setHints(newHints);
  };

  const doNext = () => {
    if (selected === null) return;
    const isCorrect = selected === q.correct;

    const newAns = [...ans];
    newAns[cur] = selected;
    setAns(newAns);
    setResponded(true);

    if (isCorrect) {
      setStats(prev => ({ correct: prev.correct + 1, streak: prev.streak + 1 }));
    } else {
      setStats(prev => ({ ...prev, streak: 0 }));
    }

    setFlash({ show: true, type: isCorrect ? 'ok' : 'bad' });
    setTimeout(() => setFlash({ show: false, type: '' }), 800);

    setTimeout(() => {
      if (cur < total - 1) {
        setCur(cur + 1);
        setSelected(null);
        setResponded(false);
      } else {
        showPopup(isCorrect ? stats.correct + 1 : stats.correct);
      }
    }, 1200);
  };

  const doSkip = () => {
    const newAns = [...ans];
    newAns[cur] = -1;
    setAns(newAns);
    setStats(prev => ({ ...prev, streak: 0 }));

    if (cur < total - 1) {
      setCur(cur + 1);
      setSelected(null);
      setResponded(false);
    } else {
      showPopup(stats.correct);
    }
  };

  const getOptClass = i => {
    if (!responded) return i === selected ? 'opt sel' : 'opt';
    if (i === q.correct) return 'opt rev-ok';
    if (i === selected && i !== q.correct) return 'opt rev-no';
    return 'opt';
  };

  const getDotClass = i => {
    if (i === cur) return 'sdot current';
    if (ans[i] === null) return 'sdot';
    if (ans[i] === -1) return 'sdot skp';
    if (ans[i] === SESSION.questions[i].correct) return 'sdot ok';
    return 'sdot bad';
  };

  const gohome = () => navigate('/home');

  return {
    state: {
      total,
      cur,
      ans,
      hints,
      selected,
      responded,
      stats,
      flash,
      confetti,
      screens,
      q,
      pct,
      ps,
      SESSION,
      SKILL_UPDATES,
      NEXT_SESS,
    },
    actions: {
      pick,
      showHint,
      doNext,
      doSkip,
      setScreens,
      getOptClass,
      getDotClass,
      gohome,
      navigate,
    },
  };
}
