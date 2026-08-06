import React from "react";

interface ProgressStepperProps {
  stepLabels: string[];
  step: number;
  progressPct: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  stepLabels,
  step,
  progressPct,
}) => {
  return (
    <div className="progress-wrap">
      <div className="progress-steps">
        {stepLabels.map((label, i) => {
          const stepNum = i + 1;
          const isActive = stepNum === step;
          const isDone = stepNum < step;
          return (
            <div
              key={i}
              className={`step-node ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            >
              <div className="step-dot">{isDone ? "✓" : stepNum}</div>
              <div className="step-label">{label}</div>
            </div>
          );
        })}
      </div>
      <div className="progress-bar-track">
        <div
          className="progress-bar-fill"
          style={{ width: `${progressPct}%` }}
        ></div>
      </div>
    </div>
  );
};
