import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { GOALS } from "../../../data/mockData";
import { InformationService } from "../../../services/informationService";
import { InformationFormData } from "../../../models/informationModel";

export function useInformationController() {
  const [step, setStep] = useState<number>(1);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const navigate = useNavigate();

  // Context access
  const { addBranch, switchBranch, branches } = useApp();
  const [showSelectBranch, setShowSelectBranch] = useState<boolean>(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const [newBranchIds, setNewBranchIds] = useState<string[]>([]);

  // Form State
  const [formData, setFormData] = useState<InformationFormData>({
    edu: "bachelor",
    year: "",
    campus: "",
    faculty: "",
    major: "",
  });
  const [selectedGoal, setSelectedGoal] = useState<string[]>([]);
  const [exp, setExp] = useState<number>(1);
  const [toast, setToast] = useState<{ show: boolean; msg: string }>({
    show: false,
    msg: "",
  });

  const totalSteps = InformationService.getTotalSteps();
  const steps = InformationService.getSteps();
  const stepLabels = InformationService.getStepLabels();
  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;
  const currentExpData = InformationService.getExperienceData(exp);
  const goalsByGroup = InformationService.groupGoalsByGroup(GOALS);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const showNotice = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const setFormDataField = (field: keyof InformationFormData, value: string) => {
    if (field === "faculty") {
      setFormData((prev) => ({ ...prev, faculty: value, major: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoal((prev) =>
      prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId]
    );
  };

  const validateStep = (): boolean => {
    if (step === 1) {
      const { year, campus, faculty, major } = formData;
      if (!year || !campus || !faculty || !major) {
        triggerShake();
        showNotice("กรุณากรอกข้อมูลให้ครบถ้วน");
        return false;
      }
    }
    if (step === 2 && selectedGoal.length === 0) {
      triggerShake();
      showNotice("กรุณาเลือกเนื้อหาที่ต้องการเรียนรู้");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 2) {
      const createdIds = InformationService.createBranchesForSelectedGoals(
        formData,
        selectedGoal,
        GOALS,
        exp,
        addBranch
      );
      setNewBranchIds(createdIds);
      setTimeout(() => setShowSelectBranch(true), 50);
      return;
    }

    if (step === 3) {
      setStep(4);
      setTimeout(() => {
        navigate("/pretest");
      }, 500);
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleConfirmBranch = () => {
    if (!selectedBranchId) return;
    switchBranch(selectedBranchId);
    setShowSelectBranch(false);
    setStep(3);
  };

  const handleStartPretestDirect = () => {
    navigate("/pretest");
  };

  const selectedGoalBranchName =
    branches.find(
      (b: any) => b.id === (selectedBranchId || branches[branches.length - 1]?.id)
    )?.goalName || "ที่เลือก";

  return {
    // States
    step,
    isShaking,
    formData,
    selectedGoal,
    exp,
    toast,
    showSelectBranch,
    selectedBranchId,
    newBranchIds,
    branches,
    // Derived
    progressPct,
    currentExpData,
    goalsByGroup,
    steps,
    stepLabels,
    totalSteps,
    selectedGoalBranchName,
    // Actions
    setFormDataField,
    toggleGoal,
    setExp,
    setSelectedBranchId,
    handleNext,
    handlePrev,
    handleConfirmBranch,
    handleStartPretestDirect,
  };
}
