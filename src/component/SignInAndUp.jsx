import React, { useState, useEffect } from 'react';
import './decorate/signInAndUp.css'; // Paste your <style> content into this file
import close_eye from '../assets/closed-eyes.png';
import GetStart from './GetStart.jsx'
import { useNavigate } from 'react-router-dom';
export default function SignInAndUp() {
  const [activeTab, setActiveTab] = useState('login');
  
  // Form State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    fname: '', lname: '', dob: '', gender: '', username: '', password: '', confirm: ''
  });
  //naviagate
  const navigate = useNavigate();
  // UI State
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [showRegPw, setShowRegPw] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', show: false });

  // Validation State
  const [usernameMsg, setUsernameMsg] = useState({ text: '', type: '' });
  const [confirmMsg, setConfirmMsg] = useState({ text: '', type: '' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type, show: true });
    setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3200);
  };

  const handleLoginSubmit = () => {
    if (!loginForm.username || !loginForm.password) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Welcome back, ${loginForm.username}! 🎓`, 'success');
      // window.location.href = '/home';
      console.log('login complete')
      // setTimeout(() => navigate('/home'), 900);
      console.log('login complete')
      // navigate('/getstart')
      
    }, 1400);
    
    navigate('/select-branch')
  };

  const handleRegSubmit = () => {
    const { fname, lname, dob, gender, username, password, confirm } = regForm;
    if (!fname || !lname || !dob || !gender || !username || !password || !confirm) {
      showToast('Please fill in all fields', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'error');
      return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters', 'error');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast(`Account created! Welcome, ${fname} 🎉`, 'success');
      navigate('/getstart')
      // window.location.href = '/getstarted';
    }, 1600);
  };

  const checkUsername = (val) => {
    setRegForm({ ...regForm, username: val });
    const takenNames = ['admin', 'psu_user', 'hello_myname', 'test'];
    const cleanVal = val.trim().toLowerCase();
    
    if (!cleanVal) return setUsernameMsg({ text: '', type: '' });
    if (cleanVal.length < 4) return setUsernameMsg({ text: 'At least 4 characters', type: 'err' });
    if (takenNames.includes(cleanVal)) return setUsernameMsg({ text: '✗ Username already taken', type: 'err' });
    
    setUsernameMsg({ text: '✓ Username available', type: 'ok' });
  };

  const checkMatch = (val) => {
    setRegForm({ ...regForm, confirm: val });
    if (!val) return setConfirmMsg({ text: '', type: '' });
    if (regForm.password === val) return setConfirmMsg({ text: '✓ Passwords match', type: 'ok' });
    setConfirmMsg({ text: 'Passwords do not match', type: 'err' });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
    <div className="bg-layer"></div>
    <div className="bg-grid"></div>
    <div className="orb orb-1"></div>
    <div className="orb orb-2"></div>
    <div className="orb orb-3"></div>

   <main className="page" style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  width: '100vw',
  position: 'fixed',
  top: 0,
  left: 0,
}}>
        <div className="brand">
          <div className="brand-mark">
            <div className="brand-icon">⚡</div>
            <span className="brand-name">G16 · AER</span>
          </div>
          <div className="brand-sub">Adaptive Exercise Recommendation based on User Profiles</div>
        </div>
        

        <div className="card" id="mainCard">
          <div className="tabs">
            <button 
              className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
              onClick={() => setActiveTab('login')}
            >
              Login
            </button>
            <button 
              className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
              onClick={() => setActiveTab('register')}
            >
              Register
            </button>
          </div>

          {/* LOGIN PANEL */}
          {activeTab === 'login' && (
            <div className="panel active">
              <h2 className="panel-title">Welcome back</h2>
              <p className="panel-sub">Sign in to continue your learning journey</p>

              <div className="field">
                <label>Username</label>
                <input 
                  type="text" 
                  placeholder="your_username" 
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                />
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input 
                    type={showLoginPw ? 'text' : 'password'} 
                    placeholder="••••••••" 
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  />
                  <button className="pw-toggle" onClick={() => setShowLoginPw(!showLoginPw)} tabIndex="-1">
                    {showLoginPw ? '🙈' : '👁'}
                  </button>
                </div>
              </div>

              <label className="remember">
                <input type="checkbox" id="rememberMe" />
                <div className="check-box">
                  <svg className="tick" viewBox="0 0 10 10"><polyline points="1.5,5 4,7.5 8.5,2.5"/></svg>
                </div>
                <span >Remember me</span>
              </label>

              <button className={`btn-primary ${isLoading ? 'loading' : ''}`} onClick={handleLoginSubmit}>
                <span>Sign In</span>
              </button>

              <div className="divider">
                <div className="divider-line"></div>
                <div className="divider-text">or</div>
                <div className="divider-line"></div>
              </div>

              <div style={{textAlign: 'center', fontSize: '13px', color: 'var(--muted)'}}>
                Don't have an account?
                <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('register'); }} style={{color: 'var(--gold)', textDecoration: 'none', marginLeft: '4px'}}>Create one →</a>
              </div>
            </div>
          )}

          {/* REGISTER PANEL */}
          {activeTab === 'register' && (
            <div className="panel active">
              <h2 className="panel-title">Create account</h2>
              <p className="panel-sub"></p>

              <div className="field-row">
                <div>
                  <label>First Name</label>
                  <input type="text" placeholder="สมชาย" value={regForm.fname} onChange={(e) => setRegForm({...regForm, fname: e.target.value})} />
                </div>
                <div>
                  <label>Last Name</label>
                  <input type="text" placeholder="ใจดี" value={regForm.lname} onChange={(e) => setRegForm({...regForm, lname: e.target.value})} />
                </div>
              </div>

              <div className="field-row">
                <div>
                  <label>Date of Birth</label>
                  <input type="date" max="2010-12-31" value={regForm.dob} onChange={(e) => setRegForm({...regForm, dob: e.target.value})} />
                </div>
                <div>
                  <label>Gender</label>
                  <div className="select-wrap">
                    <select value={regForm.gender} onChange={(e) => setRegForm({...regForm, gender: e.target.value})}>
                      <option value="" disabled>เลือก...</option>
                      <option value="man">Male</option>
                      <option value="woman">Female</option>
                      <option value="lgbtq">LGBTQ+</option>
                      <option value="none">ไม่ระบุ</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Username</label>
                <input type="text" placeholder="your_username" value={regForm.username} onChange={(e) => checkUsername(e.target.value)} className={usernameMsg.type === 'err' ? 'error' : usernameMsg.type === 'ok' ? 'ok' : ''} />
                <div className={`field-msg ${usernameMsg.type}`}>{usernameMsg.text}</div>
              </div>

              <div className="field">
                <label>Password</label>
                <div className="pw-wrap">
                  <input type={showRegPw ? 'text' : 'password'} placeholder="••••••••" value={regForm.password} onChange={(e) => setRegForm({...regForm, password: e.target.value})} />
                  <button className="pw-toggle" onClick={() => setShowRegPw(!showRegPw)} tabIndex="-1">{showRegPw ? '🙈' : '👁'}</button>
                </div>
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <div className="pw-wrap">
                  <input type={showRegConfirm ? 'text' : 'password'} placeholder="••••••••" value={regForm.confirm} onChange={(e) => checkMatch(e.target.value)} className={confirmMsg.type === 'err' ? 'error' : confirmMsg.type === 'ok' ? 'ok' : ''} />
                  <button className="pw-toggle" onClick={() => setShowRegConfirm(!showRegConfirm)} tabIndex="-1">{showRegConfirm ? '🙈' : '👁'}</button>
                </div>
                <div className={`field-msg ${confirmMsg.type}`}>{confirmMsg.text}</div>
              </div>

              <button className={`btn-primary ${isLoading ? 'loading' : ''}`} onClick={handleRegSubmit}>
                <span>Create Account</span>
              </button>

              <div style={{textAlign: 'center', fontSize: '13px', color: 'var(--muted)', marginTop: '16px'}}>
                Already have an account?
                <a href="" onClick={(e) => { e.preventDefault(); setActiveTab('login'); }} style={{color: 'var(--gold)', textDecoration: 'none', marginLeft: '4px'}}>Sign in →</a>
              </div>
            </div>
          )}

          {/* <div className="card-footer">
            By continuing you agree to our <a href="#">Terms of Service</a> &amp; <a href="#">Privacy Policy</a>
          </div> */}
        </div>
      </main>

      <div className={`toast ${toast.type} ${toast.show ? 'show' : ''}`}>
        {toast.message}
      </div>
    </div>
  );
}
