import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBullseye, FaXmark } from 'react-icons/fa6';
import { useApp } from '../context/AppContext';
import { usePreferences } from '../context/PreferencesContext';
import type { TKey } from '../i18n';
import { InformationService } from '../services/informationService';
import { GoalItem } from '../models/informationModel';

// Reusing EXP_DATA from InformationForm — level name + accent colour here,
// title/desc/badges in i18n (exp.N.*; badges are '|'-separated)
const EXP_DATA: Record<number, { level: string; color: string; titleKey: TKey; descKey: TKey; badgesKey: TKey }> = {
  1: { level: 'Level 1 — Novice',       color: '#e05c5c', titleKey: 'exp.1.title', descKey: 'exp.1.desc', badgesKey: 'exp.1.badges' },
  2: { level: 'Level 2 — Beginner',     color: '#e8a03c', titleKey: 'exp.2.title', descKey: 'exp.2.desc', badgesKey: 'exp.2.badges' },
  3: { level: 'Level 3 — Intermediate', color: '#0047AB', titleKey: 'exp.3.title', descKey: 'exp.3.desc', badgesKey: 'exp.3.badges' },
  4: { level: 'Level 4 — Advanced',     color: '#82C8E5', titleKey: 'exp.4.title', descKey: 'exp.4.desc', badgesKey: 'exp.4.badges' },
  5: { level: 'Level 5 — Expert',       color: '#38b874', titleKey: 'exp.5.title', descKey: 'exp.5.desc', badgesKey: 'exp.5.badges' },
};

const GROUP_KEYS: Record<string, TKey> = {
  Career:      'cbm.group.Career',
  Academic:    'cbm.group.Academic',
  Competitive: 'cbm.group.Competitive',
  Specialized: 'cbm.group.Specialized',
  General:     'cbm.group.General',
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { addBranch, switchBranch, activeBranch, branches } = useApp();
  const { t } = usePreferences();
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

  const handleNext = async () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    } else if (step === 2 && selectedGoal && !isSubmitting) {
      setIsSubmitting(true);
      let serverBranchId: string;
      try {
        serverBranchId = await InformationService.createBranchOnServer(selectedGoal, exp);
      } catch (error) {
        console.error('Failed to save new branch to backend:', error);
        setIsSubmitting(false);
        return;
      }
      setIsSubmitting(false);

      const goal = goals.find((g) => g.id === selectedGoal);
      const newId = addBranch({
        id: serverBranchId,
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
  const selectedGoalData = goals.find((g) => g.id === selectedGoal);
  const nextDisabled = (step === 1 && !selectedGoal) || goals.length === 0 || isSubmitting;

  return (
    <div className="ex-picker-overlay cbm-overlay" onClick={onClose}>
      <div className="ex-picker-modal create-branch-modal cbm-modal" onClick={(e) => e.stopPropagation()}>

        <div className="cbm-header">
          <h2 className="cbm-title">{step === 1 ? t('cbm.titleGoal') : t('cbm.titleExp')}</h2>
          <button className="cbm-close" onClick={onClose} aria-label={t('common.close')}>
            <FaXmark aria-hidden />
          </button>
        </div>

        {step === 1 && (
          <div className="cbm-step">
            {isLoadingGoals ? (
              <div className="cbm-status">{t('cbm.loading')}</div>
            ) : goals.length === 0 ? (
              <div className="cbm-status error">
                <p>{t('cbm.empty')}</p>
              </div>
            ) : (
              Object.entries(GROUP_KEYS).map(([groupKey, labelKey]) => {
                const groupGoals = goalsByGroup[groupKey] || [];
                if (groupGoals.length === 0) return null;
                return (
                  <div key={groupKey}>
                    <div className="cbm-group-title">{t(labelKey)}</div>
                    <div className="cbm-goal-grid">
                      {groupGoals.map((g) => (
                        <div
                          key={g.id}
                          onClick={() => setSelectedGoal(g.id)}
                          className={`cbm-goal-card ${selectedGoal === g.id ? 'selected' : ''}`}
                        >
                          <div className="cbm-goal-head">
                            <span className="cbm-goal-icon">{g.icon || <FaBullseye aria-hidden />}</span>
                            <span className="cbm-goal-name">{g.name}</span>
                          </div>
                          <p className="cbm-goal-desc">{g.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {step === 2 && (
          <div className="cbm-step exp">
            {selectedGoalData && (
              <div className="cbm-selected-goal">
                <span className="cbm-goal-icon sm">{selectedGoalData.icon || <FaBullseye aria-hidden />}</span>
                <span className="cbm-selected-goal-name">{selectedGoalData.name}</span>
              </div>
            )}
            <p className="cbm-intro">{t('cbm.expIntro')}</p>

            <div className="cbm-slider">
              <div className="cbm-slider-track">
                <div
                  className="cbm-slider-fill"
                  style={{ background: currentExpData.color, width: `${((exp - 1) / 4) * 100}%` }}
                />
              </div>
              <div className="cbm-slider-dots">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    onClick={() => setExp(lvl)}
                    className="cbm-dot"
                    style={{
                      background: exp >= lvl ? EXP_DATA[lvl].color : undefined,
                      borderColor: exp >= lvl ? EXP_DATA[lvl].color : undefined,
                      boxShadow: exp === lvl ? `0 0 0 4px ${currentExpData.color}33` : undefined,
                    }}
                  />
                ))}
              </div>
              <div className="cbm-slider-labels">
                <span>{t('cbm.novice')}</span>
                <span>{t('cbm.expert')}</span>
              </div>
            </div>

            <div
              className="cbm-level-card"
              style={{ borderColor: `${currentExpData.color}44`, borderLeftColor: currentExpData.color }}
            >
              <div className="cbm-level-kicker" style={{ color: currentExpData.color }}>{currentExpData.level}</div>
              <div className="cbm-level-title">{t(currentExpData.titleKey)}</div>
              <p className="cbm-level-desc">{t(currentExpData.descKey)}</p>
              <div className="cbm-badges">
                {t(currentExpData.badgesKey).split('|').map((badge) => (
                  <span
                    key={badge}
                    className="cbm-badge"
                    style={{ background: `${currentExpData.color}15`, color: currentExpData.color }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="cbm-footer">
          {step === 2 ? (
            <button className="cbm-btn-back" onClick={() => setStep(1)}>
              {t('cbm.back')}
            </button>
          ) : <div />}
          <button className="cbm-btn-next" disabled={nextDisabled} onClick={handleNext}>
            {step === 1 ? t('cbm.next') : isSubmitting ? t('cbm.saving') : t('cbm.confirm')}
          </button>
        </div>

      </div>
    </div>
  );
}
