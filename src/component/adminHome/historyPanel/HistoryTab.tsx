import { useState, type ReactNode } from "react";
import {
  FaBookOpen,
  FaChevronRight,
  FaFlagCheckered,
  FaLayerGroup,
  FaPenToSquare,
  FaRightToBracket,
  FaRotateRight,
} from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import type { TKey } from "../../../i18n";
import {
  ACTIVITY_TABS,
  ActivityEvent,
  ActivityTab,
} from "../../../models/historyModel";
import Pagination from "../../common/Pagination";
import { Dropdown } from "../../common/Dropdown";
import { historyController } from "./history.controller";
import { STOP_REASON_LABEL, TabFilters, TimeMenu } from "./HistoryFilters";
import SessionDetailModal from "./SessionDetailModal";

const TYPE_ICON: Record<ActivityTab, ReactNode> = {
  all: <FaLayerGroup aria-hidden />,
  goal: <FaFlagCheckered aria-hidden />,
  skill: <FaBookOpen aria-hidden />,
  exercise: <FaPenToSquare aria-hidden />,
  login: <FaRightToBracket aria-hidden />,
};

const TYPE_LABEL: Record<ActivityTab, TKey> = {
  all: "admin.common.all",
  goal: "admin.history.type.goal",
  skill: "admin.history.type.skill",
  exercise: "admin.history.type.exercise",
  login: "admin.history.type.login",
};

const ACTION_LABEL: Record<ActivityEvent["action"], TKey> = {
  goal_started: "admin.history.action.goal_started",
  goal_completed: "admin.history.action.goal_completed",
  session_started: "admin.history.action.session_started",
  session_ended: "admin.history.action.session_ended",
  exercise_session: "admin.history.action.exercise_session",
  login: "admin.history.action.login",
};

// same bands as the student history's sessionGrade
const scoreOf = (e: ActivityEvent) =>
  e.questionCount ? Math.round(((e.correctCount ?? 0) / e.questionCount) * 100) : 0;
const gradeOf = (score: number) => (score >= 80 ? "great" : score >= 55 ? "good" : "poor");

/** the "Name" column: the goal for goal rows, the practised skill for skill/exercise rows */
const nameOf = (e: ActivityEvent): string | null =>
  e.type === "goal" ? e.goalName ?? null : e.type === "login" ? null : e.skillName ?? null;

export default function HistoryTab({ icon }: { icon?: ReactNode }) {
  const { t, lang } = usePreferences();
  const c = historyController();
  const [openSession, setOpenSession] = useState<{ id: number; name: string } | null>(null);

  const from = c.total ? (c.page - 1) * c.pageSize + 1 : 0;
  const to = c.total ? Math.min(c.page * c.pageSize, c.total) : 0;

  const locale = lang === "th" ? "th-TH" : "en-GB";
  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const describe = (e: ActivityEvent): string =>
    t(ACTION_LABEL[e.action], {
      goal: e.goalName ?? "-",
      skill: e.skillName ?? "-",
      id: String(e.sessionId ?? "-"),
    });

  const openRow = (e: ActivityEvent) => {
    if (e.action === "exercise_session" && e.sessionId) {
      setOpenSession({ id: e.sessionId, name: e.user.name });
    }
  };

  return (
    <div className="ad-tab-history">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t("admin.history.title")}</h1>
        <span className="ad-page-sub">{t("admin.history.sub")}</span>
      </div>

      <div className="ad-toolbar ad-hist-toolbar">
        <div className="ad-hist-tabs" role="tablist" aria-label={t("admin.history.tabs")}>
          {ACTIVITY_TABS.map((key) => {
            const active = c.tab === key;
            const count = c.totalOf(key);
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                className={`ad-filter-btn ad-hist-filter ${active ? "active" : ""}`}
                onClick={() => c.setTab(key)}
              >
                {TYPE_ICON[key]} {t(TYPE_LABEL[key])}
                {count !== null && <span className="ad-hist-count">{count}</span>}
              </button>
            );
          })}
        </div>

        {/* ผู้ใช้มีหลายสิบคน — พิมพ์ค้นหาชื่อหรือ username ได้ (ชื่อซ้ำแยกด้วย @username) */}
        <Dropdown
          className="ad-hist-user"
          value={c.userId === null ? "" : String(c.userId)}
          onChange={(v) => c.setUserId(v ? Number(v) : null)}
          options={[
            { value: "", label: t("admin.history.allUsers") },
            ...c.users.map((u) => ({
              value: String(u.id),
              label: u.name,
              hint: u.username ? `@${u.username}` : undefined,
            })),
          ]}
          ariaLabel={t("admin.history.userFilter")}
          searchable
          popupMinWidth={320}
          searchPlaceholder={t("admin.history.userSearch")}
          emptyText={t("admin.history.userNoMatch")}
        />

        <button
          type="button"
          className="ad-filter-btn"
          onClick={c.reload}
          title={t("admin.history.refresh")}
          aria-label={t("admin.history.refresh")}
        >
          <FaRotateRight aria-hidden />
        </button>
      </div>

      <div className="ad-hist-filters">
        <TimeMenu time={c.time} onChange={c.setTime} />
        <TabFilters
          tab={c.tab}
          filter={c.filter}
          update={c.updateFilter}
          clear={c.clearFilter}
          activeCount={c.filterCount}
          goals={c.goals}
          skills={c.skillOptions}
        />
      </div>

      {c.error && (
        <div className="ad-hist-error" role="alert">
          {t("admin.history.loadError")} ({c.error})
        </div>
      )}

      <div className="ad-card">
        <table className="ad-table">
          <thead>
            <tr>
              <th>{t("admin.history.col.time")}</th>
              <th>{t("admin.history.col.user")}</th>
              <th>{t("admin.history.col.type")}</th>
              <th>{t("admin.history.col.name")}</th>
              <th>{t("admin.history.col.detail")}</th>
            </tr>
          </thead>
          <tbody>
            {c.events.map((e) => {
              const isSession = e.action === "exercise_session" && !!e.sessionId;
              const score = scoreOf(e);
              return (
                <tr
                  key={e.id}
                  className={isSession ? "ad-hist-row-link" : undefined}
                  onClick={isSession ? () => openRow(e) : undefined}
                >
                  <td className="ad-hist-time">
                    <span className="ad-hist-date">{formatDate(e.at)}</span>
                    <span className="ad-mono ad-muted">{formatTime(e.at)}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ad-hist-user-link"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        c.setUserId(e.user.id);
                      }}
                      title={t("admin.history.onlyThisUser")}
                    >
                      <span className="ad-avatar-sm" aria-hidden>{e.user.name?.[0] ?? "?"}</span>
                      <span className="ad-user-name-sm">{e.user.name}</span>
                    </button>
                  </td>
                  <td>
                    <span className={`ad-hist-type ad-hist-type--${e.type}`}>
                      {TYPE_ICON[e.type]} {t(TYPE_LABEL[e.type])}
                    </span>
                  </td>
                  <td className="ad-hist-name">{nameOf(e) ?? <span className="ad-muted">—</span>}</td>
                  <td>
                    <div className="ad-hist-detail">
                      <span>{describe(e)}</span>
                      {isSession && (
                        <span className={`ad-hist-score is-${gradeOf(score)}`}>
                          {t("admin.history.session.score", {
                            correct: e.correctCount ?? 0,
                            total: e.questionCount ?? 0,
                            score,
                          })}
                        </span>
                      )}
                      {e.isPretest && <span className="ad-hist-tag">{t("admin.history.pretest")}</span>}
                      {isSession && e.inProgress && (
                        <span className="ad-hist-tag">{t("admin.history.inProgress")}</span>
                      )}
                      {(e.action === "session_ended" || (isSession && !e.isPretest)) &&
                        e.stopReason && STOP_REASON_LABEL[e.stopReason] && (
                          <span className="ad-hist-tag">{t(STOP_REASON_LABEL[e.stopReason])}</span>
                        )}
                    </div>
                    {(e.type === "skill" || e.type === "exercise") && e.goalName && (
                      <div className="ad-hist-sub">{t("admin.history.inGoal", { goal: e.goalName })}</div>
                    )}
                    {isSession && (
                      <button
                        type="button"
                        className="ad-hist-open"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          openRow(e);
                        }}
                      >
                        {t("admin.history.session.open")} <FaChevronRight aria-hidden />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {c.events.length === 0 && (
              <tr>
                <td colSpan={5} className="ad-empty-state">
                  {c.isLoading ? t("admin.history.loading") : t("admin.history.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="ad-hist-footer">
        {c.total !== null && c.total > 0 && (
          <span className="ad-pagination-label">
            {t("admin.history.range", { from, to, total: c.total })}
          </span>
        )}
        <Pagination page={c.page} totalPages={c.totalPages} onChange={c.setPage} />
      </div>

      <SessionDetailModal
        sessionId={openSession?.id ?? null}
        userName={openSession?.name ?? ""}
        onClose={() => setOpenSession(null)}
      />
    </div>
  );
}
