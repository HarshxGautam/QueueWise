import React, { useState, useEffect } from "react";
import { Users, PhoneCall, CheckCircle, PauseCircle, Crown, Search, ShieldCheck, UserCheck, Lock, ShieldAlert } from "lucide-react";

export default function StaffDashboard({
  summary,
  tickets,
  counters,
  services: _services,
  onCallNext,
  onUpdateStatus,
  selectedCounter,
  setSelectedCounter,
  currentUser
}) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [lockNotice, setLockNotice] = useState(null);

  const isStaff = currentUser?.role === "staff" && currentUser?.counterNumber;
  const staffCounterNum = currentUser?.counterNumber;

  // Auto-bind staff to their assigned counter window
  useEffect(() => {
    if (isStaff && selectedCounter !== staffCounterNum) {
      setSelectedCounter(staffCounterNum);
    }
  }, [isStaff, staffCounterNum, selectedCounter]);

  const handleCounterClick = (c) => {
    if (isStaff && c.counterNumber !== staffCounterNum) {
      setLockNotice(`🔒 Access Restricted: You are assigned to Counter #${staffCounterNum} (${currentUser.name}). Staff operators can only operate their own counter.`);
      setTimeout(() => setLockNotice(null), 4000);
      return;
    }
    setSelectedCounter(c.counterNumber);
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus = filterStatus === "all" || t.status === filterStatus;
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activeCounterObj = counters.find((c) => c.counterNumber === selectedCounter) || counters[0];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Access Restriction Notice Banner */}
      {lockNotice && (
        <div className="p-3.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center space-x-2 animate-shake">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
          <span>{lockNotice}</span>
        </div>
      )}
      {/* Header Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Waiting</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 font-mono">{summary.totalWaiting || 0}</p>
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">In Campus Queue</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">In Service</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 font-mono">{summary.totalInService || 0}</p>
          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">At Department Desks</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Served Today</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 font-mono">{summary.completedToday || 0}</p>
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">Completed Consultations</span>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Desks</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 font-mono">{summary.activeCounters || 0}</p>
          <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">Online Staff Desks</span>
        </div>
      </div>

      {/* Main Action Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Counter Selection & Call Action Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-2">
              <h2 className="text-sm sm:text-base font-extrabold text-heading whitespace-nowrap">
                Staff Control Station
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap shrink-0 ${
                isStaff 
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
              }`}>
                {isStaff ? `Desk #${staffCounterNum}` : `Counter #${selectedCounter}`}
              </span>
            </div>

            {/* Select Counter */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-sub uppercase">
                  {isStaff ? "Your Assigned Counter Station" : "Switch Active Counter (Admin)"}
                </label>
                {isStaff && (
                  <span className="text-[10px] text-amber-500 font-bold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked to Desk #{staffCounterNum}</span>
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {counters.map((c) => {
                  const isSel = c.counterNumber === selectedCounter;
                  const isLockedForStaff = isStaff && c.counterNumber !== staffCounterNum;

                  const counterStyles = {
                    1: { active: "bg-sky-600 border-sky-600 text-white shadow-sm ring-2 ring-sky-300", idle: "bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-950 dark:text-sky-200 hover:border-sky-400" },
                    2: { active: "bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-300", idle: "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 hover:border-emerald-400" },
                    3: { active: "bg-purple-600 border-purple-600 text-white shadow-sm ring-2 ring-purple-300", idle: "bg-purple-50/70 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 text-purple-950 dark:text-purple-200 hover:border-purple-400" },
                    4: { active: "bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-300", idle: "bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-950 dark:text-amber-200 hover:border-amber-400" }
                  };
                  const style = counterStyles[c.counterNumber] || counterStyles[1];

                  return (
                    <button
                      key={c.counterNumber}
                      onClick={() => handleCounterClick(c)}
                      className={`p-3 rounded-xl text-left border transition-all relative ${
                        isSel
                          ? style.active
                          : isLockedForStaff
                          ? "bg-slate-100/50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-800/40 text-slate-400 opacity-60 cursor-not-allowed"
                          : style.idle
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold flex items-center space-x-1.5">
                          <span className={`w-2 h-2 rounded-full ${isSel ? "bg-white" : "bg-current opacity-60"}`} />
                          <span>Counter {c.counterNumber}</span>
                        </div>
                        {isLockedForStaff && <Lock className="w-3 h-3 text-slate-400" />}
                        {isStaff && c.counterNumber === staffCounterNum && isSel && (
                          <span className="text-[9px] bg-white/20 px-1 rounded font-bold">You</span>
                        )}
                      </div>
                      <div className="text-[11px] opacity-90 truncate font-medium mt-0.5">{c.staffName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Serving Card */}
            {activeCounterObj && (
              <div className="p-5 rounded-2xl bg-indigo-50/40 dark:bg-slate-900 border border-indigo-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-sub font-semibold">
                  <span>Assigned Staff:</span>
                  <span className="font-bold text-heading">{activeCounterObj.staffName}</span>
                </div>

                <div className="text-center py-4 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80 shadow-xs">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-sub">Currently Serving</p>
                  <p className="text-4xl font-black text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
                    {activeCounterObj.currentTicket || "None"}
                  </p>
                </div>

                {/* Call Next Button */}
                <button
                  onClick={() => {
                    if (activeCounterObj.currentTicket) {
                      const curT = tickets.find(t => t.ticketNumber === activeCounterObj.currentTicket);
                      if (curT && curT.status === "in-service") {
                        alert(`⚠️ Counter #${selectedCounter} is currently serving ticket ${activeCounterObj.currentTicket}. Please complete or cancel this task before calling the next customer.`);
                        return;
                      }
                    }
                    onCallNext(selectedCounter);
                  }}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center space-x-2 transition"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call Next Customer</span>
                </button>

                {activeCounterObj.currentTicket && (
                  <div className="space-y-2 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onUpdateStatus(activeCounterObj.currentTicket, "completed", "", 0, selectedCounter)}
                        className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>
                      <button
                        onClick={() => onUpdateStatus(activeCounterObj.currentTicket, "cancelled", "", 0, selectedCounter)}
                        className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm"
                      >
                        <PauseCircle className="w-3.5 h-3.5" />
                        <span>Cancel Task</span>
                      </button>
                    </div>
                    <button
                      onClick={() => onUpdateStatus(activeCounterObj.currentTicket, "no-show", "", 0, selectedCounter)}
                      className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold shadow-sm"
                    >
                      Mark Customer No-Show
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Live Queue Directory & Controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
            
            {/* Table Filters & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-heading">Live Queue Directory</h3>
                {isStaff && (
                  <p className="text-[11px] text-sub mt-0.5">
                    Managing requests for <span className="font-bold text-indigo-600 dark:text-indigo-400">Counter #{staffCounterNum} ({currentUser.name})</span>
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ticket/name..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 outline-none text-xs"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 text-heading border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="waiting">Waiting Only</option>
                  <option value="in-service">In Service</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Queue Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">Ticket</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Service</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-heading font-medium">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-sub">
                        No tickets matching search query.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => {
                      const isAssignedToOtherCounter = isStaff && t.status === "in-service" && t.counterNumber && t.counterNumber !== staffCounterNum;

                      return (
                        <tr key={t.ticketNumber} className="hover:bg-[var(--bg-card-hover)] transition border-b border-[var(--border-color)]">
                          <td className="py-3 px-3 font-bold text-heading font-mono">{t.ticketNumber}</td>
                          <td className="py-3 px-3 font-medium text-heading">{t.customerName}</td>
                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border whitespace-nowrap ${
                              t.serviceId === 'placement' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' :
                              t.serviceId === 'it-helpdesk' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                              t.serviceId === 'academic' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                              'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}>
                              {t.serviceName}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {t.priority === "vip" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1 w-fit">
                                <Crown className="w-3 h-3" />
                                <span>VIP</span>
                              </span>
                            ) : (
                              <span className="text-sub text-xs">Standard</span>
                            )}
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  t.status === "waiting"
                                    ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                                    : t.status === "in-service"
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                    : "bg-slate-100 dark:bg-slate-800 text-sub"
                                }`}
                              >
                                {t.status}
                              </span>
                              {t.counterNumber && t.status === "in-service" && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  C#{t.counterNumber}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                            {t.status === "waiting" && (
                              <button
                                onClick={() => {
                                  if (activeCounterObj.currentTicket) {
                                    const curT = tickets.find(tk => tk.ticketNumber === activeCounterObj.currentTicket);
                                    if (curT && curT.status === "in-service") {
                                      alert(`⚠️ Counter #${selectedCounter} is currently serving ticket ${activeCounterObj.currentTicket}. Complete or cancel the current service first.`);
                                      return;
                                    }
                                  }
                                  onUpdateStatus(t.ticketNumber, "in-service", "", 0, selectedCounter);
                                }}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition whitespace-nowrap"
                              >
                                <span>Serve at C#{selectedCounter}</span>
                              </button>
                            )}

                            {t.status === "in-service" && (
                              <div className="inline-flex items-center space-x-1.5 whitespace-nowrap">
                                {isAssignedToOtherCounter ? (
                                  <span className="text-[10px] text-sub font-semibold italic px-2.5 py-1 bg-slate-100 dark:bg-slate-900 rounded-lg border border-[var(--border-color)] whitespace-nowrap">
                                    Served at Counter #{t.counterNumber}
                                  </span>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => onUpdateStatus(t.ticketNumber, "completed", "", 0, t.counterNumber || selectedCounter)}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition whitespace-nowrap"
                                    >
                                      Done
                                    </button>
                                    <button
                                      onClick={() => onUpdateStatus(t.ticketNumber, "cancelled", "", 0, t.counterNumber || selectedCounter)}
                                      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/40 text-xs font-semibold shadow-xs transition whitespace-nowrap border border-rose-200 dark:border-rose-800"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
