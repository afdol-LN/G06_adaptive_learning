import { createContext, useContext, useState, useEffect } from 'react'
import { AppClient } from '../API/appRestApi'
import { BranchService } from '../services/branchService'

const AppContext = createContext<any>(null)

export function AppProvider({ children  }) {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    AppClient.setGlobalLoaderCallback(setIsLoading)
  }, [])

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
        String(branch.id) === String(branchId)
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

  async function fetchMyBranches() {
    try {
      const serverBranches = await BranchService.getMyBranches();
      
      const prev = (() => {
        try {
          return JSON.parse(localStorage.getItem("branches")) || [];
        } catch {
          return branches || [];
        }
      })();

      const updated = [];
      serverBranches.forEach((sb) => {
        const existingBranch = prev.find((b) => String(b.id) === String(sb.id));
        const newBranchData = {
          id: String(sb.id),
          goalId: String(sb.goalId),
          goalName: sb.goal?.goal || "",
          goalDesc: sb.goal?.goalDescription || "",
          isAlreadyPretest: sb.isAlreadyPretest,
          exp: sb.expForGoal,
        };
        if (existingBranch) {
          updated.push({ ...existingBranch, ...newBranchData });
        } else {
          updated.push({
            ...newBranchData,
            xp: 0,
            level: 1,
            streak: 0,
            unlockedSkills: [],
            sessions: [],
          });
        }
      });
      localStorage.setItem("branches", JSON.stringify(updated));
      setBranches(updated);
      return updated;
    } catch (e) {
      console.error("Failed to fetch branches", e);
      return [];
    }
  }
  return (
    <AppContext.Provider value={{
      userProfile,    saveProfile,
      branches,       addBranch,    updateBranch, fetchMyBranches,
      activeBranchId, activeBranch, switchBranch,
      isLoading,      setIsLoading,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
