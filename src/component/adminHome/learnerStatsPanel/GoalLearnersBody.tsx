import { FaCircleCheck, FaHourglassHalf, FaUsers } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { learnerStatsService } from "./learnerStats.service";
import { useLearnerStats } from "./learnerStats.controller";
import { ProgressCell, useFormatDate } from "./learnerStatsUi";

/** แท็บ "สถิติ" ของ modal รายละเอียด Goal: ใครเลือกเป้าหมายนี้ และไปถึงไหนแล้ว */
export default function GoalLearnersBody({ goalId }: { goalId: number }) {
  const { t } = usePreferences();
  const { data, isLoading, error } = useLearnerStats(goalId, learnerStatsService.getGoal);
  const { date, dateTime } = useFormatDate();

  if (isLoading) return <p className="ad-empty-state">{t("admin.stats.loading")}</p>;
  if (error || !data) {
    return (
      <div className="ad-hist-error" role="alert">
        {t("admin.stats.modal.loadError")} ({error})
      </div>
    );
  }

  return (
    <>
      <div className="ad-sd-kpis">
        <div className="ad-sd-kpi">
          <span className="ad-sd-kpi-val">{data.totalLearners}</span>
          <span className="ad-sd-kpi-lbl">{t("admin.goalStats.kpi.learners")}</span>
        </div>
        <div className="ad-sd-kpi is-ok">
          <span className="ad-sd-kpi-val">{data.completedCount}</span>
          <span className="ad-sd-kpi-lbl">{t("admin.goalStats.kpi.completed")}</span>
        </div>
        <div className="ad-sd-kpi">
          <span className="ad-sd-kpi-val">{data.pretestDoneCount}</span>
          <span className="ad-sd-kpi-lbl">{t("admin.goalStats.kpi.pretest")}</span>
        </div>
        <div className="ad-sd-kpi">
          <span className="ad-sd-kpi-val">
            {data.avgProgress === null ? "—" : `${data.avgProgress}%`}
          </span>
          <span className="ad-sd-kpi-lbl">{t("admin.learnerStats.avgProgress")}</span>
        </div>
      </div>

      <div className="ad-uv-section">
        <div className="ad-uv-section-title">
          <FaUsers aria-hidden /> {t("admin.goalStats.learners")}
          {data.learners.length > 0 && <span className="ad-uv-count">{data.learners.length}</span>}
        </div>
        {data.learners.length === 0 ? (
          <div className="ad-uv-empty">{t("admin.goalStats.none")}</div>
        ) : (
          <div className="ad-stats-scroll ad-sd-table-wrap">
            <table className="ad-table ad-sd-table">
              <thead>
                <tr>
                  <th>{t("admin.stats.modal.col.name")}</th>
                  <th>{t("admin.learnerStats.col.progress")}</th>
                  <th className="is-num">{t("admin.goalStats.col.mastered")}</th>
                  <th>{t("admin.goalStats.col.pretest")}</th>
                  <th>{t("admin.goalStats.col.started")}</th>
                  <th>{t("admin.learnerStats.col.last")}</th>
                </tr>
              </thead>
              <tbody>
                {data.learners.map((l) => (
                  <tr key={l.branchId}>
                    <td>
                      <div className="ad-user-cell">
                        <span className="ad-avatar-sm" aria-hidden>{l.name?.[0] ?? "?"}</span>
                        <div>
                          <div className="ad-user-name-sm">{l.name}</div>
                          {l.username && <div className="ad-ls-username">@{l.username}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <ProgressCell
                        percent={l.progressPercent}
                        done={l.completedAt !== null || l.progressPercent === 100}
                      />
                    </td>
                    <td className="is-num">
                      {l.masteredCount}/{l.requiredCount}
                    </td>
                    <td>
                      {l.pretestDone ? (
                        <span className="ad-ls-ok">
                          <FaCircleCheck aria-hidden /> {t("admin.goalStats.pretestYes")}
                        </span>
                      ) : (
                        <span className="ad-ls-wait">
                          <FaHourglassHalf aria-hidden /> {t("admin.goalStats.pretestNo")}
                        </span>
                      )}
                    </td>
                    <td className="ad-muted ad-sd-date">{date(l.startedAt)}</td>
                    <td className="ad-muted ad-sd-date">{l.lastActiveAt ? dateTime(l.lastActiveAt) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
