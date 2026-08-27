import React, { useState } from 'react';
import { 
  GraduationCap, 
  Crown, 
  Users, 
  Lock, 
  User, 
  Phone, 
  BookOpen, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Layers, 
  Briefcase, 
  Laptop, 
  FileText, 
  Sparkles,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { API_BASE } from '../config/api';

const CAMPUS_SERVICES_PREVIEW = [
  { name: "Placement Cell", icon: Briefcase, wait: "12m", prefix: "P" },
  { name: "IT Help Desk", icon: Laptop, wait: "8m", prefix: "IT" },
  { name: "Academic Counseling", icon: GraduationCap, wait: "15m", prefix: "AC" },
  { name: "Student Services", icon: FileText, wait: "6m", prefix: "SS" }
];

export default function AuthLandingPage({ onLoginSuccess, theme = "dark", setTheme }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [activeRoleTab, setActiveRoleTab] = useState('student'); // 'student' | 'staff' | 'admin'
  
  // Cycle theme: dark -> bright -> system -> dark
  const cycleTheme = () => {
    if (!setTheme) return;
    if (theme === "dark") setTheme("bright");
    else if (theme === "bright" || theme === "light") setTheme("system");
    else setTheme("dark");
  };

  const getThemeIcon = () => {
    if (theme === "bright" || theme === "light") return <Sun className="w-3.5 h-3.5 text-amber-500" />;
    if (theme === "system") return <Monitor className="w-3.5 h-3.5 text-cyan-400" />;
    return <Moon className="w-3.5 h-3.5 text-blue-400" />;
  };

  const getThemeLabel = () => {
    if (theme === "bright" || theme === "light") return "Bright";
    if (theme === "system") return "System";
    return "Dark";
  };
  
  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('22CS101');
  const [loginPassword, setLoginPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  
  // Signup Form State
  const [signupForm, setSignupForm] = useState({
    name: '',
    rollNo: '',
    department: 'Computer Science',
    phone: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleTabChange = (role) => {
    setActiveRoleTab(role);
    setError('');
    setSuccessMsg('');
    if (role === 'student') {
      setLoginIdentifier('22CS101');
      setLoginPassword('student123');
    } else if (role === 'admin') {
      setLoginIdentifier('admin');
      setLoginPassword('admin123');
    } else {
      setLoginIdentifier('staff1');
      setLoginPassword('staff123');
    }
  };

  const setQuickUser = (user, pass) => {
    setLoginIdentifier(user);
    setLoginPassword(pass);
    setError('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: loginIdentifier.trim(),
          rollNo: activeRoleTab === 'student' ? loginIdentifier.trim() : undefined,
          password: loginPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onLoginSuccess({ token: data.token, user: data.user });
      } else {
        setError(data.error || 'Invalid credentials. Please check your credentials.');
      }
    } catch {
      setError('Cannot connect to campus backend server. Please ensure server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsLoading(true);

    if (signupForm.phone && signupForm.phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm)
      });

      const data = await res.json();

      if (res.ok && data.token) {
        setSuccessMsg('Account registered successfully! Entering portal...');
        setTimeout(() => {
          onLoginSuccess({ token: data.token, user: data.user });
        }, 600);
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch {
      setError('Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-8 sm:py-12 transition-colors">
      
      {/* Top-Right Theme Toggle Button */}
      {setTheme && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
          <button
            type="button"
            onClick={cycleTheme}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-[0_1px_3px_rgba(0,0,0,0.04)] transition flex items-center space-x-1.5"
            title="Cycle Theme: Bright -> System -> Dark"
          >
            {getThemeIcon()}
            <span>{getThemeLabel()}</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl space-y-6 sm:space-y-8 animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Campus Queue Management System</span>
          </div>

          <div className="flex items-center justify-center space-x-2.5 pt-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs font-bold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
                <path d="M8 11h6" />
                <path d="M11 8v6" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              QueueWise Campus Portal
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Authorized virtual queuing and service desk intake platform for students, faculty & administrators.
          </p>
        </div>

        {/* Main Auth Container Box */}
        <div className="max-w-xl mx-auto w-full glass-panel rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#161b22] shadow-[0_4px_20px_rgba(0,0,0,0.04)] space-y-6">
          
          {/* Top Auth Mode Switcher (Sign In vs New Student Registration) */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Campus Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('signup'); setError(''); setSuccessMsg(''); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center justify-center space-x-2 ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>New Student Sign Up</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs text-center font-semibold animate-shake">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs text-center font-semibold">
              {successMsg}
            </div>
          )}

          {/* 1. SIGN IN MODE */}
          {authMode === 'login' ? (
            <div className="space-y-5">
              
              {/* Role Sub-Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('student')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    activeRoleTab === 'student'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('staff')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    activeRoleTab === 'staff'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Staff Desk</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('admin')}
                  className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                    activeRoleTab === 'admin'
                      ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Crown className="w-3.5 h-3.5" />
                  <span>Admin</span>
                </button>
              </div>

              {/* 1-Click Profile Autofill Helper */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  <span>
                    {activeRoleTab === 'student' && 'Select Registered Student:'}
                    {activeRoleTab === 'staff' && 'Select Desk Operator:'}
                    {activeRoleTab === 'admin' && 'Admin Master Profile:'}
                  </span>
                  <span className="text-[9px] text-blue-600 dark:text-blue-400 font-semibold">1-Click Auto Fill</span>
                </div>

                {activeRoleTab === 'student' && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQuickUser('22CS101', 'student123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === '22CS101' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">Aarav Sharma</div>
                      <div className="text-[9px] opacity-75 font-mono">22CS101 (CSE)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('23EC204', 'student123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === '23EC204' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">Ananya Iyer</div>
                      <div className="text-[9px] opacity-75 font-mono">23EC204 (ECE)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('22IT105', 'student123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === '22IT105' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">Rohan Mehta</div>
                      <div className="text-[9px] opacity-75 font-mono">22IT105 (IT)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('24ME302', 'student123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === '24ME302' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold truncate">Pooja Gupta</div>
                      <div className="text-[9px] opacity-75 font-mono">24ME302 (ME)</div>
                    </button>
                  </div>
                )}

                {activeRoleTab === 'staff' && (
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setQuickUser('staff1', 'staff123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === 'staff1' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold">Priya Sharma</div>
                      <div className="text-[9px] opacity-75">Desk #1 (Placement)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('staff2', 'staff123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === 'staff2' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold">Rajesh Kumar</div>
                      <div className="text-[9px] opacity-75">Desk #2 (Academic)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('staff3', 'staff123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === 'staff3' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold">Amit Patel</div>
                      <div className="text-[9px] opacity-75">Desk #3 (IT Desk)</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickUser('staff4', 'staff123')}
                      className={`p-2 rounded-lg border text-left transition ${
                        loginIdentifier === 'staff4' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 font-medium'
                      }`}
                    >
                      <div className="text-xs font-bold">Neha Verma</div>
                      <div className="text-[9px] opacity-75">Desk #4 (Student Serv.)</div>
                    </button>
                  </div>
                )}

                {activeRoleTab === 'admin' && (
                  <button
                    type="button"
                    onClick={() => setQuickUser('admin', 'admin123')}
                    className="w-full p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between"
                  >
                    <span>👑 Campus Administrator Master</span>
                    <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">admin / admin123</span>
                  </button>
                )}
              </div>

              {/* Login Form Inputs */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    {activeRoleTab === 'student' ? 'Student University Roll Number' : 'Staff Username'}
                  </label>
                  <div className="relative">
                    {activeRoleTab === 'student' ? (
                      <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    ) : (
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    )}
                    <input
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={activeRoleTab === 'student' ? 'e.g. 22CS101' : 'Enter username'}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs sm:text-sm font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-xl text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${
                    activeRoleTab === 'student'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : activeRoleTab === 'admin' 
                        ? 'bg-amber-600 hover:bg-amber-700' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <span>
                    {isLoading 
                      ? 'Authenticating...' 
                      : activeRoleTab === 'student'
                        ? 'Enter Student Desk'
                        : `Sign In as ${activeRoleTab === 'admin' ? 'Campus Admin' : 'Staff Operator'}`
                    }
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

            </div>
          ) : (
            /* 2. NEW STUDENT SIGN UP MODE */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 text-xs text-blue-900 dark:text-blue-200 flex items-start space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <span>Register your student profile to access virtual queue passes and real-time turn SMS notifications.</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Student Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Siddharth Verma"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    University Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={signupForm.rollNo}
                      onChange={(e) => setSignupForm({ ...signupForm, rollNo: e.target.value.toUpperCase() })}
                      placeholder="e.g. 23CS205"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-bold font-mono focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Department / Branch
                  </label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <select
                      value={signupForm.department}
                      onChange={(e) => setSignupForm({ ...signupForm, department: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    >
                      <option value="Computer Science">Computer Science (CSE)</option>
                      <option value="Information Tech">Information Technology (IT)</option>
                      <option value="Electronics & Comm.">Electronics & Comm. (ECE)</option>
                      <option value="Mechanical Engg.">Mechanical Engineering (ME)</option>
                      <option value="Business Admin">Business Administration (MBA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number (10 Digits)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      maxLength={10}
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-mono font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Create Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={signupForm.password}
                    onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                    placeholder="Create a secure password"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-medium focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Creating Account...' : 'Complete Student Registration'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

        </div>

        {/* Live Service Counter Glance */}
        <div className="max-w-xl mx-auto space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold uppercase tracking-wider text-[10px]">Campus Counter Live Preview</span>
            <span className="flex items-center space-x-1 text-[10px] text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Desks Online</span>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAMPUS_SERVICES_PREVIEW.map((s, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-0.5">
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                <p className="text-[10px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">~{s.wait} avg wait</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
