import React from "react";
import type { IconType } from "react-icons";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaCircleQuestion,
  FaClockRotateLeft,
  FaHouse,
  FaUser,
  FaUserGraduate,
} from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import type { TKey } from "../../i18n";
import LogoutButton from "../common/LogoutButton";
import { useHomeShellController, type HomeTabKey } from "./controller/homeShell.controller";
import { HomeTab } from "./tabs/HomeTab";
import { HistoryTab } from "./tabs/HistoryTab";
import { ProfileTab } from "./tabs/ProfileTab";
import { NextExercisePicker } from "./skillTree/NextExercisePicker";
import { ExerciseConfirmModal } from "./skillTree/ExerciseConfirmModal";
import { Topbar } from "../common/Topbar";
import CreateBranchModal from "../CreateBranchModal";
import AppBrand from "../common/AppBrand";
import { GoalSwitcher } from "./GoalSwitcher";
import { BranchBaseStateModal } from "./component/branchBaseState";
import "../decorate/Home.css";
import "../decorate/Tour.css";

const NAV_ITEMS: { key: HomeTabKey; labelKey: TKey; Icon: IconType }[] = [
  { key: "Home", labelKey: "nav.home", Icon: FaHouse },
  { key: "History", labelKey: "nav.history", Icon: FaClockRotateLeft },
  { key: "Profile", labelKey: "nav.profile", Icon: FaUser },
];

export const HomeShell: React.FC = () => {
  const { t } = usePreferences();
  const controller = useHomeShellController();
  const {
    userProfile,
    branches,
    activeBranch,
    skillTreeController,
    statsController,
    historyController,
    profileController,
    activeTab,
    sidebarCollapsed,
    showProfileMenu,
    fullName,
    hovered,
    setHovered,
  } = controller;

  const avatar = <FaUserGraduate aria-hidden />;

  // If no branch is selected or active, prompt user
  if (!activeBranch) {
    return (
      <div className="app no-branch">
        <div className="no-branch-card">
          <h2 className="no-branch-title">{t("noBranch.title")}</h2>
          <p className="no-branch-desc">{t("noBranch.desc")}</p>
          <button className="no-branch-cta" onClick={controller.goToSelectBranch}>
            {t("noBranch.cta")}
          </button>
        </div>
      </div>
    );
  }

  const activeNav = NAV_ITEMS.find((n) => n.key === activeTab) ?? NAV_ITEMS[0];
  const sidebarToggleLabel = sidebarCollapsed ? t("sidebar.show") : t("sidebar.hide");

  return (
    <div className="app" data-tour="tour-page">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <button
          type="button"
          className="sb-toggle"
          onClick={controller.toggleSidebar}
          aria-expanded={!sidebarCollapsed}
          aria-label={sidebarToggleLabel}
          title={sidebarToggleLabel}
        >
          {sidebarCollapsed ? <FaChevronRight aria-hidden /> : <FaChevronLeft aria-hidden />}
        </button>

        <AppBrand variant="sidebar" tourId="tour-logo" />


        {/* Navigation Tabs */}
        <nav className="sb-nav" data-tour="tour-nav-tabs">
          {NAV_ITEMS.map((item) => {
            const label = t(item.labelKey);
            return (
              <button
                key={item.key}
                className={`sb-nav-item ${activeTab === item.key ? "active" : ""}`}
                onClick={() => controller.switchTab(item.key)}
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
            onClick={controller.handleHelpClick}
            title={t("sidebar.helpHint")}
          >
            <span className="sb-icon"><FaCircleQuestion aria-hidden /></span>
            <span className="sb-label">{t("sidebar.help")}</span>
          </button>

          {/* User profile dropdown */}
          <div className="sb-user-wrapper" ref={controller.profileMenuRef} data-tour="tour-profile-menu">
            <button
              className="sb-user"
              onClick={controller.toggleProfileMenu}
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
                <button className="dropdown-item" onClick={controller.openProfileFromMenu}>
                  {t("menu.profile")}
                </button>
                <div className="dropdown-sep" />
                <LogoutButton className="dropdown-item danger">
                  {t("menu.logout")}
                </LogoutButton>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main column: topbar + tab content (sits beside the sidebar, never under it) */}
      <div className="app-main">
        <Topbar
          title={t(activeNav.labelKey)}
          extra={<GoalSwitcher onCreateBranch={() => controller.setShowCreateModal(true)} />}
        />

        <div className="content">
          {activeTab === "Home" && (
            <HomeTab
              fullName={fullName}
              profileStripCollapsed={controller.profileStripCollapsed}
              onToggleProfileStrip={controller.toggleProfileStrip}
              progressPanelCollapsed={controller.progressPanelCollapsed}
              onToggleProgressPanel={controller.toggleProgressPanel}
              activeBranch={activeBranch}
              stats={statsController.stats}
              treeSkills={skillTreeController.treeSkills}
              unlocked={skillTreeController.unlockedSkills}
              canUnlock={skillTreeController.canUnlock}
              selected={skillTreeController.selectedSkill}
              setSelected={skillTreeController.setSelectedSkill}
              hovered={hovered}
              setHovered={setHovered}
              onStartExercise={controller.handleStartExercise}
              setShowPicker={controller.setShowPicker}
              handleNodeClick={controller.handleNodeClick}
              goal={skillTreeController.goalNode}
              goalSelected={skillTreeController.goalSelected}
              onGoalClick={controller.handleGoalClick}
              setGoalSelected={skillTreeController.setGoalSelected}
              onShowBreakdown={activeBranch.isAlreadyPretest ? controller.openBreakdown : undefined}
              recommendedSkillId={controller.recommendedSkillId}
            />
          )}

          {activeTab === "History" && <HistoryTab sessions={historyController.sessions} />}

          {activeTab === "Profile" && (
            <ProfileTab
              unlocked={skillTreeController.unlockedSkills}
              sessions={historyController.sessions}
              profile={profileController.profile}
              profileLoading={profileController.isLoading}
              stats={statsController.stats}
              goalsCount={branches?.length ?? 0}
              activeBranch={activeBranch}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {controller.showPicker && (
        <NextExercisePicker
          skills={skillTreeController.treeSkills}
          unlocked={skillTreeController.unlockedSkills}
          canUnlockFn={skillTreeController.canUnlock}
          onGo={controller.handleGoPicker}
          onClose={() => controller.setShowPicker(false)}
        />
      )}

      {controller.confirmSkill && (
        <ExerciseConfirmModal
          skill={controller.confirmSkill}
          onConfirm={controller.handleConfirmExercise}
          onCancel={controller.handleCancelExercise}
        />
      )}

      {controller.showCreateModal && (
        <CreateBranchModal onClose={() => controller.setShowCreateModal(false)} />
      )}

      {controller.baseState && (
        <BranchBaseStateModal items={controller.baseState} onClose={controller.closeBreakdown} />
      )}
    </div>
  );
};
export default HomeShell;
