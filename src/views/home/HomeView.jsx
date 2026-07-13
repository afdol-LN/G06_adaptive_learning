// ─── views/home/HomeView.jsx ─────────────────────────────────────────────────
// Home page — layout wrapper + tab routing, UI only
// Logic: src/viewModels/useHomeViewModel.jsx
// ─────────────────────────────────────────────────────────────────────────────
import { useHomeViewModel } from '../../viewModels/useHomeViewModel';
import HomeTabView       from './tabs/HomeTabView';
import SkillTreeTabView  from './tabs/SkillTreeTabView';
import HistoryTabView    from './tabs/HistoryTabView';
import ProfileTabView    from './tabs/ProfileTabView';
import CreateBranchModal from '../../component/CreateBranchModal';
import '../../component/decorate/Home.css';

const NAV_TABS = [
  { id: 'Home',       icon: '🏠', label: 'หน้าหลัก' },
  { id: 'SkillTree',  icon: '🌳', label: 'Skill Tree' },
  { id: 'History',    icon: '📋', label: 'ประวัติ' },
  { id: 'Profile',    icon: '👤', label: 'โปรไฟล์' },
];

export default function HomeView() {
  const vm = useHomeViewModel();
  const {
    activeTab, switchTab,
    showProfileMenu, setShowProfileMenu, profileMenuRef,
    showGoalMenu, setShowGoalMenu, goalMenuRef,
    showCreateModal, setShowCreateModal,
    USER, activeBranch, branches,
    twText, showCursor,
    appCtx,
  } = vm;

  return (
    <div className="home-root">
      {/* ── Side Nav ─────────────────────────────────────────────────────── */}
      <nav className="side-nav">
        <div className="nav-brand">
          <div className="nav-logo">⚡</div>
          <span className="nav-name">PSU ALS</span>
        </div>
        <ul className="nav-menu">
          {NAV_TABS.map(tab => (
            <li key={tab.id}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => switchTab(tab.id)}>
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </li>
          ))}
        </ul>

        {/* Goal menu */}
        <div className="nav-goal-wrap" ref={goalMenuRef}>
          <button className="nav-goal-btn" onClick={() => setShowGoalMenu(prev => !prev)}>
            <span className="nav-goal-icon">{activeBranch?.goalIcon || '🎯'}</span>
            <div className="nav-goal-info">
              <span className="nav-goal-label">สายการเรียน</span>
              <span className="nav-goal-name">{activeBranch?.goalName || 'ยังไม่ได้เลือก'}</span>
            </div>
            <span className="nav-goal-arrow">{showGoalMenu ? '▲' : '▼'}</span>
          </button>
          {showGoalMenu && (
            <div className="goal-dropdown">
              <div className="goal-dropdown-header">เลือกสายการเรียน</div>
              {branches.map(b => (
                <div key={b.id}
                  className={`goal-dropdown-item ${b.id === activeBranch?.id ? 'active' : ''}`}
                  onClick={() => { appCtx?.switchBranch?.(b.id); setShowGoalMenu(false); }}>
                  <span>{b.goalIcon}</span>
                  <span>{b.goalName}</span>
                  {b.id === activeBranch?.id && <span className="goal-active-badge">✓</span>}
                </div>
              ))}
              <button className="goal-add-btn" onClick={() => { setShowCreateModal(true); setShowGoalMenu(false); }}>
                + เพิ่มสายการเรียน
              </button>
            </div>
          )}
        </div>

        {/* Profile menu */}
        <div className="nav-profile-wrap" ref={profileMenuRef}>
          <button className="nav-profile-btn" onClick={() => setShowProfileMenu(prev => !prev)}>
            <div className="nav-avatar">{USER.avatar}</div>
            <div className="nav-user-info">
              <span className="nav-user-name">{twText}{showCursor && <span className="cursor">|</span>}</span>
              <span className="nav-user-role">Student</span>
            </div>
          </button>
          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="pd-avatar">{USER.avatar}</div>
                <div>
                  <div className="pd-name">{USER.name}</div>
                  <div className="pd-goal">{USER.goal}</div>
                </div>
              </div>
              <div className="profile-dropdown-item" onClick={() => { switchTab('Profile'); setShowProfileMenu(false); }}>
                👤 โปรไฟล์
              </div>
              <div className="profile-dropdown-divider" />
              <div className="profile-dropdown-item danger">🚪 ออกจากระบบ</div>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────────────────────── */}
      <main className="home-main">
        {activeTab === 'Home'      && <HomeTabView      vm={vm} />}
        {activeTab === 'SkillTree' && <SkillTreeTabView vm={vm} />}
        {activeTab === 'History'   && <HistoryTabView   vm={vm} />}
        {activeTab === 'Profile'   && <ProfileTabView   vm={vm} />}
      </main>

      {/* ── Create Branch Modal ───────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateBranchModal onClose={() => setShowCreateModal(false)} />
      )}
    </div>
  );
}
