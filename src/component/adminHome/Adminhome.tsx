import { useState } from "react";
import {
  FaArrowRightFromBracket,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import {
  getScoreColor,
  getStatusColor,
  getTierColor,
  gradeKey,
  TABS,
} from "../../utils/adminUi";
import AppLogo from "../common/AppLogo";
import LogoutButton from "../common/LogoutButton";
import { Topbar } from "../common/Topbar";
import "../decorate/Adminhome.css";
import AiTab from "./aiPanel/AiTab";
import ExerciseTab from "./exercisePanel/ExerciseTab";
import GoalTab from "./goalPanel/GoalTab";
import { historyController } from "./historyPanel/history.controller";
import HistoryTab from "./HistoryTab";
import SkillTab from "./skillPanel/SkillTab";
import { summaryController } from "./summaryPanel/summary.controller";
import SummaryTab from "./SummaryTab";
import UsersTab from "./userPanel/UsersTab";
import ErrorBoundary from "../common/ErrorBoundary";

export default function AdminHome() {
  const { t } = usePreferences();
  const [activeTab, setActiveTab] = useState("summary");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    new Set(["summary"]),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    setVisitedTabs((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  };

  const { summary, skillProgress, userActivity, maxBar, dayLabels } =
    summaryController();
  const {
    filteredHistory,
    histSearch,
    setHistSearch,
    histGrade,
    setHistGrade,
  } = historyController();

  const tabIcon = (key: string) => TABS.find((tab) => tab.key === key)?.icon;
  const activeTabDef = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];
  const toggleLabel = sidebarOpen
    ? t("admin.sidebar.collapse")
    : t("admin.sidebar.expand");

  return (
    <div className="ad-app">
      {/* ── SIDEBAR ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <button
          type="button"
          className="ad-sidebar-toggle"
          onClick={() => setSidebarOpen((prev) => !prev)}
          title={toggleLabel}
          aria-label={toggleLabel}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? (
            <FaChevronLeft aria-hidden />
          ) : (
            <FaChevronRight aria-hidden />
          )}
        </button>

        <div className="ad-sidebar-head">
          <div className="ad-nav-icon">
            <AppLogo />
          </div>
          <div className="ad-sidebar-brand-text">
            <span className="ad-nav-brand">G06 · ALS</span>
            <span className="ad-nav-badge">{t("admin.badge")}</span>
          </div>
        </div>

        <div className="ad-sidebar-tabs">
          {TABS.map((tab) => {
            const label = t(tab.labelKey);
            return (
              <button
                key={tab.key}
                type="button"
                className={`ad-sidebar-tab ${activeTab === tab.key ? "active" : ""}`}
                onClick={() => handleTabClick(tab.key)}
                aria-current={activeTab === tab.key ? "page" : undefined}
                title={label}
              >
                <span className="ad-sidebar-tab-icon">{tab.icon}</span>
                <span className="ad-sidebar-tab-label">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="ad-sidebar-foot">
          <LogoutButton className="ad-sidebar-logout" title={t("admin.logout")}>
            <span className="ad-sidebar-tab-icon">
              <FaArrowRightFromBracket />
            </span>
            <span className="ad-sidebar-tab-label">{t("admin.logout")}</span>
          </LogoutButton>
        </div>
      </aside>

      {/* ── MAIN COLUMN: shared topbar + tab content, beside the sidebar ── */}
      <div className="ad-column">
        <Topbar title={t(activeTabDef.labelKey)} />

        <main className="ad-main">
          {/* ══ SUMMARY ══ */}
          {visitedTabs.has("summary") && (
            <div
              style={{ display: activeTab === "summary" ? undefined : "none" }}
            >
              <ErrorBoundary>
                <SummaryTab
                  icon={tabIcon("summary")}
                  SUMMARY={summary}
                  skills={skillProgress}
                  users={userActivity}
                  getTierColor={getTierColor}
                  getScoreColor={getScoreColor}
                  getStatusColor={getStatusColor}
                  maxBar={maxBar}
                  dayLabels={dayLabels}
                />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ USERS ══ */}
          {visitedTabs.has("users") && (
            <div
              style={{ display: activeTab === "users" ? undefined : "none" }}
            >
              <ErrorBoundary>
                <UsersTab icon={tabIcon("users")} />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ SKILLS ══ */}
          {visitedTabs.has("skills") && (
            <div
              style={{ display: activeTab === "skills" ? undefined : "none" }}
            >
              <ErrorBoundary>
                <SkillTab icon={tabIcon("skills")} />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ GOALS ══ */}
          {visitedTabs.has("goals") && (
            <div
              style={{ display: activeTab === "goals" ? undefined : "none" }}
            >
              <ErrorBoundary>
                <GoalTab icon={tabIcon("goals")} />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ EXERCISES ══ */}
          {visitedTabs.has("exercises") && (
            <div
              style={{
                display: activeTab === "exercises" ? undefined : "none",
              }}
            >
              <ErrorBoundary>
                <ExerciseTab icon={tabIcon("exercises")} />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {visitedTabs.has("history") && (
            <div
              style={{ display: activeTab === "history" ? undefined : "none" }}
            >
              <ErrorBoundary>
                <HistoryTab
                  icon={tabIcon("history")}
                  filteredHistory={filteredHistory}
                  histSearch={histSearch}
                  setHistSearch={setHistSearch}
                  histGrade={histGrade}
                  setHistGrade={setHistGrade}
                  gradeLabel={(grade: string) => t(gradeKey(grade))}
                  getScoreColor={getScoreColor}
                />
              </ErrorBoundary>
            </div>
          )}

          {/* ══ AI ผู้ช่วย ══ */}
          {visitedTabs.has("ai") && (
            <div style={{ display: activeTab === "ai" ? undefined : "none" }}>
              <ErrorBoundary>
                <AiTab icon={tabIcon("ai")} />
              </ErrorBoundary>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
