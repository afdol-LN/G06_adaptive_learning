import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../../../context/AppContext";
import { useToast } from "../../../context/ToastContext";
import { InformationService } from "../../../services/informationService";
import { InformationFormData, GoalItem } from "../../../models/informationModel";

/**
 * state ที่หน้าอื่นส่งมากับ navigate("/information", { state })
 * - skipGeneralInfo: มาจากปุ่ม "Add new branch" (ข้าม step 1)
 * - fromSelectBranch: มาจากหน้า Select Branch → แสดงลิงก์ย้อนกลับมุมซ้ายบน
 * - pretestBranchId: branch ที่สร้างแล้วแต่ยังไม่ทำ pretest → เปิดที่ step 4 (แนะนำ Pretest)
 *   ถูกเขียนกลับลง history ทันทีที่สร้าง branch ด้วย ให้ refresh แล้วยังอยู่ step 4
 */
export interface InformationRouteState {
  skipGeneralInfo?: boolean;
  fromSelectBranch?: boolean;
  pretestBranchId?: string;
}

const PRETEST_INTRO_STEP = 4;

export function useInformationController() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const routeState = (location.state ?? {}) as InformationRouteState;
  const skipGeneralInfo = Boolean(routeState.skipGeneralInfo);
  const fromSelectBranch = Boolean(routeState.fromSelectBranch || skipGeneralInfo);

  // Context access
  const { addBranch, switchBranch, updateBranch, branches } = useApp();

  // branch ที่ onboarding รอบนี้สร้างไว้แล้ว (หรือที่กลับมาทำ pretest ต่อ)
  // มีค่า = goal ถูกล็อก, step 3 ไม่มีปุ่มย้อน, และ Next ที่ step 3 จะ "แก้" branch นี้แทนการสร้างใหม่
  const [branchId, setBranchId] = useState<string | null>(routeState.pretestBranchId ?? null);
  const resumedBranch = routeState.pretestBranchId
    ? branches.find((b: any) => String(b.id) === String(routeState.pretestBranchId))
    : undefined;

  const [step, setStep] = useState<number>(
    routeState.pretestBranchId ? PRETEST_INTRO_STEP : skipGeneralInfo ? 2 : 1
  );
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Goals from backend state
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState<boolean>(true);

  // Form State
  const [formData, setFormData] = useState<InformationFormData>({
    edu: "bachelor",
    year: "",
    campus: "",
    faculty: "",
    major: "",
  });
  const [selectedGoal, setSelectedGoal] = useState<string[]>(
    resumedBranch?.goalId ? [String(resumedBranch.goalId)] : []
  );
  const [exp, setExp] = useState<number>(Number(resumedBranch?.exp) || 1);
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
  const stepLabels = InformationService.getStepLabels();
  const steps = InformationService.getSteps();
  const currentExpData = InformationService.getExperienceData(exp);
  const goalsByGroup = InformationService.groupGoalsByGroup(goals);
  const goalStatus = InformationService.getGoalStatusMap(branches);

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

  // Only one goal can be selected at a time — clicking the selected goal
  // again deselects it, clicking a different goal replaces the selection.
  const toggleGoal = (goalId: string) => {
    setSelectedGoal((prev) => (prev.includes(goalId) ? [] : [goalId]));
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
      } catch (error) {
        console.error("Failed to save onboarding info to backend:", error);
        toast.error("บันทึกข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);
      setStep(3);
      return;
    }

    // Branch is saved here — after the user has picked both the goal (step 2)
    // and the experience level (step 3) — then we stay on /information and show
    // the pretest intro (step 4). Pretest starts only from step 4's button.
    if (step === 3) {
      setIsSubmitting(true);

      // มาถึงแล้วรอบหนึ่ง (กด Back จาก step 4) → แก้ระดับของ branch เดิม ไม่สร้างซ้ำ
      if (branchId) {
        try {
          await InformationService.updateBranchExpOnServer(branchId, exp);
          updateBranch(branchId, { exp });
        } catch (error) {
          console.error("Failed to update branch experience:", error);
          toast.error("บันทึกข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
          setIsSubmitting(false);
          return;
        }
        setIsSubmitting(false);
        setStep(PRETEST_INTRO_STEP);
        return;
      }

      let serverBranchIds: string[] = [];
      try {
        serverBranchIds = await Promise.all(
          selectedGoal.map((goalId) =>
            InformationService.createBranchOnServer(goalId, exp)
          )
        );
      } catch (error) {
        console.error("Failed to save branch to backend:", error);
        toast.error("บันทึกข้อมูลไปยังเซิร์ฟเวอร์ไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);

      const createdIds = InformationService.createBranchesForSelectedGoals(
        formData,
        selectedGoal,
        serverBranchIds,
        goals,
        exp,
        addBranch
      );
      if (createdIds.length > 0) {
        const newId = createdIds[createdIds.length - 1];
        switchBranch(newId);
        setBranchId(newId);
        // จำไว้ใน history state: refresh แล้วกลับมาที่ step 4 ของ branch นี้ ไม่ใช่ step 1
        navigate(location.pathname, {
          replace: true,
          state: { ...routeState, pretestBranchId: newId } satisfies InformationRouteState,
        });
      }

      setStep(PRETEST_INTRO_STEP);
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  // ปุ่ม Back ในการ์ด: step 1 ไม่มีที่ให้ย้อน, step 3 ไม่มีเมื่อ branch ถูกสร้างแล้ว (goal ล็อก)
  const canGoBack = step > 1 && !(step === 3 && branchId);

  const handlePrev = () => {
    if (!canGoBack) return;
    if (skipGeneralInfo && step === 2) {
      navigate('/selectbranch');
      return;
    }
    setStep(step - 1);
  };

  const handleBackToSelectBranch = () => {
    navigate("/selectbranch");
  };

  const handleStartPretest = () => {
    if (branchId) switchBranch(branchId);
    navigate("/pretest");
  };

  const selectedGoalBranchName =
    goals.find((g) => g.id === selectedGoal[0])?.name ||
    resumedBranch?.goalName ||
    "ที่เลือก";

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
    fromSelectBranch,
    canGoBack,
    // Derived
    currentExpData,
    goalsByGroup,
    goalStatus,
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
    handleBackToSelectBranch,
    handleStartPretest,
  };
}
