import React from "react";
import { FaChartSimple, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";
import type { BranchBaseState } from "../../../models/branchStatsModel";
interface BranchBaseStateModalProps {
  /** หนึ่งแถวต่อ skill ของ goal — จาก branchStatsService.getBranchBaseState */
  items: BranchBaseState[];
  onClose: () => void;
}

/**
 * อธิบายว่าคะแนนเริ่มต้นหลัง pretest ของแต่ละ skill มาจากอะไร
 * ทุกตัวเลขมาจาก backend ตามนั้น (หน่วย Progress, ตัดทศนิยม 2 ตำแหน่ง) — ห้ามคำนวณใหม่ที่นี่
 * (adt-learning/docs/adr/0001, 0004)
 */
// เฉลี่ย % ที่ได้จากส่วนนั้น ๆ ข้าม skill ทั้งหมดของ goal — เพื่อสรุปเป็นภาพรวมบนสุดของ modal เท่านั้น
// (ตัดทศนิยมลง 2 ตำแหน่งตามธรรมเนียม Progress ของแอป — ADR 0004) ตัวเลขต่อ skill ด้านล่างยังคงเป็นของจริงจาก backend
const truncate2 = (n: number) => Math.floor(n * 100) / 100;
const average = (values: number[]) =>
  values.length === 0 ? 0 : truncate2(values.reduce((sum, v) => sum + v, 0) / values.length);

export const BranchBaseStateModal: React.FC<BranchBaseStateModalProps> = ({ items, onClose }) => {
  const { t } = usePreferences();

  // โปรไฟล์/ประสบการณ์เหมือนกันทุกแถว — หยิบจากแถวแรกพอ
  const first = items[0];
  const avgBasePercent = average(items.map((i) => i.basePercent));
  const avgProfilePercent = average(items.map((i) => i.profilePercent));

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div
        className="bbs-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bbs-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bbs-head">
          <span className="bbs-head-icon"><FaChartSimple aria-hidden /></span>
          <h2 className="bbs-title" id="bbs-title">{t("pretestBreakdown.title")}</h2>
          <button
            type="button"
            className="bbs-close"
            onClick={onClose}
            aria-label={t("pretestBreakdown.close")}
            title={t("pretestBreakdown.close")}
          >
            <FaXmark aria-hidden />
          </button>
        </div>

        <p className="bbs-lead">{t("pretestBreakdown.lead")}</p>

        {first && (
          <div className="bbs-summary">
            <div className="bbs-summary-facts">
              <span className="bbs-summary-fact">
                {t("pretestBreakdown.summaryFaculty")}: {first.facultyName ?? "—"}
                {first.majorName ? ` / ${first.majorName}` : ""}
              </span>
              {first.year != null && (
                <span className="bbs-summary-fact">{t("pretestBreakdown.summaryYear", { year: first.year })}</span>
              )}
              <span className="bbs-summary-fact">{t("pretestBreakdown.summaryExp", { level: first.expForGoal })}</span>
            </div>
            <div className="bbs-summary-scores">
              <span className="bbs-summary-score">
                {t("pretestBreakdown.summaryBaseAvg")} <b>+{avgBasePercent}%</b>
              </span>
              <span className="bbs-summary-score">
                {t("pretestBreakdown.summaryProfileAvg")} <b>+{avgProfilePercent}%</b>
              </span>
            </div>
          </div>
        )}

        <ul className="bbs-list">
          {items.map((item) => (
            <li key={item.skillId} className="bbs-item">
              <div className="bbs-item-top">
                <span className="bbs-skill">{item.skillsName}</span>
                <span className="bbs-total">{item.totalPercent}%</span>
              </div>
              <div className="progress-track bbs-track">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.min(item.totalPercent, 100)}%` }}
                />
              </div>

              <ul className="bbs-parts">
                <li className="bbs-part">
                  <span>{t("pretestBreakdown.base")}</span>
                  <span className="bbs-part-val">+{item.basePercent}%</span>
                </li>
                {item.answered > 0 ? (
                  <li className="bbs-part">
                    <span>{t("pretestBreakdown.pretest", { correct: item.correct, answered: item.answered })}</span>
                    <span className="bbs-part-val">+{item.pretestPercent}%</span>
                  </li>
                ) : (
                  <li className="bbs-part bbs-part--note">{t("pretestBreakdown.notAnswered")}</li>
                )}
                <li className="bbs-part">
                  <span>{t("pretestBreakdown.profile")}</span>
                  <span className="bbs-part-val">+{item.profilePercent}%</span>
                </li>
                {item.capPercent > 0 && (
                  <li className="bbs-part bbs-part--cap">
                    <span>{t("pretestBreakdown.cap")}</span>
                    <span className="bbs-part-val">−{item.capPercent}%</span>
                  </li>
                )}
              </ul>
            </li>
          ))}
        </ul>

        <button type="button" className="confirm-btn-ok bbs-ok" onClick={onClose}>
          {t("pretestBreakdown.ok")}
        </button>
      </div>
    </div>
  );
};

export default BranchBaseStateModal;
