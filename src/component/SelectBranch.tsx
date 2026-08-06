import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import '../component/decorate/SelectBranch.css';

export default function SelectBranch() {
  const { branches, activeBranchId, switchBranch, fetchMyBranches } = useApp();
  const navigate = useNavigate();
  const [hasLoaded, setHasLoaded] = useState(false);
  const fullname = localStorage.getItem('fullname') || '';

  useEffect(() => {
    fetchMyBranches().finally(() => setHasLoaded(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSelect(branchId: string | number) {
    switchBranch(branchId);
    const branch = branches.find((b) => String(b.id) === String(branchId));
    if (branch?.isAlreadyPretest) {
      navigate('/home');
    } else {
      navigate('/pretest');
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="page">
        <div className="sb-header">
          <div className="sb-icon">⚡</div>
          <h1 className="sb-title">เลือกสายการเรียน</h1>
          {fullname && <p className="sb-fullname">{fullname}</p>}
          <p className="sb-hint">💡 สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปนี้</p>
        </div>

        {!hasLoaded ? (
          <div className="sb-empty">
            <p>กำลังโหลดสายการเรียน...</p>
          </div>
        ) : branches.length === 0 ? (
          <div className="sb-empty">
            <div className="sb-empty-icon">📭</div>
            <p>ยังไม่มีสายการเรียน</p>
            <p className="sb-empty-sub">กด "เพิ่มสายการเรียนใหม่" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div className="branch-list">
            {branches.map((branch) => {
              const isActive = branch.id === activeBranchId;
              return (
                <div
                  key={branch.id}
                  className={`branch-card${isActive ? ' active' : ''}`}
                  onClick={() => handleSelect(branch.id)}
                >
                  <div className="branch-card-inner">
                    <div className="branch-name">{branch.goalName || 'ไม่ทราบชื่อเป้าหมาย'}</div>
                    {branch.goalDesc && <div className="branch-desc">{branch.goalDesc}</div>}
                    <span
                      className={`branch-status-badge${branch.isAlreadyPretest ? ' done' : ''}`}
                    >
                      {branch.isAlreadyPretest ? '✅ ทำ Pretest แล้ว' : '📝 ยังไม่ทำ Pretest'}
                    </span>
                  </div>
                  {isActive && <div className="branch-active-badge">ใช้งานอยู่</div>}
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          className="branch-add-btn"
          onClick={() => navigate('/information', { state: { skipGeneralInfo: true } })}
        >
          + เพิ่มสายการเรียนใหม่
        </button>
      </main>
    </div>
  );
}
