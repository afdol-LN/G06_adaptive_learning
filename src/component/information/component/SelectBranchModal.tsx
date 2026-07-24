import React from "react";

interface SelectBranchModalProps {
  branches: any[];
  newBranchIds: string[];
  selectedBranchId: string | null;
  setSelectedBranchId: (id: string | null) => void;
  handleConfirmBranch: () => void;
}

export const SelectBranchModal: React.FC<SelectBranchModalProps> = ({
  branches,
  newBranchIds,
  selectedBranchId,
  setSelectedBranchId,
  handleConfirmBranch,
}) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "32px 28px",
          maxWidth: "480px",
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>⚡</div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "800",
              color: "#0f172a",
            }}
          >
            เลือกหัวข้อที่จะทำ Pretest
          </h2>
          <p
            style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}
          >
            เลือก 1 สายการเรียนเพื่อเริ่ม Pretest
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {branches
            .filter((b) => newBranchIds.includes(b.id))
            .map((branch) => {
              const isActive = branch.id === selectedBranchId;
              return (
                <div
                  key={branch.id}
                  onClick={() => setSelectedBranchId(branch.id)}
                  style={{
                    border: `2px solid ${isActive ? "#0047AB" : "#e2e8f0"}`,
                    borderRadius: "14px",
                    padding: "14px 18px",
                    cursor: "pointer",
                    background: isActive
                      ? "rgba(0,71,171,0.06)"
                      : "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    transition: "all 0.2s",
                  }}
                >
                  <div
                    style={{
                      fontSize: "24px",
                      width: "44px",
                      height: "44px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f1f5f9",
                      borderRadius: "10px",
                      flexShrink: 0,
                    }}
                  >
                    {branch.goalIcon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "700",
                        color: "#0f172a",
                        fontSize: "14px",
                      }}
                    >
                      {branch.goalName}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        marginTop: "2px",
                      }}
                    >
                      {branch.campus} · {branch.major} · {branch.year}
                    </div>
                  </div>
                  {isActive && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#0047AB",
                        background: "rgba(0,71,171,0.1)",
                        padding: "4px 10px",
                        borderRadius: "99px",
                      }}
                    >
                      ✓ เลือกอยู่
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        <button
          onClick={handleConfirmBranch}
          disabled={!selectedBranchId}
          style={{
            width: "100%",
            padding: "14px",
            background: selectedBranchId
              ? "linear-gradient(135deg, #0056d6, #0047AB)"
              : "#e2e8f0",
            color: selectedBranchId ? "#fff" : "#94a3b8",
            border: "none",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: "700",
            cursor: selectedBranchId ? "pointer" : "not-allowed",
          }}
        >
          {selectedBranchId ? "Next->" : "กรุณาเลือกหัวข้อก่อน"}
        </button>
      </div>
    </div>
  );
};
