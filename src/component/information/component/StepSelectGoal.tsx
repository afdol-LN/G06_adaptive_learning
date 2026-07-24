import React from "react";
import { GoalGroupMap } from "../../../models/informationModel";
import { InformationService } from "../../../services/informationService";

interface StepSelectGoalProps {
  goalsByGroup: GoalGroupMap;
  selectedGoal: string[];
  toggleGoal: (goalId: string) => void;
}

export const StepSelectGoal: React.FC<StepSelectGoalProps> = ({
  goalsByGroup,
  selectedGoal,
  toggleGoal,
}) => {
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
        💡 สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปภายหลัง
      </p>

      {Object.entries(goalsByGroup).map(([group, goals]) => (
        <div key={group} style={{ marginBottom: "16px" }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--muted, #94a3b8)",
              marginBottom: "8px",
              letterSpacing: "0.05em",
            }}
          >
            {InformationService.getGroupLabel(group)}
          </div>
          <div className="goal-grid">
            {goals.map((g) => (
              <div
                key={g.id}
                className={`goal-card ${selectedGoal.includes(g.id) ? "selected" : ""}`}
                onClick={() => toggleGoal(g.id)}
              >
                <div className="goal-check">✓</div>
                <div className="goal-card-inner">
                  <div className="goal-icon">{g.icon}</div>
                  <div className="goal-name">{g.name}</div>
                  <div className="goal-desc">{g.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
