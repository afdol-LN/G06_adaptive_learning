import React from "react";
import { ExperienceData } from "../../../models/informationModel";

interface StepExperienceProps {
  exp: number;
  setExp: (val: number) => void;
  currentExpData: ExperienceData;
  selectedGoalBranchName: string;
}

export const StepExperience: React.FC<StepExperienceProps> = ({
  exp,
  setExp,
  currentExpData,
  selectedGoalBranchName,
}) => {
  return (
    <div className="panel active">
      <div className="field">
        <label>
          ระดับประสบการณ์เกี่ยวกับ Goal:{" "}
          <strong>{selectedGoalBranchName}</strong>
        </label>
        <div className="slider-wrap">
          <div className="slider-track-wrap">
            <input
              type="range"
              min="1"
              max="5"
              value={exp}
              onChange={(e) => setExp(Number(e.target.value))}
              style={{ "--pct": `${((exp - 1) / 4) * 100}%` as any }}
            />
          </div>
          <div className="slider-labels">
            <span>มือใหม่</span>
            <span>เริ่มต้น</span>
            <span>กลาง</span>
            <span>ก้าวหน้า</span>
            <span>เชี่ยวชาญ</span>
          </div>
        </div>

        <div
          className="exp-card"
          style={{ borderLeftColor: currentExpData.color }}
        >
          <div
            className="exp-level"
            style={{ color: currentExpData.color }}
          >
            {currentExpData.level}
          </div>
          <div className="exp-title">{currentExpData.title}</div>
          {/* <div className="exp-badges">
            {currentExpData.badges.map((b, i) => (
              <span key={i} className="badge">
                {b}
              </span>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};
