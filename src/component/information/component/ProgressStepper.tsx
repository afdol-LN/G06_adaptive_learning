import React from "react";
import { FaCheck } from "react-icons/fa6";

interface ProgressStepperProps {
  stepLabels: string[];
  step: number;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  stepLabels,
  step,
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
              <div className="step-dot">{isDone ? <FaCheck aria-hidden /> : stepNum}</div>
              <div className="step-label">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
