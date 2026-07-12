import React from 'react';
import './decorate/Pretest.css';
import { usePretestViewModel } from '../view-models/usePretestViewModel';

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
    choices: ['Array ไม่จำเป็นต้อง sorted — O(n)', 'Array ต้องเป็น sorted — O(log n)', 'Array ต้องเป็น sorted — O(n²)', 'Array ใด ๆ ก็ได้ — O(log n)'], answer: 1,
  },
  {
    skill: 'Graph', diff: 4, diffLabel: 'ยาก', diffColor: '#e8a03c',
    text: 'ข้อแตกต่างหลักระหว่าง BFS (Breadth-First Search) และ DFS (Depth-First Search) คืออะไร?',
    code: null,
    choices: ['BFS ใช้ Stack, DFS ใช้ Queue', 'BFS ใช้ Queue ค้นหาทีละระดับ, DFS ใช้ Stack ลงลึกก่อน', 'BFS เร็วกว่า DFS เสมอ', 'ไม่มีความแตกต่าง ใช้แทนกันได้'], answer: 1,
  },
];

export default function Pretest() {
  const { state, actions } = usePretestViewModel(QUESTIONS);
  const {
    currentScreen,
    currentQIndex,
    answers,
    showModal,
    score,
    currentQ,
    progressPct,
  } = state;
  const {
    startQuiz,
    selectChoice,
    handleNext,
    confirmSkip,
    goDashboard,
    setShowModal,
    highlightCode,
  } = actions;


  return (
    <>
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="page">
        {/* <div className="brand">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">PSU · ALS</span>
        </div> */}

        {/* ═══ INTRO ═══ */}
        {currentScreen === 'intro' && (
          <div id="screenIntro" className="screen-active">
            <div className="intro-icon-ring">📝</div>
            <div className="intro-eyebrow">Adaptive Learning System</div>
            <h1 className="intro-title">เตรียมพร้อม<br />สำหรับ Pre-test</h1>
            <p className="intro-sub">
              ระบบจะประเมินระดับความรู้เบื้องต้นของคุณ<br />
              เพื่อปรับหลักสูตรให้เหมาะสมกับตัวคุณมากที่สุด
            </p>
            <div className="intro-info-grid">
              <div className="intro-info-card"><div className="intro-info-num">5</div><div className="intro-info-label">ข้อ</div></div>
              <div className="intro-info-card"><div className="intro-info-num">~8</div><div className="intro-info-label">นาที</div></div>
              <div className="intro-info-card"><div className="intro-info-num">4</div><div className="intro-info-label">ตัวเลือก</div></div>
            </div>
            <div className="intro-notice">
              <strong>⚠ หมายเหตุ:</strong> เมื่อกด Next เพื่อไปข้อถัดไปแล้ว <strong>จะไม่สามารถย้อนกลับมาแก้คำตอบได้</strong><br />
              กรุณาอ่านคำถามให้ครบถ้วนก่อนตอบทุกครั้ง
            </div>
            <button className="btn-go" onClick={startQuiz}>
              <span>GO — เริ่มเลย</span>
              <svg className="go-arrow" width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 9h12M11 5l4 4-4 4" stroke="#0b1120" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        )}

        {/* ═══ QUIZ ═══ */}
        {currentScreen === 'quiz' && (
          <div id="screenQuiz" className="screen-active" style={{ width: '100%', maxWidth: '660px' }}>

            {/* Progress */}
            <div className="quiz-progress-wrap">
              <div className="quiz-progress-top">
                <span className="quiz-progress-label">ความคืบหน้า</span>
                <span className="quiz-progress-pct">{progressPct}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progressPct}%` }}></div>
              </div>
              <div className="progress-ticks">
                {QUESTIONS.map((_, i) => (
                  <div key={i} className={`tick ${i === currentQIndex ? 'current' : answers[i] !== null ? 'done' : ''}`}></div>
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="q-card" key={currentQIndex}>
              <div className="q-header">
                <div className="q-num-badge">
                  <span className="q-num">ข้อ <strong>{currentQIndex + 1}</strong> / {QUESTIONS.length}</span>
                  <span className="q-skill-tag">{currentQ.skill}</span>
                </div>
                <span className="q-diff-tag" style={{ background: `${currentQ.diffColor}18`, border: `1px solid ${currentQ.diffColor}44`, color: currentQ.diffColor }}>
                  Level {currentQ.diff}
                </span>
              </div>

              <div className="q-body">
                <div className="q-text">{currentQ.text}</div>

                {currentQ.code && (
                  <div className="code-block">
                    {currentQ.code.map((line, idx) => (
                      <div key={idx} className="code-line" dangerouslySetInnerHTML={highlightCode(line)}></div>
                    ))}
                  </div>
                )}

                <div className="choices">
                  {currentQ.choices.map((choice, i) => (
                    <div
                      key={i}
                      className={`choice ${answers[currentQIndex] === i ? 'selected' : ''}`}
                      onClick={() => selectChoice(i)}
                    >
                      <div className="choice-letter">{['A', 'B', 'C', 'D'][i]}</div>
                      <div className="choice-text">{choice}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="q-footer">
                <div className="q-footer-left">
                  <div className="dot-indicators">
                    {QUESTIONS.map((_, i) => (
                      <div key={i} className={`dot-ind ${i === currentQIndex ? 'current' : answers[i] !== null ? 'answered' : ''}`}></div>
                    ))}
                  </div>
                </div>
                <button
                  className={`btn-next ${currentQIndex === QUESTIONS.length - 1 ? 'submit-btn' : ''}`}
                  onClick={handleNext}
                >
                  <span>{currentQIndex === QUESTIONS.length - 1 ? 'Submit' : 'Next'}</span>
                  {currentQIndex !== QUESTIONS.length - 1 && (
                    <svg className="next-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="#0b1120" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DONE ═══ */}
        {currentScreen === 'done' && (
          <div id="screenDone" className="screen-active show">
            <div className="done-ring">✓</div>
            <h2 className="done-title">เสร็จสิ้น!</h2>
            <p className="done-sub">
              ระบบกำลังวิเคราะห์ผลลัพธ์และปรับหลักสูตรให้เหมาะกับคุณ<br />
              คุณพร้อมเริ่มต้นการเรียนรู้แบบ Adaptive แล้ว
            </p>
            <div className="done-score-card">
              <div className="score-item"><div className="score-num">{score.correct}</div><div className="score-label">ตอบถูก</div></div>
              <div className="score-item"><div className="score-num">{score.total}</div><div className="score-label">ทั้งหมด</div></div>
              <div className="score-item"><div className="score-num">{score.pct}%</div><div className="score-label">คะแนน</div></div>
            </div>
            <button className="btn-continue" onClick={goDashboard}>
              <span>เริ่มเรียนได้เลย →</span>
            </button>
          </div>
        )}
      </main>

      {/* ═══ MODAL ═══ */}
      <div className={`modal-overlay ${showModal ? 'show' : ''}`}>
        <div className="modal">
          <div className="modal-icon">⚠️</div>
          <div className="modal-title">ยังไม่ได้เลือกคำตอบ</div>
          <div className="modal-body">
            คุณยังไม่ได้เลือกคำตอบสำหรับข้อนี้<br />
            หากข้ามไปข้อถัดไป <strong>จะไม่สามารถย้อนกลับมาตอบได้อีก</strong><br />
            ต้องการข้ามข้อนี้หรือไม่?
          </div>
          <div className="modal-btns">
            <button className="modal-cancel" onClick={() => setShowModal(false)}>← กลับไปตอบ</button>
            <button className="modal-confirm" onClick={confirmSkip}>ข้ามข้อนี้</button>
          </div>
        </div>
      </div>
    </>
  );
}