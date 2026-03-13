import React, { useState } from 'react';
import './decorate/InformationForm.css';
import { useNavigate } from 'react-router-dom';

// ─── DATA ───
const STEPS = [
  { title: 'ข้อมูลทั่วไป', sub: 'กรอกข้อมูลของคุณเพื่อปรับหลักสูตรให้เหมาะสม' },
  { title: 'เลือกเนื้อที่ต้องการเรียนรู้', sub: 'เลือกสิ่งที่คุณต้องการเรียนรู้จากระบบนี้' },
  { title: 'ประสบการณ์ด้านเนื้อหาที่เลือก', sub: 'บอกระดับประสบการณ์ต่อเนื้อหาที่เลือก' },
];

const FACULTY_BY_EDU = {
  bachelor: [
    { v: 'tech', label: 'เทคโนโลยีและสิ่งแวดล้อม' },
    { v: 'sci', label: 'วิทยาศาสตร์' },
    { v: 'eng', label: 'วิศวกรรมศาสตร์' },
    { v: 'bus', label: 'บริหารธุรกิจ' },
  ],
  master: [
    { v: 'tech_g', label: 'เทคโนโลยีและสิ่งแวดล้อม (บัณฑิต)' },
    { v: 'sci_g', label: 'วิทยาศาสตร์ (บัณฑิต)' },
    { v: 'bus_g', label: 'บริหารธุรกิจ (บัณฑิต)' },
  ],
  phd: [
    { v: 'tech_d', label: 'เทคโนโลยีและสิ่งแวดล้อม (ดุษฎีบัณฑิต)' },
    { v: 'sci_d', label: 'วิทยาศาสตร์ (ดุษฎีบัณฑิต)' },
  ],
};

const MAJOR_MAP = {
  tech: ['เทคโนโลยีสารสนเทศ (ICT)', 'วิทยาการคอมพิวเตอร์', 'เทคโนโลยีสิ่งแวดล้อม'],
  sci: ['คณิตศาสตร์', 'ฟิสิกส์', 'เคมี', 'ชีววิทยา', 'สถิติ'],
  eng: ['วิศวกรรมคอมพิวเตอร์', 'วิศวกรรมไฟฟ้า', 'วิศวกรรมโยธา'],
  bus: ['บริหารธุรกิจ', 'การตลาด', 'การเงิน', 'บัญชี'],
  tech_g: ['วิทยาการคอมพิวเตอร์และสารสนเทศ', 'เทคโนโลยีสิ่งแวดล้อม (ป.โท)'],
  sci_g: ['คณิตศาสตร์ประยุกต์', 'วิทยาศาสตร์สิ่งแวดล้อม'],
  bus_g: ['บริหารธุรกิจมหาบัณฑิต (MBA)', 'การจัดการ'],
  tech_d: ['วิทยาการคอมพิวเตอร์และสารสนเทศ (ป.เอก)'],
  sci_d: ['คณิตศาสตร์ (ป.เอก)', 'วิทยาศาสตร์สิ่งแวดล้อม (ป.เอก)'],
};

const YEAR_BY_EDU = {
  bachelor: ['ปีที่ 1', 'ปีที่ 2', 'ปีที่ 3', 'ปีที่ 4', 'ปีที่ 5 (ขึ้นไป)'],
  master: ['ปีที่ 1', 'ปีที่ 2', 'ปีที่ 3 (ขึ้นไป)'],
  phd: ['ปีที่ 1', 'ปีที่ 2', 'ปีที่ 3', 'ปีที่ 4 (ขึ้นไป)'],
};

const GOALS = [
  { id: 'g1', icon: '💻', name: 'Software Developer', desc: 'พัฒนาแอปและระบบซอฟต์แวร์' },
  { id: 'g2', icon: '📊', name: 'Data Analyst', desc: 'วิเคราะห์ข้อมูลด้วย Python & Pandas' },
  { id: 'g3', icon: '🧱', name: 'Data Structures', desc: 'โครงสร้างข้อมูลและอัลกอริทึม' },
  { id: 'g4', icon: '🤖', name: 'Machine Learning', desc: 'สร้างโมเดล ML เบื้องต้น' },
  { id: 'g5', icon: '🌐', name: 'Web Automation', desc: 'Scraping, API & automation' },
  { id: 'g6', icon: '🔐', name: 'Cybersecurity', desc: 'Python สำหรับ security & crypto' },
];

const EXP_DATA = {
  1: { level: 'Level 1 — Novice', title: 'มือใหม่หัดเขียนโค้ด', desc: 'เพิ่งเริ่มต้นศึกษาการเขียนโปรแกรม อาจเคยเห็นโค้ดบ้างแต่ยังไม่มีประสบการณ์จริง', badges: ['ยังไม่มีประสบการณ์', 'เรียนครั้งแรก'], color: '#e05c5c' },
  2: { level: 'Level 2 — Beginner', title: 'เริ่มต้นเขียนโปรแกรม', desc: 'เคยเรียน Python เบื้องต้นมาบ้าง รู้จัก variable, loop, if-else แต่ยังไม่มั่นใจในการเขียนฟังก์ชัน', badges: ['Variables', 'Loops', 'Conditions'], color: '#e8a03c' },
  3: { level: 'Level 3 — Intermediate', title: 'เขียนโปรแกรมได้บ้าง', desc: 'เขียน Python ได้คล่องพอสมควร เข้าใจ OOP, function, list/dict และเคยทำโปรเจกต์ขนาดเล็กมาแล้ว', badges: ['OOP', 'Functions', 'Data Structures'], color: '#0047AB' },
  4: { level: 'Level 4 — Advanced', title: 'เขียนโปรแกรมได้ดี', desc: 'มีประสบการณ์การเขียน Python อย่างจริงจัง เข้าใจ algorithms, complexity และทำงานกับ library ต่างๆ ได้', badges: ['Algorithms', 'Libraries', 'Complexity'], color: '#82C8E5' },
  5: { level: 'Level 5 — Expert', title: 'เชี่ยวชาญการเขียนโปรแกรม', desc: 'เขียน Python ขั้นสูงได้อย่างคล่องแคล่ว มีประสบการณ์ real-world, open source หรือทำงานมาแล้ว', badges: ['Advanced Python', 'Real-world', 'Professional'], color: '#38b874' },
};

export default function InformationForm() {
  const [step, setStep] = useState(1);
  const [isShaking, setIsShaking] = useState(false);
  //navigate
  const navigate = useNavigate();
  // Form State
  const [formData, setFormData] = useState({ edu: 'bachelor', year: '', campus: '', faculty: '', major: '' });
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [exp, setExp] = useState(1);
  const [toast, setToast] = useState({ show: false, msg: '' });

  const progressPct = ((step - 1) / STEPS.length) * 100;
  const currentExpData = EXP_DATA[exp];

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const showNotice = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const validateStep = () => {
    if (step === 1) {
      const { edu, year, campus, faculty, major } = formData;
      if (!edu || !year || !campus || !faculty || !major) {
        triggerShake();
        showNotice('กรุณากรอกข้อมูลให้ครบถ้วน');
        return false;
      }
    }
    if (step === 2 && !selectedGoal) {
      triggerShake();
      showNotice('กรุณาเลือกเนื้อที่ต้องการเรียนรู้');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      // alert('ไปหน้า Pretest!');
      navigate('/pretest');
      // window.location.href = '/pretest';
      console.log('Submitting data:', { formData, selectedGoal, exp });
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

 
  return (
    <>
      
      <div className="bg"></div>
      <div className="bg-grid"></div>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      <main className="page">
        {/* Brand
        <div className="brand" style={{ width: '100%', maxWidth: '620px' }}>
          <div className="brand-icon">⚡</div>
          <span className="brand-name">PSU · ALS</span>
        </div> */}

        {/* Progress Bar */}
        <div className="progress-wrap">
          <div className="progress-steps">
            {STEPS.map((s, i) => {
              const stepNum = i + 1;
              const isActive = stepNum === step;
              const isDone = stepNum < step;
              return (
                <div key={i} className={`step-node ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                  <div className="step-dot">{isDone ? '✓' : stepNum}</div>
                  <div className="step-label">{['ข้อมูล', 'เป้าหมาย', 'ประสบการณ์'][i]}</div>
                </div>
              );
            })}
          </div>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }}></div>
          </div>
        </div>

        {/* Card */}
        <div className={`card ${isShaking ? 'shake' : ''}`}>
          <div className="card-header">
            <div className="step-title">{STEPS[step - 1].title}</div>
            <div className="step-sub">{STEPS[step - 1].sub}</div>
          </div>

          {/* ═══ STEP 1 ═══ */}
          {step === 1 && (
            <div className="panel active">
              <div className="field">
                <label>วิทยาเขต</label>
                <div className="select-wrap">
                  <select value={formData.campus} onChange={(e) => setFormData({ ...formData, campus: e.target.value })}>
                    <option value="" disabled>เลือกวิทยาเขต...</option>
                    <option>หาดใหญ่</option>
                    <option>ปัตตานี</option>
                    <option>ภูเก็ต</option>
                    <option>สุราษฎร์ธานี</option>
                    <option>ตรัง</option>
                  </select>
                </div>
              </div>
             

              

              <div className="field-row">
                <div>
                  <label>คณะ</label>
                  <div className="select-wrap">
                    <select 
                      value={formData.faculty} 
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value, major: '' })}
                      disabled={!formData.campus}
                    >
                      <option value="" disabled>เลือกคณะ...</option>
                      {'bachelor' && FACULTY_BY_EDU['bachelor'].map(f => <option key={f.v} value={f.v}>{f.label}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label>สาขาวิชา</label>
                  <div className="select-wrap">
                    <select 
                      value={formData.major} 
                      onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                      disabled={!formData.faculty}
                    >
                      <option value="" disabled>เลือกสาขา...</option>
                      {formData.faculty && MAJOR_MAP[formData.faculty]?.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
              </div>
               <div className="field-row" style={{ justifyContent: 'center', width: '100%'}}>
                <div>
                  <label>ชั้นปี / ปีการศึกษา</label>
                  <div className="select-wrap">
                    <select 
                      value={formData.year} 
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      disabled={!formData.edu}
                    >
                      <option value="" disabled>เลือกชั้นปี...</option>
                      {formData.edu && YEAR_BY_EDU[formData.edu].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ STEP 2 ═══ */}
          {step === 2 && (
            <div className="panel active" style={{}}>
              <div className="goal-grid">
                {GOALS.map(g => (
                  <div 
                    key={g.id} 
                    className={`goal-card ${selectedGoal === g.id ? 'selected' : ''}`}
                    onClick={() => setSelectedGoal(g.id)}
                  >
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
          )}

          {/* ═══ STEP 3 ═══ */}
          {step === 3 && (
            <div className="panel active">
              <div className="field">
                <label>ระดับประสบการณ์การเกี่ยวกับเนื้อหาที่เลือก</label>
                <div className="slider-wrap">
                  <div className="slider-track-wrap">
                    <input 
                      type="range" 
                      min="1" max="5" 
                      value={exp} 
                      onChange={(e) => setExp(Number(e.target.value))}
                      style={{ '--pct': `${((exp - 1) / 4) * 100}%` }}
                    />
                  </div>
                  <div className="slider-labels">
                    <span>มือใหม่</span>
                    <span>เริ่มต้น</span>
                    <span>กลาง</span>
                    <span>ก้าวหน้า</span>
                    <span>เชี่ยวชาญ</span>
                  </div>
                </div>

                <div className="exp-card" style={{ borderLeftColor: currentExpData.color }}>
                  <div className="exp-level" style={{ color: currentExpData.color }}>{currentExpData.level}</div>
                  <div className="exp-title">{currentExpData.title}</div>
                  <div className="exp-desc">{currentExpData.desc}</div>
                  <div className="exp-badges">
                    {currentExpData.badges.map((b, i) => (
                      <span key={i} className="badge">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="card-footer-btns">
            <button className="btn-back" onClick={handlePrev} disabled={step === 1}>← Back</button>
            <span className="step-counter">{step} / {STEPS.length}</span>
            <button className="btn-next" onClick={handleNext}>
              <span>{step === STEPS.length ? 'เริ่ม Pretest' : 'Next'}</span>
              {step !== STEPS.length && (
                <svg className="btn-next-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10M9 4l4 4-4 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>

      <div style={{
        position: 'fixed',
        bottom: '30px',
        left: '50%',
        transform: toast.show ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(20px)',
        opacity: toast.show ? 1 : 0,
        background: '#ffffff',
        color: '#e11d48',
        padding: '12px 24px',
        borderRadius: '99px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        fontWeight: '600',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        zIndex: 2000,
        pointerEvents: 'none',
        border: '1px solid #ffe4e6'
      }}>
        ⚠️ {toast.msg}
      </div>
    </>
  );
}