import React from "react";

export const StepReady: React.FC = () => {
  return (
    <div
      className="panel active"
      style={{ textAlign: "center", padding: "40px 20px" }}
    >
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>📝</div>
      <p
        style={{
          fontSize: "15px",
          color: "#475569",
          lineHeight: "1.6",
        }}
      >
        คุณกรอกข้อมูลครบถ้วนแล้ว
        <br />
        ระบบพร้อมประเมินความรู้เบื้องต้นของคุณผ่าน Pretest
      </p>
    </div>
  );
};
