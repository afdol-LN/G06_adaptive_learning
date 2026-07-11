import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {

  // ── ข้อมูลส่วนตัว (ใช้ร่วมกันทุก branch) ──────────────────────
  // บันทึกจาก SignInAndUp: { fname, lname, gender, dob, username }
const [userProfile, setUserProfile] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("userProfile")) || null;
  } catch {
    return null;
  }
});
  // ── รายการ branch ทั้งหมด ──────────────────────────────────────
  // แต่ละ branch สร้างจากการกรอก InformationForm 1 ครั้ง
  // รูปแบบ: { id, campus, faculty, major, year, goalId, goalName, goalIcon, exp,
  //           xp, level, streak, unlockedSkills[], sessions[], createdAt }
  const [branches, setBranches] = useState(() => {
  try {
    return JSON.parse(localStorage.getItem("branches")) || [];
  } catch {
    return [];
  }
});
  // ── branch ที่กำลังใช้งานอยู่ ──────────────────────────────────
  const [activeBranchId, setActiveBranchId] = useState(() => {
  return localStorage.getItem("activeBranchId") || null;
});
  const activeBranch = branches.find(b => b.id === activeBranchId) || null

  // ── saveProfile ───────────────────────────────────────────────
  function saveProfile(data) {
    setUserProfile(data)
    localStorage.setItem('userProfile', JSON.stringify(data))
  }

  // ── addBranch ─────────────────────────────────────────────────
  // เรียกตอนกด submit InformationForm
  // branchData = { campus, faculty, major, year, goalId, goalName, goalIcon, exp }
// แทนที่ด้วย
function addBranch(branchData) {
  const newBranch = {
    id: `branch_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, // ← id ไม่ซ้ำ
    xp: 0,
    level: 1,
    streak: 0,
    unlockedSkills: [],
    sessions: [],
    createdAt: new Date().toISOString(),
    ...branchData,
  }
  setBranches(prev => {
    const updated = [...prev, newBranch]  // ← ใช้ prev แทน branches
    localStorage.setItem('branches', JSON.stringify(updated))
    return updated
  })
  return newBranch.id
}

  // ── switchBranch ──────────────────────────────────────────────
  function switchBranch(branchId) {
    setActiveBranchId(branchId)
    localStorage.setItem('activeBranchId', branchId)
  }

  // ── updateBranch ──────────────────────────────────────────────
  // ใช้อัปเดต xp, unlockedSkills, sessions ฯลฯ ภายใน branch
 function updateBranch(branchId, changes) {
  setBranches(prev => {
    const updated = prev.map(branch =>
      branch.id === branchId
        ? { ...branch, ...changes }
        : branch
    );

    localStorage.setItem(
      "branches",
      JSON.stringify(updated)
    );

    return updated;
  });
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
