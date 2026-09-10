import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FaArrowLeft,
  FaBullseye,
  FaCheck,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCircleQuestion,
  FaClockRotateLeft,
  FaHouse,
  FaPlus,
  FaSitemap,
  FaUser,
  FaUserGraduate,
} from "react-icons/fa6";
import { useApp } from "../../context/AppContext";
import { useBranchSkillController } from "./controller/branchSkill.controller";
import { useBranchStatsController } from "./controller/branchStats.controller";
import { useSessionHistoryController } from "./controller/sessionHistory.controller";
import { useHomeTourController } from "./controller/homeTour.controller";
import { HomeTab } from "./tabs/HomeTab";
import { SkillTreeTab } from "./tabs/SkillTreeTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { NextExercisePicker } from "./skillTree/NextExercisePicker";
import { ExerciseConfirmModal } from "./skillTree/ExerciseConfirmModal";
import CreateBranchModal from "../CreateBranchModal";
import AppLogo from "../common/AppLogo";
import { LayoutSkill } from "./utils/skillTree";
import "../decorate/Home.css";
import "../decorate/Tour.css";

type HomeTabKey = "Home" | "SkillTree" | "History" | "Profile";

const NAV_ITEMS: { key: HomeTabKey; label: string; Icon: IconType }[] = [
  { key: "Home", label: "Home", Icon: FaHouse },
  { key: "SkillTree", label: "Skill Tree", Icon: FaSitemap },
  { key: "History", label: "History", Icon: FaClockRotateLeft },
  { key: "Profile", label: "Profile", Icon: FaUser },
];

// จำสถานะ sidebar (ย่อ/ขยาย) ไว้ข้าม session
const SIDEBAR_COLLAPSED_KEY = "homeSidebarCollapsed";

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
  const homeTour = useHomeTourController();
  const pendingForceTourRef = useRef(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<HomeTabKey>("Home");

  // Sidebar State — ครั้งแรกบนจอแคบให้เริ่มแบบย่อ
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? stored === "1" : window.innerWidth < 768;
  });

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

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

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

  // Auto-start the onboarding tour the first time the user lands on the Home tab
  useEffect(() => {
    if (!activeBranch || activeTab !== "Home" || homeTour.hasSeenTour !== false) return;
    homeTour.startTour();
    return () => homeTour.cancelTour();
  }, [activeBranch, activeTab, homeTour.hasSeenTour]);

  // Replay requested via the Help button while on another tab — wait for Home to mount
  useEffect(() => {
    if (pendingForceTourRef.current && activeTab === "Home") {
      pendingForceTourRef.current = false;
      homeTour.startTour({ force: true });
    }
  }, [activeTab]);

  const handleHelpClick = () => {
    setShowGoalMenu(false);
    setShowProfileMenu(false);
    if (activeTab !== "Home") {
      pendingForceTourRef.current = true;
      switchTab("Home");
    } else {
      homeTour.startTour({ force: true });
    }
  };

  const toggleSidebar = () => {
    setShowGoalMenu(false);
    setShowProfileMenu(false);
    setSidebarCollapsed((c) => !c);
  };

  const switchTab = (tab: HomeTabKey) => {
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

  const avatar = <FaUserGraduate aria-hidden />;
  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || "นักเรียน ALS";

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

  const goalLabel = activeBranch.goalName || "เลือกสายการเรียน";

  return (
    <div className="app" data-tour="tour-page">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <button
          type="button"
          className="sb-toggle"
          onClick={toggleSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarCollapsed ? "แสดงแถบเมนู" : "ซ่อนแถบเมนู"}
          title={sidebarCollapsed ? "แสดงแถบเมนู" : "ซ่อนแถบเมนู"}
        >
          {sidebarCollapsed ? <FaChevronRight aria-hidden /> : <FaChevronLeft aria-hidden />}
        </button>

        <div className="sb-header" data-tour="tour-logo">
          <div className="sb-brand-icon"><AppLogo /></div>
          <span className="sb-brand sb-label">G06 · ALS</span>
        </div>

        {/* Goal switcher dropdown */}
        <div className="sb-goal" ref={goalMenuRef} data-tour="tour-goal-switcher">
          <button
            className="sb-goal-btn"
            onClick={() => setShowGoalMenu(!showGoalMenu)}
            title={sidebarCollapsed ? goalLabel : undefined}
          >
            <span className="sb-icon"><FaBullseye aria-hidden /></span>
            <span className="sb-label sb-goal-name">{goalLabel}</span>
            <span className="sb-label sb-caret"><FaChevronDown aria-hidden /></span>
          </button>
          {showGoalMenu && (
            <div className="goal-dropdown">
              <div className="goal-dropdown-list">
                {branches.map((b) => {
                  const isActive = String(b.id) === String(activeBranch.id);
                  return (
                    <button
                      key={b.id}
                      className={`goal-dropdown-item ${isActive ? "active" : ""}`}
                      onClick={() => {
                        switchBranch(b.id);
                        setShowGoalMenu(false);
                      }}
                    >
                      <div>
                        <div className="goal-dropdown-name">{b.goalName}</div>
                        <div className="goal-dropdown-meta">
                          {b.campus} · ปี {b.year || 1}
                        </div>
                      </div>
                      {isActive && <span className="goal-dropdown-check"><FaCheck aria-hidden /></span>}
                    </button>
                  );
                })}
              </div>

              <button
                className="goal-dropdown-action primary"
                onClick={() => {
                  setShowCreateModal(true);
                  setShowGoalMenu(false);
                }}
              >
                <span className="goal-dropdown-action-icon"><FaPlus aria-hidden /></span>
                <span>เพิ่มเป้าหมายใหม่</span>
              </button>

              <button
                className="goal-dropdown-action"
                onClick={() => {
                  setShowGoalMenu(false);
                  navigate("/selectbranch");
                }}
              >
                <span className="goal-dropdown-action-icon"><FaArrowLeft aria-hidden /></span>
                <span>ไปหน้าเลือกเป้าหมาย</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="sb-nav" data-tour="tour-nav-tabs">
          {NAV_ITEMS.map((t) => (
            <button
              key={t.key}
              className={`sb-nav-item ${activeTab === t.key ? "active" : ""}`}
              onClick={() => switchTab(t.key)}
              aria-current={activeTab === t.key ? "page" : undefined}
              title={sidebarCollapsed ? t.label : undefined}
            >
              <span className="sb-icon"><t.Icon aria-hidden /></span>
              <span className="sb-label">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="sb-footer">
          <button
            className="sb-nav-item sb-help"
            onClick={handleHelpClick}
            title="ดูวิธีใช้งานหน้านี้อีกครั้ง"
          >
            <span className="sb-icon"><FaCircleQuestion aria-hidden /></span>
            <span className="sb-label">วิธีใช้งาน</span>
          </button>

          {/* User profile dropdown */}
          <div className="sb-user-wrapper" ref={profileMenuRef} data-tour="tour-profile-menu">
            <button
              className="sb-user"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              title={sidebarCollapsed ? fullName : undefined}
            >
              <div className="nav-user-avatar">{avatar}</div>
              <span className="sb-label nav-user-name">{fullName}</span>
              <span className={`sb-label nav-chevron ${showProfileMenu ? "open" : ""}`}><FaChevronDown aria-hidden /></span>
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
        </div>
      </aside>

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
