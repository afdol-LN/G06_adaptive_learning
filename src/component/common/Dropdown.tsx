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
import { FaCheck, FaChevronDown, FaMagnifyingGlass } from "react-icons/fa6";
import "../decorate/Dropdown.css";

export interface DropdownOption {
  value: string;
  label: string;
  /** ข้อความรองสีจางท้ายแถว (เช่น @username) — ใช้ค้นหาได้ด้วย */
  hint?: string;
  disabled?: boolean;
}

interface DropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  /** ใช้กับ <label htmlFor> */
  id?: string;
  /** ชื่อที่ screen reader อ่าน เมื่อไม่มี <label> คู่กัน */
  ariaLabel?: string;
  /** ต่อท้าย class ของปุ่ม เผื่อหน้าไหนอยากคุมความกว้างเอง */
  className?: string;
  /** ข้อความตอนไม่มีตัวเลือกให้เลือก (หรือค้นหาไม่เจอ) */
  emptyText?: string;
  /** มีช่องค้นหาบนสุดของรายการ — กรองจาก label + hint (ไม่สนตัวพิมพ์เล็ก/ใหญ่) */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** รายการกว้างอย่างน้อยเท่านี้ (px) แม้ปุ่มจะแคบกว่า — ชื่อยาวไม่ถูกตัด; ไม่เกินขอบจอ */
  popupMinWidth?: number;
}

interface PopupPos {
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

const GAP = 4;
const MAX_POPUP_HEIGHT = 288;

/**
 * Dropdown ที่คุมหน้าตาได้ทั้งตัว
 *
 * ทำไมไม่ใช้ <select>: รายการที่กางออกมาของ <select> เป็น popup ของระบบปฏิบัติการ
 * CSS กำหนดมุมมน สีพื้น หรือระยะห่างไม่ได้เลย หน้าตาจึงต่างกันไปตาม OS/เบราว์เซอร์
 *
 * รายการถูก render ผ่าน portal ไปที่ <body> เพราะการ์ดหลายใบในโปรเจกต์ตั้ง
 * overflow: hidden (เช่น .info-root .card) ซึ่งจะตัดรายการที่กางลงมาให้หายไป
 */
export const Dropdown: React.FC<DropdownProps> = ({
  value,
  onChange,
  options,
  placeholder = "เลือก...",
  disabled = false,
  id,
  ariaLabel,
  className = "",
  emptyText = "ไม่มีตัวเลือก",
  searchable = false,
  searchPlaceholder = "ค้นหา...",
  popupMinWidth = 0,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [pos, setPos] = useState<PopupPos | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  // กรอบนอกสุดของ popup (ul เดี่ยว หรือ div ที่มีช่องค้นหา + ul)
  const popupRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const reactId = useId();
  const listId = `dd-list-${reactId}`;

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  // รายการที่แสดงตอนนี้ — index ทุกตัว (activeIndex, data-idx) อ้างอิงรายการนี้
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    return options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const firstEnabled = useCallback(
    () => visible.findIndex((o) => !o.disabled),
    [visible],
  );

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom - GAP - 8;
    const spaceAbove = r.top - GAP - 8;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;
    // กว้างกว่าปุ่มได้ — ถ้าเกินขอบขวาให้เลื่อนไปทางซ้ายแทน
    const width = Math.min(Math.max(r.width, popupMinWidth), window.innerWidth - 16);
    const left = Math.max(8, Math.min(r.left, window.innerWidth - width - 8));

    setPos({
      left,
      width,
      top: openUp ? undefined : r.bottom + GAP,
      bottom: openUp ? window.innerHeight - r.top + GAP : undefined,
      maxHeight: Math.max(
        120,
        Math.min(MAX_POPUP_HEIGHT, openUp ? spaceAbove : spaceBelow),
      ),
    });
  }, [popupMinWidth]);

  // วางตำแหน่งก่อน paint แรก ไม่งั้นรายการจะกระพริบที่มุมซ้ายบน
  useLayoutEffect(() => {
    if (open) updatePosition();
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    const onScrollOrResize = () => updatePosition();
    // capture: true เพื่อให้จับ scroll ของ container ด้านในด้วย ไม่ใช่แค่ window
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

  // เลื่อนรายการที่กำลังชี้อยู่ให้เห็นเสมอเวลาใช้ลูกศร
  useEffect(() => {
    if (!open || activeIndex < 0) return;
    const el = popupRef.current?.querySelector<HTMLElement>(
      `[data-idx="${activeIndex}"]`,
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [open, activeIndex]);

  // เปิดแบบค้นหา → โฟกัสช่องค้นหาทันที (หลังวางตำแหน่ง popup แล้ว)
  useEffect(() => {
    if (open && pos && searchable) searchRef.current?.focus();
  }, [open, pos, searchable]);

  const openList = () => {
    if (disabled) return;
    setQuery("");
    // query เพิ่งล้าง — ใช้ options เต็มชุดหา index ของค่าที่เลือกอยู่
    const current = options.findIndex((o) => o.value === value && !o.disabled);
    setActiveIndex(current >= 0 ? current : options.findIndex((o) => !o.disabled));
    setOpen(true);
  };

  const closeList = (focusTrigger = true) => {
    setOpen(false);
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  };

  const pick = (idx: number) => {
    const opt = visible[idx];
    if (!opt || opt.disabled) return;
    onChange(opt.value);
    closeList();
  };

  const step = (dir: 1 | -1) => {
    if (visible.length === 0) return;
    let i = activeIndex;
    for (let n = 0; n < visible.length; n++) {
      i = (i + dir + visible.length) % visible.length;
      if (!visible[i].disabled) {
        setActiveIndex(i);
        return;
      }
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!open) {
      if (
        e.key === "ArrowDown" ||
        e.key === "ArrowUp" ||
        e.key === "Enter" ||
        e.key === " "
      ) {
        e.preventDefault();
        openList();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        step(1);
        break;
      case "ArrowUp":
        e.preventDefault();
        step(-1);
        break;
      case "Home":
        e.preventDefault();
        setActiveIndex(firstEnabled());
        break;
      case "End": {
        e.preventDefault();
        for (let i = visible.length - 1; i >= 0; i--) {
          if (!visible[i].disabled) {
            setActiveIndex(i);
            break;
          }
        }
        break;
      }
      case "Enter":
      case " ":
        e.preventDefault();
        pick(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        closeList();
        break;
      case "Tab":
        closeList(false);
        break;
    }
  };

  // ในช่องค้นหา: ลูกศร/Enter/Esc/Tab คุมรายการ ส่วนปุ่มอื่น (รวม space, Home/End) ใช้พิมพ์ตามปกติ
  const onSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (["ArrowDown", "ArrowUp", "Enter", "Escape", "Tab"].includes(e.key)) onKeyDown(e);
  };

  const popupStyle = pos
    ? { left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxHeight }
    : undefined;

  const listBox = (
          <ul
            ref={searchable ? undefined : (el) => { popupRef.current = el; }}
            id={listId}
            role="listbox"
            className={searchable ? "dd-list" : "dd-popup"}
            aria-activedescendant={
              activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined
            }
            style={searchable ? undefined : popupStyle}
          >
            {visible.length === 0 && <li className="dd-empty">{emptyText}</li>}

            {visible.map((opt, idx) => {
              const isSelected = opt.value === value;
              return (
                <li
                  key={opt.value || `dd-${idx}`}
                  id={`${listId}-${idx}`}
                  data-idx={idx}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={opt.disabled || undefined}
                  className={
                    "dd-option" +
                    (idx === activeIndex ? " is-active" : "") +
                    (isSelected ? " is-selected" : "") +
                    (opt.disabled ? " is-disabled" : "")
                  }
                  onMouseEnter={() => !opt.disabled && setActiveIndex(idx)}
                  onClick={() => pick(idx)}
                  title={searchable ? opt.label : undefined}
                >
                  <span className="dd-option-label">{opt.label}</span>
                  {opt.hint && <span className="dd-option-hint">{opt.hint}</span>}
                  {isSelected && (
                    <FaCheck className="dd-option-check" aria-hidden />
                  )}
                </li>
              );
            })}
          </ul>
  );

  const popup =
    open && pos
      ? createPortal(
          searchable ? (
            <div
              ref={(el) => { popupRef.current = el; }}
              className="dd-popup dd-popup--search"
              style={popupStyle}
            >
              <div className="dd-search-wrap">
              <FaMagnifyingGlass className="dd-search-icon" aria-hidden />
              <input
                ref={searchRef}
                type="text"
                className="dd-search"
                value={query}
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                aria-controls={listId}
                aria-autocomplete="list"
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={onSearchKeyDown}
              />
              </div>
              {listBox}
            </div>
          ) : (
            listBox
          ),
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`dd-trigger ${className}`.trim()}
        onClick={() => (open ? closeList() : openList())}
        onKeyDown={onKeyDown}
      >
        <span className={selected ? "dd-value" : "dd-value is-placeholder"}>
          {selected ? selected.label : placeholder}
        </span>
        <FaChevronDown className="dd-caret" aria-hidden />
      </button>
      {popup}
    </>
  );
};

export default Dropdown;
