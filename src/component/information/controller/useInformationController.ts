import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { InformationService } from "../../../services/informationService";
import { InformationFormData, GoalItem } from "../../../models/informationModel";

export function useInformationController() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const skipGeneralInfo = Boolean((location.state as any)?.skipGeneralInfo);

  const [step, setStep] = useState<number>(skipGeneralInfo ? 2 : 1);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Goals from backend state
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState<boolean>(true);

  // Context access
  const { addBranch, switchBranch, branches } = useApp();

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Goals from Backend API on mount
  useEffect(() => {
    async function loadGoals() {
      setIsLoadingGoals(true);
      try {
        const fetchedGoals = await InformationService.fetchGoals();
        setGoals(fetchedGoals);
      } catch (error) {
        console.error("Failed to fetch goals from backend API:", error);
        toast.error("โหลดข้อมูลเป้าหมายการเรียนรู้ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      } finally {
        setIsLoadingGoals(false);
      }
    }
    loadGoals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalSteps = InformationService.getTotalSteps();
  const steps = InformationService.getSteps();
  const stepLabels = InformationService.getStepLabels();
  const progressPct = ((step - 1) / (totalSteps - 1)) * 100;
  const currentExpData = InformationService.getExperienceData(exp);
  const goalsByGroup = InformationService.groupGoalsByGroup(goals);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const setFormDataField = (field: keyof InformationFormData, value: string) => {
    if (field === "faculty") {
      setFormData((prev) => ({ ...prev, faculty: value, major: "", majorId: "" }));
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
        toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");
        return false;
      }
    }
    if (step === 2 && selectedGoal.length === 0) {
      triggerShake();
      toast.warning("กรุณาเลือกเนื้อหาที่ต้องการเรียนรู้");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (step === 2) {
      setIsSubmitting(true);
      try {
        if (!skipGeneralInfo) {
          await InformationService.submitGeneralInfo(formData);
        }
        await Promise.all(
          selectedGoal.map((goalId) =>
            InformationService.createBranchOnServer(goalId, exp)
          )
        );
      } catch (error) {
        console.error("Failed to save onboarding info to backend:", error);
        toast.error("บันทึกข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);

      const createdIds = InformationService.createBranchesForSelectedGoals(
        formData,
        selectedGoal,
        goals,
        exp,
        addBranch
      );
      if (createdIds.length > 0) {
        switchBranch(createdIds[createdIds.length - 1]);
      }
      setStep(3);
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
    if (skipGeneralInfo && step === 2) {
      navigate('/selectbranch');
      return;
    }
    if (step > 1) setStep(step - 1);
  };



  const handleStartPretestDirect = () => {
    navigate("/pretest");
  };

  const selectedGoalBranchName =
    branches.find(
      (b: any) => b.id === branches[branches.length - 1]?.id
    )?.goalName || "ที่เลือก";

  return {
    // States
    step,
    isShaking,
    formData,
    selectedGoal,
    exp,
    branches,
    goals,
    isLoadingGoals,
    isSubmitting,
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
    handleNext,
    handlePrev,
    handleStartPretestDirect,
  };
}
