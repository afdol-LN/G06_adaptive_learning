import React, { useEffect, useMemo, useState } from "react";
import {
  FaBullseye,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaCircleCheck,
  FaBookOpen,
} from "react-icons/fa6";
import { GoalGroupMap, GoalStatusMap } from "../../../models/informationModel";
import { usePreferences } from "../../../context/PreferencesContext";

interface StepSelectGoalProps {
  goalsByGroup: GoalGroupMap;
  goalStatus: GoalStatusMap;
  selectedGoal: string[];
  isLoadingGoals?: boolean;
  toggleGoal: (goalId: string) => void;
}

const PAGE_SIZE = 4;

export const StepSelectGoal: React.FC<StepSelectGoalProps> = ({
  goalsByGroup,
  goalStatus,
  selectedGoal,
  isLoadingGoals = false,
  toggleGoal,
}) => {
  const { t } = usePreferences();
  const [page, setPage] = useState(0);

  // ไม่แสดงหัวข้อกลุ่ม (ทุก goal อยู่กลุ่ม "General" เดียวกัน) — แบ่งหน้าจากรายการเรียงต่อกัน
  const flat = useMemo(() => Object.values(goalsByGroup).flat(), [goalsByGroup]);
  const pageCount = Math.max(1, Math.ceil(flat.length / PAGE_SIZE));

  // จำนวน goal เปลี่ยน (โหลดเสร็จ) → กันหน้าเกินจำนวนจริง
  useEffect(() => {
    if (page > pageCount - 1) setPage(pageCount - 1);
  }, [page, pageCount]);

  const pageGoals = flat.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (isLoadingGoals) {
    return (
      <div className="panel active" style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ color: "var(--muted, #94a3b8)", fontSize: "14px" }}>
          กำลังโหลดข้อมูลเป้าหมายการเรียนรู้...
        </p>
      </div>
    );
  }

  if (flat.length === 0) {
    return (
      <div className="panel active" style={{ textAlign: "center", padding: "48px 20px" }}>
        <p style={{ fontSize: "16px", fontWeight: "600", color: "#f87171", margin: 0 }}>
          ไม่พบข้อมูลเป้าหมายการเรียนรู้ในระบบ (ไม่มี goal ให้เลือก)
        </p>
        <p style={{ fontSize: "13px", color: "var(--muted, #94a3b8)", marginTop: "8px" }}>
          กรุณาติดต่อผู้ดูแลระบบเพื่อเพิ่มข้อมูลเป้าหมายการเรียนรู้
        </p>
      </div>
    );
  }

  return (
    <div className="panel active">
      <p className="goal-hint">สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปภายหลัง</p>

      <div className="goal-grid">
        {pageGoals.map((goalItem) => {
          const status = goalStatus[goalItem.id];
          return (
            <div
              key={goalItem.id}
              className={`goal-card ${selectedGoal.includes(goalItem.id) ? "selected" : ""}`}
              onClick={() => toggleGoal(goalItem.id)}
            >
              <div className="goal-check"><FaCheck aria-hidden /></div>
              <div className="goal-card-inner">
                <div className="goal-card-top">
                  <div className="goal-icon"><FaBullseye aria-hidden /></div>
                  {status === "completed" && (
                    <span className="goal-tag is-completed">
                      <FaCircleCheck aria-hidden />
                      {t("goal.status.completed")}
                    </span>
                  )}
                  {status === "learning" && (
                    <span className="goal-tag is-learning">
                      <FaBookOpen aria-hidden />
                      {t("goal.status.learning")}
                    </span>
                  )}
                </div>
                <div className="goal-name">{goalItem.name}</div>
                <div className="goal-desc">{goalItem.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {pageCount > 1 && (
        <nav className="goal-pager">
          <button
            type="button"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            aria-label={t("goal.page.prev")}
            title={t("goal.page.prev")}
          >
            <FaChevronLeft aria-hidden />
          </button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-current={i === page ? "page" : undefined}
              aria-label={t("goal.page.go", { page: i + 1 })}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={page === pageCount - 1}
            aria-label={t("goal.page.next")}
            title={t("goal.page.next")}
          >
            <FaChevronRight aria-hidden />
          </button>
        </nav>
      )}
    </div>
  );
};
