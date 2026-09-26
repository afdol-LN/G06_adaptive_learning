import React from "react";
import { FaChevronDown, FaChevronUp, FaLock } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  LayoutSkill,
  getProgressColor,
  getNodeColors,
  displayProgressPercent,
  formatProgressLabel,
} from "../utils/skillTree";

interface HomeProgressPanelProps {
  skills: LayoutSkill[];
  unlocked: Set<number>;
  canUnlock: (skillId: number) => boolean;
  collapsed: boolean;
  onToggle: () => void;
  onSkillClick: (skill: LayoutSkill) => void;
}

// การ์ด "ความคืบหน้าโดยรวม" ลอยมุมซ้ายล่างของ tree — กดหัวการ์ดเพื่อพับ/กาง
export const HomeProgressPanel: React.FC<HomeProgressPanelProps> = ({
  skills,
  unlocked,
  canUnlock,
  collapsed,
  onToggle,
  onSkillClick,
}) => {
  const { t } = usePreferences();

  return (
    <section className={`progress-summary hpp${collapsed ? " collapsed" : ""}`}>
      <button type="button" className="hpp-head" onClick={onToggle} aria-expanded={!collapsed}>
        <span className="progress-summary-label">{t("home.progressSummary")}</span>
        {/* การ์ดชิดขอบล่าง: พับอยู่ = กางขึ้น (ลูกศรขึ้น), กางอยู่ = พับลง */}
        {collapsed ? <FaChevronUp aria-hidden /> : <FaChevronDown aria-hidden />}
      </button>
      {!collapsed && (
        // สีเดียวกับโหนดใน skill tree (getNodeColors)
        // ครบ 100% เขียว · ปลดล็อกแล้ว น้ำเงิน · ปลดล็อกได้ ฟ้า · ล็อก เทา
        <div className="progress-summary-list">
          {skills.map((s) => {
            const pct = displayProgressPercent(s);
            const isUnlocked = unlocked.has(s.skillId);
            const isLocked = !isUnlocked && !canUnlock(s.skillId);
            const { bg, border, text, bar } = getNodeColors(isUnlocked, !isLocked, pct);
            return (
              <button
                type="button"
                key={s.skillId}
                className={`progress-summary-item${isLocked ? " locked" : ""}`}
                // ล็อก: พื้น/ขอบเทาจาก tree แต่ตัวอักษรใช้ --muted (ผ่าน CSS) — --node-locked-text จางเกินสำหรับข้อความ 12px
                style={{ background: bg, borderColor: border, color: isLocked ? undefined : text }}
                onClick={() => onSkillClick(s)}
                title={t("home.progressTooltip", { name: s.skillsName, pct })}
              >
                <span className="progress-summary-row">
                  <span className="progress-summary-name">{s.skillsName}</span>
                  <span className="progress-summary-pct">
                    {isLocked ? <FaLock aria-label={t("skill.locked")} /> : formatProgressLabel(s, t("skill.notStarted"))}
                  </span>
                </span>
                <span className="progress-summary-track" style={{ background: bar }}>
                  <span
                    className="progress-summary-fill"
                    style={{ width: `${pct}%`, background: getProgressColor(pct) }}
                  />
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};
export default HomeProgressPanel;
