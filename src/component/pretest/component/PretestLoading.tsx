import React from "react";

export const PretestLoading: React.FC = () => {
  return (
    <main className="page">
      <div id="screenIntro" className="screen-active">
        <div className="intro-icon-ring" style={{ animation: "pulse 2s infinite" }}>
          ⏳
        </div>
        <div className="intro-eyebrow">Adaptive Learning System</div>
        <h1 className="intro-title">กำลังเตรียมคำถาม...</h1>
        <p className="intro-sub">ระบบกำลังคัดเลือกชุดแบบทดสอบที่ตรงกับเป้าหมายของคุณ</p>
      </div>
    </main>
  );
};
