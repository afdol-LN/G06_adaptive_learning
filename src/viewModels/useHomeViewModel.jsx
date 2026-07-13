// ─── viewModels/useHomeViewModel.jsx ────────────────────────────────────────
// Home page ViewModel — จัดการ state ทั้งหมดของหน้า Home
// คืนค่าพร้อมใช้ให้ HomeView (UI ไม่ต้องมี logic)
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  MOCK_BRANCHES,
  MOCK_USER_PROFILE,
  MOCK_ACTIVE_BRANCH,
  SKILLS,
  GOAL_SKILLS,
  ELO_RANGES,
  computeSkillProgress,
  getSkillLevel,
  getSkillElo,
} from '../models/mockData';
import { PREREQS } from '../models/mockData';
import { layoutSkills } from '../component/SkillTreeSVG';

// ── Business Logic: คำนวณ behavior จาก sessions ──────────────────────────────
function computeBehavior(sessions) {
  if (sessions.length === 0) {
    return { dims: { time: 0, streak: 0, momentum: 0 }, cls: 'struggler', score: 0, avgTime: 0 };
  }

  let totalQuestions = 0, totalSessionTime = 0;
  let sumTimeScore = 0, sumStreakScore = 0, sumMomentumScore = 0;

  sessions.forEach(s => {
    let c = 0, w = 0, exp = 0, act = 0;
    s.questions.forEach(q => {
      if (q.correct) c++; else w++;
      act += parseInt(q.time) || 15;
      exp += 15;
      totalQuestions++;
    });
    totalSessionTime += act;

    const ratio  = act > 0 ? (exp / act) : 1;
    const tScore = (Math.max(0.5, Math.min(ratio, 2.0)) - 0.5) / 1.5;
    const sScore = (c + w) > 0 ? (c / (c + w)) : 0;
    const mScore = Math.max(0, Math.min((c - w + 5) / 10, 1.0));

    sumTimeScore     += tScore;
    sumStreakScore    += sScore;
    sumMomentumScore += mScore;
  });

  const avgTime = totalQuestions > 0 ? totalSessionTime / totalQuestions : 0;
  const tFinal  = sumTimeScore     / sessions.length;
  const sFinal  = sumStreakScore    / sessions.length;
  const mFinal  = sumMomentumScore / sessions.length;

  const score = Math.round((tFinal * 0.50 + sFinal * 0.30 + mFinal * 0.20) * 100);
  const dims  = {
    time:     Math.round(tFinal * 100),
    streak:   Math.round(sFinal * 100),
    momentum: Math.round(mFinal * 100),
  };

  let cls = 'struggler';
  if (score >= 80) cls = 'mastery';
  else if (score >= 60) {
    if (dims.time - dims.streak >= 15) cls = 'fast';
    else if (dims.streak - dims.time >= 15) cls = 'slow';
    else cls = 'steady';
  }
  else if (score >= 40) cls = 'slow';

  return { dims, cls, score, avgTime: Math.round(avgTime) };
}

// ── Main Hook ─────────────────────────────────────────────────────────────────
export function useHomeViewModel() {
  const navigate = useNavigate();
  const appCtx   = useApp();

  // ── Data from context or mock ──
  const branches     = appCtx?.branches?.length > 0 ? appCtx.branches : MOCK_BRANCHES;
  const activeBranch = appCtx?.activeBranch || branches[0] || MOCK_ACTIVE_BRANCH;
  const userProfile  = appCtx?.userProfile  || MOCK_USER_PROFILE;

  const USER = {
    name:    `${userProfile.fname} ${userProfile.lname}`,
    goal:    activeBranch.goalName,
    avatar:  userProfile.fname?.[0]?.toUpperCase() || 'U',
    faculty: activeBranch.faculty,
    major:   activeBranch.major,
    year:    activeBranch.year,
    campus:  activeBranch.campus,
  };

  // ── Skills with progress ──
  const rawSkills     = SKILLS;
  const sessionProg   = computeSkillProgress(activeBranch.sessions || []);
  const enrichedSkills = rawSkills.map(s => ({
    ...s,
    progress: sessionProg[s.id] ?? s.progress,
    level:    getSkillLevel({ ...s, progress: sessionProg[s.id] ?? s.progress }),
    elo:      getSkillElo({ ...s, progress: sessionProg[s.id] ?? s.progress }),
  }));
  const treeSkills = layoutSkills(enrichedSkills);

  // ── Unlocked skills ──
  const [unlocked, setUnlocked] = useState(() => {
    const set = new Set();
    enrichedSkills.forEach(s => { if (s.progress > 0) set.add(s.id); });
    return set;
  });

  const sessions = activeBranch.sessions || [];

  // ── UI State ──
  const [activeTab,       setActiveTab]       = useState('Home');
  const [selected,        setSelected]        = useState(null);
  const [hovered,         setHovered]         = useState(null);
  const [showPicker,      setShowPicker]      = useState(false);
  const [confirmSkill,    setConfirmSkill]    = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGoalMenu,    setShowGoalMenu]    = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [twText,          setTwText]          = useState('');
  const [showCursor,      setShowCursor]      = useState(true);
  const [historyFilter,   setHistoryFilter]   = useState(new Set(['all']));
  const [topicFilter,     setTopicFilter]     = useState('all');
  const [openSessions,    setOpenSessions]    = useState({});

  const profileMenuRef = useRef(null);
  const goalMenuRef    = useRef(null);

  // ── Typewriter effect ──
  useEffect(() => {
    let i = 0;
    setTwText('');
    setShowCursor(true);
    const timer = setInterval(() => {
      setTwText(USER.name.substring(0, i + 1));
      i++;
      if (i >= USER.name.length) {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 70);
    return () => clearInterval(timer);
  }, [USER.name]);

  // ── Close dropdown on outside click ──
  useEffect(() => {
    const handle = e => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target))
        setShowProfileMenu(false);
      if (goalMenuRef.current && !goalMenuRef.current.contains(e.target) &&
          !e.target.closest('.create-branch-modal'))
        setShowGoalMenu(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  // ── canUnlock ──
  const canUnlock = skill => {
    if (unlocked.has(skill.id)) return false;
    const parentReqs = PREREQS.filter(p => p.skillId === skill.id);
    if (parentReqs.length === 0) return true;
    return parentReqs.every(req => {
      const parentSkill = enrichedSkills.find(p => p.id === req.prereqId);
      const reqLvl = parseInt(req.minLevel.replace(/\D/g, ''), 10) || 1;
      return parentSkill && parentSkill.level >= reqLvl;
    });
  };

  // ── Goal progress ──
  const requiredGoalSkills = GOAL_SKILLS[activeBranch.goalId] || [];
  let totalReqElo = 0, totalUserElo = 0;
  requiredGoalSkills.forEach(req => {
    const minLvl     = parseInt(req.minLevel.replace(/\D/g, ''), 10) || 1;
    const reqElo     = ELO_RANGES[minLvl]?.min || 1200;
    const userElo    = enrichedSkills.find(s => s.id === req.skillId)?.elo || 1200;
    const baseElo    = 1200;
    const reqSpread  = Math.max(0, reqElo  - baseElo);
    const userSpread = Math.max(0, userElo - baseElo);
    totalReqElo  += reqSpread;
    totalUserElo += Math.min(userSpread, reqSpread);
  });
  const goalProgressPct = totalReqElo > 0
    ? Math.round((totalUserElo / totalReqElo) * 100)
    : 0;

  // ── Behavior ──
  const behavior = computeBehavior(sessions);

  // ── Handlers ──
  const handleNodeClick       = skill => setSelected(prev => prev?.id === skill.id ? null : skill);
  const handleStartExercise   = skill => setConfirmSkill(skill);
  const handleConfirmExercise = () => { setConfirmSkill(null); navigate('/exercise'); };
  const handleCancelExercise  = () => setConfirmSkill(null);
  const handleGoPicker        = skill => { setShowPicker(false); setConfirmSkill(skill); };
  const toggleSession         = id => setOpenSessions(prev => ({ ...prev, [id]: !prev[id] }));
  const gradeLabel            = g => g === 'great' ? 'ดีเยี่ยม' : g === 'good' ? 'ดี' : 'ต้องปรับปรุง';
  const switchTab             = tab => { setActiveTab(tab); setSelected(null); };
  const handleHistoryFilter   = filter => {
    setHistoryFilter(prev => {
      const next = new Set(prev);
      if (filter === 'all') return new Set(['all']);
      next.delete('all');
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next.size === 0 ? new Set(['all']) : next;
    });
  };

  const allTopics = ['all', ...Array.from(new Set(sessions.map(s => s.title)))];

  // ── Return ───────────────────────────────────────────────────────────────────
  return {
    // Data
    USER, treeSkills, enrichedSkills, unlocked, sessions,
    branches, activeBranch, goalProgressPct, behavior, allTopics,
    // UI State
    activeTab, selected, hovered, showPicker, confirmSkill,
    showProfileMenu, showGoalMenu, showCreateModal,
    twText, showCursor, historyFilter, topicFilter, openSessions,
    // Setters
    setSelected, setHovered, setShowPicker, setShowProfileMenu,
    setShowGoalMenu, setShowCreateModal, setTopicFilter,
    // Refs
    profileMenuRef, goalMenuRef,
    // Functions
    canUnlock, switchTab, handleNodeClick, handleStartExercise,
    handleConfirmExercise, handleCancelExercise, handleGoPicker,
    toggleSession, gradeLabel, handleHistoryFilter,
    appCtx,
  };
}
