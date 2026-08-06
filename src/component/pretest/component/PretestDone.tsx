import React from "react";
import { PretestControllerType } from "../controller/usePretestController";

interface PretestDoneProps {
  controller: PretestControllerType;
}

export const PretestDone: React.FC<PretestDoneProps> = ({ controller }) => {
  const scoreSummary = controller.scoreSummary;

  return (
    <div id="screenDone" className="screen-active show" style={{ maxWidth: "660px" }}>
      <div className="done-ring">✓</div>
      <h2 className="done-title">เสร็จสิ้น!</h2>
      <p className="done-sub">
        ระบบวิเคราะห์ผลลัพธ์การทำแบบทดสอบของคุณเรียบร้อยแล้ว
        <br />
        พร้อมสรุปผลรายข้อด้านล่าง
      </p>
      <div className="done-score-card">
        <div className="score-item">
          <div className="score-num">{scoreSummary.correct}</div>
          <div className="score-label">ตอบถูก</div>
        </div>
        <div className="score-item">
          <div className="score-num">{scoreSummary.total}</div>
          <div className="score-label">ทั้งหมด</div>
        </div>
        <div className="score-item">
          <div className="score-num">{scoreSummary.pct}%</div>
          <div className="score-label">คะแนน</div>
        </div>
      </div>

      {/* Itemized Results List */}
      <div className="results-list">
        {scoreSummary.results.map((resultItem, index) => (
          <div key={index} className="result-item-card">
            <div className="result-item-left">
              <span>ข้อ {index + 1}</span>
              <span style={{ color: "var(--muted)", fontSize: "13px" }}>
                ({resultItem.skillName || `Skill ${resultItem.skillId}`})
              </span>
              <span
                style={{
                  fontSize: "12px",
                  background: "rgba(255,255,255,0.08)",
                  padding: "2px 8px",
                  borderRadius: "8px",
                }}
              >
                {resultItem.type === "FILL_IN_BLANK" ? "เติมคำ" : "ตัวเลือก"}
              </span>
            </div>
            <div>
              {resultItem.isCorrect ? (
                <span className="result-badge correct">✓ ถูกต้อง</span>
              ) : (
                <span className="result-badge incorrect">✗ ผิด</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-continue" onClick={controller.navigateToDashboard}>
        <span>เริ่มเรียนได้เลย →</span>
      </button>
    </div>
  );
};
