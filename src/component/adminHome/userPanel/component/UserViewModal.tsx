import { useState } from "react";
import {
  FaMagnifyingGlass,
  FaPen,
  FaChevronDown,
  FaFire,
  FaCircleCheck,
  FaHourglassHalf,
  FaUserShield,
  FaBullseye,
} from "react-icons/fa6";
import { UserResponseAdmin } from "../../../../models/userModel";
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

  const isActive = user.status === "active";
  const education = [user.campusName, user.facultyName, user.majorName].filter(Boolean).join(" • ");

  return (
    <div className="ad-overlay" onClick={onClose}>
      <div className="ad-modal ad-modal--user" onClick={(e) => e.stopPropagation()}>
        <div className="ad-modal-header">
          <span className="ad-modal-title">
            <FaMagnifyingGlass /> {t("admin.userView.title")}
          </span>
        </div>

        <div className="ad-modal-body">
          {/* ส่วนหัว: ใคร + สถานะ/บทบาท/streak เป็นป้ายเล็ก อ่านจบในบรรทัดเดียว */}
          <div className="ad-user-hero ad-uv-hero">
            <div className="ad-user-avatar-lg">{user.fullName[0] || "?"}</div>
            <div className="ad-uv-hero-text">
              <div className="ad-uv-name">{user.fullName}</div>
              <div className="ad-uv-username">@{user.username || "-"}</div>
              <div className="ad-uv-pills">
                <span className={`ad-uv-pill ${isActive ? "ad-uv-pill--ok" : "ad-uv-pill--off"}`}>
                  <span className="ad-uv-dot" />
                  {isActive ? t("admin.status.active") : t("admin.status.inactive")}
                </span>
                <span className="ad-uv-pill">
                  <FaUserShield aria-hidden /> {user.role || "-"}
                </span>
                <span className="ad-uv-pill ad-uv-pill--streak">
                  <FaFire aria-hidden /> {t("admin.summary.col.streak")} {user.dayStreak ?? 0}
                </span>
              </div>
            </div>
          </div>

          <div className="ad-uv-grid">
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.userForm.dob")}</span>
              <span className="ad-uv-value">{user.birthDate || "-"}</span>
            </div>
            <div className="ad-uv-item">
              <span className="ad-uv-label">{t("admin.userForm.gender")}</span>
              <span className="ad-uv-value">{user.genderName || "-"}</span>
            </div>
            <div className="ad-uv-item ad-uv-item--full">
              <span className="ad-uv-label">{t("admin.userView.education")}</span>
              <span className="ad-uv-value">{education || "-"}</span>
            </div>
          </div>

          <div className="ad-uv-section">
            <div className="ad-uv-section-title">
              <FaBullseye aria-hidden /> {t("admin.userView.goals")}
              {!isLoadingBranches && branches.length > 0 && (
                <span className="ad-uv-count">{branches.length}</span>
              )}
            </div>

            {isLoadingBranches ? (
              <div className="ad-uv-empty">{t("admin.common.loadingData")}</div>
            ) : branches.length === 0 ? (
              <div className="ad-uv-empty">{t("admin.userView.noGoals")}</div>
            ) : (
              <div className="ad-uv-goals">
                {branches.map((branch) => {
                  const isOpen = expandedBranchId === branch.id;
                  return (
                    <div key={branch.id} className={`ad-uv-goal${isOpen ? " is-open" : ""}`}>
                      <button
                        type="button"
                        className="ad-uv-goal-head"
                        onClick={() => setExpandedBranchId(isOpen ? null : branch.id)}
                        aria-expanded={isOpen}
                      >
                        <span className="ad-uv-goal-name">
                          {branch.goal?.goal || `Goal #${branch.goalId}`}
                        </span>
                        <span className="ad-uv-exp">EXP {branch.expForGoal ?? 0}</span>
                        <FaChevronDown className="ad-uv-chevron" aria-hidden />
                      </button>

                      {isOpen && (
                        <div className="ad-uv-goal-body">
                          <p>{branch.goal?.goalDescription || t("admin.userView.noDesc")}</p>
                          <div className="ad-uv-goal-meta">
                            <span>
                              {t("admin.userView.pretest")}{" "}
                              {branch.isAlreadyPretest ? (
                                <span className="ad-uv-ok">
                                  <FaCircleCheck aria-hidden /> {t("admin.userView.pretestDone")}
                                </span>
                              ) : (
                                <span className="ad-uv-wait">
                                  <FaHourglassHalf aria-hidden /> {t("admin.userView.pretestPending")}
                                </span>
                              )}
                            </span>
                            <span className="ad-uv-muted">Goal ID: {branch.goalId}</span>
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
