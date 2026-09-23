import React from "react";
import { FaHourglassHalf } from "react-icons/fa6";

export const PretestLoading: React.FC = () => {
  return (
    <main className="page">
      <div id="screenIntro" className="screen-active">
        <div className="intro-icon-ring pt-pulse">
          <FaHourglassHalf aria-hidden />
        </div>
        <div className="intro-eyebrow">Adaptive Learning System</div>
        <h1 className="intro-title">กำลังเตรียมคำถาม...</h1>
        <p className="intro-sub">ระบบกำลังคัดเลือกชุดแบบทดสอบที่ตรงกับเป้าหมายของคุณ</p>
      </div>
    </main>
  );
};
