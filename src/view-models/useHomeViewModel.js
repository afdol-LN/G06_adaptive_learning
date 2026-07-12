/**
 * @file useHomeViewModel.js
 * @description ViewModel สำหรับ Home (จัดการ State ของหน้า Dashboard, การคำนวณ Skill Tree, Behavior Score, Filtering และ Modals)
 */
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  getSkillTreeForGoal,
  computeSkillProgress,
  getSkillLevel,
  getSkillElo,
  ELO_RANGES,
  GOAL_SKILLS,
  PREREQS,
} from '../data/mockData';
import dagre from 'dagre';

const NODE_W = 220;
const NODE_H = 100;

export function layoutSkills(skills) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: 'TB', nodesep: 60, ranksep: 80, marginx: 10, marginy: 10 });
  g.setDefaultEdgeLabel(() => ({}));
  skills.forEach(s => g.setNode(s.id, { width: NODE_W, height: NODE_H }));
  skills.forEach(s =>
    s.requires.forEach(r => {
      if (skills.find(sk => sk.id === r)) g.setEdge(r, s.id);
    })
  );
  dagre.layout(g);
  return skills.map(s => {
    const node = g.node(s.id);
    return { ...s, x: node.x, y: node.y };
  });
}

export function computeBehavior(sessions, unlockedSkills) {
  if (sessions.length === 0) {
    return {
      dims: { time: 0, streak: 0, momentum: 0 },
      cls: 'struggler',
      score: 0,
      avgTime: 0,
    };
  }

  let totalQuestions = 0;
  let totalSessionTime = 0;
  let sumTimeScore = 0;
  let sumStreakScore = 0;
  let sumMomentumScore = 0;

  sessions.forEach(s => {
    let c = 0,
      w = 0,
      exp = 0,
      act = 0;
    s.questions.forEach(q => {
      if (q.correct) c++;
      else w++;
      act += parseInt(q.time) || 15;
      exp += 15;
      totalQuestions++;
    });
    totalSessionTime += act;

    const ratio = act > 0 ? exp / act : 1;
    const tScore = (Math.max(0.5, Math.min(ratio, 2.0)) - 0.5) / 1.5;
    const sScore = c + w > 0 ? c / (c + w) : 0;
    const mScore = Math.max(0, Math.min((c - w + 5) / 10, 1.0));

    sumTimeScore += tScore;
    sumStreakScore += sScore;
    sumMomentumScore += mScore;
  });

  const avgTime = totalQuestions > 0 ? totalSessionTime / totalQuestions : 0;
  const tFinal = sumTimeScore / sessions.length;
  const sFinal = sumStreakScore / sessions.length;
  const mFinal = sumMomentumScore / sessions.length;

  const score = Math.round((tFinal * 0.5 + sFinal * 0.3 + mFinal * 0.2) * 100);
  const dims = {
    time: Math.round(tFinal * 100),
    streak: Math.round(sFinal * 100),
    momentum: Math.round(mFinal * 100),
  };

  let cls = 'struggler';
  if (score >= 80) cls = 'mastery';
  else if (score >= 60) {
    if (dims.time - dims.streak >= 15) cls = 'fast';
    else if (dims.streak - dims.time >= 15) cls = 'slow';
    else cls = 'steady';
  } else if (score >= 40) cls = 'slow';

  return { dims, cls, score, avgTime: Math.round(avgTime) };
}

export function useHomeViewModel() {
  const navigate = useNavigate();
  const appCtx = useApp();

  const branches = appCtx?.branches || [];
  const activeBranch = appCtx?.activeBranch || branches[0] || {};
  const userProfile = appCtx?.userProfile || {};

  const USER = {
    name: `${userProfile.fname || ''} ${userProfile.lname || ''}`.trim(),
    goal: activeBranch.goalName || '',
    avatar: (userProfile.fname?.[0] || 'U').toUpperCase(),
    faculty: activeBranch.faculty || '',
    major: activeBranch.major || '',
    year: activeBranch.year || '',
    campus: activeBranch.campus || '',
  };

  const rawSkills = getSkillTreeForGoal(activeBranch.goalId || '');
  const sessions = activeBranch.sessions || [];
  const sessionProg = computeSkillProgress(sessions);

  const enrichedSkills = rawSkills.map(s => ({
    ...s,
    progress: sessionProg[s.id] ?? s.progress,
    level: getSkillLevel({ ...s, progress: sessionProg[s.id] ?? s.progress }),
    elo: getSkillElo({ ...s, progress: sessionProg[s.id] ?? s.progress }),
  }));

  const treeSkills = layoutSkills(enrichedSkills);

  const [unlocked, setUnlocked] = useState(() => {
    const set = new Set();
    enrichedSkills.forEach(s => {
      if (s.progress > 0) set.add(s.id);
    });
    return set;
  });

  useEffect(() => {
    const set = new Set();
    enrichedSkills.forEach(s => {
      if (s.progress > 0) set.add(s.id);
    });
    setUnlocked(set);
  }, [activeBranch.id, sessions.length]);

  const [activeTab, setActiveTab] = useState('Home');
  const [selected, setSelected] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [confirmSkill, setConfirmSkill] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGoalMenu, setShowGoalMenu] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [twText, setTwText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [historyFilter, setHistoryFilter] = useState(new Set(['all']));
  const [topicFilter, setTopicFilter] = useState('all');
  const [openSessions, setOpenSessions] = useState({});

  const profileMenuRef = useRef(null);
  const goalMenuRef = useRef(null);

  useEffect(() => {
    let i = 0;
    setTwText('');
    setShowCursor(true);
    const nameStr = USER.name || 'User';
    const timer = setInterval(() => {
      setTwText(nameStr.substring(0, i + 1));
      i++;
      if (i >= nameStr.length) {
        clearInterval(timer);
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 70);
    return () => clearInterval(timer);
  }, [USER.name]);

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

  const handleNodeClick = skill =>
    setSelected(prev => (prev?.id === skill.id ? null : skill));
  const handleStartExercise = skill => setConfirmSkill(skill);
  const handleConfirmExercise = () => {
    setConfirmSkill(null);
    navigate('/exercise');
  };
  const handleCancelExercise = () => setConfirmSkill(null);
  const handleGoPicker = skill => {
    setShowPicker(false);
    setConfirmSkill(skill);
  };
  const toggleSession = id =>
    setOpenSessions(prev => ({ ...prev, [id]: !prev[id] }));
  const switchTab = tab => {
    setActiveTab(tab);
    setSelected(null);
  };

  const handleHistoryFilter = filter => {
    setHistoryFilter(prev => {
      const next = new Set(prev);
      if (filter === 'all') return new Set(['all']);
      next.delete('all');
      next.has(filter) ? next.delete(filter) : next.add(filter);
      return next.size === 0 ? new Set(['all']) : next;
    });
  };

  const allTopics = ['all', ...Array.from(new Set(sessions.map(s => s.title)))];

  const requiredGoalSkills = GOAL_SKILLS[activeBranch.goalId] || [];
  let totalReqElo = 0;
  let totalUserElo = 0;

  requiredGoalSkills.forEach(req => {
    const minLvl = parseInt(req.minLevel.replace(/\D/g, ''), 10) || 1;
    const reqElo = ELO_RANGES[minLvl]?.min || 1200;
    const userElo = enrichedSkills.find(s => s.id === req.skillId)?.elo || 1200;

    const baseElo = 1200;
    const reqSpread = Math.max(0, reqElo - baseElo);
    const userSpread = Math.max(0, userElo - baseElo);

    totalReqElo += reqSpread;
    totalUserElo += Math.min(userSpread, reqSpread);
  });

  const goalProgressPct =
    totalReqElo > 0 ? Math.round((totalUserElo / totalReqElo) * 100) : 0;

  return {
    state: {
      branches,
      activeBranch,
      USER,
      enrichedSkills,
      treeSkills,
      unlocked,
      sessions,
      activeTab,
      selected,
      hovered,
      showPicker,
      confirmSkill,
      showProfileMenu,
      showGoalMenu,
      showCreateModal,
      twText,
      showCursor,
      historyFilter,
      topicFilter,
      openSessions,
      allTopics,
      goalProgressPct,
    },
    refs: {
      profileMenuRef,
      goalMenuRef,
    },
    actions: {
      canUnlock,
      handleNodeClick,
      handleStartExercise,
      handleConfirmExercise,
      handleCancelExercise,
      handleGoPicker,
      toggleSession,
      switchTab,
      handleHistoryFilter,
      setTopicFilter,
      setActiveTab,
      setSelected,
      setHovered,
      setShowPicker,
      setConfirmSkill,
      setShowProfileMenu,
      setShowGoalMenu,
      setShowCreateModal,
      switchBranch: appCtx?.switchBranch,
    },
  };
}
