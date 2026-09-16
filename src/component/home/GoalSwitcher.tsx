import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaBullseye,
  FaCheck,
  FaChevronDown,
  FaPlus,
  FaRightLeft,
} from "react-icons/fa6";
import { useApp } from "../../context/AppContext";
import { usePreferences } from "../../context/PreferencesContext";

interface GoalSwitcherProps {
  onCreateBranch: () => void;
}

/**
 * ปุ่ม Goal Switcher (dropdown เลือก/สลับ/เพิ่มเป้าหมาย)
 * แยกออกมาจาก HomeShell.tsx เพื่อส่งเข้า Topbar ผ่าน prop `extra`
 * พฤติกรรมทั้งหมดเหมือนเดิม — เปลี่ยนแค่ตำแหน่ง render
 */
export const GoalSwitcher: React.FC<GoalSwitcherProps> = ({ onCreateBranch }) => {
  const { branches, activeBranch, switchBranch } = useApp();
  const { t } = usePreferences();
  const navigate = useNavigate();

  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const goalMenuRef = useRef<HTMLDivElement>(null);

  // ปิด dropdown เมื่อคลิกนอกกล่อง (ยกเว้นตอน create-branch-modal เปิดอยู่)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        goalMenuRef.current &&
        !goalMenuRef.current.contains(target) &&
        !target.closest(".create-branch-modal")
      ) {
        setShowGoalMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!activeBranch) return null;

  const goalLabel = activeBranch.goalName || t("goal.placeholder");

  return (
    <div className="gs-wrapper" ref={goalMenuRef} data-tour="tour-goal-switcher">
      <div className="gs-btn-group">
        <button
          className="gs-btn"
          onClick={() => setShowGoalMenu((prev) => !prev)}
          title={goalLabel}
          aria-expanded={showGoalMenu}
          aria-haspopup="listbox"
        >
          <span className="gs-icon">
            <FaBullseye aria-hidden />
          </span>
          <span className="gs-label">{goalLabel}</span>
          <span className="gs-caret">
            <FaChevronDown aria-hidden />
          </span>
        </button>

        {/* ปุ่ม swap — กดแล้วเปิด dropdown เดียวกับปุ่มหลัก */}
        <button
          className="gs-swap-btn"
          onClick={() => setShowGoalMenu((prev) => !prev)}
          title="เปลี่ยนเป้าหมาย"
          aria-expanded={showGoalMenu}
          aria-haspopup="listbox"
        >
          <FaRightLeft aria-hidden />
        </button>
      </div>

      {showGoalMenu && (
        <div className="gs-dropdown" role="listbox">
          <div className="goal-dropdown-list">
            {branches.map((b) => {
              const isActive = String(b.id) === String(activeBranch.id);
              return (
                <button
                  key={b.id}
                  className={`goal-dropdown-item ${isActive ? "active" : ""}`}
                  role="option"
                  aria-selected={isActive}
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
                  {isActive && (
                    <span className="goal-dropdown-check">
                      <FaCheck aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <button
            className="goal-dropdown-action primary"
            onClick={() => {
              onCreateBranch();
              setShowGoalMenu(false);
            }}
          >
            <span className="goal-dropdown-action-icon">
              <FaPlus aria-hidden />
            </span>
            <span>{t("goal.add")}</span>
          </button>

          <button
            className="goal-dropdown-action"
            onClick={() => {
              setShowGoalMenu(false);
              navigate("/selectbranch");
            }}
          >
            <span className="goal-dropdown-action-icon">
              <FaArrowLeft aria-hidden />
            </span>
            <span>{t("goal.backToSelect")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default GoalSwitcher;
