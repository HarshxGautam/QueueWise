import React from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { BarChart3, CheckCircle2, Users, ShieldCheck, Clock, Download } from 'lucide-react';

Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function AnalyticsDashboard({ adminData }) {
  const { summary = {}, tickets = [], counters = [], services = [] } = adminData || {};

  const isLight = document.documentElement.classList.contains('light');
  const textColor = isLight ? '#0f172a' : '#f0f6fc';
  const subTextColor = isLight ? '#64748b' : '#8b949e';
  const gridColor = isLight ? '#e2e8f0' : '#30363d';

  // Completed tickets for audit log
  const completedTickets = tickets.filter(t => t.status === "completed" || t.status === "cancelled" || t.status === "no-show");

  // Export CSV function
  const handleExportCSV = () => {
    if (tickets.length === 0) {
      alert("No queue data to export.");
      return;
    }
    const headers = ["Ticket", "Customer", "Service", "Priority", "Status", "Counter", "JoinedAt", "CompletedAt", "Rating"];
    const rows = tickets.map(t => [
      t.ticketNumber,
      `"${t.customerName}"`,
      `"${t.serviceName}"`,
      t.priority,
      t.status,
      t.counterNumber || "N/A",
      t.joinedAt ? new Date(t.joinedAt).toLocaleTimeString() : "N/A",
      t.completedAt ? new Date(t.completedAt).toLocaleTimeString() : "N/A",
      t.rating || "N/A"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `queuewise_service_log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Default Chart Options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: textColor,
          font: { family: 'Plus Jakarta Sans', size: 11, weight: '600' }
        }
      },
      tooltip: {
        backgroundColor: isLight ? '#ffffff' : '#161b22',
        titleColor: textColor,
        bodyColor: subTextColor,
        borderColor: isLight ? '#cbd5e1' : '#30363d',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8
      }
    }
  };

  const defaultBarOptions = {
    ...defaultOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: subTextColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: subTextColor, font: { family: 'Plus Jakarta Sans', size: 10 } }
      }
    }
  };

  // 1. Tickets by Service
  const serviceCounts = services.reduce((acc, s) => {
    acc[s.name] = tickets.filter(t => t.serviceId === s.serviceId).length;
    return acc;
  }, {});

  const serviceChartData = {
    labels: Object.keys(serviceCounts),
    datasets: [{
      data: Object.values(serviceCounts),
      backgroundColor: ['#2563eb', '#16a34a', '#0ea5e9', '#d97706'],
      borderColor: isLight ? '#ffffff' : '#161b22',
      borderWidth: 2,
    }]
  };

  // 2. Queue Status Breakdown
  const statusCounts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, { 'waiting': 0, 'in-service': 0, 'completed': 0, 'cancelled': 0, 'no-show': 0 });

  const statusChartData = {
    labels: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      label: 'Tickets',
      data: Object.values(statusCounts),
      backgroundColor: ['#2563eb', '#16a34a', '#8b5cf6', '#dc2626', '#d97706'],
      borderRadius: 6
    }]
  };

  // 3. Counter Performance
  const counterChartData = {
    labels: counters.map(c => `Counter ${c.counterNumber}`),
    datasets: [{
      label: 'Served Today',
      data: counters.map(c => c.servedTodayCount || 0),
      backgroundColor: '#2563eb',
      borderRadius: 6
    }]
  };

  // 4. Priority Distribution
  const priorityCounts = tickets.reduce((acc, t) => {
    acc[t.priority] = (acc[t.priority] || 0) + 1;
    return acc;
  }, { 'standard': 0, 'vip': 0 });

  const priorityChartData = {
    labels: ['Standard', 'VIP'],
    datasets: [{
      data: [priorityCounts['standard'] || 0, priorityCounts['vip'] || 0],
      backgroundColor: ['#2563eb', '#d97706'],
      borderColor: isLight ? '#ffffff' : '#161b22',
      borderWidth: 2,
    }]
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      
      {/* Header with Export Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-heading tracking-tight">
              Facility Analytics & Reports
            </h1>
          </div>
          <p className="text-xs text-sub mt-0.5">
            Operational metrics, service throughput, and historical counter performance.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Service Log (CSV)</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-sub">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Tickets</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">{tickets.length}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Overall daily entries</span>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-sub">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{summary.completedToday || 0}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Processed successfully</span>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-sub">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Active Desks</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200 dark:border-cyan-800">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 font-mono">{summary.activeCounters || 0}</p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Operating staff desks</span>
        </div>

        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-1">
          <div className="flex items-center justify-between text-sub">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Queue Load</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {summary.totalWaiting || 0} <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ {summary.totalInService || 0} active</span>
          </p>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Current active flow</span>
        </div>
      </div>

      {/* 4 Interactive Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider">Demand by Service Category</h3>
            <span className="text-[11px] text-sub">Service Distribution</span>
          </div>
          <div className="h-56 relative">
            <Doughnut data={serviceChartData} options={defaultOptions} />
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider">Queue Flow Status</h3>
            <span className="text-[11px] text-sub">Lifecycle Stages</span>
          </div>
          <div className="h-56 relative">
            <Bar data={statusChartData} options={defaultBarOptions} />
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider">Desk Throughput Performance</h3>
            <span className="text-[11px] text-sub">Served by Window</span>
          </div>
          <div className="h-56 relative">
            <Bar data={counterChartData} options={defaultBarOptions} />
          </div>
        </div>

        <div className="glass-panel p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-heading uppercase tracking-wider">Priority Distribution</h3>
            <span className="text-[11px] text-sub">Standard vs VIP</span>
          </div>
          <div className="h-56 relative">
            <Doughnut data={priorityChartData} options={defaultOptions} />
          </div>
        </div>

      </div>

      {/* Audit Log / Completed Queue History */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-heading">Service Audit Log & History</h3>
            <p className="text-xs text-sub">Completed consultations and performance timestamps</p>
          </div>
          <span className="text-xs font-semibold text-sub">
            {completedTickets.length} Entries Logged
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Attendee</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Desk</th>
                <th className="py-2.5 px-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-heading">
              {completedTickets.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-sub">
                    No completed tickets logged yet today.
                  </td>
                </tr>
              ) : (
                completedTickets.slice(0, 8).map((t) => (
                  <tr key={t.ticketNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-2.5 px-3 font-bold font-mono text-heading">{t.ticketNumber}</td>
                    <td className="py-2.5 px-3 font-medium text-heading">{t.customerName}</td>
                    <td className="py-2.5 px-3 text-sub">{t.serviceName}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.priority === "vip" 
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800" 
                          : "text-sub"
                      }`}>
                        {t.priority === "vip" ? "⭐ VIP" : "Standard"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        t.status === "completed" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
                        t.status === "no-show" ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800" :
                        "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      {t.counterNumber ? (
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Desk #{t.counterNumber}</span>
                      ) : "---"}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-amber-500">
                      {t.rating ? `★ ${t.rating}/5` : "---"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
