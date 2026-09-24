import React from "react";
import { FaChartSimple, FaChevronLeft, FaChevronRight, FaUserGraduate } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { BranchStats } from "../../../models/branchStatsModel";
import { StatCard } from "../../common/StatCard";

interface HomeProfileStripProps {
  fullName: string;
  goalName?: string;
  stats: BranchStats | null;
  collapsed: boolean;
  onToggle: () => void;
  /** เปิด modal ที่มาของคะแนนเริ่มต้นจาก pretest — ไม่ส่งมา = ยังไม่ได้ทำ pretest ไม่ต้องแสดงปุ่ม */
  onShowBreakdown?: () => void;
}

// แถบข้อมูลผู้ใช้ + stats ต่อจากขอบ sidebar — พับแล้วเหลือปุ่มไอคอนคน + ลูกศร
export const HomeProfileStrip: React.FC<HomeProfileStripProps> = ({
  fullName,
  goalName,
  stats,
  collapsed,
  onToggle,
  onShowBreakdown,
}) => {
  const { t } = usePreferences();

  const statsList = [
    { num: stats ? `${stats.skillsUnlockedCount}` : "0", label: t("home.stat.skills"), cls: "gold" },
    { num: stats ? `${stats.sessionsCount}` : "0", label: t("home.stat.sessions"), cls: "green" },
    { num: stats ? `${stats.dayStreak}` : "0", label: t("home.stat.streak"), cls: "blue" },
    {
      num: stats ? `${stats.goalProgressPercent}%` : "0%",
      label: t("home.stat.progress"),
      cls: "purple",
      // the same numbers as the goal node at the end of the tree (adt-learning/docs/adr/0005)
      sub:
        !stats || stats.goalRequiredCount === 0
          ? undefined
          : stats.goalComplete
            ? t("goalNode.complete")
            : t("goalNode.count", { done: stats.goalMasteredCount, total: stats.goalRequiredCount }),
    },
  ];
  const toggleLabel = collapsed ? t("home.profile.expand") : t("home.profile.collapse");

  return (
    // พับ = เลื่อนออกไปทางซ้ายจนเหลือแค่คอลัมน์ปุ่ม (สูงเท่าตอนกางเสมอ) — ไม่ unmount เนื้อหา
    <section className={`hps${collapsed ? " is-collapsed" : ""}`}>
      {/* inert: ตอนพับเนื้อหาอยู่นอกจอ ห้าม tab/คลิกถึง */}
      <div className="hps-body" inert={collapsed}>
        <div className="hps-hero">
          <div className="home-hero-avatar"><FaUserGraduate aria-hidden /></div>
          <div className="hps-info">
            <div className="home-greeting">{t("home.greeting")}</div>
            <h1 className="home-username">{fullName}</h1>
            <div className="home-goal">
              {t("home.goal")} <span className="goal-badge">{goalName || t("home.goalUnset")}</span>
            </div>
            {onShowBreakdown && (
              <button type="button" className="hps-breakdown" onClick={onShowBreakdown}>
                <FaChartSimple aria-hidden />
                <span>{t("pretestBreakdown.reopen")}</span>
              </button>
            )}
          </div>
        </div>

        <div className="hps-stats" data-tour="tour-stats">
          {statsList.map((s) => (
            <StatCard key={s.label} title={s.label} value={s.num} colorClass={s.cls} sub={s.sub} />
          ))}
        </div>
      </div>

      <button
        type="button"
        className="hps-toggle"
        onClick={onToggle}
        aria-expanded={!collapsed}
        aria-label={toggleLabel}
        title={toggleLabel}
      >
        {collapsed && <FaUserGraduate aria-hidden />}
        {collapsed ? <FaChevronRight aria-hidden /> : <FaChevronLeft aria-hidden />}
      </button>
    </section>
  );
};
export default HomeProfileStrip;
