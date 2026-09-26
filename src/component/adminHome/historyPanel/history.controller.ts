import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { historyService } from "./history.service";
import { userService } from "../userPanel/user.service";
import { goalService } from "../goalPanel/goal.service";
import { skillService } from "../skillPanel/skill.service";
import {
  ACTIVITY_TABS,
  ActivityPage,
  ActivityTab,
  TabFilter,
  TimeFilter,
  emptyTabFilter,
} from "../../../models/historyModel";
import { SessionHistoryItem } from "../../../models/sessionHistoryModel";
import { addDays, parseIso, startOfDay } from "../../common/calendarDate";

const PAGE_SIZE = 20;

export interface Option {
  id: number;
  name: string;
}
interface GoalOption extends Option {
  skillIds: number[];
}

type PerTab<T> = Record<ActivityTab, T>;
const perTab = <T,>(make: () => T): PerTab<T> =>
  Object.fromEntries(ACTIVITY_TABS.map((tab) => [tab, make()])) as PerTab<T>;

/** local midnight of a calendar day, as an instant the backend compares against */
const midnight = (day: Date) =>
  new Date(day.getFullYear(), day.getMonth(), day.getDate()).toISOString();

/** the time menu → [from, to) instants; null = unbounded */
export function timeBounds(time: TimeFilter): { from: string | null; to: string | null } {
  const today = startOfDay(new Date());
  const tomorrow = midnight(addDays(today, 1));
  switch (time.preset) {
    case "today":
      return { from: midnight(today), to: tomorrow };
    case "7d":
      return { from: midnight(addDays(today, -6)), to: tomorrow };
    case "30d":
      return { from: midnight(addDays(today, -29)), to: tomorrow };
    case "custom": {
      const from = parseIso(time.from);
      const to = parseIso(time.to);
      return {
        from: from ? midnight(from) : null,
        to: to ? midnight(addDays(to, 1)) : null,
      };
    }
    default:
      return { from: null, to: null };
  }
}

/** how many options differ from "no filter" — shown on the clear button */
export const activeFilterCount = (f: TabFilter) =>
  (Object.keys(f) as (keyof TabFilter)[]).filter(
    (k) => f[k] !== emptyTabFilter()[k],
  ).length;

/**
 * Lazy + paginated + filtered. The shared row (user, time) applies to every tab; each tab also
 * keeps its own filter options and page. A (tab, user, time, filters, page) combination is fetched
 * only the first time it is shown, then served from `cache` — going back to it costs no request.
 * Changing any filter returns that tab to page 1. Reload drops the cache.
 */
export function historyController() {
  const [tab, setTab] = useState<ActivityTab>("all");
  const [pageByTab, setPageByTab] = useState<PerTab<number>>(() => perTab(() => 1));
  const [filters, setFilters] = useState<PerTab<TabFilter>>(() => perTab(emptyTabFilter));
  const [userId, setUserIdState] = useState<number | null>(null);
  const [time, setTimeState] = useState<TimeFilter>({ preset: "all", from: "", to: "" });

  const [users, setUsers] = useState<Option[]>([]);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [skills, setSkills] = useState<Option[]>([]);

  const [cache, setCache] = useState<Map<string, ActivityPage>>(() => new Map());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // a change while a request is in flight must not let the older answer win
  const requestSeq = useRef(0);

  const page = pageByTab[tab];
  const filter = filters[tab];
  // "today"/"7d" are resolved to instants per request; the key uses the resolved bounds
  const bounds = useMemo(() => timeBounds(time), [time]);
  const keyOf = useCallback(
    (t: ActivityTab, p: number) =>
      JSON.stringify([t, userId, bounds.from, bounds.to, filters[t], p]),
    [userId, bounds, filters],
  );
  const key = keyOf(tab, page);
  const current = cache.get(key) ?? null;

  useEffect(() => {
    if (cache.has(key)) {
      requestSeq.current++; // drop any request still in flight for the view we just left
      setIsLoading(false);
      setError(null);
      return;
    }
    const seq = ++requestSeq.current;
    setIsLoading(true);
    (async () => {
      const result = await historyService.getActivity({
        tab,
        userId,
        from: bounds.from,
        to: bounds.to,
        filter,
        page,
        pageSize: PAGE_SIZE,
      });
      if (seq !== requestSeq.current) return;
      setIsLoading(false);
      if (result.isError || !result.data) {
        setError(result.errorMessage || "error");
        return;
      }
      const data = result.data;
      setError(null);
      setCache((prev) => new Map(prev).set(key, data));
      // rows were deleted since the page count was known: fall back to the real last page
      if (data.events.length === 0 && page > data.totalPages) {
        setPageByTab((prev) => ({ ...prev, [tab]: data.totalPages }));
      }
    })();
  }, [key, cache, tab, userId, bounds, filter, page]);

  // dropdown options, loaded once
  useEffect(() => {
    (async () => {
      const [u, g, s] = await Promise.all([
        userService.getAllUsers(),
        goalService.getAllGoals(),
        skillService.getAllSkills(),
      ]);
      const byName = (a: Option, b: Option) => a.name.localeCompare(b.name);
      if (!u.isError && u.data) {
        setUsers(
          u.data
            .filter((x) => x.id !== undefined)
            .map((x) => ({ id: x.id as number, name: x.fullName }))
            .sort(byName),
        );
      }
      if (!g.isError && g.data) {
        setGoals(
          g.data
            .map((x) => ({
              id: x.id,
              name: x.goal,
              skillIds: (x.goalSkillRequire ?? []).map((r) => r.skillId),
            }))
            .sort(byName),
        );
      }
      if (!s.isError && s.data) {
        setSkills(s.data.map((x) => ({ id: x.skillId, name: x.skillsName })).sort(byName));
      }
    })();
  }, []);

  const resetPages = () => setPageByTab(perTab(() => 1));

  const setPage = useCallback(
    (next: number) => setPageByTab((prev) => ({ ...prev, [tab]: next })),
    [tab],
  );

  const setUserId = useCallback((next: number | null) => {
    setUserIdState(next);
    resetPages();
  }, []);

  const setTime = useCallback((next: TimeFilter) => {
    setTimeState(next);
    resetPages();
  }, []);

  /** change some of this tab's options; the tab goes back to page 1 */
  const updateFilter = useCallback(
    (patch: Partial<TabFilter>) => {
      setFilters((prev) => {
        const next = { ...prev[tab], ...patch };
        // a goal narrows the skill list; drop a skill the new goal does not require
        if (patch.goalId !== undefined && next.skillId !== null && patch.goalId !== null) {
          const goal = goals.find((g) => g.id === patch.goalId);
          if (goal && goal.skillIds.length > 0 && !goal.skillIds.includes(next.skillId)) {
            next.skillId = null;
          }
        }
        return { ...prev, [tab]: next };
      });
      setPageByTab((prev) => ({ ...prev, [tab]: 1 }));
    },
    [tab, goals],
  );

  const clearFilter = useCallback(() => {
    setFilters((prev) => ({ ...prev, [tab]: emptyTabFilter() }));
    setPageByTab((prev) => ({ ...prev, [tab]: 1 }));
  }, [tab]);

  const reload = useCallback(() => {
    resetPages();
    setCache(new Map());
  }, []);

  /** skills to offer: the chosen goal's required skills, or every skill */
  const skillOptions = useMemo(() => {
    const goal = goals.find((g) => g.id === filter.goalId);
    if (!goal || goal.skillIds.length === 0) return skills;
    return skills.filter((s) => goal.skillIds.includes(s.id));
  }, [goals, skills, filter.goalId]);

  /** total for a tab if its current view has been loaded already (never fetched just for a count) */
  const totalOf = useCallback(
    (t: ActivityTab): number | null => cache.get(keyOf(t, pageByTab[t]))?.total ?? null,
    [cache, keyOf, pageByTab],
  );

  return {
    tab,
    setTab,
    page,
    setPage,
    totalPages: current?.totalPages ?? 1,
    total: current?.total ?? null,
    pageSize: PAGE_SIZE,
    events: current?.events ?? [],
    totalOf,
    userId,
    setUserId,
    time,
    setTime,
    filter,
    updateFilter,
    clearFilter,
    filterCount: activeFilterCount(filter),
    users,
    goals,
    skillOptions,
    isLoading: isLoading && !current,
    error,
    reload,
  };
}

/** loads one session for the detail popup; `sessionId` null = closed */
export function sessionDetailController(sessionId: number | null) {
  const [session, setSession] = useState<SessionHistoryItem | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSession(null);
    setError(null);
    if (sessionId === null) return;
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      const result = await historyService.getSessionDetail(sessionId);
      if (cancelled) return;
      setIsLoading(false);
      if (result.isError || !result.data) setError(result.errorMessage || "error");
      else setSession(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return { session, error, isLoading };
}
