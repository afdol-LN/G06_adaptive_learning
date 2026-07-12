import { createContext, useContext, useState } from 'react'
import { ProfileService } from '../services/profileService'

const AppContext = createContext(null)

export function AppProvider({ children }) {

  // ── ข้อมูลส่วนตัว (ใช้ร่วมกันทุก branch) ──────────────────────
  const [userProfile, setUserProfile] = useState(() => {
    return ProfileService.getUserProfile();
  });

  // ── รายการ branch ทั้งหมด ──────────────────────────────────────
  const [branches, setBranches] = useState(() => {
    return ProfileService.getBranches();
  });

  // ── branch ที่กำลังใช้งานอยู่ ──────────────────────────────────
  const [activeBranchId, setActiveBranchIdState] = useState(() => {
    return ProfileService.getActiveBranchId();
  });

  const activeBranch = branches.find(b => b.id === activeBranchId) || null

  // ── saveProfile ───────────────────────────────────────────────
  function saveProfile(data) {
    const saved = ProfileService.saveUserProfile(data);
    setUserProfile(saved);
  }

  // ── addBranch ─────────────────────────────────────────────────
  function addBranch(branchData) {
    const newBranch = ProfileService.addBranch(branchData);
    setBranches(ProfileService.getBranches());
    return newBranch.id;
  }

  // ── switchBranch ──────────────────────────────────────────────
  function switchBranch(branchId) {
    ProfileService.setActiveBranchId(branchId);
    setActiveBranchIdState(branchId);
  }

  // ── updateBranch ──────────────────────────────────────────────
  function updateBranch(branchId, changes) {
    const updatedBranches = ProfileService.updateBranch(branchId, changes);
    setBranches(updatedBranches);
  }

  return (
    <AppContext.Provider value={{
      userProfile,    saveProfile,
      branches,       addBranch,    updateBranch,
      activeBranchId, activeBranch, switchBranch,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}

