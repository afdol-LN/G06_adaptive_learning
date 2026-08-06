export interface InformationFormData {
  edu: "bachelor" | "master" | "phd" | string;
  year: string;
  campus: string;
  faculty: string;
  major: string;
  // Numeric ids (kept as strings for setFormDataField) resolved alongside the
  // display names above — the backend persists ids, not names.
  campusId?: string;
  facultyId?: string;
  majorId?: string;
}

export interface StepDefinition {
  title: string;
  sub: string;
}

export interface FacultyOption {
  v: string;
  label: string;
}

export interface ExperienceData {
  level: string;
  title: string;
  desc: string;
  badges: string[];
  color: string;
}

export interface GoalItem {
  id: string;
  name: string;
  group: string;
  icon: string;
  desc: string;
  skillCount?: number;
}

export interface BranchCreationData {
  campus: string;
  faculty: string;
  major: string;
  year: string;
  goalId: string;
  goalName: string;
  goalIcon: string;
  goalDesc: string;
  exp: number;
}

export type GoalGroupMap = Record<string, GoalItem[]>;
