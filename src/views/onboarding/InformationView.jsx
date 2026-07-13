// ─── views/onboarding/InformationView.jsx ───────────────────────────────────
// InformationForm page — UI only, ใช้ useInformationViewModel สำหรับ logic
// ─────────────────────────────────────────────────────────────────────────────
import { useInformationViewModel } from '../../viewModels/useInformationViewModel';
import { GOALS } from '../../models/mockData';
import { EXP_DATA, GROUP_LABELS } from '../../models/skillModel';
import { FACULTY_BY_EDU, MAJOR_MAP, YEAR_BY_EDU, CAMPUSES, STEPS, STEP_LABELS, TOTAL_STEPS } from '../../models/branchModel';
import '../../component/decorate/InformationForm.css';

export default function InformationView() {
  const {
    step, isShaking, toast, progressPct,
    formData, selectedGoal, exp,
    showSelectBranch, selectedBranchId, newBranchIds, branches,
    setFormData, setSelectedGoal, setExp,
    setSelectedBranchId, setShowSelectBranch,
    handleNext, handlePrev, handleBranchConfirm,
  } = useInformationViewModel();

  const goalsByGroup = GOALS.reduce((acc, g) => {
    if (!acc[g.group]) acc[g.group] = [];
    acc[g.group].push(g);
    return acc;
  }, {});

  const currentExpData = EXP_DATA[exp];

  return (
    <div style={{ position: 'relative' }}>
      <div className="bg" /><div className="bg-grid" />
      <div className="orb orb-1" /><div className="orb orb-2" />

      <main className="page">
        {/* Progress Bar */}
        <div className="progress-wrap">
          <div className="progress-steps">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isDone   = stepNum < step;
              return (
                <div key={i} className={`step-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="step-dot">{isDone ? '✓' : stepNum}</div>
                  <div className="step-label">{label}</div>
                </div>
              );
            })}
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>

        {/* Card */}
        <div className={`card ${isShaking ? 'shake' : ''}`}>
          <div className="card-header">
            <div className="step-title">
              {step === 4 ? 'พร้อมแล้ว!' : step === 3
                ? `ประสบการณ์ด้าน ${branches.find(b => b.id === selectedBranchId)?.goalName || 'Goal ที่เลือก'}`
                : STEPS[step - 1].title}
            </div>
            <div className="step-sub">
              {step === 4 ? 'กดปุ่มด้านล่างเมื่อพร้อมเริ่มทำ Pretest' : STEPS[step - 1].sub}
            </div>
          </div>

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <div className="panel active">
              <div className="field">
                <label>วิทยาเขต</label>
                <div className="select-wrap">
                  <select value={formData.campus} onChange={e => setFormData({ ...formData, campus: e.target.value })}>
                    <option value="" disabled>เลือกวิทยาเขต...</option>
                    {CAMPUSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div>
                  <label>คณะ</label>
                  <div className="select-wrap">
                    <select value={formData.faculty}
                      onChange={e => setFormData({ ...formData, faculty: e.target.value, major: '' })}
                      disabled={!formData.campus}>
                      <option value="" disabled>เลือกคณะ...</option>
                      {FACULTY_BY_EDU['bachelor'].map(f => <option key={f.v} value={f.v}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label>สาขาวิชา</label>
                  <div className="select-wrap">
                    <select value={formData.major}
                      onChange={e => setFormData({ ...formData, major: e.target.value })}
                      disabled={!formData.faculty}>
                      <option value="" disabled>เลือกสาขา...</option>
                      {formData.faculty && MAJOR_MAP[formData.faculty]?.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="field-row" style={{ justifyContent: 'center' }}>
                <div>
                  <label>ชั้นปี / ปีการศึกษา</label>
                  <div className="select-wrap">
                    <select value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })}>
                      <option value="" disabled>เลือกชั้นปี...</option>
                      {YEAR_BY_EDU['bachelor'].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 2 && (
            <div className="panel active">
              <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--muted, #94a3b8)', marginBottom: '12px' }}>
                💡 สามารถเพิ่มสายการเรียนใหม่ได้ภายในแอปภายหลัง
              </p>
              {Object.entries(goalsByGroup).map(([group, goals]) => (
                <div key={group} style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--muted, #94a3b8)', marginBottom: '8px', letterSpacing: '0.05em' }}>
                    {GROUP_LABELS[group] || group}
                  </div>
                  <div className="goal-grid">
                    {goals.map(g => (
                      <div key={g.id}
                        className={`goal-card ${selectedGoal.includes(g.id) ? 'selected' : ''}`}
                        onClick={() => setSelectedGoal(prev =>
                          prev.includes(g.id) ? prev.filter(id => id !== g.id) : [...prev, g.id]
                        )}>
                        <div className="goal-check">✓</div>
                        <div className="goal-card-inner">
                          <div className="goal-icon">{g.icon}</div>
                          <div className="goal-name">{g.name}</div>
                          <div className="goal-desc">{g.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ STEP 3 ═══ */}
          {step === 3 && (
            <div className="panel active">
              <div className="field">
                <label>ระดับประสบการณ์เกี่ยวกับ Goal: <strong>
                  {branches.find(b => b.id === (selectedBranchId || branches[branches.length - 1]?.id))?.goalName || 'ที่เลือก'}
                </strong></label>
                <div className="slider-wrap">
                  <div className="slider-track-wrap">
                    <input type="range" min="1" max="5" value={exp}
                      onChange={e => setExp(Number(e.target.value))}
                      style={{ '--pct': `${((exp - 1) / 4) * 100}%` }} />
                  </div>
                  <div className="slider-labels">
                    <span>มือใหม่</span><span>เริ่มต้น</span><span>กลาง</span>
                    <span>ก้าวหน้า</span><span>เชี่ยวชาญ</span>
                  </div>
                </div>
                <div className="exp-card" style={{ borderLeftColor: currentExpData.color }}>
                  <div className="exp-level" style={{ color: currentExpData.color }}>{currentExpData.level}</div>
                  <div className="exp-title">{currentExpData.title}</div>
                  <div className="exp-desc">{currentExpData.desc}</div>
                  <div className="exp-badges">
                    {currentExpData.badges.map((b, i) => <span key={i} className="badge">{b}</span>)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 4 ═══ */}
          {step === 4 && (
            <div className="panel active" style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                คุณกรอกข้อมูลครบถ้วนแล้ว<br />
                ระบบพร้อมประเมินความรู้เบื้องต้นของคุณผ่าน Pretest
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="card-footer-btns">
            <button className="btn-back" onClick={handlePrev} disabled={step === 1}>← Back</button>
            <span className="step-counter">{step} / {TOTAL_STEPS}</span>
            <button className="btn-next" onClick={handleNext}>
              <span>{step === 3 ? 'เริ่ม Pretest' : step === 4 ? 'เริ่ม Pretest' : 'Next'}</span>
              <svg className="btn-next-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </main>

      {/* Toast */}
      <div style={{
        position: 'fixed', bottom: '30px', left: '50%',
        transform: toast.show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
        opacity: toast.show ? 1 : 0,
        background: '#ffffff', color: '#e11d48',
        padding: '12px 24px', borderRadius: '99px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 2000, pointerEvents: 'none',
        border: '1px solid #ffe4e6',
      }}>
        ⚠️ {toast.msg}
      </div>

      {/* Branch selector modal */}
      {showSelectBranch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '32px 28px', maxWidth: '480px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⚡</div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>เลือกหัวข้อที่จะทำ Pretest</h2>
              <p style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>เลือก 1 สายการเรียนเพื่อเริ่ม Pretest</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {branches.filter(b => newBranchIds.includes(b.id)).map(branch => {
                const isActive = branch.id === selectedBranchId;
                return (
                  <div key={branch.id} onClick={() => setSelectedBranchId(branch.id)} style={{
                    border: `2px solid ${isActive ? '#0047AB' : '#e2e8f0'}`,
                    borderRadius: '14px', padding: '14px 18px', cursor: 'pointer',
                    background: isActive ? 'rgba(0,71,171,0.06)' : '#f8fafc',
                    display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: '24px', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: '10px', flexShrink: 0 }}>
                      {branch.goalIcon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '14px' }}>{branch.goalName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{branch.campus} · {branch.major} · {branch.year}</div>
                    </div>
                    {isActive && <div style={{ fontSize: '11px', fontWeight: '700', color: '#0047AB', background: 'rgba(0,71,171,0.1)', padding: '4px 10px', borderRadius: '99px' }}>✓ เลือกอยู่</div>}
                  </div>
                );
              })}
            </div>
            <button onClick={handleBranchConfirm} disabled={!selectedBranchId} style={{
              width: '100%', padding: '14px',
              background: selectedBranchId ? 'linear-gradient(135deg, #0056d6, #0047AB)' : '#e2e8f0',
              color: selectedBranchId ? '#fff' : '#94a3b8',
              border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700',
              cursor: selectedBranchId ? 'pointer' : 'not-allowed',
            }}>
              {selectedBranchId ? 'Next->' : 'กรุณาเลือกหัวข้อก่อน'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
