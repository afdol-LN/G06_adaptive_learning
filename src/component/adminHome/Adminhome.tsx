import { useState } from "react";
import "../decorate/Adminhome.css";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRightFromBracket,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa6";
import SummaryTab from "./SummaryTab";
import UsersTab from "./userPanel/UsersTab";
import SkillTab from "./skillPanel/SkillTab";
import GoalTab from "./goalPanel/GoalTab";
import ExerciseTab from "./exercisePanel/ExerciseTab";
import HistoryTab from "./HistoryTab";
import AiTab from "./aiPanel/AiTab";
import AppLogo from "../common/AppLogo";
import { Topbar } from "../common/Topbar";
import { usePreferences } from "../../context/PreferencesContext";
import { summaryController } from "./summaryPanel/summary.controller";
import { historyController } from "./historyPanel/history.controller";
import { getTierColor, getScoreColor, getStatusColor, gradeKey, TABS } from "../../utils/adminUi";


export default function AdminHome() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [activeTab, setActiveTab] = useState("summary");
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(["summary"]));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleTabClick = (key: string) => {
    setActiveTab(key);
    setVisitedTabs((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  };

  const { summary, skillProgress, userActivity, maxBar, dayLabels } = summaryController();
  const { filteredHistory, histSearch, setHistSearch, histGrade, setHistGrade } =
    historyController();

  const tabIcon = (key: string) => TABS.find((tab) => tab.key === key)?.icon;
  const activeTabDef = TABS.find((tab) => tab.key === activeTab) ?? TABS[0];
  const toggleLabel = sidebarOpen ? t("admin.sidebar.collapse") : t("admin.sidebar.expand");

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
          {sidebarOpen ? <FaChevronLeft aria-hidden /> : <FaChevronRight aria-hidden />}
        </button>

        <div className="ad-sidebar-head">
          <div className="ad-nav-icon"><AppLogo /></div>
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
          <button
            type="button"
            className="ad-sidebar-logout"
            onClick={() => navigate("/")}
            title={t("admin.logout")}
          >
            <span className="ad-sidebar-tab-icon"><FaArrowRightFromBracket /></span>
            <span className="ad-sidebar-tab-label">{t("admin.logout")}</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN COLUMN: shared topbar + tab content, beside the sidebar ── */}
      <div className="ad-column">
        <Topbar title={t(activeTabDef.labelKey)} />

        <main className="ad-main">
          {/* ══ SUMMARY ══ */}
          {visitedTabs.has("summary") && (
            <div style={{ display: activeTab === "summary" ? undefined : "none" }}>
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
            </div>
          )}

          {/* ══ USERS ══ */}
          {visitedTabs.has("users") && (
            <div style={{ display: activeTab === "users" ? undefined : "none" }}>
              <UsersTab icon={tabIcon("users")} />
            </div>
          )}

          {/* ══ SKILLS ══ */}
          {visitedTabs.has("skills") && (
            <div style={{ display: activeTab === "skills" ? undefined : "none" }}>
              <SkillTab icon={tabIcon("skills")} />
            </div>
          )}

          {/* ══ GOALS ══ */}
          {visitedTabs.has("goals") && (
            <div style={{ display: activeTab === "goals" ? undefined : "none" }}>
              <GoalTab icon={tabIcon("goals")} />
            </div>
          )}

          {/* ══ EXERCISES ══ */}
          {visitedTabs.has("exercises") && (
            <div style={{ display: activeTab === "exercises" ? undefined : "none" }}>
              <ExerciseTab icon={tabIcon("exercises")} />
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {visitedTabs.has("history") && (
            <div style={{ display: activeTab === "history" ? undefined : "none" }}>
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
            </div>
          )}

          {/* ══ AI ผู้ช่วย ══ */}
          {visitedTabs.has("ai") && (
            <div style={{ display: activeTab === "ai" ? undefined : "none" }}>
              <AiTab icon={tabIcon("ai")} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
