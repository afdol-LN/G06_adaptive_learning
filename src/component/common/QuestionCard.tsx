import React from "react";
import { FaCheck, FaPenToSquare, FaXmark } from "react-icons/fa6";
import CodeBlock from "./CodeBlock";
import { usePreferences } from "../../context/PreferencesContext";
import "../decorate/QuestionCard.css";

export interface QuestionCardChoice {
  key: number;
  script: string;
}

/** ผลตรวจของข้อนี้ — key คือตัวเลือกที่ตอบ (null สำหรับข้อเติมคำ) */
export interface QuestionCardReveal {
  key: number | null;
  isCorrect: boolean;
}

export interface QuestionCardProps {
  /** เริ่มที่ 0 แสดงเป็น index + 1 */
  index: number;
  /** จำนวนข้อสูงสุด — null = ยังไม่รู้ แสดงแค่ "ข้อ n" */
  total: number | null;
  skillName: string;
  /** 1–5 */
  level: number;
  type: "CHOICE" | "FILL_IN_BLANK";
  description: string;
  code?: string | string[] | null;
  language?: string | null;
  choices?: QuestionCardChoice[];
  selectedKey: number | null;
  onPick: (key: number) => void;
  fillValue: string;
  onFillChange: (value: string) => void;
  onFillEnter?: () => void;
  /** คำตอบถูกส่งแล้ว — แก้ไม่ได้ (Exercise เท่านั้น) */
  locked?: boolean;
  reveal?: QuestionCardReveal | null;
  /** ปุ่ม/dot ของแต่ละหน้า */
  footer: React.ReactNode;
  /** data-tour ของ driver.js บนหน้า Exercise */
  tourAttrs?: { question?: string; answer?: string };
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

// สีของป้าย Level มีแค่ 1–5 — ค่าที่หลุดช่วงใช้สีของขอบที่ใกล้ที่สุด แต่ตัวเลขยังแสดงค่าจริง
const levelClass = (level: number) =>
  `qc-level-${Math.min(5, Math.max(1, Math.round(level) || 1))}`;

export default function QuestionCard({
  index,
  total,
  skillName,
  level,
  type,
  description,
  code,
  language,
  choices = [],
  selectedKey,
  onPick,
  fillValue,
  onFillChange,
  onFillEnter,
  locked = false,
  reveal = null,
  footer,
  tourAttrs,
}: QuestionCardProps) {
  const { t } = usePreferences();
  const outcome = reveal ? (reveal.isCorrect ? "ok" : "no") : null;

  return (
    <div className="qc-card">
      <div className="qc-head">
        <div className="qc-head-l">
          <span className="qc-num">
            {t("question.no")} <strong>{index + 1}</strong>
            {total != null && <> / {total}</>}
          </span>
          <span className="qc-skill">{skillName}</span>
        </div>
        <span className={`qc-level ${levelClass(level)}`}>
          {t("question.level", { level })} •{" "}
          {type === "FILL_IN_BLANK" ? t("question.type.fill") : t("question.type.choice")}
        </span>
      </div>

      <div className="qc-body">
        <div className="qc-question" data-tour={tourAttrs?.question}>
          {description}
        </div>

        <CodeBlock code={code} language={language} />

        {type === "CHOICE" ? (
          <div
            className={locked ? "qc-choices qc-choices--locked" : "qc-choices"}
            data-tour={tourAttrs?.answer}
          >
            {choices.map((choice, i) => {
              const revealed = outcome && reveal?.key === choice.key ? outcome : null;
              const state = revealed
                ? ` qc-choice--${revealed}`
                : selectedKey === choice.key
                  ? " qc-choice--selected"
                  : "";
              return (
                <button
                  type="button"
                  key={choice.key}
                  className={`qc-choice${state}`}
                  onClick={() => onPick(choice.key)}
                  disabled={locked}
                  aria-pressed={selectedKey === choice.key}
                >
                  <span className="qc-letter">{LETTERS[i] ?? i + 1}</span>
                  <span className="qc-choice-text">{choice.script}</span>
                  {revealed && (
                    <span
                      className="qc-mark"
                      title={revealed === "ok" ? t("question.correct") : t("question.incorrect")}
                    >
                      {revealed === "ok" ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="qc-fill" data-tour={tourAttrs?.answer}>
            <label className="qc-fill-label" htmlFor="qc-fill-input">
              <FaPenToSquare aria-hidden /> {t("question.fillLabel")}
            </label>
            {/* ✓/✗ วางทับขอบขวาของช่องกรอก เหมือนเครื่องหมายบนตัวเลือก */}
            <div className="qc-fill-field">
              <input
                id="qc-fill-input"
                type="text"
                className={outcome ? `qc-fill-input qc-fill--${outcome}` : "qc-fill-input"}
                placeholder={t("question.fillPlaceholder")}
                value={fillValue}
                onChange={(e) => onFillChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && onFillEnter) onFillEnter();
                }}
                disabled={locked}
                autoFocus
              />
              {outcome && (
                <span
                  className={`qc-mark qc-fill-mark qc-fill-mark--${outcome}`}
                  title={outcome === "ok" ? t("question.correct") : t("question.incorrect")}
                >
                  {outcome === "ok" ? <FaCheck aria-hidden /> : <FaXmark aria-hidden />}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="qc-foot">{footer}</div>
    </div>
  );
}
