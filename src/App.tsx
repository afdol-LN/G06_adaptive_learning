// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import "./App.css";
import SignInAndUp from "./component/SignInAndUp";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import GetStart from "./component/GetStart";
import Pretest from "./component/Pretest";
import InformationForm from "./component/information/InformationForm";
import SelectBranch from "./component/SelectBranch";
import HomeShell from "./component/home/HomeShell";
import Exercise from "./component/Exercise";
import AdminHome from "./component/adminHome/Adminhome";
import SkillTree from "./component/SkillTree";
import { AppProvider, useApp } from "./context/AppContext";
import GlobalLoader from "./component/common/GlobalLoader";

function AppContent() {
  const { isLoading } = useApp();

  return (
    <>
      <GlobalLoader isLoading={isLoading} />
      <Router>
        <Routes>
          <Route path="/" element={<SignInAndUp />}></Route>
          <Route path="/getstart" element={<GetStart />}></Route>
          <Route path="/pretest" element={<Pretest />}></Route>
          <Route path="/information" element={<InformationForm />}></Route>
          <Route path="/selectbranch" element={<SelectBranch />}></Route>
          <Route path="/home" element={<HomeShell />}></Route>
          <Route path="/homenew" element={<HomeShell />}></Route>
          <Route path="/exercise" element={<Exercise />}></Route>
          <Route path="/admin/home" element={<AdminHome />}></Route>
          <Route path="/skilltree" element={<SkillTree />}></Route>
        </Routes>
      </Router>
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
