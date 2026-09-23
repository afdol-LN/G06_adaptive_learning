import React from "react";
import { FaPenToSquare, FaTriangleExclamation } from "react-icons/fa6";
import { usePreferences } from "../../../context/PreferencesContext";

/**
 * Step 4 ของ onboarding — ข้อมูลและกติกาของ Pretest (ย้ายมาจากหน้า intro เดิมของ /pretest)
 * /pretest เปิดที่ข้อแรกทันที หน้านี้จึงเป็นที่เดียวที่ผู้เรียนเห็นกติกาก่อนเริ่ม
 *
 * จำนวนข้อเป็น "สูงสุด 5" ตายตัว: backend สุ่มชุดใหม่ทุกครั้งที่เรียก /exercise/pretest
 * (targetTotal = 5) การดึงมานับที่นี่จะได้ชุดที่ไม่ใช่ชุดที่ /pretest ใช้จริง
 */
export const StepPretestIntro: React.FC = () => {
  const { t } = usePreferences();

  return (
    <div className="panel active pti">
      <div className="pti-icon"><FaPenToSquare aria-hidden /></div>
      <h2 className="pti-title">{t("pretestIntro.title")}</h2>
      <p className="pti-sub">{t("pretestIntro.sub")}</p>

      <div className="pti-grid">
        <div className="pti-card">
          <div className="pti-num">{t("pretestIntro.questionsValue")}</div>
          <div className="pti-label">{t("pretestIntro.questionsLabel")}</div>
        </div>
        <div className="pti-card">
          <div className="pti-num">~8</div>
          <div className="pti-label">{t("pretestIntro.minutesLabel")}</div>
        </div>
        <div className="pti-card">
          <div className="pti-num">2</div>
          <div className="pti-label">{t("pretestIntro.typesLabel")}</div>
        </div>
      </div>

      <div className="pti-notice" role="note">
        <FaTriangleExclamation aria-hidden className="pti-notice-icon" />
        <p>
          <strong>{t("pretestIntro.noticeTitle")}</strong> {t("pretestIntro.notice")}{" "}
          <strong>{t("pretestIntro.noticeStrong")}</strong>
        </p>
      </div>
    </div>
  );
};
