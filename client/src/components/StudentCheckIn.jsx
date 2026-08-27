import React, { useState } from "react";
import { 
  Briefcase, 
  Laptop, 
  GraduationCap, 
  FileText, 
  Clock, 
  User, 
  QrCode, 
  Star, 
  CheckCircle2, 
  Crown, 
  Volume2, 
  VolumeX, 
  XCircle, 
  Phone, 
  ArrowRight, 
  Bell, 
  Check, 
  Activity,
  Layers
} from "lucide-react";

// Campus Service Definitions
const ENTERPRISE_SERVICES = [
  {
    serviceId: "placement",
    name: "Placement Cell",
    subtitle: "Internship, Job & Campus Recruitment Support",
    avgDurationMins: 20,
    prefix: "P",
    icon: Briefcase
  },
  {
    serviceId: "it-helpdesk",
    name: "IT Help Desk",
    subtitle: "Software, Network & System Assistance",
    avgDurationMins: 10,
    prefix: "IT",
    icon: Laptop
  },
  {
    serviceId: "academic",
    name: "Academic Counseling",
    subtitle: "Course Guidance & Faculty Consultation",
    avgDurationMins: 15,
    prefix: "AC",
    icon: GraduationCap
  },
  {
    serviceId: "student-services",
    name: "Student Services",
    subtitle: "Certificates, ID Cards & Official Requests",
    avgDurationMins: 8,
    prefix: "SS",
    icon: FileText
  }
];

export default function StudentCheckIn({ 
  services: _services = [], 
  tickets = [], 
  counters = [], 
  onJoinQueue, 
  activeTicket, 
  onCancelTicket, 
  onDismissTicket, 
  onSubmitFeedback, 
  qrCodeUrl, 
  onTestAlert,
  currentUser,
  onLoginClick
}) {
  const [formData, setFormData] = useState({
    customerName: currentUser?.name || "",
    phone: currentUser?.phone || "",
    serviceId: "placement",
    priority: "standard"
  });

  // Sync state if student logs in
  React.useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.name || prev.customerName,
        phone: currentUser.phone || prev.phone
      }));
    }
  }, [currentUser]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("🔒 Please log in with your Student Roll Number to generate a queue ticket.");
      if (onLoginClick) onLoginClick();
      return;
    }
    if (!formData.customerName.trim()) return;
    if (formData.phone && formData.phone.length !== 10) {
      alert("⚠️ Please enter a valid 10-digit mobile number for SMS notifications.");
      return;
    }
    setIsSubmitting(true);
    await onJoinQueue(formData);
    setIsSubmitting(false);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    if (activeTicket) {
      onSubmitFeedback(activeTicket.ticketNumber, feedbackRating, feedbackComment);
      setFeedbackSubmitted(true);
    }
  };

  // Compute live queue metrics for each service card
  const getServiceLiveMetrics = (serviceMeta) => {
    const sId = serviceMeta.serviceId;
    const waitingForThis = Array.isArray(tickets) ? tickets.filter(t => t.serviceId === sId && t.status === "waiting") : [];
    const inServiceForThis = Array.isArray(tickets) ? tickets.filter(t => t.serviceId === sId && t.status === "in-service") : [];

    const activeCounterWithTicket = counters.find(c => c.assignedServices?.includes(sId) && c.currentTicket);
    const servingToken = inServiceForThis.length > 0 
      ? inServiceForThis[0].ticketNumber 
      : (activeCounterWithTicket?.currentTicket || "None");

    const nextToken = waitingForThis.length > 0 
      ? waitingForThis[0].ticketNumber 
      : "Open";

    const queueLength = waitingForThis.length;
    
    const activeDeskCount = (counters && counters.filter(c => c.assignedServices?.includes(sId) && c.status === "active").length) || 1;
    const estimatedWait = queueLength === 0 
      ? 2 
      : Math.max(2, Math.ceil((queueLength * serviceMeta.avgDurationMins) / Math.max(1, activeDeskCount)));

    return {
      servingToken,
      nextToken,
      queueLength,
      estimatedWait
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Enterprise Campus Hero Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mb-1">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>Campus & Enterprise Queue Portal</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-heading tracking-tight">
          Campus Check-In & Service Routing
        </h1>
        <p className="text-xs sm:text-sm text-sub max-w-xl mx-auto">
          Select your campus department, check live token status, and receive real-time turn notifications on your device.
        </p>
      </div>

      {!activeTicket ? (
        !currentUser ? (
          /* Student Authentication Gate Card (If not logged in) */
          <div className="glass-panel rounded-2xl p-6 sm:p-10 text-center space-y-6 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)]">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80 flex items-center justify-center mx-auto shadow-sm">
              <GraduationCap className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-heading tracking-tight">
                Student Login Required
              </h2>
              <p className="text-xs sm:text-sm text-sub leading-relaxed">
                QueueWise is an authorized campus platform for registered students and faculty. Please sign in with your <strong>Roll Number</strong> to issue and track queue passes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onLoginClick}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center justify-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Sign In with Student Roll No</span>
              </button>

              <button
                type="button"
                onClick={onLoginClick}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
              >
                Staff & Admin Portal
              </button>
            </div>

            {/* Live Campus Departments Preview */}
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 tracking-wider">
                  Live Department Queue Status:
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active Desks</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ENTERPRISE_SERVICES.map((serv) => {
                  const Icon = serv.icon;
                  const metrics = getServiceLiveMetrics(serv);
                  return (
                    <div 
                      key={serv.serviceId}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-heading truncate">{serv.name}</p>
                          <p className="text-[10px] text-sub font-mono">Serving: <strong className="text-emerald-600 dark:text-emerald-400">{metrics.servingToken}</strong></p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold font-mono text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 shrink-0">
                        ~{metrics.estimatedWait}m wait
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          /* Join Queue Form Card (When Authenticated) */
          <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-7 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-wrap gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-heading">Issue Virtual Queue Pass</h2>
                <p className="text-xs text-sub">Enter attendee details and choose the destination department</p>
              </div>
            </div>

            {currentUser?.role === 'student' && (
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold shadow-2xs">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Verified Student: {currentUser.rollNo}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Attendee Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name / Student Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none text-xs sm:text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mobile Number (Optional SMS Alert)
                  </label>
                  {formData.phone && (
                    <span className={`text-[10px] font-mono font-bold ${formData.phone.length === 10 ? 'text-emerald-500' : 'text-amber-500'}`}>
                      {formData.phone.length}/10 digits
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => {
                      const cleanDigits = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: cleanDigits });
                    }}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 hover:border-slate-400 dark:hover:border-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-950/50 shadow-[0_1px_2px_rgba(0,0,0,0.02)] outline-none text-xs sm:text-sm font-medium font-mono transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Premium Enterprise Department / Service Selection Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Department & Service Desk
                </label>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                  Real-time SLA tracking active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {ENTERPRISE_SERVICES.map((serv) => {
                  const isSelected = formData.serviceId === serv.serviceId;
                  const Icon = serv.icon;
                  const metrics = getServiceLiveMetrics(serv);

                  return (
                    <div
                      key={serv.serviceId}
                      onClick={() => setFormData({ ...formData, serviceId: serv.serviceId })}
                      className={`group relative cursor-pointer p-4 sm:p-4.5 rounded-xl border transition-all duration-200 ease-out flex flex-col justify-between space-y-3.5 ${
                        isSelected
                          ? "bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-600 dark:border-indigo-500 shadow-sm ring-1 ring-indigo-500/20 -translate-y-0.5"
                          : "bg-white dark:bg-[#151921] border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-0.5 hover:shadow-sm"
                      }`}
                    >
                      {/* Top Row: Icon + Title + Duration Tag + Radio Selection Indicator */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start space-x-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                            isSelected
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50"
                          }`}>
                            <Icon className="w-4.5 h-4.5" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
                                {serv.name}
                              </h3>
                              <span className="inline-flex items-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-200/60 dark:border-slate-700/60">
                                <Clock className="w-2.5 h-2.5 mr-0.5" />
                                {serv.avgDurationMins}m
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-1 mt-0.5">
                              {serv.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Custom Radio Button */}
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all mt-0.5 ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs scale-105"
                            : "border-slate-300 dark:border-slate-700 bg-transparent group-hover:border-slate-400"
                        }`}>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      {/* Bottom Live Queue Intelligence Strip (SaaS Style) */}
                      <div className="pt-2.5 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-4 gap-2 text-center bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/50">
                        <div className="text-left">
                          <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Serving</span>
                          <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 truncate block">
                            {metrics.servingToken}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Next</span>
                          <span className="text-xs font-bold font-mono text-slate-700 dark:text-slate-300 truncate block">
                            {metrics.nextToken}
                          </span>
                        </div>
                        <div className="text-left">
                          <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">In Queue</span>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                            {metrics.queueLength} waiting
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Est. Wait</span>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                            ~{metrics.estimatedWait} min
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* VIP Fast-Track Option */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold shadow-2xs shrink-0">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">Priority Fast-Track Pass</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">For scheduled interviews, senior faculty & urgent approvals</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, priority: formData.priority === "vip" ? "standard" : "vip" })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                  formData.priority === "vip"
                    ? "bg-amber-500 text-slate-950 font-extrabold shadow-xs ring-2 ring-amber-400/50"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-slate-700 shadow-2xs"
                }`}
              >
                {formData.priority === "vip" ? "Priority Active ⭐" : "Standard"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? "Generating Digital Pass..." : "Issue Digital Queue Pass"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
        )
      ) : (
        /* Active Ticket Digital Pass Card */
        <div className="space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-[var(--border-color)]">
            
            {/* Top Pass Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {activeTicket.serviceName}
                </span>
                {activeTicket.priority === "vip" && (
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>Priority</span>
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-[var(--border-color)] text-sub hover:text-heading"
                  title="Audio Alerts"
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> : <VolumeX className="w-3.5 h-3.5 text-sub" />}
                </button>
              </div>
            </div>

            {/* Main Ticket Display */}
            <div className="py-6 text-center space-y-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-sub font-bold mb-1">Your Token Number</p>
                <h2 className="text-5xl sm:text-6xl font-black tracking-tight text-indigo-600 dark:text-indigo-400 font-mono">
                  {activeTicket.ticketNumber}
                </h2>
                <p className="text-xs font-medium text-sub mt-1">Issued for {activeTicket.customerName}</p>
              </div>

              {/* Status Banner */}
              {activeTicket.status === "waiting" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center">
                      <p className="text-[10px] text-sub uppercase font-bold">Position In Line</p>
                      <p className="text-2xl font-black text-heading mt-0.5 font-mono">#{activeTicket.position || 1}</p>
                      <p className="text-[10px] text-sub font-medium">in front of you</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 text-center">
                      <p className="text-[10px] text-indigo-700 dark:text-indigo-300 uppercase font-bold">Estimated Wait</p>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5 font-mono">
                        ~{Math.min(22, Math.max(3, activeTicket.estimatedWaitMins || ((activeTicket.position || 1) * 5)))} min
                      </p>
                      <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">predictive calculation</p>
                    </div>
                  </div>

                  {/* Multi-channel alert pill & preview button */}
                  <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/80 max-w-md mx-auto flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 text-indigo-900 dark:text-indigo-200">
                      <Bell className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      <span className="text-[11px] font-semibold">
                        Alerts active for <strong className="font-bold">{activeTicket.phone || "+91 98765 43210"}</strong>
                      </span>
                    </div>
                    {onTestAlert && (
                      <button
                        type="button"
                        onClick={onTestAlert}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] shadow-xs transition shrink-0 ml-2"
                        title="Simulate turn call notification"
                      >
                        Test Alert
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeTicket.status === "in-service" && (
                <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 max-w-md mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
                  <h3 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">YOUR TICKET IS CALLED</h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                    Please proceed to <strong className="font-bold underline text-sm">Counter #{activeTicket.counterNumber || 1}</strong>
                  </p>
                </div>
              )}

              {activeTicket.status === "completed" && (
                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-emerald-500/30 max-w-md mx-auto space-y-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <div>
                    <h3 className="text-base font-bold text-heading">Service Completed</h3>
                    <p className="text-xs text-sub">Thank you for visiting!</p>
                  </div>
                  <button
                    onClick={onDismissTicket}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    Issue New Ticket
                  </button>
                </div>
              )}
            </div>

            {/* QR Code & Actions Footer */}
            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center space-x-3 text-sub text-xs">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Ticket QR Code" className="w-10 h-10 bg-white rounded-md p-1 border border-slate-300 dark:border-slate-700 shrink-0" />
                ) : (
                  <QrCode className="w-7 h-7 text-indigo-500 shrink-0" />
                )}
                <div>
                  <p className="font-bold text-heading text-xs">Digital Verification Pass</p>
                  <p className="text-[10px] text-sub">Scan QR at counter for check-in</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {activeTicket.status === "waiting" && (
                  <button
                    onClick={() => onCancelTicket(activeTicket.ticketNumber)}
                    className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-semibold hover:bg-rose-100 transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel Pass</span>
                  </button>
                )}

                <button
                  onClick={onDismissTicket}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-sub hover:text-heading border border-[var(--border-color)] text-xs font-semibold transition"
                >
                  Close Pass
                </button>
              </div>
            </div>

          </div>

          {/* Optional Customer Experience Rating & Feedback Section */}
          <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <h3 className="text-sm font-bold text-heading">Service Experience Rating (Optional)</h3>
                </div>
                <p className="text-xs text-sub mt-0.5">Rate your consultation or campus intake experience</p>
              </div>

              {feedbackSubmitted || activeTicket.rating ? (
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rating Recorded (★ {activeTicket.rating || feedbackRating}/5)</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  Quick 1-Click Rating
                </span>
              )}
            </div>

            {feedbackSubmitted || activeTicket.rating ? (
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-1">
                <div className="flex justify-center space-x-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= (activeTicket.rating || feedbackRating) ? "fill-amber-400" : "text-slate-300 dark:text-slate-700"}`} 
                    />
                  ))}
                </div>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  Thank you! Your feedback helps optimize campus queue SLAs.
                </p>
                {activeTicket.feedback && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 italic">"{activeTicket.feedback}"</p>
                )}
              </div>
            ) : (
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    How would you rate this service window?
                  </span>

                  {/* Interactive Star Selection */}
                  <div className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950/60 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setFeedbackRating(star)}
                        className="p-1 transition transform hover:scale-125 focus:outline-none"
                        title={`${star} Star${star > 1 ? 's' : ''}`}
                      >
                        <Star 
                          className={`w-5 h-5 transition-colors ${
                            star <= feedbackRating 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-slate-300 dark:text-slate-700 hover:text-amber-300"
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-black font-mono text-amber-600 dark:text-amber-400 ml-1">
                      {feedbackRating}/5
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Add an optional comment or note for staff..."
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-xs focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition shrink-0 flex items-center space-x-1"
                  >
                    <span>Submit Rating</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export { StudentCheckIn as CustomerKiosk };
