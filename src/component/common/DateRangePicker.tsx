import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { FaCalendarDays, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { usePreferences } from "../../context/PreferencesContext";
import "../decorate/DatePicker.css";
import {
  addDays,
  addMonths,
  monthGrid,
  parseIso,
  startOfDay,
  toIso,
} from "./calendarDate";

export interface DateRange {
  /** ISO `yyyy-mm-dd`, inclusive; "" = not set */
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  /** latest selectable day, ISO `yyyy-mm-dd` */
  max?: string;
  ariaLabel?: string;
  className?: string;
}

interface PopupPos {
  left: number;
  top: number;
  maxHeight: number;
}

const GAP = 4;
const EDGE = 8;
const POPUP_W = 324;
const POPUP_H = 400;

/**
 * Calendar for picking a from–to range: the first click sets the start, the second the end
 * (in either order), with the days in between previewed on hover. Same look, tokens and
 * พ.ศ. display as DatePicker; values are always ค.ศ. `yyyy-mm-dd`.
 */
export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  max,
  ariaLabel,
  className = "",
}) => {
  const { t, lang, locale } = usePreferences();
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<PopupPos | null>(null);

  const from = useMemo(() => parseIso(value.from), [value.from]);
  const to = useMemo(() => parseIso(value.to), [value.to]);
  const maxDate = useMemo(() => (max ? parseIso(max) : null), [max]);

  /** first click of a new range, waiting for the second */
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [hover, setHover] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(() => from ?? startOfDay(new Date()));
  const [focusDate, setFocusDate] = useState<Date>(() => from ?? startOfDay(new Date()));

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const dayFmt = useMemo(
    () => new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }),
    [locale],
  );
  const monthTitle = useMemo(() => {
    const month = new Intl.DateTimeFormat(locale, { month: "long" }).format(viewDate);
    const y = viewDate.getFullYear();
    return `${month} ${lang === "th" ? y + 543 : y}`;
  }, [viewDate, locale, lang]);
  const weekdayNames = useMemo(() => {
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "narrow" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2024, 0, 7 + i)));
  }, [locale]);

  const label =
    from && to
      ? toIso(from) === toIso(to)
        ? dayFmt.format(from)
        : `${dayFmt.format(from)} – ${dayFmt.format(to)}`
      : "";

  const isBlocked = useCallback(
    (d: Date) => !!maxDate && d > startOfDay(maxDate),
    [maxDate],
  );

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const maxHeight = Math.min(POPUP_H, vh - EDGE * 2);
    let top = r.bottom + GAP;
    if (top + maxHeight > vh - EDGE) {
      const above = r.top - GAP - maxHeight;
      top = above >= EDGE ? above : Math.max(EDGE, vh - EDGE - maxHeight);
    }
    // right-align under the trigger when it sits near the right edge
    const left = Math.min(Math.max(EDGE, r.left), window.innerWidth - POPUP_W - EDGE);
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

  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLElement>('[tabindex="0"]')?.focus();
  }, [open, focusDate]);

  const openCal = () => {
    const base = from ?? startOfDay(new Date());
    setViewDate(base);
    setFocusDate(base);
    setAnchor(null);
    setHover(null);
    setOpen(true);
  };

  const closeCal = () => {
    setOpen(false);
    setAnchor(null);
    triggerRef.current?.focus();
  };

  const pick = (d: Date) => {
    if (isBlocked(d)) return;
    if (!anchor) {
      setAnchor(d);
      return;
    }
    const [a, b] = anchor <= d ? [anchor, d] : [d, anchor];
    onChange({ from: toIso(a), to: toIso(b) });
    closeCal();
  };

  const moveFocus = (next: Date) => {
    setFocusDate(next);
    if (anchor) setHover(next);
    if (next.getMonth() !== viewDate.getMonth() || next.getFullYear() !== viewDate.getFullYear()) {
      setViewDate(next);
    }
  };

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const step: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (e.key in step) {
      e.preventDefault();
      moveFocus(addDays(focusDate, step[e.key]));
    } else if (e.key === "PageUp" || e.key === "PageDown") {
      e.preventDefault();
      moveFocus(addMonths(focusDate, e.key === "PageUp" ? -1 : 1));
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(focusDate);
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeCal();
    }
  };

  // the range to paint: the one being picked (anchor → hover) or the committed value
  const [lo, hi] = useMemo(() => {
    if (anchor) {
      const other = hover ?? anchor;
      return anchor <= other ? [anchor, other] : [other, anchor];
    }
    return [from, to];
  }, [anchor, hover, from, to]);
  const loIso = lo ? toIso(lo) : "";
  const hiIso = hi ? toIso(hi) : "";

  const days = useMemo(() => monthGrid(viewDate), [viewDate]);
  const todayIso = toIso(startOfDay(new Date()));
  const focusIso = toIso(focusDate);

  const popup =
    open && pos
      ? createPortal(
          <div
            ref={popupRef}
            className="dp-popup"
            role="dialog"
            aria-modal="false"
            aria-label={ariaLabel ?? t("date.rangePlaceholder")}
            style={{ left: pos.left, top: pos.top, width: POPUP_W, maxHeight: pos.maxHeight }}
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
              <div className="dp-range-title" aria-live="polite">{monthTitle}</div>
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
                <span key={i} className={i === 0 || i === 6 ? "dp-weekend" : undefined}>{w}</span>
              ))}
            </div>

            <div
              ref={gridRef}
              className="dp-grid dp-grid--range"
              role="grid"
              onKeyDown={onGridKeyDown}
              onMouseLeave={() => setHover(null)}
            >
              {days.map((d) => {
                const iso = toIso(d);
                const inRange = !!loIso && iso >= loIso && iso <= hiIso;
                const isEnd = iso === loIso || iso === hiIso;
                return (
                  <button
                    key={iso}
                    type="button"
                    role="gridcell"
                    tabIndex={iso === focusIso ? 0 : -1}
                    aria-selected={inRange}
                    aria-current={iso === todayIso ? "date" : undefined}
                    disabled={isBlocked(d)}
                    className={
                      "dp-day" +
                      (d.getMonth() !== viewDate.getMonth() ? " is-outside" : "") +
                      (iso === todayIso ? " is-today" : "") +
                      (inRange && !isEnd ? " is-in-range" : "") +
                      (isEnd ? " is-selected" : "")
                    }
                    onMouseEnter={() => anchor && setHover(d)}
                    onClick={() => pick(d)}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="dp-foot">
              <span className="dp-range-hint">
                {anchor ? t("date.pickEnd") : t("date.pickStart")}
              </span>
              <button
                type="button"
                className="dp-foot-btn dp-foot-btn--auto"
                onClick={() => {
                  onChange({ from: "", to: "" });
                  closeCal();
                }}
              >
                {t("date.clear")}
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={`dp-trigger ${className}`.trim()}
        onClick={() => (open ? closeCal() : openCal())}
      >
        <span className={label ? "dp-value" : "dp-value is-placeholder"}>
          {label || t("date.rangePlaceholder")}
        </span>
        <FaCalendarDays className="dp-icon" aria-hidden />
      </button>
      {popup}
    </>
  );
};

export default DateRangePicker;
