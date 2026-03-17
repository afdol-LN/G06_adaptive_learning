import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import SignInAndUp from './component/SignInAndUp';
import GetStart from './component/GetStart';
import Pretest from './component/Pretest';
import InformationFrom from './component/InformationForm';
import Home from './component/Home';
import Exercise from './component/Exercise';
import AdminHome from './component/Adminhome';
import SelectBranch from './component/SelectBranch';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path='/'              element={<SignInAndUp />} />
          <Route path='/getstart'      element={<GetStart />} />
          <Route path='/pretest'       element={<Pretest />} />
          <Route path='/information'   element={<InformationFrom />} />
          <Route path='/home'          element={<Home />} />
          <Route path='/exercise'      element={<Exercise />} />
          <Route path='/admin/home'    element={<AdminHome />} />
          <Route path='/select-branch' element={<SelectBranch />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
