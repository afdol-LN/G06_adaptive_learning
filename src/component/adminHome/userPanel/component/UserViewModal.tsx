import { useState } from "react";
import {
  FaMagnifyingGlass,
  FaPen,
  FaChevronDown,
  FaCircleInfo,
  FaFire,
  FaCircleCheck,
  FaHourglassHalf,
} from "react-icons/fa6";
import { UserResponseAdmin } from "../../../../models/userModel";
import { getStatusColor } from "../../../../utils/adminUi";
import { usePreferences } from "../../../../context/PreferencesContext";

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
  const { t } = usePreferences();
  const [expandedBranchId, setExpandedBranchId] = useState<number | null>(null);

  if (!user) return null;

  const statusColor = getStatusColor(user.status);

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaMagnifyingGlass /> {t("admin.userView.title")}
          </span>
        </div>

        <div className="ad-modal-body">
          <div className="ad-field">
            <label className="ad-label">{t("admin.users.col.name")}</label>
            <div>{user.fullName}</div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.common.status")}</label>
              <div>
                <span className="ad-status-dot" style={{ background: statusColor }} />
                <span className="ad-muted">
                  {user.status === "active" ? t("admin.status.active") : t("admin.status.inactive")}
                </span>
              </div>
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("admin.userForm.username")}</label>
              <div>{user.username || "-"}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.userForm.dob")}</label>
              <div>{user.birthDate || "-"}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("admin.userForm.gender")}</label>
              <div>{user.genderName || "-"}</div>
            </div>
          </div>

          <div className="ad-field-row">
            <div className="ad-field">
              <label className="ad-label">{t("admin.userForm.role")}</label>
              <div>{user.role || "-"}</div>
            </div>
            <div className="ad-field">
              <label className="ad-label">{t("admin.summary.col.streak")}</label>
              <div>
                <FaFire /> {user.dayStreak ?? 0}
              </div>
            </div>
          </div>

          <div className="ad-field">
            <label className="ad-label">{t("admin.userView.education")}</label>
            <div>
              {user.campusName} • {user.facultyName} • {user.majorName}
            </div>
          </div>

          <div className="ad-field">
            <label
              className="ad-label"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <FaCircleInfo /> {t("admin.userView.goals")}
            </label>

            {isLoadingBranches ? (
              <div style={{ fontSize: "12px", color: "var(--muted)", padding: 8 }}>
                {t("admin.common.loadingData")}
              </div>
            ) : branches.length === 0 ? (
              <div style={{ fontSize: "12px", color: "var(--muted)", padding: 8 }}>
                {t("admin.userView.noGoals")}
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
                          background: isBranchExpanded
                            ? "color-mix(in srgb, var(--accent) 5%, transparent)"
                            : "transparent",
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
                              background: "color-mix(in srgb, var(--accent) 8%, transparent)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              border: "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
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
                            <strong>{t("admin.userView.goalDesc")}</strong>{" "}
                            {branch.goal?.goalDescription || t("admin.userView.noDesc")}
                          </div>
                          <div style={{ display: "flex", gap: 20 }}>
                            <div>
                              <strong>{t("admin.userView.pretest")}</strong>{" "}
                              {branch.isAlreadyPretest ? (
                                <span style={{ color: "var(--green)" }}>
                                  {t("admin.userView.pretestDone")} <FaCircleCheck aria-hidden />
                                </span>
                              ) : (
                                <span style={{ color: "var(--orange)" }}>
                                  {t("admin.userView.pretestPending")} <FaHourglassHalf aria-hidden />
                                </span>
                              )}
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
            {t("admin.common.close")}
          </button>
          <button type="button" className="ad-btn-primary" onClick={() => onEdit(user)}>
            <FaPen /> {t("admin.common.edit")}
          </button>
        </div>
      </div>
    </div>
  );
}
