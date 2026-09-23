import { useCallback, useEffect, useMemo, useState } from "react";
import { workspaceService } from "./workspace.service";
import { goalService } from "../goal.service";
import { skillService } from "../../skillPanel/skill.service";
import { exerciseService } from "../../exercisePanel/exercise.service";
import { aiService } from "../../aiPanel/ai.service";
import { ExerciseFormValues } from "../../exercisePanel/exercise.controller";
import { SkillFormValues } from "../../skillPanel/skill.controller";
import { GoalFormValues } from "../goal.controller";
import { usePreferences } from "../../../../context/PreferencesContext";
import {
  Goal,
  GoalSkillRequireInput,
  GoalWorkspace,
  WorkspaceSkill,
} from "../../../../models/goalModel";
import { Skill } from "../../../../models/skillModel";
import { Exercise } from "../../../../models/exerciseModel";
import { AiDraft } from "../../../../models/aiDraftModel";
import {
  ConfirmState,
  ExerciseFormState,
  PublishMessage,
  SkillFormSource,
} from "./workspace.types";
import {
  draftSkillId,
  draftToExercise,
  toDraftPayload,
  toExercisePayload,
} from "./utils/exerciseDraft.mapper";
import { missingDraftCount } from "./utils/draftCount";

const CLOSED_FORM: ExerciseFormState = { open: false, editing: null, draft: null };

// โหลดใหม่ทุกครั้งหลังเขียน — ถ้ารายการ skill เหมือนเดิมให้คง reference เดิมไว้
// ไม่งั้น ExerciseFormModal (ที่ผูก effect กับ activeSkills) จะล้างฟอร์มระหว่าง "บันทึกและเพิ่มข้อถัดไป"
const skillsSignature = (skills: Skill[]) =>
  skills
    .map(
      (s) =>
        `${s.skillId}:${s.skillsName}:${s.status}:${(s.skillPrequisite ?? [])
          .map((p) => p.prerequisiteSkillId)
          .join("-")}`,
    )
    .join("|");

/**
 * controller ระดับหน้า Goal Workspace — ถือข้อมูลทั้งหน้าและทุกการเขียน
 * คืน props เป็นชุด ๆ ให้ component ลูก เพื่อให้ GoalWorkspace.tsx มีแค่การวาง layout
 */
export function workspaceController(goalId: number) {
  const { t } = usePreferences();

  const [workspace, setWorkspace] = useState<GoalWorkspace | null>(null);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [drafts, setDrafts] = useState<AiDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(null);
  // เลือกได้ทีละอย่าง: skill หนึ่งตัว หรือ goal node
  const [isGoalSelected, setIsGoalSelected] = useState<boolean>(false);

  const [isWriting, setIsWriting] = useState<boolean>(false);
  const [addSkillError, setAddSkillError] = useState<string | null>(null);
  const [pendingLinkSkillId, setPendingLinkSkillId] = useState<number | null>(null);
  // modal สร้าง skill เปิดจากไหน (null = ปิด)
  const [skillFormSource, setSkillFormSource] = useState<SkillFormSource | null>(null);
  const [skillFormError, setSkillFormError] = useState<string | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState<boolean>(false);
  const [goalFormError, setGoalFormError] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);

  const [exerciseForm, setExerciseForm] = useState<ExerciseFormState>(CLOSED_FORM);
  const [exerciseFormError, setExerciseFormError] = useState<string | null>(null);
  const [viewingExercise, setViewingExercise] = useState<Exercise | null>(null);
  const [togglingExerciseId, setTogglingExerciseId] = useState<number | null>(null);

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateMessage, setGenerateMessage] = useState<string | null>(null);
  const [busyDraftId, setBusyDraftId] = useState<number | null>(null);

  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [publishMessage, setPublishMessage] = useState<PublishMessage | null>(null);

  const reload = useCallback(async () => {
    const [ws, skills, exs, pending] = await Promise.all([
      workspaceService.getWorkspace(goalId),
      skillService.getAllSkills(),
      exerciseService.getAllExercises(),
      aiService.getDrafts({ status: "pending", entityType: "exercise" }),
    ]);

    if (ws.isError || !ws.data) {
      setError(ws.errorMessage);
    } else {
      setWorkspace(ws.data);
      setError(null);
    }
    if (!skills.isError) {
      const next = skills.data || [];
      setAllSkills((prev) => (skillsSignature(prev) === skillsSignature(next) ? prev : next));
    }
    if (!exs.isError) setExercises(exs.data || []);
    if (!pending.isError) setDrafts(pending.data || []);
    setIsLoading(false);
  }, [goalId]);

  useEffect(() => {
    setIsLoading(true);
    setSelectedSkillId(null);
    setIsGoalSelected(false);
    reload();
  }, [reload]);

  const selectSkill = (skillId: number) => {
    setIsGoalSelected(false);
    setSelectedSkillId(skillId);
  };
  const selectGoal = () => {
    setSelectedSkillId(null);
    setIsGoalSelected(true);
  };

  const skillsById = useMemo(
    () => new Map((workspace?.skills ?? []).map((s) => [s.skillId, s])),
    [workspace],
  );
  const selectedSkill = selectedSkillId != null ? skillsById.get(selectedSkillId) ?? null : null;

  const selectedExercises = useMemo(
    () => exercises.filter((e) => e.skillId === selectedSkillId),
    [exercises, selectedSkillId],
  );
  const selectedDrafts = useMemo(
    () => drafts.filter((d) => draftSkillId(d) === selectedSkillId),
    [drafts, selectedSkillId],
  );
  const activeExerciseCountBySkill = useMemo(() => {
    const counts = new Map<number, number>();
    for (const e of exercises) {
      if (e.status !== "active") continue;
      counts.set(e.skillId, (counts.get(e.skillId) ?? 0) + 1);
    }
    return counts;
  }, [exercises]);
  const requiredIds = useMemo(
    () => new Set((workspace?.skills ?? []).filter((s) => s.required).map((s) => s.skillId)),
    [workspace],
  );

  // PUT with-skill-require เป็น full replace — ส่งรายการเดิมทั้งหมดกลับไปเสมอ
  const requiredInputs = (): GoalSkillRequireInput[] =>
    (workspace?.skills ?? [])
      .filter((s) => s.required)
      .map((s) =>
        s.levelRequire != null
          ? { skillId: s.skillId, levelRequire: s.levelRequire }
          : { skillId: s.skillId },
      );

  /** คืนข้อความ error หรือ null ถ้าสำเร็จ */
  const saveRequires = async (next: GoalSkillRequireInput[]): Promise<string | null> => {
    const result = await goalService.updateGoalWithSkillRequire(goalId, { skillRequires: next });
    if (result.isError) return result.errorMessage;
    await reload();
    return null;
  };

  // ── เพิ่ม skill ──
  // select = false เมื่อเพิ่มจากแผงของ goal — ให้อยู่ที่แผง goal ต่อ จะได้เพิ่มหลายตัวติดกัน
  const linkSkill = async (skillId: number, select = true): Promise<boolean> => {
    setIsWriting(true);
    setAddSkillError(null);
    try {
      const err = await saveRequires([
        ...requiredInputs().filter((r) => r.skillId !== skillId),
        { skillId },
      ]);
      if (err) {
        setAddSkillError(err);
        return false;
      }
      setPendingLinkSkillId(null);
      if (select) selectSkill(skillId);
      return true;
    } finally {
      setIsWriting(false);
    }
  };

  // ── แก้ goal (ใช้ GoalFormModal ตัวเดียวกับแท็บ Goal) ──
  const activeSkills = useMemo(() => allSkills.filter((s) => s.status === "active"), [allSkills]);

  // แปลงข้อมูล workspace เป็น Goal ที่ฟอร์มรับ — goalSkillRequire = required skill ปัจจุบัน
  const editingGoal = useMemo<Goal | null>(() => {
    if (!workspace) return null;
    const skillById = new Map(allSkills.map((s) => [s.skillId, s]));
    return {
      id: workspace.goal.id,
      goal: workspace.goal.goal,
      goalDescription: workspace.goal.goalDescription,
      status: workspace.goal.status,
      goalSkillRequire: workspace.skills
        .filter((s) => s.required)
        .map((s) => ({
          goalId: workspace.goal.id,
          skillId: s.skillId,
          levelRequire: s.levelRequire,
          skill: skillById.get(s.skillId),
        })),
    };
  }, [workspace, allSkills]);

  const openEditGoal = () => {
    setGoalFormError(null);
    setIsGoalFormOpen(true);
  };
  const closeEditGoal = () => {
    setIsGoalFormOpen(false);
    setGoalFormError(null);
  };

  const saveGoal = async (form: GoalFormValues): Promise<boolean> => {
    setIsWriting(true);
    setGoalFormError(null);
    try {
      // endpoint เดียวกับแท็บ Goal — skillRequires เป็น full replace ตามที่ฟอร์มแก้
      const result = await goalService.updateGoalWithSkillRequire(goalId, {
        goal: form.goal,
        goalDescription: form.goalDescription,
        skillRequires: form.skillRequires,
      });
      if (result.isError) {
        setGoalFormError(result.errorMessage);
        return false;
      }
      closeEditGoal();
      await reload();
      return true;
    } finally {
      setIsWriting(false);
    }
  };

  const openCreateSkill = (from: SkillFormSource) => {
    setSkillFormError(null);
    setSkillFormSource(from);
  };
  const closeCreateSkill = () => {
    setSkillFormSource(null);
    setSkillFormError(null);
  };

  /**
   * บันทึกจาก SkillFormModal: สร้าง skill (พร้อม prerequisite ที่เลือกในฟอร์ม) แล้วผูกกับ goal ทันที
   * สองคำขอนี้ไม่ atomic: ถ้าขั้นผูกล้ม skill ยังอยู่ และมีปุ่มให้ผูกซ้ำ
   */
  const createAndLinkSkill = async (form: SkillFormValues): Promise<boolean> => {
    // skill inactive ผูกกับ goal ไม่ได้ (backend ตอบ 400) — บอกในฟอร์มก่อนสร้าง แทนที่จะสร้างแล้วผูกไม่ติด
    if (form.status !== "active") {
      setSkillFormError(t("admin.workspace.add.mustBeActive"));
      return false;
    }
    // สร้างจากแผง goal → อยู่ที่แผง goal ต่อ, จากปุ่มบน header → เปิดแผงของ skill ใหม่
    const select = skillFormSource !== "goal";
    setIsWriting(true);
    setSkillFormError(null);
    setAddSkillError(null);
    try {
      const created = await skillService.createSkillWithPrerequisite({
        skillCode: form.skillCode,
        skillsName: form.skillsName,
        tier: form.tier,
        status: form.status,
        prerequisites: form.prerequisites,
      });
      if (created.isError || !created.data) {
        setSkillFormError(created.errorMessage);
        return false;
      }
      closeCreateSkill();
      const newSkillId = created.data.skillId;
      const err = await saveRequires([...requiredInputs(), { skillId: newSkillId }]);
      if (err) {
        setPendingLinkSkillId(newSkillId);
        setAddSkillError(t("admin.workspace.add.linkFailed", { error: err }));
        await reload();
        return true;
      }
      if (select) selectSkill(newSkillId);
      return true;
    } finally {
      setIsWriting(false);
    }
  };

  const retryLink = async () => {
    if (pendingLinkSkillId != null) await linkSkill(pendingLinkSkillId, !isGoalSelected);
  };

  const addSkillBoxBase = {
    allSkills,
    requiredIds,
    activeExerciseCountBySkill,
    isBusy: isWriting,
    canRetryLink: pendingLinkSkillId != null,
    onRetryLink: retryLink,
  };

  // ── แผง skill ──
  const runPanelWrite = async (write: () => Promise<string | null>): Promise<boolean> => {
    setIsWriting(true);
    setPanelError(null);
    try {
      const err = await write();
      if (err) setPanelError(err);
      return err === null;
    } finally {
      setIsWriting(false);
    }
  };

  const makeRequired = (skillId: number) =>
    runPanelWrite(() => saveRequires([...requiredInputs(), { skillId }]));

  const setLevelRequire = (skillId: number, level: number | null) =>
    runPanelWrite(() =>
      saveRequires(
        requiredInputs().map((r) =>
          r.skillId !== skillId ? r : level != null ? { skillId, levelRequire: level } : { skillId },
        ),
      ),
    );

  const askRemoveRequired = (skill: WorkspaceSkill) => {
    if (!workspace) return;
    setConfirm({
      title: t("admin.workspace.confirm.removeTitle"),
      message: t("admin.workspace.confirm.remove", { name: skill.skillsName }),
      items:
        workspace.goal.status === "active"
          ? [t("admin.workspace.confirm.activeNote", { count: workspace.branchCount })]
          : undefined,
      confirmLabel: t("admin.workspace.panel.remove"),
      onConfirm: async () => {
        await runPanelWrite(() =>
          saveRequires(requiredInputs().filter((r) => r.skillId !== skill.skillId)),
        );
      },
    });
  };

  const savePrerequisites = (skillId: number, prerequisiteIds: number[]) =>
    runPanelWrite(async () => {
      // คง prerequisiteLevel เดิมไว้ — endpoint นี้แทนที่รายการทั้งหมด
      const current = allSkills.find((s) => s.skillId === skillId);
      const levelOf = new Map(
        (current?.skillPrequisite ?? []).map((p) => [p.prerequisiteSkillId, p.prerequisiteLevel]),
      );
      const result = await skillService.updateSkillWithPrerequisite(skillId, {
        prerequisites: prerequisiteIds.map((id) => {
          const level = levelOf.get(id);
          return level != null
            ? { prerequisiteSkillId: id, prerequisiteLevel: level }
            : { prerequisiteSkillId: id };
        }),
      });
      // วงวน → 400 "Prerequisite creates a cycle" แสดงตรง ๆ และไม่โหลด tree ใหม่
      if (result.isError) return result.errorMessage;
      await reload();
      return null;
    });

  // ── ข้อสอบ ──
  const openAddExercise = () => {
    setExerciseFormError(null);
    setExerciseForm({ open: true, editing: null, draft: null });
  };

  const openEditExercise = async (exercise: Exercise) => {
    setExerciseFormError(null);
    setExerciseForm({ open: true, editing: exercise, draft: null });
    // รายการรวมไม่มี choice ครบ — โหลดตัวเต็มมาทับ
    const result = await exerciseService.getExercise(exercise.id);
    const loaded = result.data;
    if (!result.isError && loaded) {
      setExerciseForm((f) =>
        f.open && f.editing?.id === exercise.id && !f.draft ? { ...f, editing: loaded } : f,
      );
    }
  };

  const openViewExercise = async (exercise: Exercise) => {
    setViewingExercise(exercise);
    // รายการรวมไม่มี choice ครบ — โหลดตัวเต็มมาทับ (เหมือน ExerciseTab)
    const result = await exerciseService.getExercise(exercise.id);
    const loaded = result.data;
    if (!result.isError && loaded) {
      setViewingExercise((current) => (current?.id === exercise.id ? loaded : current));
    }
  };

  const closeViewExercise = () => setViewingExercise(null);

  /** ปิด = soft delete (DELETE ตั้ง status inactive), เปิด = PUT status active — แบบเดียวกับ ExerciseTab */
  const toggleExerciseStatus = async (exercise: Exercise) => {
    setTogglingExerciseId(exercise.id);
    setPanelError(null);
    try {
      const result =
        exercise.status === "active"
          ? await exerciseService.deleteExercise(exercise.id)
          : await exerciseService.updateExercise(exercise.id, { status: "active" });
      if (result.isError) setPanelError(result.errorMessage);
      // โหลดใหม่ทั้งหน้า — จำนวนข้อ active เปลี่ยน readiness ของ skill/goal
      else await reload();
    } finally {
      setTogglingExerciseId(null);
    }
  };

  const openEditDraft = (draft: AiDraft) => {
    setExerciseFormError(null);
    setExerciseForm({ open: true, editing: draftToExercise(draft), draft });
  };

  const closeExerciseForm = () => {
    setExerciseForm(CLOSED_FORM);
    setExerciseFormError(null);
  };

  const persistExercise = async (form: ExerciseFormValues): Promise<boolean> => {
    const skillId = form.skillId ?? selectedSkillId;
    if (skillId == null) {
      setExerciseFormError(t("admin.exercises.pickSkill"));
      return false;
    }
    setIsWriting(true);
    setExerciseFormError(null);
    try {
      const { draft, editing } = exerciseForm;
      const result = draft
        ? await aiService.updatePayload(draft.id, toDraftPayload(form, skillId))
        : editing
          ? await exerciseService.updateExercise(editing.id, toExercisePayload(form, skillId))
          : await exerciseService.createExercise(toExercisePayload(form, skillId));
      if (result.isError) {
        setExerciseFormError(result.errorMessage);
        return false;
      }
      await reload();
      return true;
    } finally {
      setIsWriting(false);
    }
  };

  const saveExercise = async (form: ExerciseFormValues): Promise<boolean> => {
    const ok = await persistExercise(form);
    if (ok) closeExerciseForm();
    return ok;
  };

  // ── ร่างจาก AI ──
  const generateDrafts = async () => {
    if (!workspace || !selectedSkill) return;
    setIsGenerating(true);
    setGenerateMessage(null);
    setPanelError(null);
    try {
      const result = await aiService.generate({
        entityType: "exercise",
        count: missingDraftCount(workspace, selectedSkill),
        skillId: selectedSkill.skillId,
        // เล็งที่ levelRequire เพื่อให้ผ่าน LEVEL_COVERAGE (skillLevel มีแค่ 1-5)
        ...(selectedSkill.levelRequire != null
          ? { skillLevel: Math.min(selectedSkill.levelRequire, 5) }
          : {}),
      });
      if (result.isError || !result.data) {
        setPanelError(result.errorMessage);
        return;
      }
      setGenerateMessage(
        t("admin.workspace.panel.ai.result", {
          created: result.data.created,
          rejected: result.data.rejected.length,
        }),
      );
      await reload();
    } finally {
      setIsGenerating(false);
    }
  };

  const runDraftAction = async (
    draftId: number,
    action: () => Promise<{ isError: boolean; errorMessage: string }>,
  ) => {
    setBusyDraftId(draftId);
    setPanelError(null);
    try {
      const result = await action();
      if (result.isError) setPanelError(result.errorMessage);
      else await reload();
    } finally {
      setBusyDraftId(null);
    }
  };

  const approveDraft = (draftId: number) =>
    runDraftAction(draftId, () => aiService.approve(draftId, "active"));
  const rejectDraft = (draftId: number) =>
    runDraftAction(draftId, () => aiService.reject(draftId));

  // ── publish ──
  const requestPublish = () => {
    if (!workspace) return;
    setPublishMessage(null);
    // ไม่ disable ปุ่ม — กดแล้วบอกว่าติดอะไร (รายการที่ไม่ผ่านแสดงอยู่ใน checklist แล้ว)
    if (!workspace.readiness.ready) {
      setPublishMessage({ kind: "error", text: t("admin.workspace.publish.notReady") });
      return;
    }
    const items = [
      ...(workspace.goal.status !== "active"
        ? [t("admin.workspace.publish.goalItem", { name: workspace.goal.goal })]
        : []),
      ...workspace.skills
        .filter((s) => s.status !== "active")
        .map((s) => t("admin.workspace.publish.skillItem", { name: s.skillsName })),
    ];
    setConfirm({
      title: t("admin.workspace.publish.confirmTitle"),
      message: t("admin.workspace.publish.confirmMsg"),
      items,
      confirmLabel: t("admin.workspace.confirm.yes"),
      onConfirm: async () => {
        // server ตรวจความพร้อมซ้ำเองเสมอ
        const result = await workspaceService.publish(goalId);
        setPublishMessage(
          result.isError
            ? { kind: "error", text: result.errorMessage }
            : { kind: "ok", text: t("admin.workspace.publish.success") },
        );
        await reload();
      },
    });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setIsConfirming(true);
    try {
      await confirm.onConfirm();
    } finally {
      setIsConfirming(false);
      setConfirm(null);
    }
  };

  const cancelConfirm = () => setConfirm(null);

  // ── ค่าที่หน้าจอใช้แสดงผล ──
  const isActive = workspace?.goal.status === "active";

  return {
    workspace,
    error,
    showLoading: isLoading && !workspace,
    showNotReadyBanner: !!workspace && isActive && !workspace.readiness.ready,

    header: {
      title: workspace?.goal.goal ?? "",
      showStatus: workspace !== null,
      statusClass: `ad-ws-status ad-ws-status--${isActive ? "active" : "draft"}`,
      statusLabel: isActive
        ? t("admin.workspace.status.active")
        : t("admin.workspace.status.draft"),
      branchLabel:
        workspace && isActive
          ? t("admin.workspace.branchCount", { count: workspace.branchCount })
          : null,
    },

    // error ของการเพิ่ม skill แสดงที่เดียว — ในแผง goal เมื่อเปิดอยู่ ไม่งั้นที่ช่องบน header
    addSkillBox: {
      ...addSkillBoxBase,
      error: isGoalSelected ? null : addSkillError,
      onLink: (skillId: number) => linkSkill(skillId),
      onOpenCreate: () => openCreateSkill("header"),
    },

    skillFormModal: {
      isOpen: skillFormSource !== null,
      editingSkill: null,
      allSkills,
      isSaving: isWriting,
      formError: skillFormError,
      onSave: createAndLinkSkill,
      onClose: closeCreateSkill,
      submitLabel: t("admin.workspace.add.createBtn"),
    },

    tree: {
      selectedSkillId,
      isGoalSelected,
      onSelectSkill: selectSkill,
      onSelectGoal: selectGoal,
    },

    isGoalSelected,
    goalDetail: {
      addSkillBox: {
        ...addSkillBoxBase,
        error: addSkillError,
        onLink: (skillId: number) => linkSkill(skillId, false),
        onOpenCreate: () => openCreateSkill("goal"),
      },
      isBusy: isWriting,
      error: panelError,
      onSelectSkill: selectSkill,
      onRemoveRequired: askRemoveRequired,
      onEditGoal: openEditGoal,
    },

    goalFormModal: {
      isOpen: isGoalFormOpen,
      editingGoal,
      activeSkills,
      isSaving: isWriting,
      formError: goalFormError,
      onSave: saveGoal,
      onClose: closeEditGoal,
    },

    checklist: {
      message: publishMessage,
      isBusy: isWriting || isConfirming,
      onSelectSkill: selectSkill,
      onPublish: requestPublish,
    },

    skillDetail: {
      skill: selectedSkill,
      allSkills,
      exercises: selectedExercises,
      drafts: selectedDrafts,
      isBusy: isWriting,
      isGenerating,
      error: panelError,
      generateMessage,
      busyDraftId,
      onMakeRequired: makeRequired,
      onRemoveRequired: askRemoveRequired,
      onSetLevel: setLevelRequire,
      onSavePrerequisites: savePrerequisites,
      onAddExercise: openAddExercise,
      onEditExercise: openEditExercise,
      onViewExercise: openViewExercise,
      onToggleExerciseStatus: toggleExerciseStatus,
      togglingExerciseId,
      onGenerate: generateDrafts,
      onApproveDraft: approveDraft,
      onEditDraft: openEditDraft,
      onRejectDraft: rejectDraft,
    },

    exerciseModal: {
      isOpen: exerciseForm.open,
      editingExercise: exerciseForm.editing,
      activeSkills: allSkills,
      isSaving: isWriting,
      formError: exerciseFormError,
      onSave: saveExercise,
      onClose: closeExerciseForm,
      lockedSkillId: selectedSkillId ?? undefined,
      // แก้ข้อเดิม/ร่างเดิม ไม่มี "เพิ่มข้อถัดไป"
      onSaveAndNext: exerciseForm.editing ? undefined : persistExercise,
      title: exerciseForm.draft ? t("admin.workspace.panel.ai.editTitle") : undefined,
    },

    exerciseView: {
      exercise: viewingExercise,
      onClose: closeViewExercise,
      onEdit: (exercise: Exercise) => {
        closeViewExercise();
        openEditExercise(exercise);
      },
    },

    confirmDialog: {
      state: confirm,
      isBusy: isConfirming,
      onConfirm: runConfirm,
      onCancel: cancelConfirm,
    },
  };
}
