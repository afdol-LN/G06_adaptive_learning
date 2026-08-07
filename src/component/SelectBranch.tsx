import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import '../component/decorate/SelectBranch.css';

type RefMap = { [id: string]: React.RefObject<HTMLDivElement> };

const NAV_DELAY = 380;

export default function SelectBranch() {
  const { branches, activeBranchId, userProfile, switchBranch, fetchMyBranches } = useApp();
  const navigate = useNavigate();
  const toast = useToast();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('sb-theme') === 'dark');
  const [rippleId, setRippleId] = useState<string | null>(null);
  const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroSheenRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<RefMap>({});
  const sheenRefs = useRef<RefMap>({});
  const rippleTimer = useRef<ReturnType<typeof setTimeout>>();
  const navTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetchMyBranches().finally(() => setHasLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearTimeout(rippleTimer.current);
      clearTimeout(navTimer.current);
    };
  }, []);

  function getRef(map: React.MutableRefObject<RefMap>, id: string) {
    if (!map.current[id]) map.current[id] = React.createRef();
    return map.current[id];
  }

  function sheenMove(
    cardRef: React.RefObject<HTMLDivElement>,
    sheenRef: React.RefObject<HTMLDivElement>,
    e: React.MouseEvent,
  ) {
    const card = cardRef.current;
    const sheen = sheenRef.current;
    if (!card || !sheen) return;
    const r = card.getBoundingClientRect();
    sheen.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0)`;
    sheen.style.opacity = '1';
  }

  function sheenOut(sheenRef: React.RefObject<HTMLDivElement>) {
    if (sheenRef.current) sheenRef.current.style.opacity = '0';
  }

  function toggleTheme() {
    setDark((d) => {
      localStorage.setItem('sb-theme', d ? 'light' : 'dark');
      return !d;
    });
  }

  function handleLogout() {
    toast.normal('ออกจากระบบแล้ว');
    clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => {
      localStorage.clear();
      navigate('/');
    }, NAV_DELAY);
  }

  function handleAddBranch() {
    toast.normal('เปิดหน้าสร้าง Branch ใหม่');
    clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => {
      navigate('/information', { state: { skipGeneralInfo: true } });
    }, NAV_DELAY);
  }

  function handleSelect(branch: any, e: React.MouseEvent<HTMLButtonElement>) {
    const cardEl = cardRefs.current[branch.id]?.current;
    if (cardEl) {
      const r = cardEl.getBoundingClientRect();
      setRipplePos({ x: e.clientX - r.left, y: e.clientY - r.top });
    }
    setRippleId(branch.id);
    clearTimeout(rippleTimer.current);
    rippleTimer.current = setTimeout(
      () => setRippleId((id) => (id === branch.id ? null : id)),
      620,
    );

    switchBranch(branch.id);
    toast.success(`เข้าสู่ "${branch.goalName || 'สายการเรียน'}"`);
    clearTimeout(navTimer.current);
    navTimer.current = setTimeout(() => {
      navigate(branch.isAlreadyPretest ? '/home' : '/pretest');
    }, NAV_DELAY);
  }

  function scrollRail(dir: number) {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: dir * Math.max(280, rail.clientWidth * 0.55), behavior: 'smooth' });
  }

  const profileFullname = [userProfile?.fname, userProfile?.lname].filter(Boolean).join(' ');
  const fullname = profileFullname || localStorage.getItem('fullname') || '';
  const username = userProfile?.username || '';
  const initial = (userProfile?.fname || fullname || '?').charAt(0).toUpperCase();

  return (
    <div className={`sb2-root${dark ? ' dark' : ''}`} data-screen-label="Select Branch v2">
      <div className="sb2-shell">
        <div className="sb2-topbar">
          <div className="sb2-pill sb2-titlepill">
            <div className="sb2-badge-icon">⎇</div>
            <div className="sb2-title">Select Branch</div>
          </div>

          <div className="sb2-pill sb2-userpill">
            <div className="sb2-avatar">{initial}</div>
            <div className="sb2-usertext">
              <div className="sb2-fullname">{fullname || 'ผู้ใช้งาน'}</div>
              {username && <div className="sb2-username">@{username}</div>}
            </div>
          </div>

          <div className="sb2-topbar-actions">
            <button type="button" className="sb2-theme-btn" onClick={toggleTheme}>
              {dark ? 'Light ☀' : 'Dark ☾'}
            </button>
            <button type="button" className="sb2-logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>

        <div
          ref={heroRef}
          className="sb2-hero"
          onMouseMove={(e) => sheenMove(heroRef, heroSheenRef, e)}
          onMouseLeave={() => sheenOut(heroSheenRef)}
        >
          <div ref={heroSheenRef} className="sb2-sheen" />
          <div className="sb2-hero-text">
            เลือก Branch การเรียนของท่าน
            <br />
            หรือ สร้างใหม่
          </div>
          <button type="button" className="sb2-add-btn" onClick={handleAddBranch}>
            <span className="sb2-add-icon">＋</span>
            <span>Add new branch</span>
          </button>
        </div>

        <div className="sb2-listbar">
          <div className="sb2-listbar-label">
            Branch ของท่าน : <span className="sb2-listbar-count">{branches.length} รายการ</span>
          </div>
          <div className="sb2-scrollbtns">
            <button
              type="button"
              aria-label="ก่อนหน้า"
              className="sb2-scrollbtn prev"
              onClick={() => scrollRail(-1)}
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="ถัดไป"
              className="sb2-scrollbtn next"
              onClick={() => scrollRail(1)}
            >
              ›
            </button>
          </div>
        </div>

        {!hasLoaded ? (
          <div className="sb2-empty">
            <p>กำลังโหลดสายการเรียน...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="sb2-empty">
            <div className="sb2-empty-icon">📭</div>
            <p>ยังไม่มีสายการเรียน</p>
            <p className="sb2-empty-sub">กด "Add new branch" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div ref={railRef} className="sb2-rail">
            {branches.map((b: any) => {
              const isActive = b.id === activeBranchId;
              const cardRef = getRef(cardRefs, b.id);
              const sheenRef = getRef(sheenRefs, b.id);
              const sessionsCount = Array.isArray(b.sessions) ? b.sessions.length : 0;
              return (
                <div
                  key={b.id}
                  ref={cardRef}
                  className={`sb2-card${isActive ? ' active' : ''}`}
                  onMouseMove={(e) => sheenMove(cardRef, sheenRef, e)}
                  onMouseLeave={() => sheenOut(sheenRef)}
                >
                  <div className="sb2-card-inner">
                    <div ref={sheenRef} className="sb2-sheen" />
                    {rippleId === b.id && (
                      <span
                        className="sb2-ripple"
                        style={{ left: ripplePos.x, top: ripplePos.y }}
                      />
                    )}
                    {isActive && <div className="sb2-active-badge">ใช้งานอยู่</div>}

                    <div className="sb2-goalname">{b.goalName || 'ไม่ทราบชื่อเป้าหมาย'}</div>

                    <div className="sb2-stats-row">
                      <div className="sb2-stat">
                        <span className="sb2-stat-value">{sessionsCount}</span>
                        <span>sessions ที่ทำ</span>
                      </div>
                      <div className="sb2-stat sb2-streak">{b.streak ?? 0} 🔥</div>
                    </div>

                    <div className="sb2-desc">{b.goalDesc || '—'}</div>

                    <div className="sb2-footer-row">
                      <div className={`sb2-status-badge${b.isAlreadyPretest ? ' done' : ''}`}>
                        {b.isAlreadyPretest ? 'prestest : ทำแล้ว' : 'prestest : ยังไม่ทำ'}
                      </div>
                      <button
                        type="button"
                        className="sb2-select-btn"
                        onClick={(e) => handleSelect(b, e)}
                      >
                        <span>เลือก</span>
                        <span className="sb2-select-arrow">→</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
