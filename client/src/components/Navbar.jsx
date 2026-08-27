import React from "react";
import { Users, LayoutDashboard, Cpu, Tv, RefreshCw, BarChart3, LogIn, LogOut, Sun, Moon, Monitor, Crown, ShieldCheck, GraduationCap } from "lucide-react";

export default function Navbar({ 
  currentView, 
  setCurrentView, 
  serverStatus: _serverStatus, 
  onSeedDemo, 
  isSyncing,
  isAuthenticated,
  currentUser,
  onLoginClick,
  onLogout,
  theme = "dark",
  setTheme
}) {
  const isStudent = currentUser?.role === 'student';
  const isAdmin = currentUser?.role === 'admin';
  const isStaff = currentUser?.role === 'staff';

  const allNavItems = [
    { id: "kiosk", label: "Check-In", fullLabel: "Campus Check-In Portal", icon: Users, roles: ['student', 'public', 'staff', 'admin'] },
    { id: "admin", label: "Staff", fullLabel: "Staff Desk", icon: LayoutDashboard, roles: ['staff', 'admin'] },
    { id: "analytics", label: "Analytics", fullLabel: "Analytics", icon: BarChart3, roles: ['admin'] },
    { id: "ai-hub", label: "AI Hub", fullLabel: "AI Hub", icon: Cpu, roles: ['admin'] },
    { id: "display", label: "TV Display", fullLabel: "TV Waiting Board", icon: Tv, roles: ['student', 'public', 'staff', 'admin'] },
  ];

  // Filter items according to active role:
  // Students see ONLY Check-In & TV Display
  const navItems = allNavItems.filter(item => {
    if (isStudent) return item.id === 'kiosk' || item.id === 'display';
    if (!isAuthenticated) return true; // Show all to guest (clicking triggers login prompt)
    if (isAdmin) return true;
    if (isStaff) return item.roles.includes('staff') || item.roles.includes('public');
    return item.roles.includes('public');
  });

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

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 rounded-none shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-13 gap-1 sm:gap-2">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer shrink-0 group" 
            onClick={() => setCurrentView("kiosk")}
          >
            {/* Custom QueueWise Geometric Logo */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-xs font-bold transition-transform group-hover:scale-105">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" />
                <path d="M8 11h6" />
                <path d="M11 8v6" />
              </svg>
            </div>
            <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight">
              QueueWise
            </span>
          </div>

          {/* Clean Flat Horizontal Tabs */}
          <nav className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 space-x-0.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              const isLocked = !isAuthenticated && (item.id === 'admin' || item.id === 'analytics' || item.id === 'ai-hub');
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  title={item.fullLabel + (isLocked ? " (Login Required)" : "")}
                  className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Action Symbols & Controls */}
          <div className="flex items-center space-x-1 shrink-0">

            {/* Cycle Theme Symbol Toggle */}
            <button
              onClick={cycleTheme}
              className="p-1.5 sm:px-2 sm:py-1 rounded text-xs font-medium bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition flex items-center space-x-1 shadow-2xs"
              title="Cycle Theme: Bright -> System -> Dark"
            >
              {getThemeIcon()}
              <span className="hidden md:inline text-[11px] font-semibold">{getThemeLabel()}</span>
            </button>

            {/* Live Seed Demo Button */}
            {onSeedDemo && (
              <button
                onClick={onSeedDemo}
                disabled={isSyncing}
                title="Seed 10 Live Campus Demo Tickets"
                className="p-1.5 sm:px-2 sm:py-1 rounded text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Seed</span>
              </button>
            )}

            {/* Auth Button & Role Profile Badge */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className={`px-2 py-1 rounded-md text-[11px] font-bold border hidden sm:flex items-center space-x-1 shadow-2xs ${
                  isStudent
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                    : isAdmin 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300 border-amber-500/30' 
                      : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}>
                  {isStudent && <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                  {isStaff && <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  {isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                  <span>
                    {currentUser?.name || currentUser?.username}
                    {currentUser?.rollNo ? ` (${currentUser.rollNo})` : ''}
                    {currentUser?.counterNumber ? ` (Desk #${currentUser.counterNumber})` : ''}
                  </span>
                </span>

                <button
                  onClick={onLogout}
                  className="px-2.5 py-1 rounded text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition flex items-center space-x-1 shadow-2xs"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-2.5 py-1 rounded text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center space-x-1 shadow-2xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Portal Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
