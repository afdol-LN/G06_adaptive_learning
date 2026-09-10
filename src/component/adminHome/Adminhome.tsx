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
import { summaryController } from "./summaryPanel/summary.controller";
import { historyController } from "./historyPanel/history.controller";
import { getTierColor, getScoreColor, getStatusColor, gradeLabel, TABS } from "../../utils/adminUi";


export default function AdminHome() {
  const navigate = useNavigate();
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

  return (
    <div className="ad-app">
      {/* ── SIDEBAR ── */}
      <aside className={`ad-sidebar ${sidebarOpen ? "" : "collapsed"}`}>
        <button
          type="button"
          className="ad-sidebar-toggle"
          onClick={() => setSidebarOpen((prev) => !prev)}
          title={sidebarOpen ? "ย่อ Sidebar" : "ขยาย Sidebar"}
        >
          {sidebarOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <div className="ad-sidebar-head">
          <div className="ad-nav-icon"><AppLogo /></div>
          <div className="ad-sidebar-brand-text">
            <span className="ad-nav-brand">G06 · ALS</span>
            <span className="ad-nav-badge">Admin</span>
          </div>
        </div>

        <div className="ad-sidebar-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`ad-sidebar-tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => handleTabClick(t.key)}
              title={t.label}
            >
              <span className="ad-sidebar-tab-icon">{t.icon}</span>
              <span className="ad-sidebar-tab-label">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="ad-sidebar-foot">
          <button
            type="button"
            className="ad-sidebar-logout"
            onClick={() => navigate("/")}
            title="ออกจากระบบ"
          >
            <span className="ad-sidebar-tab-icon"><FaArrowRightFromBracket /></span>
            <span className="ad-sidebar-tab-label">ออกจากระบบ</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="ad-main">
        {/* ══ SUMMARY ══ */}
        {visitedTabs.has("summary") && (
          <div style={{ display: activeTab === "summary" ? undefined : "none" }}>
            <SummaryTab
              icon={TABS.find((t) => t.key === "summary")?.icon}
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
            <UsersTab icon={TABS.find((t) => t.key === "users")?.icon} />
          </div>
        )}

        {/* ══ SKILLS ══ */}
        {visitedTabs.has("skills") && (
          <div style={{ display: activeTab === "skills" ? undefined : "none" }}>
            <SkillTab icon={TABS.find((t) => t.key === "skills")?.icon} />
          </div>
        )}

        {/* ══ GOALS ══ */}
        {visitedTabs.has("goals") && (
          <div style={{ display: activeTab === "goals" ? undefined : "none" }}>
            <GoalTab icon={TABS.find((t) => t.key === "goals")?.icon} />
          </div>
        )}

        {/* ══ EXERCISES ══ */}
        {visitedTabs.has("exercises") && (
          <div style={{ display: activeTab === "exercises" ? undefined : "none" }}>
            <ExerciseTab icon={TABS.find((t) => t.key === "exercises")?.icon} />
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {visitedTabs.has("history") && (
          <div style={{ display: activeTab === "history" ? undefined : "none" }}>
            <HistoryTab
              icon={TABS.find((t) => t.key === "history")?.icon}
              filteredHistory={filteredHistory}
              histSearch={histSearch}
              setHistSearch={setHistSearch}
              histGrade={histGrade}
              setHistGrade={setHistGrade}
              gradeLabel={gradeLabel}
              getScoreColor={getScoreColor}
            />
          </div>
        )}

        {/* ══ AI ผู้ช่วย ══ */}
        {visitedTabs.has("ai") && (
          <div style={{ display: activeTab === "ai" ? undefined : "none" }}>
            <AiTab icon={TABS.find((t) => t.key === "ai")?.icon} />
          </div>
        )}
      </main>
    </div>
  );
}
