import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ExerciseStatDetail,
  ExerciseStatSummary,
} from "../../../models/exerciseStatsModel";
import { skillService } from "../skillPanel/skill.service";
import { exerciseStatsService } from "./exerciseStats.service";

export interface SkillOption {
  id: number;
  name: string;
}

/** list tab: filters + the per-question rows */
export function exerciseStatsController() {
  const [skillId, setSkillId] = useState<number | null>(null);
  const [includePretest, setIncludePretest] = useState(false);
  const [level, setLevel] = useState<number | null>(null);
  const [rows, setRows] = useState<ExerciseStatSummary[]>([]);
  const [skills, setSkills] = useState<SkillOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await skillService.getAllSkills();
      if (cancelled || res.isError || !res.data) return;
      setSkills(
        res.data
          .map((s) => ({ id: s.skillId, name: s.skillsName }))
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const res = await exerciseStatsService.getList(skillId, includePretest);
      if (cancelled) return;
      if (res.isError || !res.data) {
        setError(res.errorMessage || "error");
        setRows([]);
      } else {
        setError(null);
        setRows(res.data);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [skillId, includePretest, reloadKey]);

  // levels that exist in the loaded rows (the server already sorts hardest first)
  const levels = useMemo(
    () => Array.from(new Set(rows.map((r) => r.level))).sort((a, b) => a - b),
    [rows],
  );

  const filtered = useMemo(
    () => (level === null ? rows : rows.filter((r) => r.level === level)),
    [rows, level],
  );

  // a level that disappears after switching skill/pretest must not leave an empty table
  useEffect(() => {
    if (level !== null && !levels.includes(level)) setLevel(null);
  }, [levels, level]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  return {
    skillId,
    setSkillId,
    includePretest,
    setIncludePretest,
    level,
    setLevel,
    levels,
    rows: filtered,
    skills,
    isLoading,
    error,
    reload,
  };
}

/** detail modal: one question; null id = closed */
export function exerciseStatDetailController(
  exerciseId: number | null,
  includePretest: boolean,
) {
  const [detail, setDetail] = useState<ExerciseStatDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (exerciseId === null) {
      setDetail(null);
      setError(null);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    setDetail(null);
    (async () => {
      const res = await exerciseStatsService.getDetail(
        exerciseId,
        includePretest,
      );
      if (cancelled) return;
      if (res.isError || !res.data) {
        setError(res.errorMessage || "error");
      } else {
        setError(null);
        setDetail(res.data);
      }
      setIsLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [exerciseId, includePretest]);

  return { detail, isLoading, error };
}
