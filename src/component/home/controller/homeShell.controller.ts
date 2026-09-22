import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { usePreferences } from "../../../context/PreferencesContext";
import type { BranchBaseState } from "../../../models/branchStatsModel";
import { branchStatsService } from "../branchStats.service";
import { LayoutSkill } from "../utils/skillTree";
import { useBranchSkillController } from "./branchSkill.controller";
import { useBranchStatsController } from "./branchStats.controller";
import { useSessionHistoryController } from "./sessionHistory.controller";
import { useHomeTourController } from "./homeTour.controller";
import { useUserProfileController } from "./userProfile.controller";

export type HomeTabKey = "Home" | "SkillTree" | "History" | "Profile";

// จำสถานะ sidebar (ย่อ/ขยาย) ไว้ข้าม session
const SIDEBAR_COLLAPSED_KEY = "homeSidebarCollapsed";

// state + handler ทั้งหมดของ HomeShell — ตัว component เหลือแค่การจัดวาง UI
export function useHomeShellController() {
  const { userProfile, branches, activeBranchId, activeBranch, fetchMyBranches } = useApp();
  const { t } = usePreferences();
  const navigate = useNavigate();
  
  const branchId = activeBranchId ? Number(activeBranchId) : null;

  // Controllers/Hooks
  const skillTreeController = useBranchSkillController(branchId);
  const statsController = useBranchStatsController(branchId);
  const historyController = useSessionHistoryController(branchId);
  const homeTour = useHomeTourController(t);
  const profileController = useUserProfileController();

  // Tab State
  // Exercise's "View skill tree" (after completing the goal) opens a tab directly via router state
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<HomeTabKey>(
    () => (location.state as { tab?: HomeTabKey } | null)?.tab ?? "Home"
  );

  // Sidebar State — ครั้งแรกบนจอแคบให้เริ่มแบบย่อ
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? stored === "1" : window.innerWidth < 768;
  });

  // Dropdown States
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Modal States
  const [showPicker, setShowPicker] = useState(false);
  const [confirmSkill, setConfirmSkill] = useState<LayoutSkill | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // ที่มาของคะแนนเริ่มต้นจาก pretest — null = modal ปิดอยู่
  const [baseState, setBaseState] = useState<BranchBaseState[] | null>(null);

  // Hover states
  const [hovered, setHovered] = useState<number | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fetch branches on mount
  useEffect(() => {
    fetchMyBranches();
  }, []);

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, sidebarCollapsed ? "1" : "0");
  }, [sidebarCollapsed]);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // เปิดเฉพาะเมื่อมีข้อมูล — ยังไม่ทำ pretest (ได้ []) หรือเรียกไม่สำเร็จก็ไม่เปิด modal ว่าง ๆ
  const openBreakdown = useCallback(async () => {
    if (!branchId) return;
    const res = await branchStatsService.getBranchBaseState(branchId);
    if (!res.isError && res.data && res.data.length > 0) {
      setBaseState(res.data);
    }
  }, [branchId]);

  const closeBreakdown = () => setBaseState(null);

  // เพิ่งทำ pretest เสร็จ (usePretestController ส่ง state.fromPretest มา) → เปิดครั้งเดียว
  useEffect(() => {
    const state = location.state as { fromPretest?: boolean } | null;
    // รอ branchId ก่อน ไม่งั้น flag ถูกล้างไปทั้งที่ยังเปิด modal ไม่ได้
    if (!state?.fromPretest || !branchId) return;
    openBreakdown();
    // ล้าง flag — history.state อยู่รอดหลัง refresh ไม่ล้างแล้ว modal จะขึ้นซ้ำ
    navigate(location.pathname, { replace: true, state: { ...state, fromPretest: undefined } });
  }, [location.state, branchId, openBreakdown]);

  // ปิด auto-start tour — tour จะขึ้นเฉพาะเมื่อกดปุ่ม "วิธีใช้งาน" เอง
  // Help replays the tour of the tab the user is on — no jump back to Home
  const handleHelpClick = () => {
    setShowProfileMenu(false);
    homeTour.startTour(activeTab, { force: true });
  };

  const toggleSidebar = () => {
    setShowProfileMenu(false);
    setSidebarCollapsed((c) => !c);
  };

  const toggleProfileMenu = () => setShowProfileMenu((open) => !open);

  const switchTab = (tab: HomeTabKey) => {
    setActiveTab(tab);
    skillTreeController.setSelectedSkill(null);
  };

  const openProfileFromMenu = () => {
    switchTab("Profile");
    setShowProfileMenu(false);
  };

  const handleNodeClick = (skill: LayoutSkill) => {
    skillTreeController.setSelectedSkill(
      skillTreeController.selectedSkill?.skillId === skill.skillId ? null : skill
    );
  };

  const handleGoalClick = () => {
    skillTreeController.setGoalSelected(!skillTreeController.goalSelected);
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

  const goToSelectBranch = () => navigate("/selectbranch");

  const profileFullName = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(" ");
  const fullName = profileFullName || localStorage.getItem("fullname") || t("user.fallbackName");

  return {
    // data from context
    userProfile,
    branches,
    activeBranch,
    // sub-controllers
    skillTreeController,
    statsController,
    historyController,
    profileController,
    // tabs
    activeTab,
    switchTab,
    // sidebar + profile menu
    sidebarCollapsed,
    toggleSidebar,
    showProfileMenu,
    toggleProfileMenu,
    openProfileFromMenu,
    profileMenuRef,
    fullName,
    handleHelpClick,
    // skill tree interaction
    hovered,
    setHovered,
    handleNodeClick,
    handleGoalClick,
    // exercise flow
    showPicker,
    setShowPicker,
    confirmSkill,
    handleStartExercise,
    handleConfirmExercise,
    handleCancelExercise,
    handleGoPicker,
    // branches
    showCreateModal,
    setShowCreateModal,
    goToSelectBranch,
    // pretest breakdown
    baseState,
    openBreakdown,
    closeBreakdown,
  };
}

export type HomeShellControllerType = ReturnType<typeof useHomeShellController>;
