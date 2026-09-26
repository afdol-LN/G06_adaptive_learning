import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaArrowDown, FaArrowUp, FaFlagCheckered } from "react-icons/fa6";

// แผนผังแบบไม่ซูม: วาดที่ scale คงที่ให้โหนดอ่านชัด แล้วให้กรอบ scroll แทนการย่อทั้ง tree ให้พอดีจอ
// scale = กว้างกรอบ / กว้าง tree แต่ไม่ต่ำกว่า MIN_SCALE (ชื่อโหนด 19px → ~13px) และไม่ขยายเกินขนาดจริง
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;

/** กล่องในพิกัด SVG (x/y = จุดกึ่งกลาง) ของโหนดที่ปุ่มลอย "ไปที่เป้าหมาย" จะเลื่อนไปหา */
export interface ScrollTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

interface ScrollableSVGProps {
  minX: number;
  minY: number;
  width: number;
  height: number;
  className?: string;
  /** พิกัดใน SVG ที่ต้องอยู่ในจอตอนเปิด (โหนดที่มีป้าย "เริ่มเลย") — null = บนสุด กึ่งกลางแนวนอน */
  focus?: { x: number; y: number } | null;
  /** โหนดเป้าหมาย — มีค่า = แสดงปุ่มลอยพาไปหาโหนดนี้ เฉพาะตอนที่โหนดอยู่นอกจอ */
  jumpTarget?: ScrollTarget | null;
  /** aria-label ของปุ่มลูกศร "กลับขึ้นบนสุด" — แสดงแทนปุ่มไปเป้าหมายเมื่อเห็นเป้าหมายแล้วและไม่ได้อยู่บนสุด */
  backToTopLabel?: string;
  children: React.ReactNode;
}

export const ScrollableSVG: React.FC<ScrollableSVGProps> = ({
  minX,
  minY,
  width,
  height,
  className,
  focus = null,
  jumpTarget = null,
  backToTopLabel,
  children,
}) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const scrolledFor = useRef<string | null>(null);
  // null = เป้าหมายอยู่ในจอ (ซ่อนปุ่ม); "down"/"up"/"side" = ทิศที่ต้องเลื่อนไปหา (เลือกไอคอนลูกศร)
  const [jumpDir, setJumpDir] = useState<"down" | "up" | "side" | null>(null);
  // เลื่อนลงมาจากบนสุดแล้วหรือยัง — ใช้ตัดสินว่าจะโชว์ปุ่ม "กลับขึ้นบนสุด"
  const [scrolledDown, setScrolledDown] = useState(false);

  useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    setHostWidth(el.clientWidth);
    const ro = new ResizeObserver(() => setHostWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scale = hostWidth > 0 ? Math.min(MAX_SCALE, Math.max(MIN_SCALE, hostWidth / width)) : MIN_SCALE;

  // เลื่อนครั้งเดียวต่อเป้าหมาย — ไม่ดึงกลับทุกครั้งที่ re-render ขณะผู้ใช้กำลังเลื่อนดูเอง
  useEffect(() => {
    const el = hostRef.current;
    if (!el || hostWidth === 0) return;
    const key = focus ? `${focus.x},${focus.y}` : "top";
    if (scrolledFor.current === key) return;
    scrolledFor.current = key;
    const left = focus ? (focus.x - minX) * scale - el.clientWidth / 2 : (width * scale - el.clientWidth) / 2;
    // el.scrollTop=0 ก็ยังเห็น padTop ของ .skill-tree-scroll อยู่แล้ว ("แถบที่มองเห็นจริง" เริ่มต่ำกว่าขอบบนของ
    // scroller ไปเท่า padTop) แต่เนื้อหา SVG ก็ถูกเลื่อนลงมาเท่า padTop เหมือนกัน (เพราะ padding อยู่เหนือ SVG)
    // สอง padTop นี้จึงหักล้างกันในสูตร เหลือแค่หัก padTop+padBottom ออกจากความสูงแถบที่มองเห็นได้จริง
    const cs = getComputedStyle(el);
    const padTop = parseFloat(cs.paddingTop) || 0;
    const padBottom = parseFloat(cs.paddingBottom) || 0;
    const top = focus ? (focus.y - minY) * scale - (el.clientHeight - padTop - padBottom) / 3 : 0;
    el.scrollTo({ left: Math.max(0, left), top: Math.max(0, top) });
  }, [focus, hostWidth, scale, minX, minY, width]);

  // กล่องของเป้าหมายเป็น px ในพื้นที่ scroll ของ host (รวม padding บน และ margin auto ที่จัด SVG ไว้กลาง)
  const targetBox = useCallback(() => {
    const el = hostRef.current;
    if (!el || !jumpTarget) return null;
    const padTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
    const offX = Math.max(0, (el.clientWidth - width * scale) / 2);
    const cx = offX + (jumpTarget.x - minX) * scale;
    const cy = padTop + (jumpTarget.y - minY) * scale;
    const hw = (jumpTarget.width * scale) / 2;
    const hh = (jumpTarget.height * scale) / 2;
    return { el, cx, cy, left: cx - hw, right: cx + hw, top: cy - hh, bottom: cy + hh };
  }, [jumpTarget, width, scale, minX, minY]);

  // ซ่อนปุ่มไปเป้าหมายเมื่อเห็นเป้าหมายแล้ว (เห็นบางส่วนก็นับ) — คิดใหม่ทุกครั้งที่เลื่อน/ขนาดกรอบเปลี่ยน
  useEffect(() => {
    const el = hostRef.current;
    if (!el || hostWidth === 0) return;
    const update = () => {
      setScrolledDown(el.scrollTop > 40);
      const b = targetBox();
      if (!b) {
        setJumpDir(null);
        return;
      }
      const { scrollTop, scrollLeft, clientHeight, clientWidth } = b.el;
      if (b.top >= scrollTop + clientHeight) setJumpDir("down");
      else if (b.bottom <= scrollTop) setJumpDir("up");
      else if (b.right <= scrollLeft || b.left >= scrollLeft + clientWidth) setJumpDir("side");
      else setJumpDir(null);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    return () => el.removeEventListener("scroll", update);
  }, [hostWidth, targetBox]);

  const jumpToTarget = () => {
    const b = targetBox();
    if (!b) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    b.el.scrollTo({
      left: Math.max(0, b.cx - b.el.clientWidth / 2),
      top: Math.max(0, b.cy - b.el.clientHeight / 2),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  const scrollToTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    hostRef.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const DirIcon = jumpDir === "up" ? FaArrowUp : jumpDir === "down" ? FaArrowDown : FaFlagCheckered;

  return (
    <>
      <div ref={hostRef} className="skill-tree-scroll">
        <svg
          viewBox={`${minX} ${minY} ${width} ${height}`}
          width={width * scale}
          height={height * scale}
          className={className}
        >
          {children}
        </svg>
      </div>
      {jumpTarget && jumpDir && (
        <button type="button" className="tree-jump-btn" onClick={jumpToTarget}>
          <DirIcon aria-hidden />
          <span>{jumpTarget.label}</span>
        </button>
      )}
      {/* ตำแหน่งเดียวกับปุ่มไปเป้าหมาย — สองปุ่มไม่มีทางแสดงพร้อมกัน */}
      {backToTopLabel && !jumpDir && scrolledDown && (
        <button
          type="button"
          className="tree-jump-btn tree-jump-btn--icon"
          onClick={scrollToTop}
          aria-label={backToTopLabel}
          title={backToTopLabel}
        >
          <FaArrowUp aria-hidden />
        </button>
      )}
    </>
  );
};
export default ScrollableSVG;
