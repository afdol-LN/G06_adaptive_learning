import { useCallback, useEffect, useState } from "react";
import { summaryService } from "./summary.service";
import { usePreferences } from "../../../context/PreferencesContext";
import {
  AdminSummary,
  SummarySkillProgress,
  SummaryUserActivity,
} from "../../../models/summaryModel";

const EMPTY_SUMMARY: AdminSummary = {
  totalUsers: 0,
  activeToday: 0,
  totalSessions: 0,
  avgScore: 0,
  topSkill: "-",
  weekSessions: [0, 0, 0, 0, 0, 0, 0],
};

export function summaryController() {
  const { t } = usePreferences();
  const [summary, setSummary] = useState<AdminSummary>(EMPTY_SUMMARY);
  const [skillProgress, setSkillProgress] = useState<SummarySkillProgress[]>([]);
  const [userActivity, setUserActivity] = useState<SummaryUserActivity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    const result = await summaryService.getSummary();
    if (result.isError || !result.data) {
      setError(result.errorMessage);
    } else {
      setSummary(result.data.summary);
      setSkillProgress(result.data.skillProgress);
      setUserActivity(result.data.userActivity);
      setError(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const maxBar = Math.max(1, ...summary.weekSessions);

  return {
    summary,
    skillProgress,
    userActivity,
    isLoading,
    error,
    maxBar,
    // จันทร์ → อาทิตย์ ตามลำดับของ weekSessions ('|' คั่นใน i18n)
    dayLabels: t("admin.summary.days").split("|"),
  };
}
