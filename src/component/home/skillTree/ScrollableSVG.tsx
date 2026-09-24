import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

// แผนผังแบบไม่ซูม: วาดที่ scale คงที่ให้โหนดอ่านชัด แล้วให้กรอบ scroll แทนการย่อทั้ง tree ให้พอดีจอ
// scale = กว้างกรอบ / กว้าง tree แต่ไม่ต่ำกว่า MIN_SCALE (ชื่อโหนด 19px → ~13px) และไม่ขยายเกินขนาดจริง
const MIN_SCALE = 0.7;
const MAX_SCALE = 1;

interface ScrollableSVGProps {
  minX: number;
  minY: number;
  width: number;
  height: number;
  className?: string;
  /** พิกัดใน SVG ที่ต้องอยู่ในจอตอนเปิด (โหนดที่มีป้าย "เริ่มเลย") — null = บนสุด กึ่งกลางแนวนอน */
  focus?: { x: number; y: number } | null;
  children: React.ReactNode;
}

export const ScrollableSVG: React.FC<ScrollableSVGProps> = ({ minX, minY, width, height, className, focus = null, children }) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [hostWidth, setHostWidth] = useState(0);
  const scrolledFor = useRef<string | null>(null);

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

  return (
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
  );
};
export default ScrollableSVG;
