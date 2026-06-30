import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SignInAndUp from './component/SignInAndUp'
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import GetStart from './component/GetStart'
import Pretest from './component/Pretest'
import InformationFrom from './component/InformationForm'
import Home from './component/Home'
import HomeNew from './component/Home'
import Exercise from './component/Exercise'
import AdminHome from './component/Adminhome'
import SkillTree from './component/SkillTree'
function App() {

  return (
    <Router>
      {/* <SignInAndUp/> */}
      {/* <a href={<GetStart/>}>this is test message</a> */}
      <Routes>
        <Route path='/' element={<SignInAndUp/>}></Route>
        <Route path='/getstart' element = {<GetStart/>}></Route> 
        <Route path='/pretest' element = {<Pretest/>}></Route> 
        <Route path='/information' element = {<InformationFrom/>}></Route>  
        <Route path='/home' element = {<Home/>}></Route> 
        <Route path='/homenew' element = {<HomeNew/>}></Route> 
        <Route path='/exercise' element = {<Exercise/>}></Route>
        <Route path='/admin/home' element = {<AdminHome/>}></Route>
        <Route path='/skilltree' element = {<SkillTree/>}></Route>
      </Routes>
    </Router>
  )
}

export default App();
