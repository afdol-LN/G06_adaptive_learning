import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaCalendarDays, FaChevronLeft, FaChevronRight, FaXmark } from "react-icons/fa6";
import { usePreferences } from "../../../../context/PreferencesContext";
import { AiDraft } from "../../../../models/aiDraftModel";

interface DraftDateFilterProps {
  /** รายการ draft ที่ผ่านตัวกรอง status/entity อยู่แล้ว — ใช้คำนวณว่าวันไหนมีจุดสีฟ้าบ้าง
   *  (จุดจึงสะท้อนเฉพาะในขอบเขตตัวกรองปัจจุบัน ไม่ใช่ draft ทั้งหมดในระบบ) */
  drafts: AiDraft[];
  /** "YYYY-MM-DD" (local) หรือ null = ไม่กรองวันที่ */
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
/** key แบบ local date (ไม่ใช้ toISOString เพราะจะเลื่อนวันข้าม timezone) */
const dateKey = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export default function DraftDateFilter({ drafts, selectedDate, onSelect }: DraftDateFilterProps) {
  const { t, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(() => {
    const base = selectedDate ? new Date(selectedDate) : new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const wrapRef = useRef<HTMLDivElement>(null);

  // วันไหนมีการ generate บ้าง (ภายใต้ตัวกรอง status/entity ปัจจุบัน) — ใช้ขึ้นจุดสีฟ้าใต้เลขวันนั้น
  const datesWithDrafts = useMemo(() => {
    const set = new Set<string>();
    for (const d of drafts) {
      const created = new Date(d.createdAt);
      if (!Number.isNaN(created.getTime())) set.add(dateKey(created));
    }
    return set;
  }, [drafts]);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const monthLabel = viewMonth.toLocaleDateString(locale, { month: "long", year: "numeric" });

  // ตาราง 6 แถว x 7 วัน ของเดือนที่กำลังดู รวมวันท้าย/ต้นเดือนข้างเคียงให้ grid เต็ม
  const gridDays = useMemo(() => {
    const firstOfMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
    const startOffset = firstOfMonth.getDay(); // 0 = อาทิตย์
    const start = new Date(firstOfMonth);
    start.setDate(start.getDate() - startOffset);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [viewMonth]);

  const today = dateKey(new Date());
  const weekdayLabels = useMemo(() => {
    // อาทิตย์-เสาร์ ย่อสั้นตามภาษา/locale ที่เลือก
    const base = new Date(2023, 0, 1); // อาทิตย์
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return d.toLocaleDateString(locale, { weekday: "narrow" });
    });
  }, [locale]);

  const displaySelected = selectedDate
    ? new Date(selectedDate).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
    : t("admin.ai.dateFilter.all");

  return (
    <div className="ad-ai-date-filter" ref={wrapRef}>
      <button
        type="button"
        className={`ad-select ad-ai-date-filter-btn${selectedDate ? " is-active" : ""}`}
        onClick={() => setOpen((o) => !o)}
      >
        <FaCalendarDays aria-hidden /> {displaySelected}
      </button>
      {selectedDate && (
        <button
          type="button"
          className="ad-ai-date-filter-clear"
          onClick={() => onSelect(null)}
          aria-label={t("admin.ai.dateFilter.clear")}
          title={t("admin.ai.dateFilter.clear")}
        >
          <FaXmark aria-hidden />
        </button>
      )}

      {open && (
        <div className="ad-ai-date-popover">
          <div className="ad-ai-date-popover-head">
            <button
              type="button"
              className="ad-ai-date-nav"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))}
              aria-label={t("admin.ai.dateFilter.prevMonth")}
            >
              <FaChevronLeft aria-hidden />
            </button>
            <span className="ad-ai-date-month">{monthLabel}</span>
            <button
              type="button"
              className="ad-ai-date-nav"
              onClick={() => setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))}
              aria-label={t("admin.ai.dateFilter.nextMonth")}
            >
              <FaChevronRight aria-hidden />
            </button>
          </div>

          <div className="ad-ai-date-weekdays">
            {weekdayLabels.map((w, i) => (
              <span key={i}>{w}</span>
            ))}
          </div>

          <div className="ad-ai-date-grid">
            {gridDays.map((d) => {
              const key = dateKey(d);
              const inMonth = d.getMonth() === viewMonth.getMonth();
              const hasDrafts = datesWithDrafts.has(key);
              return (
                <button
                  type="button"
                  key={key}
                  className={[
                    "ad-ai-date-cell",
                    !inMonth && "is-outside",
                    key === today && "is-today",
                    key === selectedDate && "is-selected",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    onSelect(key === selectedDate ? null : key);
                    setOpen(false);
                  }}
                >
                  {d.getDate()}
                  {hasDrafts && <span className="ad-ai-date-dot" aria-hidden />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
