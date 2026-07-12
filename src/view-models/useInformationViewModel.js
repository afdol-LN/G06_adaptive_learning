/**
 * @file useInformationViewModel.js
 * @description ViewModel สำหรับ InformationForm (จัดการ Steps, ฟอร์มสร้างสาขาวิชา, เลือกเป้าหมาย และระดับประสบการณ์)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { GOALS } from '../data/mockData';

export function useInformationViewModel(STEPS) {
  const navigate = useNavigate();
  const { addBranch, switchBranch, branches } = useApp();

  const [step, setStep] = useState(1);
  const [isShaking, setIsShaking] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    edu: 'bachelor',
    year: '',
    campus: '',
    faculty: '',
    major: '',
  });
  const [selectedGoal, setSelectedGoal] = useState([]);
  const [exp, setExp] = useState(1);
  const [toast, setToast] = useState({ show: false, msg: '' });

  // Modal & Selection State
  const [showSelectBranch, setShowSelectBranch] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [newBranchIds, setNewBranchIds] = useState([]);

  const progressPct = ((step - 1) / STEPS.length) * 100;

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 400);
  };

  const showNotice = msg => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 3000);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'faculty') next.major = '';
      return next;
    });
  };

  const toggleGoalSelection = goalId => {
    setSelectedGoal(prev =>
      prev.includes(goalId) ? prev.filter(id => id !== goalId) : [...prev, goalId]
    );
  };

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

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 2) {
      const createdIds = [];
      selectedGoal.forEach(goalId => {
        const goal = GOALS.find(g => g.id === goalId);
        const newId = addBranch({
          campus: formData.campus,
          faculty: formData.faculty,
          major: formData.major,
          year: formData.year,
          goalId: goalId,
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

    if (step < STEPS.length) {
      setStep(step + 1);
    } else {
      navigate('/pretest');
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const confirmBranchSelection = () => {
    if (!selectedBranchId) return;
    switchBranch(selectedBranchId);
    setShowSelectBranch(false);
    setStep(3);
  };

  return {
    state: {
      step,
      isShaking,
      formData,
      selectedGoal,
      exp,
      toast,
      showSelectBranch,
      selectedBranchId,
      newBranchIds,
      progressPct,
      branches,
    },
    actions: {
      setStep,
      updateFormData,
      toggleGoalSelection,
      setExp,
      setSelectedBranchId,
      handleNext,
      handlePrev,
      confirmBranchSelection,
    },
  };
}
