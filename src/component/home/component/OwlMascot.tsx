/**
 * นกฮูกนั่งอ่านหนังสือข้างตะเกียง — ของตกแต่งล้วน วางมุมขวาของกรอบแผนผังทักษะ (HomeTab)
 * ไม่มี props/state/API, ไม่รับ click (pointer-events:none ใน Home.css)
 * สีตัวละครคงที่ ไม่ผูกกับ theme — อนิเมชันทั้งหมดอยู่ใน Home.css (class owl-*)
 */
export function OwlMascot() {
  return (
    <div className="owl-mascot">
      <svg viewBox="0 0 170 170" aria-hidden="true" role="presentation" focusable="false">
        {/* ท่อนไม้รองนั่ง */}
        <ellipse cx="85" cy="154" rx="74" ry="9" fill="#5b3d24" />
        <rect x="14" y="138" width="142" height="15" rx="7.5" fill="#9c6b43" />

        {/* ตะเกียง (หลังนกฮูก) — แสงอยู่ล่างสุดของตะเกียง */}
        <ellipse className="owl-glow" cx="140" cy="108" rx="28" ry="28" fill="#ffd56b" />
        <path d="M130 96 Q140 78 150 96" fill="none" stroke="#5a4632" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="129" y="94" width="22" height="4" rx="2" fill="#5a4632" />
        <rect x="131" y="98" width="18" height="24" rx="3" fill="#fff3c4" stroke="#5a4632" strokeWidth="2" />
        <path className="owl-flame" d="M140 103 Q134 111 137 116 Q140 119 143 116 Q146 111 140 103 Z" fill="#f59e0b" />
        <path className="owl-flame" d="M140 108 Q137 113 138.5 115.5 Q140 117 141.5 115.5 Q143 113 140 108 Z" fill="#fde047" />
        <rect x="127" y="122" width="26" height="16" rx="3" fill="#5a4632" />

        {/* ตัวนกฮูก — หายใจ (ยืด/หดเบา ๆ จากฐาน) */}
        <g className="owl-breath">
          <path d="M40 72 L43 52 L55 66 Z" fill="#a37f56" />
          <path d="M90 72 L87 52 L75 66 Z" fill="#a37f56" />
          <ellipse cx="65" cy="100" rx="34" ry="38" fill="#a37f56" />
          <ellipse cx="65" cy="112" rx="22" ry="24" fill="#ecd9ba" />

          {/* หัว: ตา + เปลือกตา + ปาก — เอียงซ้ายขวาช้า ๆ */}
          <g className="owl-head">
            <circle cx="52" cy="86" r="11" fill="#ffffff" />
            <circle cx="78" cy="86" r="11" fill="#ffffff" />
            <circle cx="53" cy="88" r="5" fill="#1f1a17" />
            <circle cx="77" cy="88" r="5" fill="#1f1a17" />
            <rect className="owl-lid" x="40" y="74" width="24" height="24" rx="11" fill="#a37f56" />
            <rect className="owl-lid" x="66" y="74" width="24" height="24" rx="11" fill="#a37f56" />
            <path d="M60 94 L70 94 L65 103 Z" fill="#f59e0b" />
          </g>

          {/* หนังสือเปิดตรงหน้า */}
          <path d="M33 122 L65 129 L65 137 L33 130 Z" fill="#4a78c2" />
          <path d="M65 129 L97 122 L97 130 L65 137 Z" fill="#5b8ad6" />
          <path d="M36 119 Q51 116 65 124 L65 132 Q51 125 36 127 Z" fill="#ffffff" />
          <path d="M65 124 Q79 116 94 119 L94 127 Q79 125 65 132 Z" fill="#ffffff" />
          <path
            className="owl-page"
            d="M65 124 Q79 116 94 119 L94 127 Q79 125 65 132 Z"
            fill="#f4f7fb"
            stroke="#d6dde8"
            strokeWidth="0.8"
          />

          {/* ปีกวางบนหนังสือ */}
          <path d="M32 94 Q22 116 40 125 Q45 110 38 96 Z" fill="#8a6a45" />
          <path d="M98 94 Q108 116 90 125 Q85 110 92 96 Z" fill="#8a6a45" />
        </g>
      </svg>
    </div>
  );
}
