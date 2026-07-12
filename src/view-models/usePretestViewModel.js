/**
 * @file usePretestViewModel.js
 * @description ViewModel สำหรับ Pretest Component (จัดการสถานะแบบทดสอบ, คำตอบ, คะแนน, modal ข้ามข้อ และ code highlighting)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function usePretestViewModel(QUESTIONS) {
  const navigate = useNavigate();

  const [currentScreen, setCurrentScreen] = useState('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState(new Array(QUESTIONS.length).fill(null));
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: QUESTIONS.length, pct: 0 });

  const currentQ = QUESTIONS[currentQIndex];
  const answeredCount = answers.filter(a => a !== null).length;
  const progressPct = Math.round((answeredCount / QUESTIONS.length) * 100);

  const startQuiz = () => setCurrentScreen('quiz');

  const selectChoice = choiceIndex => {
    const newAnswers = [...answers];
    newAnswers[currentQIndex] = choiceIndex;
    setAnswers(newAnswers);
  };

  const advance = () => {
    if (currentQIndex === QUESTIONS.length - 1) {
      submitQuiz();
    } else {
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (answers[currentQIndex] === null) {
      setShowModal(true);
      return;
    }
    advance();
  };

  const confirmSkip = () => {
    setShowModal(false);
    advance();
  };

  const submitQuiz = () => {
    const correctCount = answers.reduce(
      (sum, ans, i) => sum + (ans === QUESTIONS[i].answer ? 1 : 0),
      0
    );
    const pct = Math.round((correctCount / QUESTIONS.length) * 100);
    setScore({ correct: correctCount, total: QUESTIONS.length, pct });
    setCurrentScreen('done');
  };

  const goDashboard = () => navigate('/home');

  const highlightCode = line => {
    const KWS = [
      'def',
      'return',
      'if',
      'else',
      'elif',
      'for',
      'in',
      'while',
      'import',
      'from',
      'class',
      'True',
      'False',
      'None',
      'and',
      'or',
      'not',
      'print',
      'range',
      'append',
      'pop',
      'len',
    ];

    let h = line
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    h = h.replace(/(#[^]*)$/, '<span class="code-cm">$1</span>');

    const strPlaceholders = [];
    h = h.replace(/("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, match => {
      strPlaceholders.push(match);
      return `\x00STR${strPlaceholders.length - 1}\x00`;
    });

    h = h.replace(
      new RegExp(`\\b(${KWS.join('|')})\\b`, 'g'),
      '<span class="code-kw">$1</span>'
    );

    h = h.replace(/\b(\d+)\b/g, '<span class="code-num">$1</span>');

    h = h.replace(
      /\x00STR(\d+)\x00/g,
      (_, i) => `<span class="code-str">${strPlaceholders[parseInt(i)]}</span>`
    );

    return { __html: h };
  };

  return {
    state: {
      currentScreen,
      currentQIndex,
      answers,
      showModal,
      score,
      currentQ,
      progressPct,
    },
    actions: {
      startQuiz,
      selectChoice,
      handleNext,
      confirmSkip,
      goDashboard,
      setShowModal,
      highlightCode,
    },
  };
}
