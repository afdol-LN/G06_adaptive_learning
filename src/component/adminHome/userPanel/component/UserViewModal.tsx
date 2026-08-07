import { useState } from "react";
import { FaMagnifyingGlass, FaPen, FaChevronDown, FaCircleInfo, FaFire } from "react-icons/fa6";
import { UserResponseAdmin } from "../../../../models/userModel";
import { getStatusColor } from "../../../../utils/adminUi";

interface UserViewModalProps {
  user: UserResponseAdmin | null;
  branches: any[];
  isLoadingBranches: boolean;
  onClose: () => void;
  onEdit: (user: UserResponseAdmin) => void;
}

export default function UserViewModal({
  user,
  branches,
  isLoadingBranches,
  onClose,
  onEdit,
}: UserViewModalProps) {
  const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);

  if (!user) return null;

  const statusColor = getStatusColor(user.status);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaMagnifyingGlass /> รายละเอียดผู้ใช้งาน
          </span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">ชื่อ - นามสกุล</label>
            <div>{user.fullName}</div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">สถานะ</label>
              <div>
                <span className="ad-status-dot" style={{ background: statusColor }} />
                <span className="ad-muted">{user.status === "active" ? "Active" : "Inactive"}</span>
              </div>
            </div>
            <div className="ad-field">
              <label className="ad-label">Username</label>
              <div>{user.username || "-"}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">วันเกิด</label>
              <div>{user.birthDate || "-"}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">เพศ</label>
              <div>{user.genderName || "-"}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">Role</label>
              <div>{user.role || "-"}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">Streak</label>
              <div>
                <FaFire /> {user.dayStreak ?? 0}
              </div>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">การศึกษา</label>
            <div>
              {user.campusName} • {user.facultyName} • {user.majorName}
            </div>
          </div>

          <div className="ad-field">
            <label
              className="ad-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <FaCircleInfo /> เป้าหมายการเรียน
            </label>

            {isLoadingBranches ? (
              <div style={{ fontSize: "12px", color: "var(--muted)", padding: 8 }}>
                กำลังโหลดข้อมูล...
              </div>
            ) : branches.length === 0 ? (
              <div style={{ fontSize: "12px", color: "var(--muted)", padding: 8 }}>
                ยังไม่ได้เลือกเป้าหมายการเรียน
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {branches.map((branch) => {
                  const isBranchExpanded = expandedBranchId === branch.id;
                  return (
                    <div
                      key={branch.id}
                      style={{
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        background: "var(--bg)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        onClick={() => setExpandedBranchId(isBranchExpanded ? null : branch.id)}
                        style={{
                          padding: "10px 14px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          background: isBranchExpanded ? "rgba(0, 71, 171, 0.04)" : "transparent",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontWeight: 700, fontSize: "13px", color: "var(--text)" }}>
                            {branch.goal?.goal || `Goal #${branch.goalId}`}
                          </span>
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: 700,
                              color: "var(--accent)",
                              background: "rgba(0, 71, 171, 0.07)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              border: "1px solid rgba(0,71,171,0.12)",
                            }}
                          >
                            EXP: {branch.expForGoal ?? 0}
                          </span>
                        </div>
                        <span
                          style={{
                            transform: isBranchExpanded ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                            fontSize: 14,
                            color: "var(--muted)",
                          }}
                        >
                          <FaChevronDown />
                        </span>
                      </div>

                      {isBranchExpanded && (
                        <div
                          style={{
                            padding: "12px 14px",
                            borderTop: "1px solid var(--border)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                            fontSize: "12px",
                          }}
                        >
                          <div>
                            <strong>คำอธิบายเป้าหมาย:</strong>{" "}
                            {branch.goal?.goalDescription || "ไม่มีคำอธิบาย"}
                          </div>
                          <div style={{ display: "flex", gap: 20 }}>
                            <div>
                              <strong>สถานะ Pretest:</strong>{" "}
                              {branch.isAlreadyPretest ? "ทำแล้ว ✅" : "ยังไม่ได้ทำ ⏳"}
                            </div>
                            <div>
                              <strong>Goal ID:</strong> {branch.goalId}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="ad-modal-footer">
          <button type="button" className="ad-btn-cancel" onClick={onClose}>
            ปิด
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(user)}>
            <FaPen /> แก้ไข
          </button>
        </div>
      </div>
    </div>
  );
}
