import React, { useState, useEffect } from 'react';
import './decorate/Exercise.css';
import { useNavigate } from 'react-router-dom';

// ─── DATA ───

const SESSION = {
  id: 3, 
  label: 'Session 3',
  skillName: 'Stack (SK-008)', // โฟกัสแค่ 1 สกิล
  skillTier: 'Tier 2', 
  goalName: 'Data Structures',
  questions: [
    { diff: 1, dLbl: 'Easy', tier: 'T2', text: 'Stack ใช้หลักการใดในการจัดการข้อมูล?', choices: ['FIFO — First In First Out', 'LIFO — Last In First Out', 'FILO — First In Last Out', 'Random access order'], correct: 1, hint: 'คิดถึงกองจาน — จานที่วางทีหลังจะหยิบออกก่อนเสมอ' },
    { diff: 2, dLbl: 'Easy+', tier: 'T2', text: 'Code ต่อไปนี้แสดงผลอะไร?', code: `stack = []\nstack.<span class="fn">append</span>(<span class="nm">10</span>)\nstack.<span class="fn">append</span>(<span class="nm">20</span>)\nstack.<span class="fn">append</span>(<span class="nm">30</span>)\n<span class="fn">print</span>(stack.<span class="fn">pop</span>())`, choices: ['10', '20', '30', '[10, 20, 30]'], correct: 2, hint: 'list.pop() โดยไม่ระบุ index จะดึง element ตัวสุดท้ายออกเสมอ' },
    { diff: 3, dLbl: 'Medium', tier: 'T2', text: 'Stack ถูกนำไปใช้งานใน use case ใดต่อไปนี้?', choices: ['Print queue ของ printer', 'Browser back-button history', 'Message queue ของ LINE', 'Waiting list ระบบจองตั๋ว'], correct: 1, hint: 'กด back บน browser = ย้อนกลับหน้าล่าสุด — เหมือน pop จาก stack' },
    { diff: 4, dLbl: 'Hard', tier: 'T2', text: 'function ต่อไปนี้ทำงานอะไร?', code: `<span class="kw">def</span> <span class="fn">is_balanced</span>(s: <span class="tp">str</span>) -> <span class="tp">bool</span>:\n    stack = []\n    pairs = {<span class="st">')'</span>: <span class="st">'('</span>, <span class="st">']'</span>: <span class="st">'['</span>, <span class="st">'}'</span>: <span class="st">'{'</span>}\n    <span class="kw">for</span> ch <span class="kw">in</span> s:\n        <span class="kw">if</span> ch <span class="kw">in</span> <span class="st">'([{'</span>:\n            stack.<span class="fn">append</span>(ch)\n        <span class="kw">elif</span> ch <span class="kw">in</span> pairs:\n            <span class="kw">if not</span> stack <span class="kw">or</span> stack[-<span class="nm">1</span>] != pairs[ch]:\n                <span class="kw">return False</span>\n            stack.<span class="fn">pop</span>()\n    <span class="kw">return</span> <span class="fn">len</span>(stack) == <span class="nm">0</span>`, choices: ['นับจำนวน bracket ใน string', 'ตรวจว่า bracket สมดุลหรือไม่', 'แปลง string เป็น stack โดยตรง', 'เรียงลำดับ bracket ใน string'], correct: 1, hint: 'สังเกต pairs dict กับการ pop() เมื่อเจอ closing bracket — classic balanced bracket check' }
  ]
};

// ตอนสรุปผล ก็จะโชว์แค่อัปเดตสกิลเดียว
const SKILL_UPDATES = [
  { ico: '📚', name: 'Stack (SK-008)', tier: 'T2', plA: .10, plB: .65, lvA: 0, lvB: 2, verdict: 'UP', req: 2 },
];

const NEXT_SESS = { 
  id: 4, 
  skill: 'Queue (SK-009)', // แนะนำสกิลถัดไปหลังจากเรียน Stack จบ
  tier: 'Tier 2', 
  qs: 5, 
  goal: 'Data Structures', 
  priority: 'Priority #1', 
  reason: 'Stack lv2 ✓ → unlock Queue prerequisite' 
};

export default function Exercise() {
  const total = SESSION.questions.length;
  
  // State
  const [cur, setCur] = useState(0);
  const [ans, setAns] = useState(new Array(total).fill(null));
  const [hints, setHints] = useState(new Array(total).fill(false));
  const [selected, setSelected] = useState(null);
  const [responded, setResponded] = useState(false);
  
  const [stats, setStats] = useState({ correct: 0, streak: 0 });
  const [flash, setFlash] = useState({ show: false, type: '' });
  const [confetti, setConfetti] = useState([]);
  
  const [screens, setScreens] = useState({ result: false, nextSess: false });

  const q = SESSION.questions[cur];
  const pct = Math.round((cur / total) * 100);

  // ─── ACTIONS ───
  const pick = (i) => {
    if (responded) return;
    setSelected(i);
  };

  const showHint = () => {
    const newHints = [...hints];
    newHints[cur] = true;
    setHints(newHints);
  };

  const doNext = () => {
    if (selected === null) return;
    const isCorrect = selected === q.correct;
    
    // Save answer & Lock selection
    const newAns = [...ans];
    newAns[cur] = selected;
    setAns(newAns);
    setResponded(true);

    // Update Stats
    if (isCorrect) {
      setStats(prev => ({ correct: prev.correct + 1, streak: prev.streak + 1 }));
    } else {
      setStats(prev => ({ ...prev, streak: 0 }));
    }

    // Trigger Flash
    setFlash({ show: true, type: isCorrect ? 'ok' : 'bad' });
    setTimeout(() => setFlash({ show: false, type: '' }), 800);

    // Move to next question or end
    setTimeout(() => {
      if (cur < total - 1) {
        setCur(cur + 1);
        setSelected(null);
        setResponded(false);
      } else {
        showPopup(isCorrect ? stats.correct + 1 : stats.correct);
      }
    }, 1200); // Wait for flash and visual feedback
  };

  const doSkip = () => {
    const newAns = [...ans];
    newAns[cur] = -1; // -1 means skipped
    setAns(newAns);
    setStats(prev => ({ ...prev, streak: 0 }));
    
    if (cur < total - 1) {
      setCur(cur + 1);
      setSelected(null);
      setResponded(false);
    } else {
      showPopup(stats.correct);
    }
  };

  const showPopup = (finalCorrect) => {
    setScreens({ ...screens, result: true });
    if ((finalCorrect / total) >= 0.7) {
      triggerConfetti();
    }
  };

  const triggerConfetti = () => {
    const cols = ['#0047AB', '#82C8E5', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];
    const particles = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      bg: cols[Math.floor(Math.random() * cols.length)],
      dur: 1.6 + Math.random() * 2.2,
      del: Math.random() * 0.8,
      round: Math.random() > 0.5
    }));
    setConfetti(particles);
  };

  // ─── RENDER HELPERS ───
  const getOptClass = (i) => {
    if (!responded) return i === selected ? 'opt sel' : 'opt';
    if (i === q.correct) return 'opt rev-ok';
    if (i === selected && i !== q.correct) return 'opt rev-no';
    return 'opt';
  };

  const getDotClass = (i) => {
    if (i === cur) return 'sdot current';
    if (ans[i] === null) return 'sdot';
    if (ans[i] === -1) return 'sdot skp';
    if (ans[i] === SESSION.questions[i].correct) return 'sdot ok';
    return 'sdot bad';
  };
  const navigate = useNavigate();
  const ps = Math.round((stats.correct / total) * 100);
  const gohome = () => navigate('/home');

  return (
    <>
      <div className="glow-bg"><div className="g1"></div><div className="g2"></div><div className="g3"></div></div>
      <div className="wrap">
        
        {/* TOPBAR */}
        <div className="topbar">
          <div className="logo">
            <div className="logo-box">⚡</div>
            <span className="logo-txt">G06 · ALS</span>
            <div className="logo-dot"></div>
            <span className="logo-sub">Adaptive Learning</span>
          </div>
          <div className="topbar-r">
            <span className="sess-chip">{SESSION.label}</span>
            <span className="skill-chip">{SESSION.skillName}</span>
          </div>
        </div>

        {/* PROGRESS */}
        <div className="prog-area">
          <div className="prog-row">
            <span className="prog-label">Progress</span>
            <span className="prog-frac">{cur} / {total}</span>
            <div className="prog-spacer"></div>
            <span className="prog-pct">{pct}%</span>
          </div>
          <div className="prog-track"><div className="prog-fill" style={{ width: `${pct}%` }}></div></div>
          <div className="dot-row">
            {SESSION.questions.map((_, i) => <div key={i} className={getDotClass(i)}></div>)}
          </div>
        </div>

        {/* STAGE */}
        <div className="stage">
          <div className="qcard" key={cur}> {/* key forces re-render animation on change */}
            <div className="card-ribbon"></div>
            <div className="card-head">
              <div className="card-meta">
                <span className="q-index">ข้อ {cur + 1} / {total}</span>
                <span className={`diff-tag d${q.diff}`}>{q.dLbl}</span>
                <span className="tier-tag">{q.tier}</span>
              </div>
              {cur === total - 1 && (
                <div className="submit-notice">
                  <div className="sn-dot"></div>
                  <span>ข้อสุดท้าย — กดส่งเพื่อคำนวณผล</span>
                </div>
              )}
            </div>

            <div className="card-body">
              <div className="q-question">{q.text}</div>
              {q.code && (
                <div className="codeblk" dangerouslySetInnerHTML={{ __html: q.code.replace(/\\n/g, '<br>') }}></div>
              )}
              
              <div className="choices">
                {q.choices.map((c, i) => (
                  <div key={i} className={getOptClass(i)} onClick={() => pick(i)}>
                    <div className="opt-letter">{['A', 'B', 'C', 'D'][i]}</div>
                    <div className="opt-text">{c}</div>
                    <div className="opt-ck">
                      {responded && i === q.correct ? '✓' : (responded && i === selected ? '✗' : (selected === i ? '●' : ''))}
                    </div>
                  </div>
                ))}
              </div>

              {/* {hints[cur] && (
                <div className="hint-box">
                  <span className="hint-icon">💡</span>
                  <div>
                    <div className="hint-lbl">Hint</div>
                    <div className="hint-txt">{q.hint}</div>
                  </div>
                </div>
              )} */}
            </div>

            <div className="card-foot">
              <div className="foot-l">
                {/* <button className={`btn-hint ${hints[cur] ? 'used' : ''}`} onClick={showHint} disabled={hints[cur]}>
                  💡 Hint {hints[cur] && <small style={{ opacity: 0.6 }}>(ใช้แล้ว)</small>}
                </button> */}
                <button className="btn-skip" onClick={doSkip} disabled={responded}>ข้าม →</button>
              </div>
              <button 
                className={`btn-next ${cur === total - 1 ? 'last' : ''}`} 
                onClick={doNext} 
                disabled={selected === null || responded}
              >
                <span>{cur === total - 1 ? 'ส่งคำตอบ' : 'Next'}</span><span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FLASH (Correct / Wrong Overlay) */}
      <div className={`flash ${flash.show ? 'in' : 'out'}`} style={{ color: flash.type === 'ok' ? 'var(--green)' : 'var(--red)' }}>
        {flash.type === 'ok' ? '✓' : '✗'}
      </div>

      {/* CONFETTI */}
      <div className="cf-layer">
        {confetti.map(c => (
          <div key={c.id} className="cp" style={{ left: `${c.left}%`, width: c.size, height: c.size, background: c.bg, borderRadius: c.round ? '50%' : '2px', animationDuration: `${c.dur}s`, animationDelay: `${c.del}s` }}></div>
        ))}
      </div>

      {/* RESULT POPUP */}
      <div className={`overlay ${screens.result && !screens.nextSess ? 'open' : ''}`}>
        <div className="popup">
          <div className="ph">
            <span className="ph-trophy">{ps >= 85 ? '🏆' : ps >= 60 ? '🎯' : '📝'}</span>
            <div className="ph-title">Session เสร็จแล้ว!</div>
            <div className="ph-sub">
              {ps >= 85 ? '🎉 ยอดเยี่ยม! Score     ทุก skill ขึ้นสูงมาก' : ps >= 60 ? 'ดีมาก! BKT อัปเดต P(L) สำเร็จ' : 'BKT อัปเดตแล้ว — แนะนำทำซ้ำเพื่อเพิ่ม Score'}
            </div>
            <div className="score-pills">
              <div className="spill sp-ps"><span>📊</span><span>PS {ps}%</span></div>
              <div className="spill sp-str"><span>🔥</span><span>Streak {stats.streak}</span></div>
              <div className="spill sp-cor"><span>✓</span><span>{stats.correct} / {total} ถูก</span></div>
            </div>
          </div>
          <div className="pb">
            <div className="pb-sec">Skill Update — ผลลัพธ์ BKT จาก Session นี้</div>
            <div className="sk-list">
              {SKILL_UPDATES.map((s, i) => (
                <div key={i} className="sk-item" style={{ animationDelay: `${i * 0.1}s` }}>
                  <span className="sk-ico">{s.ico}</span>
                  <div className="sk-info">
                    <div className="sk-name">{s.name} <span className="sk-tier">{s.tier}</span></div>
                    <div className="sk-detail">
                      <span className="lv-badge">lv{s.lvA}</span>
                      <span style={{ color: 'var(--dim)' }}>→</span>
                      <span className={`lv-badge active lv${s.lvB}`}>lv{s.lvB}</span>
                      <span style={{ color: 'var(--border2)' }}>|</span>
                      <span>P(L): {(s.plA * 100).toFixed(0)}% → <b>{(s.plB * 100).toFixed(0)}%</b></span>
                    </div>
                    <div className="sk-bar-wrap">
                      <div className={`sk-bar fill-lv${s.lvB}`} style={{ width: screens.result ? `${s.plB * 100}%` : '0%' }}></div>
                    </div>
                  </div>
                  <div className={`verdict v-${s.verdict}`}>
                    {s.verdict === 'UP' ? '⬆ Level Up' : s.verdict === 'MAINTAIN' ? '⟳ Maintain' : '⬇ Level Down'}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="pf">
            <button className="btn-home" onClick={() => gohome()}><span>🏠</span><span>กลับ Home</span></button>
            <button className="btn-sess" onClick={() => setScreens({ result: false, nextSess: true })}><span>▶</span><span>Session ถัดไป</span><span>→</span></button>
          </div>
        </div>
      </div>

      {/* NEXT SESSION SCREEN */}
      <div className={`ns-screen ${screens.nextSess ? 'open' : ''}`}>
        <div className="ns-anim">🚀</div>
        <div className="ns-title">Session ถัดไปพร้อมแล้ว</div>
        <div className="ns-sub">ระบบเลือก <strong style={{ color: 'var(--gold)' }}>{NEXT_SESS.skill}</strong> เป็น focus ถัดไป<br/>จาก priority queue ที่คำนวณใหม่</div>
        <div className="ns-card">
          <div className="ns-top-bar"></div>
          <div className="ns-rows">
            <div className="ns-row"><span className="nr-label">Session</span><span className="nr-val accent">{NEXT_SESS.id}</span></div>
            <div className="ns-row"><span className="nr-label">Skill Focus</span><span className="nr-val">{NEXT_SESS.skill}</span></div>
            <div className="ns-row"><span className="nr-label">Tier</span><span className="nr-tag">{NEXT_SESS.tier}</span></div>
            <div className="ns-row"><span className="nr-label">จำนวนข้อ</span><span className="nr-val">{NEXT_SESS.qs} ข้อ</span></div>
            <div className="ns-row"><span className="nr-label">Goal</span><span className="nr-val">{NEXT_SESS.goal}</span></div>
            <div className="ns-row"><span className="nr-label">Priority</span><span className="nr-val ok">{NEXT_SESS.priority}</span></div>
            <div className="ns-row"><span className="nr-label" style={{ flexShrink: 0, marginRight: '10px' }}>เหตุผล</span><span className="nr-val" style={{ fontSize: '11px', color: 'var(--sub)', textAlign: 'right' }}>{NEXT_SESS.reason}</span></div>
          </div>
        </div>
        <button className="ns-start" onClick={() => window.location.reload()}>เริ่ม Session ทันที →</button>
        <button className="ns-back2" onClick={() => gohome()}>← กลับ Home</button>
      </div>
    </>
  );
}
// this is comment from dol