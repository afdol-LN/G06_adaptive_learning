// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { AppProvider } from './context/AppContext'

// ── ใหม่: views ตาม MVVM Architecture ────────────────────────────────────────
// views/auth
import GetStartView    from './views/auth/GetStartView'
// views/onboarding
import InformationView from './views/onboarding/InformationView'
import PretestView     from './views/onboarding/PretestView'
// views/home
import HomeView        from './views/home/HomeView'
// views/admin
import AdminView       from './views/admin/AdminView'

// ── เก่า: component เดิม (ยังคงไว้เพื่อ backward compatibility) ─────────────
import SignInAndUp     from './component/SignInAndUp'
import Exercise        from './component/Exercise'
import SkillTree       from './component/SkillTree'
import SelectBranch    from './component/SelectBranch'

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path='/'           element={<SignInAndUp />} />
          <Route path='/getstart'   element={<GetStartView />} />

          {/* Onboarding */}
          <Route path='/information' element={<InformationView />} />
          <Route path='/pretest'     element={<PretestView />} />

          {/* Main App */}
          <Route path='/home'       element={<HomeView />} />
          <Route path='/exercise'   element={<Exercise />} />
          <Route path='/skilltree'  element={<SkillTree />} />
          <Route path='/branches'   element={<SelectBranch />} />

          {/* Admin */}
          <Route path='/admin/home' element={<AdminView />} />
        </Routes>
      </Router>
    </AppProvider>
  )
}

export default App;
