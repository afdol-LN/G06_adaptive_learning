import { useState, type ReactNode } from "react";
import { FaChevronRight, FaRotateRight } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import { Dropdown } from "../../common/Dropdown";
import { exerciseStatsController, rateTone } from "./exerciseStats.controller";
import ExerciseStatDetailModal from "./ExerciseStatDetailModal";


export default function ExerciseStatsTab({ icon }: { icon?: ReactNode }) {
  const { t } = usePreferences();
  const c = exerciseStatsController();
  const [openId, setOpenId] = useState<number | null>(null);

  const answered = c.rows.filter((r) => r.totalStudents > 0).length;

  return (
    <div className="ad-tab-stats">
      <div className="ad-page-header">
        <h1 className="ad-page-title">{icon} {t("admin.stats.title")}</h1>
        <span className="ad-page-sub">{t("admin.stats.sub")}</span>
      </div>

      {c.rows.length > 0 && (
        <p className="ad-stats-count">
          {t("admin.stats.range", { total: c.rows.length, answered })}
        </p>
      )}

      <div className="ad-toolbar ad-stats-toolbar">
        <Dropdown
          className="ad-stats-skill"
          value={c.skillId === null ? "" : String(c.skillId)}
          onChange={(v) => c.setSkillId(v ? Number(v) : null)}
          options={[
            { value: "", label: t("admin.stats.allSkills") },
            ...c.skills.map((s) => ({ value: String(s.id), label: s.name })),
          ]}
          ariaLabel={t("admin.stats.skillFilter")}
          searchable
          popupMinWidth={260}
        />

        <Dropdown
          className="ad-stats-level"
          value={c.level === null ? "" : String(c.level)}
          onChange={(v) => c.setLevel(v ? Number(v) : null)}
          options={[
            { value: "", label: t("admin.stats.allLevels") },
            ...c.levels.map((lv) => ({
              value: String(lv),
              label: t("admin.stats.levelOption", { n: lv }),
            })),
          ]}
          ariaLabel={t("admin.stats.levelFilter")}
        />

        <label className="ad-stats-check">
          <input
            type="checkbox"
            checked={c.includePretest}
            onChange={(e) => c.setIncludePretest(e.target.checked)}
          />
          {t("admin.stats.includePretest")}
        </label>

        <button
          type="button"
          className="ad-filter-btn"
          onClick={c.reload}
          title={t("admin.stats.refresh")}
          aria-label={t("admin.stats.refresh")}
        >
          <FaRotateRight aria-hidden />
        </button>
      </div>

      {c.error && (
        <div className="ad-hist-error" role="alert">
          {t("admin.stats.loadError")} ({c.error})
        </div>
      )}

      <div className="ad-card">
        <table className="ad-table ad-stats-table">
          <thead>
            <tr>
              <th>{t("admin.stats.col.question")}</th>
              <th>{t("admin.stats.col.skill")}</th>
              <th>{t("admin.stats.col.level")}</th>
              <th>{t("admin.stats.col.students")}</th>
              <th>{t("admin.stats.col.correct")}</th>
              <th>{t("admin.stats.col.wrong")}</th>
              <th>{t("admin.stats.col.rate")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {c.rows.map((r) => {
              const tone = rateTone(r.correctRate);
              return (
                <tr
                  key={r.exerciseId}
                  className="ad-hist-row-link"
                  onClick={() => setOpenId(r.exerciseId)}
                >
                  <td className="ad-stats-q">
                    <span className="ad-mono ad-muted">#{r.exerciseId}</span>{" "}
                    {r.description}
                  </td>
                  <td>{r.skillName}</td>
                  <td>{r.level}</td>
                  <td>{r.totalStudents}</td>
                  <td className="ad-stats-ok">{r.correctStudents}</td>
                  <td className="ad-stats-bad">{r.wrongStudents}</td>
                  <td className="ad-stats-rate-cell">
                    {r.correctRate === null ? (
                      <span className="ad-muted">{t("admin.stats.noAnswers")}</span>
                    ) : (
                      <div className="ad-stats-rate">
                        <div className="ad-stats-bar">
                          <div
                            className={`ad-stats-bar-fill is-${tone}`}
                            style={{ width: `${r.correctRate}%` }}
                          />
                        </div>
                        <span className={`ad-stats-pct is-${tone}`}>
                          {r.correctRate}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="ad-hist-open"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenId(r.exerciseId);
                      }}
                    >
                      {t("admin.stats.open")} <FaChevronRight aria-hidden />
                    </button>
                  </td>
                </tr>
              );
            })}
            {c.rows.length === 0 && (
              <tr>
                <td colSpan={8} className="ad-empty-state">
                  {c.isLoading ? t("admin.stats.loading") : t("admin.stats.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ExerciseStatDetailModal
        exerciseId={openId}
        includePretest={c.includePretest}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
