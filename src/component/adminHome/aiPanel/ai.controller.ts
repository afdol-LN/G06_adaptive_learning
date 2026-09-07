import { useCallback, useEffect, useMemo, useState } from "react";
import { aiService } from "./ai.service";
import { skillService } from "../skillPanel/skill.service";
import { Skill } from "../../../models/skillModel";
import { Goal } from "../../../models/goalModel";
import { Exercise } from "../../../models/exerciseModel";
import {
  AiDraft,
  AiDraftEntityType,
  AiDraftStatus,
  ExerciseDraftPayload,
  GoalDraftPayload,
  SkillDraftPayload,
} from "../../../models/aiDraftModel";
import { ExerciseFormValues } from "../exercisePanel/exercise.controller";
import { SkillFormValues } from "../skillPanel/skill.controller";
import { GoalFormValues } from "../goalPanel/goal.controller";
import { toSeconds } from "../../../utils/timeUnit";

export interface GenerateFormValues {
  entityType: AiDraftEntityType;
  count: number;
  skillId: number | null;
  skillLevel: number;
  exerciseType: "CHOICE" | "FILL_IN_BLANK" | "MIXED";
  instruction: string;
}

export const EMPTY_GENERATE_FORM: GenerateFormValues = {
  entityType: "exercise",
  count: 5,
  skillId: null,
  skillLevel: 3,
  exerciseType: "CHOICE",
  instruction: "",
};

/** ระดับความยากที่ระบบรองรับ — ยึดตาม SLIP_BY_LEVEL ฝั่ง backend ที่มีแค่ 1-5 */
export const BLOOM_LEVELS = [
  { level: 1, label: "1 · Remember / Understand" },
  { level: 2, label: "2 · Apply" },
  { level: 3, label: "3 · Analyze" },
  { level: 4, label: "4 · Evaluate" },
  { level: 5, label: "5 · Create" },
] as const;

export function aiController() {
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // ── ฟอร์มสั่งงาน ──
  const [form, setForm] = useState<GenerateFormValues>(EMPTY_GENERATE_FORM);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  /** เหตุผลของรายการที่ LLM สร้างมาแล้วไม่ผ่านการตรวจ — แสดงให้เห็น ไม่ซ่อน */
  const [rejectedReasons, setRejectedReasons] = useState<string[]>([]);

  // ── ตัวกรอง ──
  const [statusFilter, setStatusFilter] = useState<AiDraftStatus | "all">(
    "pending",
  );
  const [entityFilter, setEntityFilter] = useState<AiDraftEntityType | "all">(
    "all",
  );

  // ── สถานะการทำงานรายการ์ด ──
  const [busyDraftId, setBusyDraftId] = useState<number | null>(null);

  // ── modal ──
  const [editingDraft, setEditingDraft] = useState<AiDraft | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [approveTarget, setApproveTarget] = useState<AiDraft | null>(null);
  const [regenerateTarget, setRegenerateTarget] = useState<AiDraft | null>(null);

  const activeSkills = useMemo(
    () => allSkills.filter((s) => s.status === "active"),
    [allSkills],
  );

  const loadSkills = useCallback(async () => {
    const result = await skillService.getAllSkills();
    if (!result.isError) {
      setAllSkills(result.data || []);
    }
  }, []);

  const loadDrafts = useCallback(async () => {
    setIsLoading(true);
    const result = await aiService.getDrafts({
      status: statusFilter === "all" ? undefined : statusFilter,
      entityType: entityFilter === "all" ? undefined : entityFilter,
    });
    if (result.isError) {
      setError(result.errorMessage);
      setDrafts([]);
    } else {
      setDrafts(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  }, [statusFilter, entityFilter]);

  useEffect(() => {
    loadSkills();
  }, [loadSkills]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const skillNameById = useCallback(
    (skillId: number): string =>
      allSkills.find((s) => s.skillId === skillId)?.skillsName ?? `#${skillId}`,
    [allSkills],
  );

  // ───────────────────────────── generate ─────────────────────────────

  const updateForm = <K extends keyof GenerateFormValues>(
    key: K,
    value: GenerateFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const generate = async (): Promise<boolean> => {
    if (form.entityType === "exercise" && !form.skillId) {
      setGenerateError("กรุณาเลือก Skill ก่อนสั่งสร้างโจทย์");
      return false;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setRejectedReasons([]);
    try {
      const result = await aiService.generate({
        entityType: form.entityType,
        count: form.count,
        instruction: form.instruction.trim() || undefined,
        ...(form.entityType === "exercise"
          ? {
              skillId: form.skillId ?? undefined,
              skillLevel: form.skillLevel,
              exerciseType: form.exerciseType,
            }
          : {}),
      });

      if (result.isError) {
        setGenerateError(result.errorMessage);
        return false;
      }

      setRejectedReasons((result.data?.rejected || []).map((r) => r.reason));
      // ผลลัพธ์ใหม่เป็น pending เสมอ — เด้งตัวกรองไปที่ pending ให้เห็นทันที
      setStatusFilter("pending");
      setEntityFilter(form.entityType);
      await loadDrafts();
      return true;
    } finally {
      setIsGenerating(false);
    }
  };

  // ──────────────────── approve / reject / regenerate ────────────────────

  const approveDraft = async (
    draft: AiDraft,
    status: "active" | "inactive",
  ): Promise<boolean> => {
    setBusyDraftId(draft.id);
    setError(null);
    try {
      const result = await aiService.approve(draft.id, status);
      if (result.isError) {
        setError(result.errorMessage);
        return false;
      }
      setApproveTarget(null);
      await loadDrafts();
      return true;
    } finally {
      setBusyDraftId(null);
    }
  };

  const rejectDraft = async (draft: AiDraft): Promise<boolean> => {
    setBusyDraftId(draft.id);
    setError(null);
    try {
      const result = await aiService.reject(draft.id);
      if (result.isError) {
        setError(result.errorMessage);
        return false;
      }
      await loadDrafts();
      return true;
    } finally {
      setBusyDraftId(null);
    }
  };

  const regenerateDraft = async (
    draft: AiDraft,
    instruction: string,
  ): Promise<boolean> => {
    setBusyDraftId(draft.id);
    setError(null);
    try {
      const result = await aiService.regenerate(
        draft.id,
        instruction.trim() || undefined,
      );
      if (result.isError) {
        setError(result.errorMessage);
        return false;
      }
      setRegenerateTarget(null);
      // แทนที่เฉพาะการ์ดใบนั้น เพื่อไม่ให้ทั้งรายการกระพริบ
      setDrafts((prev) =>
        prev.map((d) => (d.id === draft.id ? (result.data as AiDraft) : d)),
      );
      return true;
    } finally {
      setBusyDraftId(null);
    }
  };

  // ───────────────── แก้ draft ผ่าน FormModal เดิมของแต่ละ tab ─────────────────

  const openEdit = (draft: AiDraft) => {
    setFormError(null);
    setEditingDraft(draft);
  };
  const closeEdit = () => {
    setEditingDraft(null);
    setFormError(null);
  };

  /**
   * แปลง payload ของร่างให้เป็น object หน้าตาเหมือน entity จริง
   * เพื่อป้อนเข้า ExerciseFormModal ที่ hydrate จาก Exercise
   *
   * modal บังคับกรอกตัวเลือกครบ 4 ช่อง แต่ backend รับ 2-4 ข้อ
   * จึงเติมช่องว่างให้ครบ 4 แล้วค่อยตัดช่องว่างทิ้งตอนบันทึกกลับ
   */
  const editingExercise: Exercise | null = useMemo(() => {
    if (!editingDraft || editingDraft.entityType !== "exercise") return null;
    const p = editingDraft.payload as ExerciseDraftPayload;
    const choices = p.choices || [];
    return {
      id: editingDraft.id,
      description: p.description,
      level: p.skillLevel,
      status: "active",
      expectTime: p.expectTime ?? 60,
      skillId: p.skillId,
      skillLevel: p.skillLevel,
      type: p.type,
      fillInBlank: p.fillInBlank ?? null,
      isCasesensitive: p.isCasesensitive ?? "NO",
      exerciseChoices: choices.map((c, index) => ({
        id: index,
        exerciseId: editingDraft.id,
        script: c.script,
        isAnswer: c.isAnswer,
      })),
    };
  }, [editingDraft]);

  const editingSkill: Skill | null = useMemo(() => {
    if (!editingDraft || editingDraft.entityType !== "skill") return null;
    const p = editingDraft.payload as SkillDraftPayload;
    return {
      skillId: editingDraft.id,
      skillCode: p.skillCode,
      skillsName: p.skillsName,
      tier: p.tier ?? null,
      status: "active",
      skillPrequisite: (p.prerequisites || []).map((pre) => ({
        skillId: editingDraft.id,
        prerequisiteSkillId: pre.prerequisiteSkillId,
        prerequisiteLevel: null,
      })),
    };
  }, [editingDraft]);

  const editingGoal: Goal | null = useMemo(() => {
    if (!editingDraft || editingDraft.entityType !== "goal") return null;
    const p = editingDraft.payload as GoalDraftPayload;
    return {
      id: editingDraft.id,
      goal: p.goal,
      goalDescription: p.goalDescription ?? "",
      status: "active",
      goalSkillRequire: (p.skillRequires || []).map((r) => ({
        goalId: editingDraft.id,
        skillId: r.skillId,
        levelRequire: r.levelRequire ?? null,
      })),
    };
  }, [editingDraft]);

  const persistPayload = async (payload: any): Promise<boolean> => {
    if (!editingDraft) return false;
    setIsSaving(true);
    setFormError(null);
    try {
      const result = await aiService.updatePayload(editingDraft.id, payload);
      if (result.isError) {
        setFormError(result.errorMessage);
        return false;
      }
      setDrafts((prev) =>
        prev.map((d) =>
          d.id === editingDraft.id ? (result.data as AiDraft) : d,
        ),
      );
      closeEdit();
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const saveExerciseDraft = async (
    values: ExerciseFormValues,
  ): Promise<boolean> => {
    if (!values.skillId) {
      setFormError("กรุณาเลือก Skill");
      return false;
    }
    const base: ExerciseDraftPayload = {
      description: values.description.trim(),
      skillId: values.skillId,
      skillLevel: values.level,
      type: values.type,
      expectTime: toSeconds(values.expectTimeValue, values.expectTimeUnit),
    };
    const payload: ExerciseDraftPayload =
      values.type === "CHOICE"
        ? {
            ...base,
            // ตัดช่องที่เว้นว่างทิ้ง — backend รับ 2-4 ข้อ ไม่จำเป็นต้องครบ 4
            choices: values.choices
              .map((script, index) => ({
                script: script.trim(),
                isAnswer: index === values.correctChoiceIndex,
              }))
              .filter((c) => c.script !== ""),
          }
        : {
            ...base,
            fillInBlank: values.fillInBlank.trim(),
            isCasesensitive: values.isCasesensitive,
          };
    return persistPayload(payload);
  };

  const saveSkillDraft = async (values: SkillFormValues): Promise<boolean> => {
    const payload: SkillDraftPayload = {
      skillCode: values.skillCode.trim(),
      skillsName: values.skillsName.trim(),
      tier: values.tier,
      prerequisites: values.prerequisites.map((p) => ({
        prerequisiteSkillId: p.prerequisiteSkillId,
      })),
    };
    return persistPayload(payload);
  };

  const saveGoalDraft = async (values: GoalFormValues): Promise<boolean> => {
    const payload: GoalDraftPayload = {
      goal: values.goal.trim(),
      goalDescription: values.goalDescription.trim() || undefined,
      skillRequires: values.skillRequires.map((r) => ({
        skillId: r.skillId,
        levelRequire: r.levelRequire,
      })),
    };
    return persistPayload(payload);
  };

  return {
    drafts,
    allSkills,
    activeSkills,
    isLoading,
    error,
    skillNameById,

    form,
    updateForm,
    isGenerating,
    generateError,
    rejectedReasons,
    generate,

    statusFilter,
    setStatusFilter,
    entityFilter,
    setEntityFilter,
    reloadDrafts: loadDrafts,

    busyDraftId,
    approveDraft,
    rejectDraft,
    regenerateDraft,

    editingDraft,
    editingExercise,
    editingSkill,
    editingGoal,
    isSaving,
    formError,
    openEdit,
    closeEdit,
    saveExerciseDraft,
    saveSkillDraft,
    saveGoalDraft,

    approveTarget,
    setApproveTarget,
    regenerateTarget,
    setRegenerateTarget,
  };
}
