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
import { usePreferences } from "../../context/PreferencesContext";
import type { TKey } from "../../i18n";
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
import { Topbar } from "../common/Topbar";
import CreateBranchModal from "../CreateBranchModal";
import AppLogo from "../common/AppLogo";
import { LayoutSkill } from "./utils/skillTree";
import "../decorate/Home.css";
import "../decorate/Tour.css";

type HomeTabKey = "Home" | "SkillTree" | "History" | "Profile";

const NAV_ITEMS: { key: HomeTabKey; labelKey: TKey; Icon: IconType }[] = [
  { key: "Home", labelKey: "nav.home", Icon: FaHouse },
  { key: "SkillTree", labelKey: "nav.skillTree", Icon: FaSitemap },
  { key: "History", labelKey: "nav.history", Icon: FaClockRotateLeft },
  { key: "Profile", labelKey: "nav.profile", Icon: FaUser },
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
  const { t } = usePreferences();

  const navigate = useNavigate();

  const branchId = activeBranchId ? Number(activeBranchId) : null;

  // Controllers/Hooks
  const skillTreeController = useBranchSkillController(branchId);
  const statsController = useBranchStatsController(branchId);
  const historyController = useSessionHistoryController(branchId);
  const homeTour = useHomeTourController(t);

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

  // Each tab has its own tour: auto-start it the first time the user opens that tab,
  // and close whatever tour is running when they move to another tab
  const hasBranch = Boolean(activeBranch);
  const pageTourSeen = homeTour.hasSeenTour(activeTab);
  useEffect(() => {
    if (!hasBranch || pageTourSeen !== false) return;
    homeTour.startTour(activeTab);
    return () => homeTour.cancelTour();
  }, [hasBranch, activeTab, pageTourSeen]);

  // Help replays the tour of the tab the user is on — no jump back to Home
  const handleHelpClick = () => {
    setShowGoalMenu(false);
    setShowProfileMenu(false);
    homeTour.startTour(activeTab, { force: true });
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
  const fullName = profileFullName || localStorage.getItem("fullname") || t("user.fallbackName");

  // If no branch is selected or active, prompt user
  if (!activeBranch) {
    return (
      <div className="app no-branch">
        <div className="no-branch-card">
          <h2 className="no-branch-title">{t("noBranch.title")}</h2>
          <p className="no-branch-desc">{t("noBranch.desc")}</p>
          <button className="no-branch-cta" onClick={() => navigate("/selectbranch")}>
            {t("noBranch.cta")}
          </button>
        </div>
      </div>
    );
  }

  const goalLabel = activeBranch.goalName || t("goal.placeholder");
  const activeNav = NAV_ITEMS.find((n) => n.key === activeTab) ?? NAV_ITEMS[0];
  const sidebarToggleLabel = sidebarCollapsed ? t("sidebar.show") : t("sidebar.hide");

  return (
    <div className="app" data-tour="tour-page">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <button
          type="button"
          className="sb-toggle"
          onClick={toggleSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarToggleLabel}
          title={sidebarToggleLabel}
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
                          {b.campus} · {t("goal.year", { year: b.year || 1 })}
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
                <span>{t("goal.add")}</span>
              </button>

              <button
                className="goal-dropdown-action"
                onClick={() => {
                  setShowGoalMenu(false);
                  navigate("/selectbranch");
                }}
              >
                <span className="goal-dropdown-action-icon"><FaArrowLeft aria-hidden /></span>
                <span>{t("goal.backToSelect")}</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="sb-nav" data-tour="tour-nav-tabs">
          {NAV_ITEMS.map((item) => {
            const label = t(item.labelKey);
            return (
              <button
                key={item.key}
                className={`sb-nav-item ${activeTab === item.key ? "active" : ""}`}
                onClick={() => switchTab(item.key)}
                aria-current={activeTab === item.key ? "page" : undefined}
                title={sidebarCollapsed ? label : undefined}
              >
                <span className="sb-icon"><item.Icon aria-hidden /></span>
                <span className="sb-label">{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sb-footer">
          <button
            className="sb-nav-item sb-help"
            data-tour="tour-help"
            onClick={handleHelpClick}
            title={t("sidebar.helpHint")}
          >
            <span className="sb-icon"><FaCircleQuestion aria-hidden /></span>
            <span className="sb-label">{t("sidebar.help")}</span>
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
                  {t("menu.profile")}
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
                  {t("menu.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main column: topbar + tab content (sits beside the sidebar, never under it) */}
      <div className="app-main">
        <Topbar title={t(activeNav.labelKey)} />

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
