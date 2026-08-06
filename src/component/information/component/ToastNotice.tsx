import React from "react";

interface ToastNoticeProps {
  toast: { show: boolean; msg: string };
}

export const ToastNotice: React.FC<ToastNoticeProps> = ({ toast }) => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "30px",
        left: "50%",
        transform: toast.show
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(20px)",
        opacity: toast.show ? 1 : 0,
        background: "#ffffff",
        color: "#e11d48",
        padding: "12px 24px",
        borderRadius: "99px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        fontWeight: "600",
        transition: "all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        zIndex: 2000,
        pointerEvents: "none",
        border: "1px solid #ffe4e6",
      }}
    >
      ⚠️ {toast.msg}
    </div>
  );
};
