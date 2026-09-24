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
import { useRecommendationController } from "./recommendation.controller";

export type HomeTabKey = "Home" | "History" | "Profile";
const HOME_TABS: HomeTabKey[] = ["Home", "History", "Profile"];

// จำสถานะ sidebar (ย่อ/ขยาย) ไว้ข้าม session
const SIDEBAR_COLLAPSED_KEY = "homeSidebarCollapsed";
// จำสถานะ Profile strip บนหน้า Home (พับ/กาง) — ค่าเริ่มต้นกาง
const PROFILE_STRIP_COLLAPSED_KEY = "homeProfileCollapsed";
// จำสถานะการ์ด "ความคืบหน้าโดยรวม" ที่ลอยบน tree — ครั้งแรกบนจอแคบให้เริ่มแบบพับ
const PROGRESS_PANEL_COLLAPSED_KEY = "homeProgressCollapsed";

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
  const recommendationController = useRecommendationController(branchId);
  // แสดงป้ายเฉพาะเมื่อ skill ที่แนะนำอยู่ใน tree ของ branch นี้จริง
  const recommendedSkillId =
    skillTreeController.treeSkills.find((s) => s.skillId === recommendationController.recommendedSkillId)
      ?.skillId ?? null;

  // Tab State — เปิดแท็บตรงได้ผ่าน router state { tab }
  // ชื่อแท็บที่ไม่มีแล้ว (เช่น "SkillTree" เดิม ที่รวมเข้า Home) → Home
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<HomeTabKey>(() => {
    const tab = (location.state as { tab?: string } | null)?.tab;
    return HOME_TABS.includes(tab as HomeTabKey) ? (tab as HomeTabKey) : "Home";
  });

  // Sidebar State — ครั้งแรกบนจอแคบให้เริ่มแบบย่อ
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored !== null ? stored === "1" : window.innerWidth < 768;
  });

  const [profileStripCollapsed, setProfileStripCollapsed] = useState<boolean>(
    () => localStorage.getItem(PROFILE_STRIP_COLLAPSED_KEY) === "1"
  );

  const [progressPanelCollapsed, setProgressPanelCollapsed] = useState<boolean>(() => {
    const stored = localStorage.getItem(PROGRESS_PANEL_COLLAPSED_KEY);
    return stored !== null ? stored === "1" : window.innerWidth < 1024;
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

  useEffect(() => {
    localStorage.setItem(PROFILE_STRIP_COLLAPSED_KEY, profileStripCollapsed ? "1" : "0");
  }, [profileStripCollapsed]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_PANEL_COLLAPSED_KEY, progressPanelCollapsed ? "1" : "0");
  }, [progressPanelCollapsed]);

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
    // strip พับอยู่ → กางก่อน ไม่งั้น step tour-stats ไม่มี element ให้ชี้และถูกข้าม
    if (activeTab === "Home" && profileStripCollapsed) {
      setProfileStripCollapsed(false);
      requestAnimationFrame(() => homeTour.startTour(activeTab, { force: true }));
      return;
    }
    homeTour.startTour(activeTab, { force: true });
  };

  const toggleProfileStrip = () => setProfileStripCollapsed((c) => !c);

  const toggleProgressPanel = () => setProgressPanelCollapsed((c) => !c);

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
    // home profile strip
    profileStripCollapsed,
    toggleProfileStrip,
    progressPanelCollapsed,
    toggleProgressPanel,
    // skill tree interaction
    hovered,
    setHovered,
    handleNodeClick,
    handleGoalClick,
    recommendedSkillId,
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
