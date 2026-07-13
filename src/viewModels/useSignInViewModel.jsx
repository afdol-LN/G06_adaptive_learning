// ─── viewModels/useSignInViewModel.jsx ──────────────────────────────────────
// SignIn/SignUp ViewModel — จัดการ form state, validation และ auth
// คืนค่าพร้อมใช้ให้ SignInView
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const INITIAL_LOGIN = { username: '', password: '' };
const INITIAL_REG   = { fname: '', lname: '', dob: '', gender: '', username: '', password: '', confirm: '' };

export function useSignInViewModel() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();

  const [mode,        setMode]        = useState('login');
  const [loginForm,   setLoginForm]   = useState(INITIAL_LOGIN);
  const [regForm,     setRegForm]     = useState(INITIAL_REG);
  const [toast,       setToast]       = useState({ show: false, msg: '', type: 'error' });
  const [loading,     setLoading]     = useState(false);
  const [passMatch,   setPassMatch]   = useState(null);
  const [unameTaken,  setUnameTaken]  = useState(null);

  const showToast = (msg, type = 'error') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: 'error' }), 3000);
  };

  const setLoginField = (k, v) => setLoginForm(f => ({ ...f, [k]: v }));
  const setRegField   = (k, v) => {
    setRegForm(f => ({ ...f, [k]: v }));
    if (k === 'confirm')  setPassMatch(regForm.password === v);
    if (k === 'password') setPassMatch(v === regForm.confirm);
    if (k === 'username') {
      setUnameTaken(null);
      if (v.length >= 3) {
        const taken = ['admin', 'psu_user', 'hello_myname'];
        setTimeout(() => setUnameTaken(taken.includes(v.toLowerCase())), 400);
      }
    }
  };

  const handleLogin = async e => {
    e.preventDefault();
    const { username, password } = loginForm;
    if (!username || !password) { showToast('กรุณากรอกข้อมูลให้ครบถ้วน'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);
    saveProfile({ fname: username, lname: 'User', username });
    navigate('/home');
  };

  const handleRegister = async e => {
    e.preventDefault();
    const { fname, lname, dob, gender, username, password, confirm } = regForm;
    if (!fname || !lname || !dob || !gender || !username || !password) {
      showToast('กรุณากรอกข้อมูลให้ครบถ้วน'); return;
    }
    if (password !== confirm) { showToast('รหัสผ่านไม่ตรงกัน'); return; }
    if (password.length < 8)  { showToast('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'); return; }
    if (unameTaken)            { showToast('Username นี้ถูกใช้แล้ว'); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    saveProfile({ fname, lname, username, gender, dob });
    showToast('สมัครสมาชิกสำเร็จ!', 'success');
    setTimeout(() => navigate('/getstart'), 1200);
  };

  return {
    mode, loginForm, regForm, toast, loading, passMatch, unameTaken,
    setMode, setLoginField, setRegField, handleLogin, handleRegister,
  };
}
