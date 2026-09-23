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
export const BranchBaseStateModal: React.FC<BranchBaseStateModalProps> = ({ items, onClose }) => {
  const { t } = usePreferences();

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

        <ul className="bbs-list">
          {items.map((item) => (
            <li key={item.skillId} className="bbs-item">
              <div className="bbs-item-top">
                <span className="bbs-skill">{item.skillsName}</span>
                <span className="bbs-total">{item.totalPercent}%</span>
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
