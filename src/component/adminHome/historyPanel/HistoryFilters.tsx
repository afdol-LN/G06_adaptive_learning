import { FaFilterCircleXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TKey } from "../../../i18n";
import {
  ActivityTab,
  SESSION_GRADES,
  STOP_REASONS,
  TabFilter,
  TimeFilter,
  TimePreset,
} from "../../../models/historyModel";
import { DateRangePicker } from "../../common/DateRangePicker";
import { Dropdown } from "../../common/Dropdown";
import { toIso, startOfDay } from "../../common/calendarDate";
import type { Option } from "./history.controller";

const TIME_PRESETS: { key: Exclude<TimePreset, "custom">; label: TKey }[] = [
  { key: "all", label: "admin.history.time.all" },
  { key: "today", label: "admin.history.time.today" },
  { key: "7d", label: "admin.history.time.7d" },
  { key: "30d", label: "admin.history.time.30d" },
];

export const STOP_REASON_LABEL: Record<string, TKey> = {
  completed: "admin.history.stop.completed",
  mastered: "admin.history.stop.mastered",
  exhausted: "admin.history.stop.exhausted",
  abandoned: "admin.history.stop.abandoned",
};

const GRADE_LABEL: Record<string, TKey> = {
  great: "admin.history.grade.great",
  good: "admin.history.grade.good",
  poor: "admin.history.grade.poor",
};

/** shared time menu: preset chips + a calendar for a custom from–to */
export function TimeMenu({
  time,
  onChange,
}: {
  time: TimeFilter;
  onChange: (next: TimeFilter) => void;
}) {
  const { t } = usePreferences();
  return (
    <div className="ad-hist-row" role="group" aria-label={t("admin.history.time.label")}>
      <span className="ad-hist-row-label">{t("admin.history.time.label")}</span>
      {TIME_PRESETS.map(({ key, label }) => (
        <button
          key={key}
          type="button"
          className={`ad-filter-btn ad-filter-btn--sm ${time.preset === key ? "active" : ""}`}
          aria-pressed={time.preset === key}
          onClick={() => onChange({ preset: key, from: "", to: "" })}
        >
          {t(label)}
        </button>
      ))}
      <DateRangePicker
        className={`ad-hist-range ${time.preset === "custom" ? "is-active" : ""}`}
        value={time.preset === "custom" ? { from: time.from, to: time.to } : { from: "", to: "" }}
        max={toIso(startOfDay(new Date()))}
        ariaLabel={t("admin.history.time.custom")}
        onChange={(r) =>
          onChange(r.from ? { preset: "custom", ...r } : { preset: "all", from: "", to: "" })
        }
      />
    </div>
  );
}

interface TabFiltersProps {
  tab: ActivityTab;
  filter: TabFilter;
  update: (patch: Partial<TabFilter>) => void;
  clear: () => void;
  activeCount: number;
  goals: Option[];
  skills: Option[];
}

/** the options of the tab that is open — "all" and "login" have none beyond the shared row */
export function TabFilters({ tab, filter, update, clear, activeCount, goals, skills }: TabFiltersProps) {
  const { t } = usePreferences();
  if (tab === "all" || tab === "login") return null;

  const idOrNull = (v: string) => (v ? Number(v) : null);

  // goal / skill มีหลายสิบรายการ — พิมพ์ค้นหาได้ (ตัวกรองอื่นในแถวมีไม่กี่ค่า คง <select> ไว้)
  const goalSelect = (
    <Dropdown
      className="ad-hist-dd"
      value={filter.goalId === null ? "" : String(filter.goalId)}
      onChange={(v) => update({ goalId: idOrNull(v) })}
      options={[
        { value: "", label: t("admin.history.f.allGoals") },
        ...goals.map((g) => ({ value: String(g.id), label: g.name })),
      ]}
      ariaLabel={t("admin.history.f.goal")}
      searchable
      popupMinWidth={340}
      searchPlaceholder={t("admin.history.f.searchGoal")}
      emptyText={t("admin.history.f.noMatch")}
    />
  );

  const skillSelect = (
    <Dropdown
      className="ad-hist-dd"
      value={filter.skillId === null ? "" : String(filter.skillId)}
      onChange={(v) => update({ skillId: idOrNull(v) })}
      options={[
        { value: "", label: t("admin.history.f.allSkills") },
        ...skills.map((s) => ({ value: String(s.id), label: s.name })),
      ]}
      ariaLabel={t("admin.history.f.skill")}
      searchable
      popupMinWidth={340}
      searchPlaceholder={t("admin.history.f.searchSkill")}
      emptyText={t("admin.history.f.noMatch")}
    />
  );

  return (
    <div className="ad-hist-row ad-hist-row--tab" role="group" aria-label={t("admin.history.f.label")}>
      <span className="ad-hist-row-label">{t("admin.history.f.label")}</span>

      {tab === "goal" && (
        <>
          {goalSelect}
          <select
            className="ad-select ad-select-sm"
            value={filter.event}
            onChange={(e) => update({ event: e.target.value as TabFilter["event"] })}
            aria-label={t("admin.history.f.event")}
          >
            <option value="">{t("admin.history.f.allEvents")}</option>
            <option value="started">{t("admin.history.f.goalStarted")}</option>
            <option value="completed">{t("admin.history.f.goalCompleted")}</option>
          </select>
        </>
      )}

      {tab === "skill" && (
        <>
          {goalSelect}
          {skillSelect}
          <select
            className="ad-select ad-select-sm"
            value={filter.event}
            onChange={(e) => update({ event: e.target.value as TabFilter["event"] })}
            aria-label={t("admin.history.f.event")}
          >
            <option value="">{t("admin.history.f.allEvents")}</option>
            <option value="started">{t("admin.history.f.sessionStarted")}</option>
            <option value="ended">{t("admin.history.f.sessionEnded")}</option>
          </select>
          <select
            className="ad-select ad-select-sm"
            value={filter.result}
            onChange={(e) => update({ result: e.target.value as TabFilter["result"] })}
            aria-label={t("admin.history.f.result")}
          >
            <option value="">{t("admin.history.f.allResults")}</option>
            {STOP_REASONS.map((r) => (
              <option key={r} value={r}>{t(STOP_REASON_LABEL[r])}</option>
            ))}
            <option value="in_progress">{t("admin.history.inProgress")}</option>
          </select>
        </>
      )}

      {tab === "exercise" && (
        <>
          {goalSelect}
          {skillSelect}
          <select
            className="ad-select ad-select-sm"
            value={filter.sessionType}
            onChange={(e) => update({ sessionType: e.target.value as TabFilter["sessionType"] })}
            aria-label={t("admin.history.f.sessionType")}
          >
            <option value="">{t("admin.history.f.allTypes")}</option>
            <option value="practice">{t("admin.history.f.practice")}</option>
            <option value="pretest">{t("admin.history.pretest")}</option>
          </select>
          <select
            className="ad-select ad-select-sm"
            value={filter.grade}
            onChange={(e) => update({ grade: e.target.value as TabFilter["grade"] })}
            aria-label={t("admin.history.f.grade")}
          >
            <option value="">{t("admin.history.f.allGrades")}</option>
            {SESSION_GRADES.map((g) => (
              <option key={g} value={g}>{t(GRADE_LABEL[g])}</option>
            ))}
          </select>
          <select
            className="ad-select ad-select-sm"
            value={filter.status}
            onChange={(e) => update({ status: e.target.value as TabFilter["status"] })}
            aria-label={t("admin.history.f.status")}
          >
            <option value="">{t("admin.history.f.allStatuses")}</option>
            <option value="finished">{t("admin.history.f.finished")}</option>
            <option value="in_progress">{t("admin.history.inProgress")}</option>
          </select>
          <button
            type="button"
            className={`ad-filter-btn ad-filter-btn--sm ${filter.hasWrong ? "active" : ""}`}
            aria-pressed={filter.hasWrong}
            onClick={() => update({ hasWrong: !filter.hasWrong })}
          >
            {t("admin.history.f.hasWrong")}
          </button>
        </>
      )}

      {activeCount > 0 && (
        <button type="button" className="ad-hist-clear" onClick={clear}>
          <FaFilterCircleXmark aria-hidden /> {t("admin.history.f.clear", { count: activeCount })}
        </button>
      )}
    </div>
  );
}
