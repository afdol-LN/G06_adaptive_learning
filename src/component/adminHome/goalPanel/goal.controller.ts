import { useCallback, useEffect, useMemo, useState } from "react";
import { goalService } from "./goal.service";
import { skillService } from "../skillPanel/skill.service";
import { Goal, GoalSkillRequireInput } from "../../../models/goalModel";
import { Skill } from "../../../models/skillModel";
import { getStatusColor } from "../../../utils/adminUi";

export interface GoalFormValues {
  goal: string;
  goalDescription: string;
  skillRequires: GoalSkillRequireInput[];
}

export const EMPTY_GOAL_FORM: GoalFormValues = {
  goal: "",
  goalDescription: "",
  skillRequires: [],
};

export function goalController() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [goalSearch, setGoalSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const [activeSkills, setActiveSkills] = useState<Skill[]>([]);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [viewingGoal, setViewingGoal] = useState<Goal | null>(null);

  useEffect(() => {
    loadGoals();
    loadSkills();
  }, []);

  const loadGoals = useCallback(async () => {
    setIsLoading(true);
    const result = await goalService.getAllGoals();
    if (result.isError) {
      setError(result.errorMessage);
      setGoals([]);
    } else {
      setGoals(result.data || []);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  const loadSkills = useCallback(async () => {
    const result = await skillService.getAllSkills();
    if (!result.isError) {
      setActiveSkills((result.data || []).filter((s) => s.status === "active"));
    }
  }, []);

  const filteredGoals = useMemo(() => {
    const term = goalSearch.trim().toLowerCase();
    return goals.filter((g) => {
      if (term && !g.goal.toLowerCase().includes(term)) return false;
      if (statusFilter !== "all" && g.status !== statusFilter) return false;
      return true;
    });
  }, [goals, goalSearch, statusFilter]);

  const openCreateForm = () => {
    setFormError(null);
    setEditingGoal(null);
    setIsFormOpen(true);
  };

  const openEditForm = (goal: Goal) => {
    setFormError(null);
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingGoal(null);
    setFormError(null);
  };

  const openView = (goal: Goal) => setViewingGoal(goal);
  const closeView = () => setViewingGoal(null);

  const saveGoal = async (form: GoalFormValues): Promise<boolean> => {
    setIsSaving(true);
    setFormError(null);
    try {
      const payload = {
        goal: form.goal,
        goalDescription: form.goalDescription,
        skillRequires: form.skillRequires,
      };

      const result = editingGoal
        ? await goalService.updateGoalWithSkillRequire(editingGoal.id, payload)
        : await goalService.createGoalWithSkillRequire(payload);

      if (result.isError) {
        setFormError(result.errorMessage);
        return false;
      }

      closeForm();
      await loadGoals();
      return true;
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoalStatus = async (goal: Goal) => {
    const newStatus = goal.status === "active" ? "inactive" : "active";
    setIsLoading(true);
    const result = await goalService.updateGoalStatus(goal.id, newStatus);
    if (result.isError) {
      setError(result.errorMessage);
    } else {
      setGoals((prev) =>
        prev.map((g) => (g.id === goal.id ? { ...g, status: newStatus } : g)),
      );
    }
    setIsLoading(false);
  };

  return {
    goals,
    isLoading,
    error,
    goalSearch,
    setGoalSearch,
    statusFilter,
    setStatusFilter,
    filteredGoals,
    activeSkills,
    getStatusColor,

    isFormOpen,
    editingGoal,
    isSaving,
    formError,
    openCreateForm,
    openEditForm,
    closeForm,
    saveGoal,

    viewingGoal,
    openView,
    closeView,

    toggleGoalStatus,
  };
}
