import React from "react";
import "../decorate/InformationForm.css";
import { useInformationController } from "./controller/useInformationController";
import { ProgressStepper } from "./component/ProgressStepper";
import { StepGeneralInfo } from "./component/StepGeneralInfo";
import { StepSelectGoal } from "./component/StepSelectGoal";
import { StepExperience } from "./component/StepExperience";
import { StepReady } from "./component/StepReady";

export default function InformationForm() {
  const ctrl = useInformationController();

  return (
    <div style={{ position: "relative" }}>
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="page">
        {/* Progress Bar */}
        <ProgressStepper
          stepLabels={ctrl.stepLabels}
          step={ctrl.step}
          progressPct={ctrl.progressPct}
        />

        {/* Card */}
        <div className={`card ${ctrl.isShaking ? "shake" : ""}`}>
          <div className="card-header">
            <div className="step-title">
              {ctrl.step === 4
                ? "พร้อมแล้ว!"
                : ctrl.step === 3
                  ? `ประสบการณ์ด้าน ${ctrl.selectedGoalBranchName}`
                  : ctrl.steps[ctrl.step - 1].title}
            </div>
            <div className="step-sub">
              {ctrl.step === 4
                ? "กดปุ่มด้านล่างเมื่อพร้อมเริ่มทำ Pretest"
                : ctrl.steps[ctrl.step - 1].sub}
            </div>
          </div>

          {/* Step Panels */}
          {ctrl.step === 1 && (
            <StepGeneralInfo
              formData={ctrl.formData}
              setFormDataField={ctrl.setFormDataField}
            />
          )}

          {ctrl.step === 2 && (
            <StepSelectGoal
              goalsByGroup={ctrl.goalsByGroup}
              selectedGoal={ctrl.selectedGoal}
              isLoadingGoals={ctrl.isLoadingGoals}
              toggleGoal={ctrl.toggleGoal}
            />
          )}

          {ctrl.step === 3 && (
            <StepExperience
              exp={ctrl.exp}
              setExp={ctrl.setExp}
              currentExpData={ctrl.currentExpData}
              selectedGoalBranchName={ctrl.selectedGoalBranchName}
            />
          )}

          {ctrl.step === 4 && <StepReady />}

          {/* Footer Navigation */}
          <div className="card-footer-btns">
            <button
              className="btn-back"
              onClick={ctrl.handlePrev}
              disabled={ctrl.step === 1}
            >
              ← Back
            </button>
            <span className="step-counter">
              {ctrl.step} / {ctrl.totalSteps}
            </span>
            {ctrl.step === 4 ? (
              <button className="btn-next" onClick={ctrl.handleStartPretestDirect}>
                <span>เริ่ม Pretest</span>
                <svg
                  className="btn-next-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                className="btn-next"
                onClick={ctrl.handleNext}
                disabled={ctrl.isSubmitting}
              >
                <span>
                  {ctrl.isSubmitting
                    ? "กำลังบันทึก..."
                    : ctrl.step === 3
                      ? "เริ่ม Pretest"
                      : "Next"}
                </span>
                <svg
                  className="btn-next-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                >
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
