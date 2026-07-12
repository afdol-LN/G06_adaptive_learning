/**
 * @file useAuthViewModel.js
 * @description ViewModel สำหรับหน้า SignInAndUp (จัดการ State ของฟอร์ม Login/Register และ Validation)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function useAuthViewModel() {
  const navigate = useNavigate();
  const { saveProfile } = useApp();

  const [activeTab, setActiveTab] = useState('login');

  // Form State
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [regForm, setRegForm] = useState({
    fname: '',
    lname: '',
    dob: '',
    gender: '',
    username: '',
    password: '',
    confirm: '',
  });

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
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3200);
  };

  const handleLoginFormChange = (field, value) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  const handleRegFormChange = (field, value) => {
    setRegForm(prev => ({ ...prev, [field]: value }));
  };

  const checkUsername = val => {
    handleRegFormChange('username', val);
    const takenNames = ['admin', 'psu_user', 'hello_myname', 'test'];
    const cleanVal = val.trim().toLowerCase();

    if (!cleanVal) return setUsernameMsg({ text: '', type: '' });
    if (cleanVal.length < 4) return setUsernameMsg({ text: 'At least 4 characters', type: 'err' });
    if (takenNames.includes(cleanVal))
      return setUsernameMsg({ text: '✗ Username already taken', type: 'err' });

    setUsernameMsg({ text: '✓ Username available', type: 'ok' });
  };

  const checkMatch = val => {
    handleRegFormChange('confirm', val);
    if (!val) return setConfirmMsg({ text: '', type: '' });
    if (regForm.password === val)
      return setConfirmMsg({ text: '✓ Passwords match', type: 'ok' });
    setConfirmMsg({ text: 'Passwords do not match', type: 'err' });
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
      navigate('/getstart');
    }, 800);
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
      saveProfile({ fname, lname, dob, gender, username });
      showToast(`Account created! Welcome, ${fname} 🎉`, 'success');
      navigate('/getstart');
    }, 800);
  };

  return {
    state: {
      activeTab,
      loginForm,
      regForm,
      showLoginPw,
      showRegPw,
      showRegConfirm,
      isLoading,
      toast,
      usernameMsg,
      confirmMsg,
    },
    actions: {
      setActiveTab,
      handleLoginFormChange,
      handleRegFormChange,
      setShowLoginPw,
      setShowRegPw,
      setShowRegConfirm,
      checkUsername,
      checkMatch,
      handleLoginSubmit,
      handleRegSubmit,
    },
  };
}
