import { useEffect, useState, type KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import type { IconType } from 'react-icons';
import {
  FaArrowRight,
  FaBullseye,
  FaChartLine,
  FaChevronLeft,
  FaChevronRight,
  FaClipboardCheck,
  FaRightFromBracket,
  FaUserPen,
} from 'react-icons/fa6';
import './decorate/GetStart.css';
import AppLogo from './common/AppLogo';
import LogoutButton from './common/LogoutButton';
import { usePreferences } from '../context/PreferencesContext';
import type { TKey } from '../i18n';

interface Star {
  id: number;
  size: number;
  top: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
}

interface Slide {
  icon: IconType;
  titleKey: TKey;
  descKey: TKey;
  // รูปประกอบสไลด์ (ไม่บังคับ) — ถ้าใส่จะแสดงแทนไอคอน
  // ใส่รูปไว้ที่ src/assets/getstart/ แล้ว import เข้ามา เช่น
  //   import stepGoalImg from '../assets/getstart/step-goal.png';
  //   { icon: FaUserPen, image: stepGoalImg, titleKey: ..., descKey: ... }
  image?: string;
}

// สไลด์แนะนำระบบ: เป้าหมายของระบบ แล้วตามด้วยขั้นตอนการใช้งานตามลำดับจริง (information → pretest → ฝึก)
const SLIDES: Slide[] = [
  { icon: FaBullseye, titleKey: 'getStart.s1.title', descKey: 'getStart.s1.desc' },
  { icon: FaUserPen, titleKey: 'getStart.s2.title', descKey: 'getStart.s2.desc' },
  { icon: FaClipboardCheck, titleKey: 'getStart.s3.title', descKey: 'getStart.s3.desc' },
  { icon: FaChartLine, titleKey: 'getStart.s4.title', descKey: 'getStart.s4.desc' },
];

export default function GetStart() {
  const navigate = useNavigate();
  const { t } = usePreferences();
  const [stars, setStars] = useState<Star[]>([]);
  const [isStarting, setIsStarting] = useState(false);
  const [current, setCurrent] = useState(0);

  // Generate stars on mount
  useEffect(() => {
    const generatedStars = Array.from({ length: 55 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: 2.5 + Math.random() * 4,
      delay: -Math.random() * 5,
      opacity: 0.05 + Math.random() * 0.2,
    }));
    setStars(generatedStars);
  }, []);

  const goTo = (index: number) => setCurrent((index + SLIDES.length) % SLIDES.length);

  const handleCarouselKey = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  };

  const handleStart = () => {
    setIsStarting(true);
    // หน่วงให้ animation ของปุ่มเล่นจบก่อนเปลี่ยนหน้า
    setTimeout(() => navigate('/information'), 320);
  };

  return (
    <>
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      <div className="orb orb-4"></div>

      <div className="stars">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              width: `${s.size}px`,
              height: `${s.size}px`,
              top: `${s.top}%`,
              left: `${s.left}%`,
              animationDuration: `${s.duration}s`,
              animationDelay: `${s.delay}s`,
              opacity: s.opacity,
            }}
          ></div>
        ))}
      </div>

      <main className="page">
        <div className="gs-shell">
          {/* Icon and system name */}
          <header className="gs-header">
            <span className="gs-logo"><AppLogo /></span>
            <div className="gs-header-text">
              <h1 className="gs-title">{t('getStart.systemName')}</h1>
              <p className="gs-tagline">{t('getStart.tagline')}</p>
            </div>
          </header>

          {/* Carousel: เป้าหมายของระบบ + วิธีใช้งาน */}
          <section
            className="gs-carousel"
            aria-roledescription="carousel"
            aria-label={t('getStart.carousel')}
            tabIndex={0}
            onKeyDown={handleCarouselKey}
          >
            <button
              type="button"
              className="gs-nav gs-nav-prev"
              onClick={() => goTo(current - 1)}
              aria-label={t('getStart.prev')}
              title={t('getStart.prev')}
            >
              <FaChevronLeft aria-hidden />
            </button>

            <div className="gs-viewport">
              <div className="gs-track" style={{ transform: `translateX(-${current * 100}%)` }}>
                {SLIDES.map((slide, i) => {
                  const Icon = slide.icon;
                  return (
                    <div
                      key={slide.titleKey}
                      className="gs-slide"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={t('getStart.slide', { n: i + 1, total: SLIDES.length })}
                      aria-hidden={i !== current}
                    >
                      {slide.image ? (
                        // รูปเป็นภาพประกอบ ข้อความของสไลด์อธิบายไว้แล้ว จึงใช้ alt ว่าง
                        <span className="gs-slide-media">
                          <img src={slide.image} alt="" draggable={false} />
                        </span>
                      ) : (
                        <span className="gs-slide-icon"><Icon aria-hidden /></span>
                      )}
                      <h2 className="gs-slide-title">{t(slide.titleKey)}</h2>
                      <p className="gs-slide-desc">{t(slide.descKey)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className="gs-nav gs-nav-next"
              onClick={() => goTo(current + 1)}
              aria-label={t('getStart.next')}
              title={t('getStart.next')}
            >
              <FaChevronRight aria-hidden />
            </button>

            <div className="gs-dots">
              {SLIDES.map((slide, i) => (
                <button
                  key={slide.titleKey}
                  type="button"
                  className={`gs-dot${i === current ? ' is-active' : ''}`}
                  onClick={() => goTo(i)}
                  aria-label={t('getStart.slide', { n: i + 1, total: SLIDES.length })}
                  aria-current={i === current}
                />
              ))}
            </div>
          </section>

          {/* Exit / Start */}
          <div className="gs-actions">
            <LogoutButton className="gs-btn gs-btn-exit">
              <FaRightFromBracket aria-hidden />
              {t('getStart.exit')}
            </LogoutButton>
            <button
              type="button"
              className={`gs-btn gs-btn-start${isStarting ? ' is-starting' : ''}`}
              onClick={handleStart}
              disabled={isStarting}
            >
              {t('getStart.start')}
              <FaArrowRight aria-hidden className="gs-btn-arrow" />
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
