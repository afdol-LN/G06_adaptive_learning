import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { useBranchSkillController } from "./controller/branchSkill.controller";
import { useBranchStatsController } from "./controller/branchStats.controller";
import { useSessionHistoryController } from "./controller/sessionHistory.controller";
import { HomeTab } from "./tabs/HomeTab";
import { SkillTreeTab } from "./tabs/SkillTreeTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { NextExercisePicker } from "./skillTree/NextExercisePicker";
import { ExerciseConfirmModal } from "./skillTree/ExerciseConfirmModal";
import CreateBranchModal from "../CreateBranchModal";
import { LayoutSkill } from "./utils/skillTree";
import "../decorate/Home.css";

export const HomeShell: React.FC = () => {
  const {
    userProfile,
    branches,
    activeBranchId,
    activeBranch,
    switchBranch,
    fetchMyBranches,
  } = useApp();

  const navigate = useNavigate();

  const branchId = activeBranchId ? Number(activeBranchId) : null;

  // Controllers/Hooks
  const skillTreeController = useBranchSkillController(branchId);
  const statsController = useBranchStatsController(branchId);
  const historyController = useSessionHistoryController(branchId);

  // Tab State
  const [activeTab, setActiveTab] = useState<"Home" | "SkillTree" | "History" | "Profile">("Home");

  // Dropdown States
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modal States
  const [showPicker, setShowPicker] = useState(false);
  const [confirmSkill, setConfirmSkill] = useState<LayoutSkill | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hover states
  const [hovered, setHovered] = useState<number | null>(null);

  const goalMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch branches on mount
  useEffect(() => {
    fetchMyBranches();
  }, []);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (goalMenuRef.current && !goalMenuRef.current.contains(target) && !target.closest(".create-branch-modal")) {
        setShowGoalMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const switchTab = (tab: "Home" | "SkillTree" | "History" | "Profile") => {
    setActiveTab(tab);
    skillTreeController.setSelectedSkill(null);
  };

  const handleNodeClick = (skill: LayoutSkill) => {
    skillTreeController.setSelectedSkill(
      skillTreeController.selectedSkill?.skillId === skill.skillId ? null : skill
    );
  };

  const handleStartExercise = (skill: LayoutSkill) => {
    setConfirmSkill(skill);
  };

  const handleConfirmExercise = () => {
    if (!confirmSkill) return;
    const targetSkill = confirmSkill;
    setConfirmSkill(null);
    // Navigate to gameplay with state
    navigate("/exercise", {
      state: {
        skillId: targetSkill.skillId,
        skillCode: targetSkill.skillCode,
        skillsName: targetSkill.skillsName,
      },
    });
  };

  const handleCancelExercise = () => setConfirmSkill(null);

  const handleGoPicker = (skill: LayoutSkill) => {
    setShowPicker(false);
    setConfirmSkill(skill);
  };

  const avatar = userProfile?.gender === "FEMALE" ? "👩‍🎓" : "👨‍🎓";
  const fullName = userProfile
    ? `${userProfile.fname || ""} ${userProfile.lname || ""}`.trim()
    : "นักเรียน ALS";

  // If no branch is selected or active, prompt user
  if (!activeBranch) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f8fafc" }}>
        <div style={{ textAlign: "center", background: "#fff", padding: "40px", borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" }}>
            ยังไม่พบเป้าหมายการเรียนรู้หลัก
          </h2>
          <p style={{ color: "#64748b", marginBottom: "24px" }}>
            กรุณาเลือกหรือเพิ่มเป้าหมายการเรียนรู้ใหม่ก่อนทำแบบฝึกหัด
          </p>
          <button
            onClick={() => navigate("/selectbranch")}
            style={{ padding: "10px 24px", background: "#0047AB", color: "#fff", fontWeight: "700", border: "none", borderRadius: "8px", cursor: "pointer" }}
          >
            เลือกเป้าหมายการเรียนรู้
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-logo">
          <span className="nav-logo-text">PSU · ALS</span>

          {/* Goal switcher dropdown */}
          <div ref={goalMenuRef} style={{ position: "relative", marginLeft: "8px" }}>
            <button
              onClick={() => setShowGoalMenu(!showGoalMenu)}
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#0047AB",
                background: "rgba(0,71,171,0.08)",
                border: "1px solid rgba(0,71,171,0.2)",
                borderRadius: "99px",
                padding: "3px 10px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              {activeBranch.goalName || "เลือกสายการเรียน"}
              <span style={{ fontSize: "10px" }}>▾</span>
            </button>
            {showGoalMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  minWidth: "220px",
                  background: "#fff",
                  border: "1px solid #c2d3e0",
                  borderRadius: "14px",
                  boxShadow: "0 8px 32px rgba(0,71,171,0.13)",
                  zIndex: 300,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  maxHeight: "360px",
                }}
              >
                <div style={{ overflowY: "auto", maxHeight: "300px" }}>
                  {branches.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBranch(b.id);
                        setShowGoalMenu(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: String(b.id) === String(activeBranch.id) ? "#e8f0fe" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: "1px solid #f1f5f9",
                        fontFamily: "inherit",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{b.goalName}</div>
                        <div style={{ fontSize: "11px", color: "#64748b" }}>
                          {b.campus} · ปี {b.year || 1}
                        </div>
                      </div>
                      {String(b.id) === String(activeBranch.id) && (
                        <span style={{ marginLeft: "auto", color: "#0047AB", fontSize: "12px" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setShowGoalMenu(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#f8fafc",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    color: "#0047AB",
                    fontWeight: "700",
                    borderTop: "1px solid #e2e8f0",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ fontSize: "18px" }}>+</span>
                  <span style={{ fontSize: "13px" }}>เพิ่มเป้าหมายใหม่</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-tabs">
          {[
            { key: "Home", label: "Home" },
            { key: "SkillTree", label: "Skill Tree" },
            { key: "History", label: "History" },
            { key: "Profile", label: "Profile" },
          ].map((t) => (
            <button
              key={t.key}
              className={`nav-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => switchTab(t.key as any)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* User profile dropdown */}
        <div className="nav-user-wrapper" ref={profileMenuRef}>
          <button className="nav-user" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="nav-user-avatar">{avatar}</div>
            <span className="nav-user-name">{fullName}</span>
            <span className={`nav-chevron ${showProfileMenu ? "open" : ""}`}>▾</span>
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">{avatar}</div>
                <div>
                  <div className="dropdown-name">{fullName}</div>
                  <div className="dropdown-email">{activeBranch.goalName}</div>
                </div>
              </div>
              <div className="dropdown-sep" />
              <button
                className="dropdown-item"
                onClick={() => {
                  switchTab("Profile");
                  setShowProfileMenu(false);
                }}
              >
                Profile
              </button>
              <div className="dropdown-sep" />
              <button
                className="dropdown-item danger"
                onClick={() => {
                  localStorage.removeItem("access_token");
                  localStorage.removeItem("userProfile");
                  localStorage.removeItem("activeBranchId");
                  navigate("/");
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Tabs Content */}
      <div className="content">
        {activeTab === "Home" && (
          <HomeTab
            userProfile={userProfile}
            activeBranch={activeBranch}
            stats={statsController.stats}
            skills={skillTreeController.skills}
            treeSkills={skillTreeController.treeSkills}
            unlocked={skillTreeController.unlockedSkills}
            canUnlock={skillTreeController.canUnlock}
            selected={skillTreeController.selectedSkill}
            setSelected={skillTreeController.setSelectedSkill}
            hovered={hovered}
            setHovered={setHovered}
            sessions={historyController.sessions}
            onStartExercise={handleStartExercise}
            setShowPicker={setShowPicker}
            handleNodeClick={handleNodeClick}
            switchTab={switchTab}
          />
        )}

        {activeTab === "SkillTree" && (
          <SkillTreeTab
            treeSkills={skillTreeController.treeSkills}
            unlocked={skillTreeController.unlockedSkills}
            canUnlockFn={skillTreeController.canUnlock}
            onNodeClick={handleNodeClick}
            selected={skillTreeController.selectedSkill}
            setSelected={skillTreeController.setSelectedSkill}
            hovered={hovered}
            setHovered={setHovered}
            onStartExercise={handleStartExercise}
          />
        )}

        {activeTab === "History" && <HistoryTab sessions={historyController.sessions} />}

        {activeTab === "Profile" && (
          <ProfileTab
            unlocked={skillTreeController.unlockedSkills}
            sessions={historyController.sessions}
            userProfile={userProfile}
            activeBranch={activeBranch}
          />
        )}
      </div>

      {/* Modals */}
      {showPicker && (
        <NextExercisePicker
          skills={skillTreeController.treeSkills}
          unlocked={skillTreeController.unlockedSkills}
          canUnlockFn={skillTreeController.canUnlock}
          onGo={handleGoPicker}
          onClose={() => setShowPicker(false)}
        />
      )}

      {confirmSkill && (
        <ExerciseConfirmModal
          skill={confirmSkill}
          onConfirm={handleConfirmExercise}
          onCancel={handleCancelExercise}
        />
      )}

      {showCreateModal && <CreateBranchModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
export default HomeShell;
