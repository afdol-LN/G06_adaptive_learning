import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { InformationService } from '../services/informationService';
import { GoalItem } from '../models/informationModel';

// Reusing EXP_DATA from InformationForm
const EXP_DATA: Record<number, { level: string; title: string; desc: string; badges: string[]; color: string }> = {
  1: { level: 'Level 1 — Novice',       title: 'มือใหม่หัดเขียนโค้ด',      desc: 'เพิ่งเริ่มต้นศึกษา อาจเคยเห็นโค้ดบ้างแต่ยังไม่มีประสบการณ์', badges: ['ยังไม่มีประสบการณ์', 'เรียนครั้งแรก'], color: '#e05c5c' },
  2: { level: 'Level 2 — Beginner',     title: 'เริ่มต้นเขียนโปรแกรม',     desc: 'รู้จัก variable, loop, if-else แต่ยังไม่มั่นใจ', badges: ['Variables', 'Loops', 'Conditions'], color: '#e8a03c' },
  3: { level: 'Level 3 — Intermediate', title: 'เขียนโปรแกรมได้บ้าง',      desc: 'เข้าใจ OOP, function และเคยทำโปรเจกต์ขนาดเล็ก', badges: ['OOP', 'Functions', 'Data Structures'], color: '#0047AB' },
  4: { level: 'Level 4 — Advanced',     title: 'เขียนโปรแกรมได้ดี',         desc: 'เข้าใจ algorithms, complexity และทำงานกับ library', badges: ['Algorithms', 'Libraries', 'Complexity'], color: '#82C8E5' },
  5: { level: 'Level 5 — Expert',       title: 'เชี่ยวชาญการเขียนโปรแกรม', desc: 'เขียน Python ขั้นสูงได้อย่างคล่องแคล่ว มีประสบการณ์จริง', badges: ['Advanced Python', 'Real-world', 'Professional'], color: '#38b874' },
};

const GROUP_LABELS: Record<string, string> = {
  Career:      'Career',
  Academic:    'Academic',
  Competitive: 'Competitive',
  Specialized: 'Specialized',
  General:     'General',
};

interface CreateBranchModalProps {
  onClose: () => void;
}

export default function CreateBranchModal({ onClose }: CreateBranchModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [exp, setExp] = useState<number>(1);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState<boolean>(true);

  const { addBranch, switchBranch, activeBranch, branches } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadGoalsFromBackend() {
      setIsLoadingGoals(true);
      const fetchedGoals = await InformationService.fetchGoals();
      setGoals(fetchedGoals);
      setIsLoadingGoals(false);
    }
    loadGoalsFromBackend();
  }, []);

  const goalsByGroup = InformationService.groupGoalsByGroup(goals);
  const baseBranch = activeBranch || branches?.[0];

  const handleNext = () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    } else if (step === 2 && selectedGoal) {
      const goal = goals.find((g) => g.id === selectedGoal);
      const newId = addBranch({
        campus:   baseBranch?.campus || 'หาดใหญ่',
        faculty:  baseBranch?.faculty || 'วิทยาศาสตร์',
        major:    baseBranch?.major || 'ICT',
        year:     baseBranch?.year || '1',
        goalId:   selectedGoal,
        goalName: goal?.name || '',
        goalIcon: goal?.icon || '🎯',
        goalDesc: goal?.desc || '',
        exp,
      });

      switchBranch(newId);
      onClose();
      navigate('/pretest');
    }
  };

  const currentExpData = EXP_DATA[exp] || EXP_DATA[1];

  return (
    <div className="ex-picker-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="ex-picker-modal create-branch-modal" onClick={(e) => e.stopPropagation()} style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            {step === 1 ? 'เพิ่มเป้าหมายการเรียนรู้ใหม่' : 'ระดับประสบการณ์'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}>✕</button>
        </div>

        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {isLoadingGoals ? (
              <div style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                กำลังโหลดข้อมูลเป้าหมายการเรียนรู้...
              </div>
            ) : goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 16px', color: '#f87171' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', margin: 0 }}>
                  ไม่พบข้อมูลเป้าหมายการเรียนรู้ในระบบ (ไม่มี goal ให้เลือก)
                </p>
              </div>
            ) : (
              Object.entries(GROUP_LABELS).map(([groupKey, groupTitle]) => {
                const groupGoals = goalsByGroup[groupKey] || [];
                if (groupGoals.length === 0) return null;
                return (
                  <div key={groupKey}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                      {groupTitle}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '12px' }}>
                      {groupGoals.map((g) => {
                        const isSel = selectedGoal === g.id;
                        return (
                          <div key={g.id} onClick={() => setSelectedGoal(g.id)}
                            style={{
                              padding: '16px', border: `2px solid ${isSel ? '#0047AB' : '#e2e8f0'}`,
                              borderRadius: '12px', background: isSel ? '#f0f4ff' : '#fff',
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '24px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{g.icon || '🎯'}</span>
                              <span style={{ fontSize: '15px', fontWeight: '700', color: isSel ? '#0047AB' : '#0f172a' }}>{g.name}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>{g.desc}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <p style={{ margin: 0, color: '#475569', fontSize: '15px' }}>
              เลือกระดับประสบการณ์สำหรับเป้าหมายนี้ เพื่อให้ระบบปรับความยากในการประเมินได้เหมาะสม
            </p>
            
            <div style={{ position: 'relative', marginTop: '20px', marginBottom: '40px' }}>
              <div style={{ position: 'absolute', top: '10px', left: '10px', right: '10px', height: '4px', background: '#e2e8f0', borderRadius: '2px', zIndex: 1 }}>
                <div style={{ height: '100%', background: currentExpData.color, borderRadius: '2px', width: `${((exp - 1) / 4) * 100}%`, transition: 'all 0.3s' }}></div>
              </div>
              <div style={{ position: 'relative', zIndex: 2, display: 'flex', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div key={lvl} onClick={() => setExp(lvl)}
                    style={{
                      width: '24px', height: '24px', borderRadius: '50%',
                      background: exp >= lvl ? EXP_DATA[lvl].color : '#fff',
                      border: `3px solid ${exp >= lvl ? EXP_DATA[lvl].color : '#cbd5e1'}`,
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: exp === lvl ? `0 0 0 4px ${currentExpData.color}33` : 'none'
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 4px 0', color: '#94a3b8', fontSize: '12px', fontWeight: '600' }}>
                <span>มือใหม่</span>
                <span>เชี่ยวชาญ</span>
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: `1px solid ${currentExpData.color}44`, borderLeft: `4px solid ${currentExpData.color}`, borderRadius: '8px', padding: '20px' }}>
              <div style={{ color: currentExpData.color, fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{currentExpData.level}</div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', marginBottom: '12px' }}>{currentExpData.title}</div>
              <p style={{ margin: 0, fontSize: '15px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>{currentExpData.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {currentExpData.badges.map((badge) => (
                  <span key={badge} style={{ fontSize: '12px', padding: '4px 10px', background: `${currentExpData.color}15`, color: currentExpData.color, borderRadius: '99px', fontWeight: '600' }}>{badge}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          {step === 2 ? (
            <button onClick={() => setStep(1)} style={{ padding: '10px 20px', fontSize: '15px', fontWeight: '600', color: '#64748b', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
              กลับ
            </button>
          ) : <div></div>}
          <button 
            disabled={(step === 1 && !selectedGoal) || goals.length === 0}
            onClick={handleNext} 
            style={{ 
              padding: '10px 24px', fontSize: '15px', fontWeight: '700', color: '#fff', 
              background: ((step === 1 && !selectedGoal) || goals.length === 0) ? '#cbd5e1' : '#0047AB', 
              border: 'none', borderRadius: '8px', cursor: ((step === 1 && !selectedGoal) || goals.length === 0) ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {step === 1 ? 'ถัดไป →' : 'ยืนยันและทำ Pretest'}
          </button>
        </div>

      </div>
    </div>
  );
}
