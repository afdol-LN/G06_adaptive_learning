import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

export default function AdminHome() {
  const { t } = usePreferences();
  const navigate = useNavigate();
  // แท็บที่เปิดอยู่มาจาก URL (/admin/:tab) — key ใน TABS ใช้เป็น path ตรง ๆ
  // path ย่อยมีเฉพาะแท็บ goals: /admin/goals/:goalId = Goal Workspace
  const { tab: tabParam, goalId: goalIdParam } = useParams<{ tab: string; goalId?: string }>();
  const location = useLocation();
  const isKnownTab = TABS.some((tab) => tab.key === tabParam);
  const activeTab = isKnownTab && tabParam ? tabParam : "summary";
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(
    () => new Set([activeTab]),
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // path ล่าสุดของแต่ละแท็บ — กดเมนูกลับมาแล้วเจอหน้าเดิม (เช่น workspace ของ goal ที่เปิดค้างไว้)
  const lastPathByTab = useRef<Record<string, string>>({});

  // path ที่ไม่รู้จัก (เช่น /admin/xyz หรือ /admin/users/5) → กลับไปหน้าที่ถูกต้อง
  const hasStraySubPath = isKnownTab && goalIdParam !== undefined && activeTab !== "goals";
  useEffect(() => {
    if (!isKnownTab) navigate("/admin/summary", { replace: true });
    else if (hasStraySubPath) navigate(`/admin/${activeTab}`, { replace: true });
  }, [isKnownTab, hasStraySubPath]);

  useEffect(() => {
    if (isKnownTab && !hasStraySubPath) lastPathByTab.current[activeTab] = location.pathname;
  }, [location.pathname]);

  // mount แท็บครั้งแรกที่ถูกเปิด (ทั้งจากการคลิก, back/forward และลิงก์ตรง) แล้วเก็บไว้ ไม่ unmount
  useEffect(() => {
    setVisitedTabs((prev) =>
      prev.has(activeTab) ? prev : new Set(prev).add(activeTab),
    );
  }, [activeTab]);

  const handleTabClick = (key: string) => {
    if (key !== activeTab) navigate(lastPathByTab.current[key] ?? `/admin/${key}`);
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
            <div
              style={{ display: activeTab === "users" ? undefined : "none" }}
            >
              <UsersTab icon={tabIcon("users")} />
            </div>
          )}

          {/* ══ SKILLS ══ */}
          {visitedTabs.has("skills") && (
            <div
              style={{ display: activeTab === "skills" ? undefined : "none" }}
            >
              <SkillTab icon={tabIcon("skills")} />
            </div>
          )}

          {/* ══ GOALS ══ */}
          {visitedTabs.has("goals") && (
            <div
              style={{ display: activeTab === "goals" ? undefined : "none" }}
            >
              <GoalTab icon={tabIcon("goals")} />
            </div>
          )}

          {/* ══ EXERCISES ══ */}
          {visitedTabs.has("exercises") && (
            <div
              style={{
                display: activeTab === "exercises" ? undefined : "none",
              }}
            >
              <ExerciseTab icon={tabIcon("exercises")} />
            </div>
          )}

          {/* ══ HISTORY ══ */}
          {visitedTabs.has("history") && (
            <div
              style={{ display: activeTab === "history" ? undefined : "none" }}
            >
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
