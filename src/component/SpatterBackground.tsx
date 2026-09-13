import { useEffect, useRef } from "react";

export type SpatterProps = {
  /** ink colour of the specks */
  color?: string;
  /** 1 = default. >1 = denser speckle */
  density?: number;
  /** 1 = default. >1 = bigger flecks + wider clusters */
  grainScale?: number;
  /** deterministic pattern seed */
  seed?: number;
  className?: string;
};

/* deterministic PRNG — no dependency needed */
function mulberry32(a: number) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CANVAS_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  pointerEvents: "none",
  userSelect: "none",
};

/**
 * Canvas version — draws once on mount / resize only.
 * Does not re-render on scroll, doesn't touch the main thread after drawing.
 */
export default function SpatterBackground({
  color = "#2f57d1",
  density = 1,
  grainScale = 1,
  seed = 7,
  className = "",
}: SpatterProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = ref.current;
    const host = cvs?.parentElement;
    if (!cvs || !host) return;

    let raf = 0;

    const draw = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cvs.width = Math.round(w * dpr);
      cvs.height = Math.round(h * dpr);
      cvs.style.width = w + "px";
      cvs.style.height = h + "px";

      const ctx = cvs.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const rnd = mulberry32(seed * 9301 + 49297);
      const gauss = () => {
        const u = Math.max(rnd(), 1e-9);
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185307 * rnd());
      };

      /* density field: heavier near top+right edges, fading toward bottom-left */
      const field = (x: number, y: number) => {
        const fx = x / w;
        const fy = y / h;
        const d = 0.08 + 1.0 * (0.6 * Math.pow(1 - fy, 1.7) + 0.4 * Math.pow(fx, 1.7));
        const edge =
          Math.min(1, Math.min(x, w - x) / (w * 0.11)) *
          Math.min(1, Math.min(y, h - y) / (h * 0.11));
        return Math.max(0, Math.min(1, d)) * (0.2 + 0.8 * edge);
      };

      ctx.fillStyle = color;

      /* clusters */
      const clusters = Math.round(((w * h) / 4200) * density);
      for (let i = 0; i < clusters; i++) {
        const cx = rnd() * w;
        const cy = rnd() * h;
        if (rnd() > field(cx, cy)) continue;
        const n = 3 + Math.floor(rnd() * rnd() * 30 * density);
        const sigma = (4 + rnd() * rnd() * 48) * grainScale;
        for (let j = 0; j < n; j++) {
          const x = cx + gauss() * sigma;
          const y = cy + gauss() * sigma;
          if (x < 0 || y < 0 || x > w || y > h) continue;
          if (rnd() > field(x, y) * 0.85 + 0.15) continue;
          const r = (0.35 + rnd() * rnd() * 1.3) * grainScale;
          ctx.globalAlpha = 0.2 + rnd() * 0.75;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, 6.283185307);
          ctx.fill();
        }
      }

      /* sparse single specks so it doesn't read as clumps only */
      const singles = Math.round(((w * h) / 700) * density);
      for (let i = 0; i < singles; i++) {
        const x = rnd() * w;
        const y = rnd() * h;
        if (rnd() > field(x, y) * 0.55) continue;
        ctx.globalAlpha = 0.12 + rnd() * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, (0.3 + rnd() * 0.7) * grainScale, 0, 6.283185307);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };

    schedule();
    const ro = new ResizeObserver(schedule);
    ro.observe(host);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [color, density, grainScale, seed]);

  return <canvas ref={ref} aria-hidden="true" className={className} style={CANVAS_STYLE} />;
}
