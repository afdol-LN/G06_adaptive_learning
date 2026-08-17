import React from "react";
import { PretestControllerType } from "../controller/usePretestController";

interface PretestIntroProps {
  controller: PretestControllerType;
}

export const PretestIntro: React.FC<PretestIntroProps> = ({ controller }) => {
  return (
    <div id="screenIntro" className="screen-active">
      <div className="intro-icon-ring">📝</div>
      <div className="intro-eyebrow">Adaptive Learning System</div>
      <h1 className="intro-title">
        เตรียมพร้อม
        <br />
        สำหรับ Pre-test
      </h1>
      <p className="intro-sub">
        ระบบจะประเมินระดับความรู้เบื้องต้นของคุณ
        <br />
        เพื่อปรับหลักสูตรให้เหมาะสมกับตัวคุณมากที่สุด
      </p>
      <div className="intro-info-grid">
        <div className="intro-info-card">
          <div className="intro-info-num">{controller.questions.length}</div>
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
      <button className="btn-go" onClick={controller.startQuiz}>
        <span>เริ่มเลย</span>
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
  );
};
