// ─── views/auth/GetStartView.jsx ────────────────────────────────────────────
// Landing page — UI only (no logic)
// Logic: src/viewModels/useGetStartViewModel.jsx (ยังไม่จำเป็น — simple)
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../component/decorate/GetStart.css';

export default function GetStartView() {
  const navigate   = useNavigate();
  const [stars, setStars]           = useState([]);
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    const generatedStars = Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      size:     Math.random() * 2 + 1,
      top:      Math.random() * 100,
      left:     Math.random() * 100,
      duration: 2.5 + Math.random() * 4,
      delay:    -Math.random() * 5,
      opacity:  0.05 + Math.random() * 0.2,
    }));
    setStars(generatedStars);
  }, []);

  const handleStart = e => {
    e.preventDefault();
    setIsStarting(true);
    setTimeout(() => navigate('/information'), 320);
  };

  return (
    <>
      <div className="bg" /><div className="bg-grid" />
      <div className="orb orb-1" /><div className="orb orb-2" />
      <div className="orb orb-3" /><div className="orb orb-4" />

      <div className="stars">
        {stars.map(s => (
          <div key={s.id} className="star" style={{
            width: `${s.size}px`, height: `${s.size}px`,
            top: `${s.top}%`, left: `${s.left}%`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`, opacity: s.opacity,
          }} />
        ))}
      </div>

      <div className="corner corner-tl" /><div className="corner corner-tr" />
      <div className="corner corner-bl" /><div className="corner corner-br" />

      <main className="page">
        <div className="icon-wrap">
          <div className="icon-ring"><span className="icon-inner">⚡</span></div>
        </div>
        <div className="eyebrow">G06</div>
        <h1 className="title">Adaptive Exercise <br />based on User Profiles</h1>
        <p className="subtitle-line">Personalized · Intelligent · Adaptive</p>
        <div className="sep" />
        <p className="desc">
          ระบบการเรียนรู้อัจฉริยะที่ปรับตัวตามระดับความรู้ของคุณ<br />
          เพื่อการเรียนรู้ที่มีประสิทธิภาพและเหมาะสมที่สุด
        </p>
        <div className="btn-wrap">
          <a href="#" className="btn-start" onClick={handleStart}>
            <span className="btn-label">Get Started</span>
            <div className="btn-arrow">→</div>
          </a>
        </div>
      </main>
    </>
  );
}
