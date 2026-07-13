// ─── viewModels/useInformationViewModel.jsx ─────────────────────────────────
// InformationForm ViewModel — จัดการ form state และ step navigation
// คืนค่าพร้อมใช้ให้ InformationView
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GOALS } from '../models/mockData';
import { STEPS, TOTAL_STEPS } from '../models/branchModel';

export function useInformationViewModel() {
  const navigate = useNavigate();
  const { addBranch, switchBranch, branches } = useApp();

  // ── Step state ──
  const [step,       setStep]       = useState(1);
  const [isShaking,  setIsShaking]  = useState(false);
  const [toast,      setToast]      = useState({ show: false, msg: '' });

  // ── Branch selection state ──
  const [showSelectBranch, setShowSelectBranch] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [newBranchIds,     setNewBranchIds]     = useState([]);

  // ── Form data ──
  const [formData, setFormData]   = useState({ edu: 'bachelor', year: '', campus: '', faculty: '', major: '' });
  const [selectedGoal, setSelectedGoal] = useState([]);
  const [exp,          setExp]          = useState(1);

  const progressPct = ((step - 1) / (TOTAL_STEPS - 1)) * 100;

  // ── Validation ──
  const validateStep = () => {
    if (step === 1) {
      const { year, campus, faculty, major } = formData;
      if (!year || !campus || !faculty || !major) {
        triggerShake();
        showNotice('กรุณากรอกข้อมูลให้ครบถ้วน');
        return false;
      }
    }
    if (step === 2 && selectedGoal.length === 0) {
      triggerShake();
      showNotice('กรุณาเลือกเนื้อหาที่ต้องการเรียนรู้');
      return false;
    }
    return true;
  };

  // ── Helpers ──
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const showNotice = msg => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  // ── Navigation ──
  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 2) {
      const createdIds = [];
      selectedGoal.forEach(goalId => {
        const goal  = GOALS.find(g => g.id === goalId);
        const newId = addBranch({
          campus:   formData.campus,
          faculty:  formData.faculty,
          major:    formData.major,
          year:     formData.year,
          goalId,
          goalName: goal?.name || '',
          goalIcon: goal?.icon || '🎯',
          goalDesc: goal?.desc || '',
          exp,
        });
        createdIds.push(newId);
      });
      setNewBranchIds(createdIds);
      setTimeout(() => setShowSelectBranch(true), 50);
      return;
    }

    if (step === 3) {
      setStep(4);
      setTimeout(() => navigate('/pretest'), 500);
      return;
    }

    if (step < TOTAL_STEPS) setStep(s => s + 1);
  };

  const handlePrev = () => { if (step > 1) setStep(s => s - 1); };

  const handleBranchConfirm = () => {
    if (!selectedBranchId) return;
    switchBranch(selectedBranchId);
    setShowSelectBranch(false);
    setStep(3);
  };

  return {
    // State
    step, isShaking, toast, progressPct,
    formData, selectedGoal, exp,
    showSelectBranch, selectedBranchId, newBranchIds,
    branches,
    // Setters
    setFormData, setSelectedGoal, setExp,
    setSelectedBranchId, setShowSelectBranch,
    // Handlers
    handleNext, handlePrev, handleBranchConfirm,
  };
}
