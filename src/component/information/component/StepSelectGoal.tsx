import React from "react";
import { GoalGroupMap } from "../../../models/informationModel";
import { InformationService } from "../../../services/informationService";

interface StepSelectGoalProps {
  goalsByGroup: GoalGroupMap;
  selectedGoal: string[];
  isLoadingGoals?: boolean;
  toggleGoal: (goalId: string) => void;
}

export const StepSelectGoal: React.FC<StepSelectGoalProps> = ({
  goalsByGroup,
  selectedGoal,
  isLoadingGoals = false,
  toggleGoal,
}) => {
  const groupEntries = Object.entries(goalsByGroup);

  if (isLoadingGoals) {
    return (
      <div className="panel active" style={{ textAlign: "center", padding: "40px 20px" }}>
        <p style={{ color: "var(--muted, #94a3b8)", fontSize: "14px" }}>
          กำลังโหลดข้อมูลเป้าหมายการเรียนรู้...
        </p>
      </div>
    );
  }

  if (groupEntries.length === 0) {
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
      <p
        style={{
          textAlign: "center",
          fontSize: "13px",
          color: "var(--muted, #94a3b8)",
          marginBottom: "12px",
        }}
      >
        สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปภายหลัง
      </p>

      {groupEntries.map(([groupName, goalList]) => (
        <div key={groupName} style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--muted, #94a3b8)",
              marginBottom: "8px",
              letterSpacing: "0.05em",
            }}
          >
            {InformationService.getGroupLabel(groupName)}
          </div>
          <div className="goal-grid">
            {goalList.map((goalItem) => (
              <div
                key={goalItem.id}
                className={`goal-card ${selectedGoal.includes(goalItem.id) ? "selected" : ""}`}
                onClick={() => toggleGoal(goalItem.id)}
              >
                <div className="goal-check">✓</div>
                <div className="goal-card-inner">
                  <div className="goal-icon">{goalItem.icon || "🎯"}</div>
                  <div className="goal-name">{goalItem.name}</div>
                  <div className="goal-desc">{goalItem.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
