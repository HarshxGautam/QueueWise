import React, { useState, useEffect } from "react";
import { Tv, Sparkles, Clock } from "lucide-react";

export default function TvDisplay({ counters, tickets }) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const waitingTickets = tickets.filter((t) => t.status === "waiting").slice(0, 6);

  return (
    <div className="min-h-[75vh] rounded-2xl glass-panel p-6 sm:p-8 space-y-6 shadow-xs animate-fade-in">
      
      {/* TV Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-heading tracking-tight">
              LIVE QUEUE MONITOR
            </h1>
            <p className="text-xs text-sub">Waiting Lounge Public Announcement Board</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm font-bold text-heading">
          <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>{time}</span>
        </div>
      </div>

      {/* Main TV Board Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Now Serving Counter Cards (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold uppercase text-xs tracking-wider pb-1">
            <Sparkles className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Now Serving at Counter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {counters.map((c) => {
              const currentT = tickets.find((t) => t.ticketNumber === c.currentTicket);
              return (
                <div
                  key={c.counterNumber}
                  className={`p-5 rounded-xl border transition-all ${
                    c.currentTicket
                      ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 shadow-xs"
                      : "bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-sub">
                    <span className="text-indigo-900 dark:text-indigo-300">COUNTER {c.counterNumber}</span>
                    <span className="text-[11px] font-semibold text-sub">{c.staffName}</span>
                  </div>

                  <div className="my-3 text-center">
                    <p className="text-[10px] text-sub uppercase tracking-wider font-bold mb-0.5">Calling Ticket</p>
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                      {c.currentTicket || "---"}
                    </h2>
                  </div>

                  <div className="text-center text-xs font-semibold">
                    {currentT ? (
                      <span className="text-emerald-700 dark:text-emerald-300 font-bold">{currentT.serviceName}</span>
                    ) : (
                      <span className="text-sub">Counter Available</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Up Next in Line (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-wider pb-1">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Up Next in Line</span>
          </div>

          <div className="space-y-2">
            {waitingTickets.length === 0 ? (
              <div className="p-8 text-center glass-panel rounded-xl text-sub text-xs border border-[var(--border-color)]">
                No customers currently waiting in line.
              </div>
            ) : (
              waitingTickets.map((t, idx) => (
                <div
                  key={t.ticketNumber}
                  className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between transition hover:border-indigo-300"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center border border-indigo-200 dark:border-indigo-800">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="text-sm font-bold text-heading font-mono">{t.ticketNumber}</div>
                      <div className="text-[11px] text-sub">{t.serviceName}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 dark:bg-slate-800 text-sub border border-slate-200 dark:border-slate-700">
                      {t.priority === "vip" ? "⭐ VIP" : "Waiting"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
