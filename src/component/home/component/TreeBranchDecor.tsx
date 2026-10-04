/**
 * กิ่งไม้ + นก ตกแต่งพื้นหลังของ .home-canvas (HomeTab) — อยู่หลัง tree เสมอ (z-index 0) ไม่รับ click
 *
 * กิ่งสร้างแบบ deterministic: mulberry32(seed) + แตกกิ่ง recursive (ห้าม Math.random — ภาพต้องเหมือนเดิมทุกครั้ง)
 * พิกัดคิดใน "แบบ G" 660×300 แต่แยกวาดเป็น 2 SVG เล็กติดมุม ขนาดคุมด้วย CSS (.tbd-corner ใน Home.css)
 * เพราะถ้าใช้ SVG เดียวแบบ slice เต็ม canvas ภาพจะถูกขยายตามความสูงจอ จนกิ่งยื่นเข้าไปกลางจอใกล้กล่อง goal
 * คำนวณครั้งเดียวตอนโหลดไฟล์ — ไม่มี props/state
 */

type Leaf = { x: number; y: number; angle: number; color: string };
type Segment = { d: string; width: number };
type Bird = { x: number; y: number; color: string; flip: boolean };
type Flower = { x: number; y: number };
type Corner = { segments: Segment[]; leaves: Leaf[]; flowers: Flower[]; bird: Bird; viewBox: string };
type BranchStart = { x: number; y: number; angle: number; len: number; depth: number; width: number };

const BRANCH_COLOR = "#a08a6e";
const LEAF_COLORS = ["#a9d49a", "#8cc789", "#b9deaa", "#9ccfa3"];
const LEAF_RX = 6;
// ดอกเล็ก ๆ ที่ปลายกิ่งบางกิ่ง — สีอ่อน ไม่แย่งการ์ด
const FLOWER_PETAL = "#f6c9d4";
const FLOWER_CENTER = "#f5d76e";
const FLOWER_R = 2;
const BIRD_SCALE = 1.3;
// ขอบของแบบ G — ส่วนที่เลยขอบไม่ต้องวาด (กิ่งเริ่มนอกขอบเล็กน้อยให้ดูเหมือนงอกมาจากนอกจอ)
const VIEW_W = 660;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** หลายกิ่งงอกจากขอบเดียวกัน (เรียงตามแนวตั้ง) → กอใหญ่ขึ้นโดยไม่ยื่นเข้ากลางจอ */
function buildCorner(
  seed: number,
  starts: BranchStart[],
  bird: Bird,
  clip: { minX: number; maxX: number },
): Corner {
  const rng = mulberry32(seed);
  const flowers: Flower[] = [];
  const segments: Segment[] = [];
  const leaves: Leaf[] = [];
  const xs: number[] = [];
  const ys: number[] = [];

  const branch = (x: number, y: number, a: number, len: number, d: number, w: number) => {
    const rad = (a * Math.PI) / 180;
    const x2 = x + Math.cos(rad) * len;
    const y2 = y + Math.sin(rad) * len;
    // จุดควบคุมของเส้นโค้ง quadratic — เบี่ยงตั้งฉากกับกิ่งเล็กน้อย
    const bend = (rng() - 0.5) * 0.4 * len;
    const cx = (x + x2) / 2 - Math.sin(rad) * bend;
    const cy = (y + y2) / 2 + Math.cos(rad) * bend;
    segments.push({ d: `M${x.toFixed(1)} ${y.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`, width: w });
    xs.push(x, x2);
    ys.push(y, y2);

    // ใบ 3 ใบต่อปล้อง วางตามเส้นโค้ง สลับซ้าย/ขวาของกิ่ง
    [0.4, 0.65, 0.9].forEach((t, i) => {
      const lx = (1 - t) * (1 - t) * x + 2 * (1 - t) * t * cx + t * t * x2;
      const ly = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * cy + t * t * y2;
      const side = i % 2 === 0 ? 1 : -1;
      leaves.push({
        x: lx,
        y: ly,
        angle: a + side * (35 + rng() * 25),
        color: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
      });
      xs.push(lx - LEAF_RX, lx + LEAF_RX);
      ys.push(ly - LEAF_RX, ly + LEAF_RX);
    });

    if (d <= 0) {
      if (rng() < 0.45) {
        flowers.push({ x: x2, y: y2 });
        xs.push(x2 - 4, x2 + 4);
        ys.push(y2 - 4, y2 + 4);
      }
      return;
    }
    for (const sign of [-1, 1]) {
      const da = 20 + rng() * 20;
      const k = 0.62 + rng() * 0.1;
      branch(x2, y2, a + sign * da, len * k, d - 1, w * 0.68);
    }
  };

  starts.forEach((b) => branch(b.x, b.y, b.angle, b.len, b.depth, b.width));

  // นกต้องอยู่ในกรอบด้วย (ลำตัว+หาง ~16 หน่วย × scale)
  const birdPad = 16 * BIRD_SCALE;
  xs.push(bird.x - birdPad, bird.x + birdPad);
  ys.push(bird.y - birdPad, bird.y + birdPad * 0.6);

  const minX = Math.max(clip.minX, Math.min(...xs));
  const maxX = Math.min(clip.maxX, Math.max(...xs));
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return {
    segments,
    leaves,
    flowers,
    bird,
    viewBox: `${minX.toFixed(1)} ${minY.toFixed(1)} ${(maxX - minX).toFixed(1)} ${(maxY - minY).toFixed(1)}`,
  };
}

// กิ่งหลักตามแบบ G (ตัวแรก) + กิ่งเสริมเหนือ/ใต้ ให้เป็นกอ — กิ่งเสริมสั้นกว่าเพื่อคุมระยะยื่นแนวนอน
const RIGHT = buildCorner(
  51,
  [
    { x: 668, y: 70, angle: 176, len: 95, depth: 3, width: 3.6 },
    { x: 668, y: 8, angle: 160, len: 62, depth: 2, width: 2.8 },
    { x: 668, y: 150, angle: 192, len: 70, depth: 2, width: 3 },
  ],
  { x: 572, y: 86, color: "#5a8bd6", flip: true },
  { minX: -Infinity, maxX: VIEW_W },
);
const LEFT = buildCorner(
  52,
  [
    { x: -8, y: 230, angle: -6, len: 92, depth: 3, width: 3.4 },
    { x: -8, y: 160, angle: -22, len: 66, depth: 2, width: 2.8 },
    { x: -8, y: 300, angle: 10, len: 58, depth: 2, width: 2.6 },
  ],
  { x: 70, y: 224, color: "#f2a65a", flip: false },
  { minX: 0, maxX: Infinity },
);

function BirdShape({ bird }: { bird: Bird }) {
  const sx = bird.flip ? -BIRD_SCALE : BIRD_SCALE;
  return (
    <g transform={`translate(${bird.x} ${bird.y}) scale(${sx} ${BIRD_SCALE})`}>
      {/* g ด้านในขยับขึ้นลง (CSS) แยกจาก transform ตำแหน่งด้านนอก */}
      <g className="tbd-bird">
        <path d="M-6 -1 L-13 -5 L-12 2 Z" fill={bird.color} />
        <ellipse cx="0" cy="0" rx="7.5" ry="5.2" fill={bird.color} />
        <circle cx="6.5" cy="-4.5" r="3.8" fill={bird.color} />
        <circle cx="7.6" cy="-5.2" r="0.9" fill="#1f2937" />
        <path d="M10 -5 L13.4 -4 L10 -3 Z" fill="#f5c542" />
      </g>
    </g>
  );
}

function CornerSvg({ corner, className }: { corner: Corner; className: string }) {
  return (
    <svg className={`tbd-corner ${className}`} viewBox={corner.viewBox} focusable="false">
      <g opacity={0.75} stroke={BRANCH_COLOR} fill="none" strokeLinecap="round">
        {corner.segments.map((s, i) => (
          <path key={i} d={s.d} strokeWidth={s.width} />
        ))}
      </g>
      <g opacity={0.85}>
        {corner.leaves.map((l, i) => (
          <ellipse
            key={i}
            cx={0}
            cy={0}
            rx={LEAF_RX}
            ry={2.8}
            fill={l.color}
            transform={`translate(${l.x.toFixed(1)} ${l.y.toFixed(1)}) rotate(${l.angle.toFixed(1)}) translate(${LEAF_RX} 0)`}
          />
        ))}
      </g>
      <g opacity={0.9}>
        {corner.flowers.map((f, i) => (
          <g key={i} transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)})`}>
            {[0, 72, 144, 216, 288].map((deg) => (
              <circle
                key={deg}
                cx={Math.cos((deg * Math.PI) / 180) * FLOWER_R}
                cy={Math.sin((deg * Math.PI) / 180) * FLOWER_R}
                r={FLOWER_R}
                fill={FLOWER_PETAL}
              />
            ))}
            <circle r={1.3} fill={FLOWER_CENTER} />
          </g>
        ))}
      </g>
      <BirdShape bird={corner.bird} />
    </svg>
  );
}

export function TreeBranchDecor() {
  return (
    <div className="tree-branch-decor" aria-hidden="true" role="presentation">
      <CornerSvg corner={RIGHT} className="tbd-right" />
      <CornerSvg corner={LEFT} className="tbd-left" />
    </div>
  );
}
