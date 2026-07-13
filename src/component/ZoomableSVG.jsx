// ─── component/ZoomableSVG.jsx ──────────────────────────────────────────────
// SVG ที่ zoom/pan ได้ด้วย scroll wheel และ drag
// ใช้ใน: SkillTreeSVG (SkillTree tab ใน HomeView)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react';

export default function ZoomableSVG({ children, viewBox, className }) {
  const svgRef    = useRef(null);
  const isPanning = useRef(false);
  const lastPos   = useRef({ x: 0, y: 0 });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });

  const onWheel = useCallback(e => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(t => ({ ...t, scale: Math.min(3, Math.max(0.3, t.scale * delta)) }));
  }, []);

  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return;
    isPanning.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback(e => {
    if (!isPanning.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setTransform(t => ({ ...t, x: t.x + dx, y: t.y + dy }));
  }, []);

  const onMouseUp = useCallback(() => { isPanning.current = false; }, []);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [onWheel]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className={className}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      style={{ cursor: 'grab' }}
    >
      <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
        {children}
      </g>
    </svg>
  );
}
