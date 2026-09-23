import React, {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FaCalendarDays, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import "../decorate/DatePicker.css";
import { Dropdown, DropdownOption } from "./Dropdown";

interface DatePickerProps {
  /** ค่าเป็น ISO `yyyy-mm-dd` เท่านั้น (รูปแบบเดียวกับ <input type="date"> เดิม) */
  value: string;
  onChange: (iso: string) => void;
  /** ขอบเขตวันที่ที่เลือกได้ เป็น ISO `yyyy-mm-dd` */
  min?: string;
  max?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
  className?: string;
  /** แสดงปุ่มล้างค่าในแถบล่างของปฏิทิน */
  clearable?: boolean;
}

interface PopupPos {
  left: number;
  top: number;
  maxHeight: number;
}

const GAP = 4;
const EDGE = 8;
const POPUP_W = 324;
/** ความสูงโดยประมาณของปฏิทิน 6 สัปดาห์ + หัว + แถบล่าง */
const POPUP_H = 400;

/** yyyy-mm-dd → Date (เที่ยงวันตามเวลาเครื่อง) — เที่ยงวันกันวันเลื่อนเพราะ timezone */
function parseIso(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12);
  return Number.isNaN(d.getTime()) ? null : d;
}

function toIso(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12);
}

function addMonths(d: Date, n: number): Date {
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1, 12);
  const lastDay = new Date(
    target.getFullYear(),
    target.getMonth() + 1,
    0,
  ).getDate();
  target.setDate(Math.min(d.getDate(), lastDay));
  return target;
}

/**
 * ปฏิทินเลือกวันที่ที่คุมหน้าตาได้ทั้งตัว
 *
 * ทำไมไม่ใช้ <input type="date">: ปฏิทินที่เด้งขึ้นมาเป็นของระบบปฏิบัติการ
 * CSS แตะไม่ได้ หน้าตาต่างกันทุก OS และบางเบราว์เซอร์ยังไม่มีให้เลย
 *
 * ปีแสดงเป็น พ.ศ. เมื่อภาษาเป็นไทย แต่ค่าที่ส่งออกเป็น ค.ศ. เสมอ (`yyyy-mm-dd`)
 * เพื่อให้เข้ากับ API และคอลัมน์ birthDate เดิมโดยไม่ต้องแปลงที่ฝั่งเรียกใช้
 */
export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  min,
  max,
  disabled = false,
  id,
  ariaLabel,
  className = "",
  clearable = false,
}) => {
  const { t, lang, locale } = usePreferences();

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);

  const selected = useMemo(() => parseIso(value), [value]);
  const minDate = useMemo(() => (min ? parseIso(min) : null), [min]);
  const maxDate = useMemo(() => (max ? parseIso(max) : null), [max]);

  /**
   * วันเริ่มต้นตอนยังไม่ได้เลือกอะไร ต้องถูกบีบให้อยู่ในช่วง min–max
   * ไม่งั้นปฏิทินวันเกิด (max = 2010) จะเปิดที่ปีปัจจุบัน ซึ่งไม่มีในรายการปี
   * ช่องปีจะขึ้น placeholder และทุกวันในเดือนนั้นถูกปิดหมด
   */
  const clampToRange = useCallback(
    (d: Date) => {
      if (minDate && d < startOfDay(minDate)) return startOfDay(minDate);
      if (maxDate && d > startOfDay(maxDate)) return startOfDay(maxDate);
      return d;
    },
    [minDate, maxDate],
  );

  const initialDate = () => selected ?? clampToRange(startOfDay(new Date()));

  /** เดือนที่กำลังแสดงอยู่ */
  const [viewDate, setViewDate] = useState<Date>(initialDate);
  /** วันที่โฟกัสอยู่ ใช้เดินด้วยลูกศร */
  const [focusDate, setFocusDate] = useState<Date>(initialDate);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const reactId = useId();
  const gridId = `dp-grid-${reactId}`;

  const dispYear = useCallback(
    (y: number) => (lang === "th" ? y + 543 : y),
    [lang],
  );

  const monthNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { month: "long" });
    return Array.from({ length: 12 }, (_, i) =>
      fmt.format(new Date(2024, i, 1)),
    );
  }, [locale]);

  const weekdayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    // 2024-01-07 เป็นวันอาทิตย์ — สัปดาห์เริ่มวันอาทิตย์ตามปฏิทินไทย
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(2024, 0, 7 + i)),
    );
  }, [locale]);

  const label = useMemo(() => {
    if (!selected) return "";
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(selected);
  }, [selected, locale]);

  const isOutOfRange = useCallback(
    (d: Date) => {
      if (minDate && d < startOfDay(minDate)) return true;
      if (maxDate && d > startOfDay(maxDate)) return true;
      return false;
    },
    [minDate, maxDate],
  );

  /** ช่วงปีของตัวเลือกปี — กว้างพอสำหรับวันเกิด */
  const yearOptions: DropdownOption[] = useMemo(() => {
    const thisYear = new Date().getFullYear();
    const from = minDate ? minDate.getFullYear() : thisYear - 100;
    const to = maxDate ? maxDate.getFullYear() : thisYear + 5;
    const out: DropdownOption[] = [];
    for (let y = to; y >= from; y--)
      out.push({ value: String(y), label: String(dispYear(y)) });
    return out;
  }, [minDate, maxDate, dispYear]);

  const monthOptions: DropdownOption[] = useMemo(
    () => monthNames.map((m, i) => ({ value: String(i), label: m })),
    [monthNames],
  );

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;

    // จอเตี้ยกว่าปฏิทินก็ยังต้องอยู่ในจอ — ย่อความสูงแล้วให้เลื่อนเอา
    const maxHeight = Math.min(POPUP_H, vh - EDGE * 2);

    let top = r.bottom + GAP;
    if (top + maxHeight > vh - EDGE) {
      const above = r.top - GAP - maxHeight;
      // กางขึ้นถ้าข้างบนพอ ไม่งั้นดันให้ชิดขอบล่างแล้วบีบไม่ให้ทะลุขอบบน
      top = above >= EDGE ? above : Math.max(EDGE, vh - EDGE - maxHeight);
    }

    const left = Math.min(
      Math.max(EDGE, r.left),
      window.innerWidth - POPUP_W - EDGE,
    );
    setPos({ left, top, maxHeight });
  }, []);

  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => updatePosition();
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      // ตัวเลือกเดือน/ปีถูก portal ออกไปนอก popup — อย่าเพิ่งปิดปฏิทิน
      if ((target as HTMLElement).closest?.(".dd-popup")) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [open, updatePosition]);

  // ให้โฟกัสอยู่ที่ช่องวันเสมอ ลูกศรจะได้ทำงานทันทีที่เปิด
  useEffect(() => {
    if (!open) return;
    const el = gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]');
    el?.focus();
  }, [open, focusDate]);

  const openCal = () => {
    if (disabled) return;
    const base = selected ?? clampToRange(startOfDay(new Date()));
    setViewDate(base);
    setFocusDate(base);
    setOpen(true);
  };

  const closeCal = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const pick = (d: Date) => {
    if (isOutOfRange(d)) return;
    onChange(toIso(d));
    closeCal();
  };

  const moveFocus = (next: Date) => {
    setFocusDate(next);
    if (
      next.getMonth() !== viewDate.getMonth() ||
      next.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(next);
    }
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        moveFocus(addDays(focusDate, -1));
        break;
      case "ArrowRight":
        e.preventDefault();
        moveFocus(addDays(focusDate, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        moveFocus(addDays(focusDate, -7));
        break;
      case "ArrowDown":
        e.preventDefault();
        moveFocus(addDays(focusDate, 7));
        break;
      case "PageUp":
        e.preventDefault();
        moveFocus(addMonths(focusDate, e.shiftKey ? -12 : -1));
        break;
      case "PageDown":
        e.preventDefault();
        moveFocus(addMonths(focusDate, e.shiftKey ? 12 : 1));
        break;
      case "Home":
        e.preventDefault();
        moveFocus(addDays(focusDate, -focusDate.getDay()));
        break;
      case "End":
        e.preventDefault();
        moveFocus(addDays(focusDate, 6 - focusDate.getDay()));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        pick(focusDate);
        break;
      case "Escape":
        e.preventDefault();
        closeCal();
        break;
    }
  };

  /** 6 สัปดาห์เสมอ ความสูงของปฏิทินจะได้ไม่กระตุกตอนเปลี่ยนเดือน */
  const days = useMemo(() => {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1, 12);
    const start = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [viewDate]);

  const todayIso = toIso(startOfDay(new Date()));
  const selectedIso = selected ? toIso(selected) : "";
  const focusIso = toIso(focusDate);

  const popup =
    open && pos
      ? createPortal(
          <div
            ref={popupRef}
            className="dp-popup"
            role="dialog"
            aria-modal="false"
            aria-label={ariaLabel ?? t("date.placeholder")}
            style={{
              left: pos.left,
              top: pos.top,
              width: POPUP_W,
              maxHeight: pos.maxHeight,
            }}
          >
            <div className="dp-head">
              <button
                type="button"
                className="dp-nav"
                aria-label={t("date.prevMonth")}
                onClick={() => setViewDate(addMonths(viewDate, -1))}
              >
                <FaChevronLeft aria-hidden />
              </button>

              <div className="dp-selects">
                <Dropdown
                  className="dp-select-month"
                  value={String(viewDate.getMonth())}
                  options={monthOptions}
                  ariaLabel={t("date.month")}
                  onChange={(v) =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), Number(v), 1, 12),
                    )
                  }
                />
                <Dropdown
                  className="dp-select-year"
                  value={String(viewDate.getFullYear())}
                  options={yearOptions}
                  ariaLabel={t("date.year")}
                  onChange={(v) =>
                    setViewDate(new Date(Number(v), viewDate.getMonth(), 1, 12))
                  }
                />
              </div>

              <button
                type="button"
                className="dp-nav"
                aria-label={t("date.nextMonth")}
                onClick={() => setViewDate(addMonths(viewDate, 1))}
              >
                <FaChevronRight aria-hidden />
              </button>
            </div>

            <div className="dp-weekdays" aria-hidden>
              {weekdayNames.map((w, i) => (
                <span
                  key={i}
                  className={i === 0 || i === 6 ? "dp-weekend" : undefined}
                >
                  {w}
                </span>
              ))}
            </div>

            <div
              ref={gridRef}
              id={gridId}
              className="dp-grid"
              role="grid"
              onKeyDown={onGridKeyDown}
            >
              {days.map((d) => {
                const iso = toIso(d);
                const outside = d.getMonth() !== viewDate.getMonth();
                const blocked = isOutOfRange(d);
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    tabIndex={iso === focusIso ? 0 : -1}
                    aria-selected={iso === selectedIso}
                    aria-current={iso === todayIso ? "date" : undefined}
                    disabled={blocked}
                    className={
                      "dp-day" +
                      (outside ? " is-outside" : "") +
                      (iso === todayIso ? " is-today" : "") +
                      (iso === selectedIso ? " is-selected" : "")
                    }
                    onClick={() => pick(d)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="dp-foot">
              <button
                type="button"
                className="dp-foot-btn"
                onClick={() => {
                  // บีบเข้าช่วงด้วย ไม่งั้นกด "วันนี้" ในปฏิทินวันเกิดจะพาไปเดือนที่เลือกอะไรไม่ได้เลย
                  const today = clampToRange(startOfDay(new Date()));
                  setViewDate(today);
                  setFocusDate(today);
                }}
              >
                {t("date.today")}
              </button>
              {clearable && (
                <button
                  type="button"
                  className="dp-foot-btn"
                  onClick={() => {
                    onChange("");
                    closeCal();
                  }}
                >
                  {t("date.clear")}
                </button>
              )}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`dp-trigger ${className}`.trim()}
        onClick={() => (open ? closeCal() : openCal())}
        onKeyDown={(e) => {
          if (
            !open &&
            (e.key === "Enter" || e.key === " " || e.key === "ArrowDown")
          ) {
            e.preventDefault();
            openCal();
          }
        }}
      >
        <span className={label ? "dp-value" : "dp-value is-placeholder"}>
          {label || t("date.placeholder")}
        </span>
        <FaCalendarDays className="dp-icon" aria-hidden />
      </button>
      {popup}
    </>
  );
};

export default DatePicker;
