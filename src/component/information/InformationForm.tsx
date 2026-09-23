import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import "../decorate/InformationForm.css";
import { ProgressStepper } from "./component/ProgressStepper";
import LogoutButton from "../common/LogoutButton";
import { useInformationController } from "./controller/useInformationController";
import { StepGeneralInfo } from "./component/StepGeneralInfo";
import { StepSelectGoal } from "./component/StepSelectGoal";
import { StepExperience } from "./component/StepExperience";
import { StepPretestIntro } from "./component/StepPretestIntro";
import { usePreferences } from "../../context/PreferencesContext";

export default function InformationForm() {
  const ctrl = useInformationController();
  const { t } = usePreferences();

  return (
    <div className="info-root">
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      {/* มาจาก login ครั้งแรก = ยังไม่มีหน้า Select Branch ให้กลับ จึงแสดงเฉพาะเมื่อมาจากหน้านั้น */}
      {ctrl.fromSelectBranch && (
        <button type="button" className="info-back-link" onClick={ctrl.handleBackToSelectBranch}>
          <FaArrowLeft aria-hidden />
          <span>{t("info.backToSelectBranch")}</span>
        </button>
      )}

      <LogoutButton className="info-logout" />

      <main className="page">
        <ProgressStepper stepLabels={ctrl.stepLabels} step={ctrl.step} />

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
                ? "อ่านรายละเอียดด้านล่าง แล้วกดเริ่ม Pretest เมื่อพร้อม"
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
              goalStatus={ctrl.goalStatus}
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

          {ctrl.step === 4 && <StepPretestIntro />}

          {/* Footer Navigation */}
          <div className="card-footer-btns">
            <button
              type="button"
              className={`btn-back${ctrl.step === 3 && !ctrl.canGoBack ? " is-hidden" : ""}`}
              onClick={ctrl.handlePrev}
              disabled={!ctrl.canGoBack}
              aria-hidden={ctrl.step === 3 && !ctrl.canGoBack ? true : undefined}
            >
              ← Back
            </button>
            <span className="step-counter">
              {ctrl.step} / {ctrl.totalSteps}
            </span>
            {ctrl.step === 4 ? (
              <button type="button" className="btn-next" onClick={ctrl.handleStartPretest}>
                <span>{t("pretestIntro.start")}</span>
                <FaArrowRight className="btn-next-arrow" aria-hidden />
              </button>
            ) : (
              <button
                type="button"
                className="btn-next"
                onClick={ctrl.handleNext}
                disabled={ctrl.isSubmitting}
              >
                <span>{ctrl.isSubmitting ? "กำลังบันทึก..." : "Next"}</span>
                <FaArrowRight className="btn-next-arrow" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
