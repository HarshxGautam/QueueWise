import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, X, ShieldCheck, Crown, Users, GraduationCap } from 'lucide-react';

const HOST = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE = `http://${HOST}:5000/api`;

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'staff' | 'admin'
  const [username, setUsername] = useState('22CS101');
  const [password, setPassword] = useState('student123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setError('');
    if (tab === 'student') {
      setUsername('22CS101');
      setPassword('student123');
    } else if (tab === 'admin') {
      setUsername('admin');
      setPassword('admin123');
    } else {
      setUsername('staff1');
      setPassword('staff123');
    }
  };

  const setQuickUser = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.trim(),
          rollNo: activeTab === 'student' ? username.trim() : undefined,
          password 
        })
      });

      const data = await res.json();

      if (res.ok && data.token) {
        onLoginSuccess({ token: data.token, user: data.user });
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Connection error. Please check backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-[420px] max-h-[92vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in bg-white dark:bg-[#161b22] text-heading">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1 rounded-lg text-sub hover:text-heading hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Header */}
          <div className="flex items-center space-x-3 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
              activeTab === 'student' 
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                : activeTab === 'admin' 
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                  : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
            }`}>
              {activeTab === 'student' && <GraduationCap className="w-5 h-5" />}
              {activeTab === 'staff' && <ShieldCheck className="w-5 h-5" />}
              {activeTab === 'admin' && <Crown className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-heading tracking-tight leading-tight">
                {activeTab === 'student' && 'Student Portal Login'}
                {activeTab === 'staff' && 'Staff Desk Login'}
                {activeTab === 'admin' && 'Campus Admin Portal'}
              </h2>
              <p className="text-[11px] text-sub">
                {activeTab === 'student' && 'Check-in & live monitor dashboard'}
                {activeTab === 'staff' && 'Serve tickets at assigned counter'}
                {activeTab === 'admin' && 'Master analytics & AI SLA engine'}
              </p>
            </div>
          </div>

          {/* Role Switcher Tabs (3 Roles) */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => handleTabSwitch('student')}
              className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                activeTab === 'student'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-sub hover:text-heading'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('staff')}
              className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-xs font-bold'
                  : 'text-sub hover:text-heading'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Staff</span>
            </button>
            <button
              type="button"
              onClick={() => handleTabSwitch('admin')}
              className={`py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1 ${
                activeTab === 'admin'
                  ? 'bg-amber-500 text-white shadow-xs font-extrabold'
                  : 'text-sub hover:text-heading'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>

          {/* Quick 1-Click Profile Autofill */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-sub tracking-wider">
              <span>
                {activeTab === 'student' && 'Select Demo Student:'}
                {activeTab === 'staff' && 'Select Counter Operator:'}
                {activeTab === 'admin' && 'Admin Master Profile:'}
              </span>
              <span className="text-[9px] text-blue-500 font-semibold">1-Click Auto Fill</span>
            </div>

            {activeTab === 'student' && (
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickUser('22CS101', 'student123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === '22CS101' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Aarav Sharma</div>
                  <div className="text-[9px] opacity-70 font-mono">22CS101 (CSE)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('23EC204', 'student123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === '23EC204' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Ananya Iyer</div>
                  <div className="text-[9px] opacity-70 font-mono">23EC204 (ECE)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('22IT105', 'student123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === '22IT105' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Rohan Mehta</div>
                  <div className="text-[9px] opacity-70 font-mono">22IT105 (IT)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('24ME302', 'student123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === '24ME302' ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-400 text-blue-600 dark:text-blue-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Pooja Gupta</div>
                  <div className="text-[9px] opacity-70 font-mono">24ME302 (ME)</div>
                </button>
              </div>
            )}

            {activeTab === 'staff' && (
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setQuickUser('staff1', 'staff123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === 'staff1' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Priya Sharma</div>
                  <div className="text-[9px] opacity-70">Desk #1 (Placement)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('staff2', 'staff123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === 'staff2' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Rajesh Kumar</div>
                  <div className="text-[9px] opacity-70">Desk #2 (Academic)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('staff3', 'staff123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === 'staff3' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Amit Patel</div>
                  <div className="text-[9px] opacity-70">Desk #3 (IT Helpdesk)</div>
                </button>
                <button
                  type="button"
                  onClick={() => setQuickUser('staff4', 'staff123')}
                  className={`p-2 rounded-lg border text-left transition ${
                    username === 'staff4' ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-400 text-indigo-600 dark:text-indigo-400 font-bold' : 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-sub hover:text-heading font-medium'
                  }`}
                >
                  <div className="text-xs">Neha Verma</div>
                  <div className="text-[9px] opacity-70">Desk #4 (Student Serv.)</div>
                </button>
              </div>
            )}

            {activeTab === 'admin' && (
              <button
                type="button"
                onClick={() => setQuickUser('admin', 'admin123')}
                className="w-full p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between"
              >
                <span>👑 Campus Admin Master</span>
                <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded font-mono">admin / admin123</span>
              </button>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-sub uppercase tracking-wider mb-1">
                {activeTab === 'student' ? 'Student Roll Number' : 'Username'}
              </label>
              <div className="relative">
                {activeTab === 'student' ? (
                  <GraduationCap className="absolute left-3 top-2.5 w-4 h-4 text-sub" />
                ) : (
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-sub" />
                )}
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={activeTab === 'student' ? 'e.g. 22CS101' : 'Enter username'}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-sub uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-sub" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-xs font-semibold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-sub hover:text-heading transition"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs text-center font-semibold">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-xs transition disabled:opacity-50 ${
                activeTab === 'student'
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : activeTab === 'admin' 
                    ? 'bg-amber-600 hover:bg-amber-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading 
                ? 'Signing In...' 
                : activeTab === 'student'
                  ? 'Sign In as Student'
                  : `Sign In as ${activeTab === 'admin' ? 'Campus Admin' : 'Staff Operator'}`
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
