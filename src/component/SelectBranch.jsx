import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function SelectBranch() {
  const { branches, activeBranchId, switchBranch } = useApp();
  const navigate = useNavigate();

  function handleSelect(branchId) {
    switchBranch(branchId);
    navigate('/home');
  }

  return (
    <>
      {/* ใช้ bg style เดียวกับหน้าอื่น */}
      <div className="bg-layer" style={{ position: 'fixed', inset: 0, background: 'var(--bg, #0a0f1e)', zIndex: 0 }} />

      <main style={{ position: 'relative', zIndex: 1, maxWidth: '560px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚡</div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#f1f5f9', margin: 0 }}>เลือกสายการเรียน</h1>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
            💡 สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปนี้
          </p>
        </div>

        {/* Branch list */}
        {branches.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: '#64748b' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p>ยังไม่มีสายการเรียน</p>
            <p style={{ fontSize: '13px' }}>กด "เพิ่มสายการเรียน" เพื่อเริ่มต้น</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
            {branches.map(branch => {
              const isActive = branch.id === activeBranchId;
              return (
                <div
                  key={branch.id}
                  onClick={() => handleSelect(branch.id)}
                  style={{
                    border: `2px solid ${isActive ? '#0047AB' : '#1e293b'}`,
                    borderRadius: '14px',
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0,71,171,0.12)' : 'rgba(255,255,255,0.04)',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                  }}
                >
                  {/* Goal icon */}
                  <div style={{
                    fontSize: '28px', width: '48px', height: '48px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.06)', borderRadius: '10px', flexShrink: 0,
                  }}>
                    {branch.goalIcon}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: '700', color: '#080808', fontSize: '15px' }}>
                      {branch.goalName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      {branch.campus} · {branch.major} · {branch.year}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      ⭐ Level {branch.level} · ✨ {branch.xp} XP
                    </div>
                  </div>

                  {/* Active badge */}
                  {isActive && (
                    <div style={{
                      fontSize: '11px', fontWeight: '700', color: '#0047AB',
                      background: 'rgba(0,71,171,0.15)', padding: '4px 10px',
                      borderRadius: '99px', flexShrink: 0,
                    }}>
                      ✅ ใช้งานอยู่
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ปุ่มเพิ่ม branch ใหม่ */}
        <button
          onClick={() => navigate('/information')}
          style={{
            width: '100%', padding: '14px',
            border: '2px dashed #334155', borderRadius: '14px',
            background: 'transparent', color: '#64748b',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#0047AB'; e.target.style.color = '#60a5fa'; }}
          onMouseLeave={e => { e.target.style.borderColor = '#334155'; e.target.style.color = '#64748b'; }}
        >
          + เพิ่มสายการเรียนใหม่
        </button>
      </main>
    </>
  );
}
