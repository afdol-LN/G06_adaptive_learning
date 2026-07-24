import React from "react";
import "./decorate/Pretest.css";
import { usePretestController } from "./pretest/controller/usePretestController";

export default function Pretest() {
  const ctrl = usePretestController();

  if (ctrl.isLoading) {
    return (
      <>
        <div className="bg"></div>
        <div className="bg-grid"></div>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <main className="page">
          <div id="screenIntro" className="screen-active">
            <div className="intro-icon-ring" style={{ animation: "pulse 2s infinite" }}>⏳</div>
            <div className="intro-eyebrow">Adaptive Learning System</div>
            <h1 className="intro-title">กำลังเตรียมคำถาม...</h1>
            <p className="intro-sub">ระบบกำลังคัดเลือกชุดแบบทดสอบที่ตรงกับเป้าหมายของคุณ</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="page">
        {/* ═══ INTRO ═══ */}
        {ctrl.currentScreen === "intro" && (
          <div id="screenIntro" className="screen-active">
            <div className="intro-icon-ring">📝</div>
            <div className="intro-eyebrow">Adaptive Learning System</div>
            <h1 className="intro-title">
              เตรียมพร้อม<br />สำหรับ Pre-test
            </h1>
            <p className="intro-sub">
              ระบบจะประเมินระดับความรู้เบื้องต้นของคุณ<br />
              เพื่อปรับหลักสูตรให้เหมาะสมกับตัวคุณมากที่สุด
            </p>
            <div className="intro-info-grid">
              <div className="intro-info-card">
                <div className="intro-info-num">{ctrl.questions.length}</div>
                <div className="intro-info-label">ข้อ</div>
              </div>
              <div className="intro-info-card">
                <div className="intro-info-num">~8</div>
                <div className="intro-info-label">นาที</div>
              </div>
              <div className="intro-info-card">
                <div className="intro-info-num">2</div>
                <div className="intro-info-label">รูปแบบคำถาม</div>
              </div>
            </div>
            <div className="intro-notice">
              <strong>⚠ หมายเหตุ:</strong> แบบทดสอบประกอบด้วยแบบตัวเลือก (Choice) และแบบเติมคำ (Fill-in-the-blank) เมื่อกด Next แล้ว <strong>จะไม่สามารถย้อนกลับมาแก้คำตอบได้</strong>
            </div>
            <button className="btn-go" onClick={ctrl.startQuiz}>
              <span>GO — เริ่มเลย</span>
              <svg
                className="go-arrow"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
              >
                <path
                  d="M3 9h12M11 5l4 4-4 4"
                  stroke="#0b1120"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}

        {/* ═══ QUIZ ═══ */}
        {ctrl.currentScreen === "quiz" && (
          <div
            id="screenQuiz"
            className="screen-active"
            style={{ width: "100%", maxWidth: "660px" }}
          >
            {/* Progress */}
            <div className="quiz-progress-wrap">
              <div className="quiz-progress-top">
                <span className="quiz-progress-label">ความคืบหน้า</span>
                <span className="quiz-progress-pct">{ctrl.progressPct}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${ctrl.progressPct}%` }}
                ></div>
              </div>
              <div className="progress-ticks">
                {ctrl.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`tick ${
                      i === ctrl.currentQIndex
                        ? "current"
                        : ctrl.answers[i] !== null && ctrl.answers[i] !== undefined && ctrl.answers[i] !== ""
                        ? "done"
                        : ""
                    }`}
                  ></div>
                ))}
              </div>
            </div>

            {/* Question Card */}
            <div className="q-card" key={ctrl.currentQIndex}>
              <div className="q-header">
                <div className="q-num-badge">
                  <span className="q-num">
                    ข้อ <strong>{ctrl.currentQIndex + 1}</strong> / {ctrl.questions.length}
                  </span>
                  <span className="q-skill-tag">
                    {ctrl.currentQ.skillName || `Skill ${ctrl.currentQ.skillId}`}
                  </span>
                </div>
                <span
                  className="q-diff-tag"
                  style={{
                    background: `${ctrl.currentQ.diffColor || "#38b874"}18`,
                    border: `1px solid ${ctrl.currentQ.diffColor || "#38b874"}44`,
                    color: ctrl.currentQ.diffColor || "#38b874",
                  }}
                >
                  Level {ctrl.currentQ.level || ctrl.currentQ.diff || 1} • {ctrl.currentQ.type === "FILL_IN_BLANK" ? "เติมคำ" : "ตัวเลือก"}
                </span>
              </div>

              <div className="q-body">
                <div className="q-text">{ctrl.currentQ.description || ctrl.currentQ.text}</div>

                {ctrl.currentQ.code && (
                  <div className="code-block">
                    {(typeof ctrl.currentQ.code === "string"
                      ? ctrl.currentQ.code.split("\n")
                      : Array.isArray(ctrl.currentQ.code)
                      ? ctrl.currentQ.code
                      : []
                    ).map((line, idx) => (
                      <div
                        key={idx}
                        className="code-line"
                        dangerouslySetInnerHTML={ctrl.highlightCode(line)}
                      ></div>
                    ))}
                  </div>
                )}

                {ctrl.currentQ.type === "FILL_IN_BLANK" ? (
                  /* ── Fill-In-The-Blank Input UI ── */
                  <div className="fill-blank-container">
                    <div className="fill-blank-label">
                      📝 กรุณาพิมพ์คำตอบลงในช่องว่างด้านล่าง:
                    </div>
                    <input
                      type="text"
                      className="fill-blank-input"
                      placeholder="พิมพ์คำตอบของคุณที่นี่..."
                      value={ctrl.fillInBlankInput}
                      onChange={(e) => ctrl.handleFillInBlankChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          ctrl.handleNext();
                        }
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  /* ── Multiple Choice Cards UI ── */
                  <div className="choices">
                    {(ctrl.currentQ.choices || []).map((choice, i) => (
                      <div
                        key={i}
                        className={`choice ${
                          ctrl.answers[ctrl.currentQIndex] === i ? "selected" : ""
                        }`}
                        onClick={() => ctrl.selectChoice(i)}
                      >
                        <div className="choice-letter">
                          {["A", "B", "C", "D", "E", "F"][i] || i + 1}
                        </div>
                        <div className="choice-text">{choice}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="q-footer">
                <div className="q-footer-left">
                  <div className="dot-indicators">
                    {ctrl.questions.map((_, i) => (
                      <div
                        key={i}
                        className={`dot-ind ${
                          i === ctrl.currentQIndex
                            ? "current"
                            : ctrl.answers[i] !== null && ctrl.answers[i] !== undefined && ctrl.answers[i] !== ""
                            ? "answered"
                            : ""
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>
                <button
                  className={`btn-next ${
                    ctrl.currentQIndex === ctrl.questions.length - 1 ? "submit-btn" : ""
                  }`}
                  onClick={ctrl.handleNext}
                >
                  <span>
                    {ctrl.currentQIndex === ctrl.questions.length - 1 ? "Submit" : "Next"}
                  </span>
                  {ctrl.currentQIndex !== ctrl.questions.length - 1 && (
                    <svg
                      className="next-arrow"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
                      <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="#0b1120"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══ DONE ═══ */}
        {ctrl.currentScreen === "done" && (
          <div id="screenDone" className="screen-active show" style={{ maxWidth: "660px" }}>
            <div className="done-ring">✓</div>
            <h2 className="done-title">เสร็จสิ้น!</h2>
            <p className="done-sub">
              ระบบวิเคราะห์ผลลัพธ์การทำแบบทดสอบของคุณเรียบร้อยแล้ว<br />
              พร้อมสรุปผลรายข้อด้านล่าง
            </p>
            <div className="done-score-card">
              <div className="score-item">
                <div className="score-num">{ctrl.score.correct}</div>
                <div className="score-label">ตอบถูก</div>
              </div>
              <div className="score-item">
                <div className="score-num">{ctrl.score.total}</div>
                <div className="score-label">ทั้งหมด</div>
              </div>
              <div className="score-item">
                <div className="score-num">{ctrl.score.pct}%</div>
                <div className="score-label">คะแนน</div>
              </div>
            </div>

            {/* One-by-One Results Array Display */}
            <div className="results-list">
              {ctrl.score.results.map((item, idx) => (
                <div key={idx} className="result-item-card">
                  <div className="result-item-left">
                    <span>ข้อ {idx + 1}</span>
                    <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                      ({item.skillName || `Skill ${item.skillId}`})
                    </span>
                    <span style={{ fontSize: "12px", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: "8px" }}>
                      {item.type === "FILL_IN_BLANK" ? "เติมคำ" : "ตัวเลือก"}
                    </span>
                  </div>
                  <div>
                    {item.isCorrect ? (
                      <span className="result-badge correct">✓ ถูกต้อง</span>
                    ) : (
                      <span className="result-badge incorrect">✗ ผิด</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button className="btn-continue" onClick={ctrl.goDashboard}>
              <span>เริ่มเรียนได้เลย →</span>
            </button>
          </div>
        )}
      </main>

      {/* ═══ MODAL ═══ */}
      <div className={`modal-overlay ${ctrl.showModal ? "show" : ""}`}>
        <div className="modal">
          <div className="modal-icon">⚠️</div>
          <div className="modal-title">ยังไม่ได้เลือก/พิมพ์คำตอบ</div>
          <div className="modal-body">
            คุณยังไม่ได้ระบุคำตอบสำหรับข้อนี้<br />
            หากข้ามไปข้อถัดไป <strong>จะไม่สามารถย้อนกลับมาตอบได้อีก</strong><br />
            ต้องการข้ามข้อนี้หรือไม่?
          </div>
          <div className="modal-btns">
            <button
              className="modal-cancel"
              onClick={() => ctrl.setShowModal(false)}
            >
              ← กลับไปตอบ
            </button>
            <button className="modal-confirm" onClick={ctrl.confirmSkip}>
              ข้ามข้อนี้
            </button>
          </div>
        </div>
      </div>
    </>
  );
}