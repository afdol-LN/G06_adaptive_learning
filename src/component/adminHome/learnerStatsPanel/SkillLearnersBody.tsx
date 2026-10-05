import { FaUsers } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { rateTone } from "../exerciseStatsPanel/exerciseStats.controller";
import { learnerStatsService } from "./learnerStats.service";
import { useLearnerStats } from "./learnerStats.controller";
import { ProgressCell, useFormatDate } from "./learnerStatsUi";

/** แท็บ "สถิติ" ของ modal รายละเอียด Skill: ใครฝึก Skill นี้ และความคืบหน้ากี่เปอร์เซ็นต์ */
export default function SkillLearnersBody({ skillId }: { skillId: number }) {
  const { t } = usePreferences();
  const { data, isLoading, error } = useLearnerStats(skillId, learnerStatsService.getSkill);
  const { dateTime } = useFormatDate();

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
          <span className="ad-sd-kpi-lbl">{t("admin.skillStats.kpi.learners")}</span>
        </div>
        <div className="ad-sd-kpi is-ok">
          <span className="ad-sd-kpi-val">{data.masteredCount}</span>
          <span className="ad-sd-kpi-lbl">{t("admin.skillStats.kpi.mastered")}</span>
        </div>
        <div className="ad-sd-kpi">
          <span className="ad-sd-kpi-val">
            {data.avgProgress === null ? "—" : `${data.avgProgress}%`}
          </span>
          <span className="ad-sd-kpi-lbl">{t("admin.learnerStats.avgProgress")}</span>
        </div>
        <div className="ad-sd-kpi">
          <span className="ad-sd-kpi-val">{data.totalAnswered}</span>
          <span className="ad-sd-kpi-lbl">{t("admin.skillStats.kpi.answered")}</span>
        </div>
        <div className={`ad-sd-kpi is-${rateTone(data.correctRate)}`}>
          <span className="ad-sd-kpi-val">
            {data.correctRate === null ? "—" : `${data.correctRate}%`}
          </span>
          <span className="ad-sd-kpi-lbl">{t("admin.stats.col.rate")}</span>
        </div>
      </div>

      <div className="ad-uv-section">
        <div className="ad-uv-section-title">
          <FaUsers aria-hidden /> {t("admin.skillStats.learners")}
          {data.learners.length > 0 && <span className="ad-uv-count">{data.learners.length}</span>}
        </div>
        {data.learners.length === 0 ? (
          <div className="ad-uv-empty">{t("admin.skillStats.none")}</div>
        ) : (
          <div className="ad-stats-scroll ad-sd-table-wrap">
            <table className="ad-table ad-sd-table">
              <thead>
                <tr>
                  <th>{t("admin.stats.modal.col.name")}</th>
                  <th>{t("admin.skillStats.col.goal")}</th>
                  <th>{t("admin.learnerStats.col.progress")}</th>
                  <th className="is-num">{t("admin.skillStats.col.answered")}</th>
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
                    <td className="ad-ls-goal">{l.goalName}</td>
                    <td>
                      {l.progressPercent === null ? (
                        <span className="ad-muted">{t("admin.skillStats.notStarted")}</span>
                      ) : (
                        <ProgressCell percent={l.progressPercent} done={l.mastered} />
                      )}
                    </td>
                    <td className="is-num">
                      {l.answered === 0 ? "—" : `${l.correct}/${l.answered}`}
                    </td>
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
