import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { MessageSquare, X } from "lucide-react";
import Navbar from "./components/Navbar";
import StudentCheckIn from "./components/StudentCheckIn";
import StaffDashboard from "./components/StaffDashboard";
import AiHub from "./components/AiHub";
import TvDisplay from "./components/TvDisplay";
import AiChatbot from "./components/AiChatbot";
import LoginModal from "./components/LoginModal";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import AuthLandingPage from "./components/AuthLandingPage";
import { playChimeSound, sendSystemNotification, triggerHapticVibration, requestNotificationPermission } from "./utils/notifications";

const HOST = typeof window !== "undefined" ? window.location.hostname : "localhost";
const API_BASE = `http://${HOST}:5000/api`;

export default function App() {
  const [currentView, setCurrentView] = useState("kiosk");
  const [services, setServices] = useState([]);
  const [adminData, setAdminData] = useState({
    summary: { totalWaiting: 0, totalInService: 0, completedToday: 0, activeCounters: 0 },
    tickets: [],
    counters: [],
    services: []
  });
  const [activeTicket, setActiveTicket] = useState(() => {
    const saved = localStorage.getItem("queuewise_active_ticket");
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedCounter, setSelectedCounter] = useState(1);
  const [serverStatus, setServerStatus] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [smsAlert, setSmsAlert] = useState(null);

  // Auth State
  const [authToken, setAuthToken] = useState(() => localStorage.getItem("queuewise_auth_token") || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("queuewise_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Theme State: 'bright' (light), 'dark', or 'system'
  const [theme, setTheme] = useState(() => localStorage.getItem("queuewise_theme") || "bright");

  useEffect(() => {
    const root = document.documentElement;
    localStorage.setItem("queuewise_theme", theme);

    const applyTheme = (mode) => {
      if (mode === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
      } else {
        root.classList.remove("dark");
        root.classList.add("light");
      }
    };

    if (theme === "system") {
      const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      applyTheme(systemDark ? "dark" : "bright");
    } else {
      applyTheme(theme);
    }
  }, [theme]);
  
  const isAuthenticated = !!authToken;

  const getAuthHeaders = () => {
    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
    return headers;
  };

  const handleLoginSuccess = ({ token, user }) => {
    setAuthToken(token);
    setCurrentUser(user);
    localStorage.setItem("queuewise_auth_token", token);
    localStorage.setItem("queuewise_user", JSON.stringify(user));
    setShowLoginModal(false);

    if (user.role === 'staff') {
      if (user.counterNumber) setSelectedCounter(user.counterNumber);
      setCurrentView("admin");
    } else if (user.role === 'admin') {
      setCurrentView("analytics");
    } else if (user.role === 'student') {
      setCurrentView("kiosk");
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem("queuewise_auth_token");
    localStorage.removeItem("queuewise_user");
    setCurrentView("kiosk");
  };

  const switchView = (newView) => {
    if (currentUser?.role === 'student' && ['admin', 'ai-hub', 'analytics'].includes(newView)) {
      alert("🔒 Student accounts have access to Campus Check-In and TV Waiting Display.");
      return;
    }
    if (['admin', 'ai-hub', 'analytics'].includes(newView) && !isAuthenticated) {
      setShowLoginModal(true);
      return;
    }
    if (['ai-hub', 'analytics'].includes(newView) && currentUser?.role === 'staff') {
      alert("🔒 Analytics & AI Hub are restricted to Campus Administrator accounts. Please log in as Admin to access.");
      return;
    }
    setCurrentView(newView);
  };

  // Speech synthesis announcement when calling customer
  const speakAnnouncement = (text) => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Synchronize data from API
  const fetchAllData = async () => {
    try {
      // 1. Fetch Services
      const servRes = await fetch(`${API_BASE}/services`);
      if (servRes.ok) {
        const servData = await servRes.json();
        setServices(servData);
        setServerStatus(true);
      }

      // 2. Fetch Admin Queue State
      const adminRes = await fetch(`${API_BASE}/queue/admin`, {
        headers: getAuthHeaders()
      });
      if (adminRes.ok) {
        const aData = await adminRes.json();
        setAdminData(aData);
      }

      // 3. Sync Active Ticket Status if present
      if (activeTicket && activeTicket.ticketNumber) {
        const tRes = await fetch(`${API_BASE}/queue/ticket/${activeTicket.ticketNumber}`);
        if (tRes.ok) {
          const updatedT = await tRes.json();
          setActiveTicket(updatedT);
          localStorage.setItem("queuewise_active_ticket", JSON.stringify(updatedT));
        }
      }
    } catch (err) {
      console.warn("Backend Sync Error:", err.message);
      setServerStatus(false);
    }
  };

  // Socket.IO and Initial Load
  useEffect(() => {
    fetchAllData();

    const socket = io(`http://${HOST}:5000`);
    
    socket.on('connect', () => {
      setServerStatus(true);
    });

    socket.on('disconnect', () => {
      setServerStatus(false);
    });

    socket.on('queue:updated', () => {
      fetchAllData();
    });

    socket.on('ticket:called', (data) => {
      const ticketObj = data.ticket || data;
      
      // If user has an active ticket and it matches the called ticket
      if (activeTicket && ticketObj.ticketNumber === activeTicket.ticketNumber) {
        // 1. Play synthesized two-tone audio chime
        playChimeSound();

        // 2. Trigger haptic vibration on mobile
        triggerHapticVibration();

        // 3. Send OS / Desktop system notification
        sendSystemNotification(
          `🚨 YOUR TICKET IS CALLED!`,
          `Ticket #${ticketObj.ticketNumber}: Please proceed immediately to Counter #${ticketObj.counterNumber || 1}!`
        );

        // 4. Voice announcement speech synthesis
        speakAnnouncement(`Ticket number ${ticketObj.ticketNumber}, please proceed to Counter ${ticketObj.counterNumber || 1}`);

        // 5. Display simulated high-visibility SMS / Push notification banner
        setSmsAlert({
          ticketNumber: ticketObj.ticketNumber,
          counterNumber: ticketObj.counterNumber || 1,
          customerName: ticketObj.customerName || activeTicket.customerName,
          phone: activeTicket.phone || "+91 98765 43210",
          serviceName: ticketObj.serviceName || activeTicket.serviceName,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [activeTicket?.ticketNumber]);

  // Actions
  const handleJoinQueue = async (formData) => {
    // Prompt for browser notification permission
    requestNotificationPermission();

    try {
      const res = await fetch(`${API_BASE}/queue/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok && data.ticket) {
        setActiveTicket(data.ticket);
        localStorage.setItem("queuewise_active_ticket", JSON.stringify(data.ticket));
        fetchAllData();
      } else {
        alert(data.error || "Failed to join queue.");
      }
    } catch {
      alert("Error connecting to server.");
    }
  };

  const handleTestAlert = () => {
    playChimeSound();
    triggerHapticVibration();
    sendSystemNotification(
      `🚨 TEST ALERT: YOUR TICKET IS CALLED!`,
      `Ticket #${activeTicket?.ticketNumber || 'A-101'}: Please proceed to Counter #1 immediately!`
    );
    speakAnnouncement(`Ticket number ${activeTicket?.ticketNumber || 'A-101'}, please proceed to Counter 1`);
    setSmsAlert({
      ticketNumber: activeTicket?.ticketNumber || 'A-101',
      counterNumber: 1,
      customerName: activeTicket?.customerName || 'Rahul Sharma',
      phone: activeTicket?.phone || '+91 98765 43210',
      serviceName: activeTicket?.serviceName || 'General Banking',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  };

  const handleCallNext = async (counterNumber) => {
    try {
      const res = await fetch(`${API_BASE}/queue/call-next`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ counterNumber })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.ticket) {
          speakAnnouncement(`Now serving ticket ${data.ticket.ticketNumber} at Counter ${counterNumber}`);
        } else {
          alert("No customers waiting for your assigned service categories.");
        }
        fetchAllData();
      } else {
        if (res.status === 401) {
          handleLogout();
          setShowLoginModal(true);
          return;
        }
        alert(data.error || 'Unauthorized');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (ticketNumber, status, feedback = "", rating = 0, counterNumber = null) => {
    try {
      const res = await fetch(`${API_BASE}/queue/update-status`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          ticketNumber, 
          status, 
          feedback, 
          rating,
          ...(counterNumber ? { counterNumber } : {})
        })
      });
      if (res.ok) {
        fetchAllData();
      } else {
        if (res.status === 401) {
          handleLogout();
          setShowLoginModal(true);
          return;
        }
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismissTicket = () => {
    setActiveTicket(null);
    localStorage.removeItem("queuewise_active_ticket");
  };

  const handleFeedbackSubmit = async (ticketNumber, rating, comment) => {
    try {
      const res = await fetch(`${API_BASE}/queue/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketNumber, rating, comment })
      });
      if (res.ok) {
        fetchAllData();
        if (activeTicket && activeTicket.ticketNumber === ticketNumber) {
          const updated = { ...activeTicket, rating, feedback: comment };
          setActiveTicket(updated);
          localStorage.setItem("queuewise_active_ticket", JSON.stringify(updated));
        }
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
    }
  };

  const handleSeedDemo = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${API_BASE}/queue/seed`, { 
        method: "POST",
        headers: getAuthHeaders() 
      });
      if (res.ok) {
        await fetchAllData();
        alert("🎉 10 Demo Tickets successfully seeded! Switch to Staff Dashboard, TV Display Board, or Analytics to view live queue activity.");
      } else {
        alert("Failed to seed demo tickets.");
      }
    } catch (err) {
      console.error(err);
      alert("Error seeding demo data.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSendAiChat = async (message, ticketContext) => {
    try {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, ticketContext: ticketContext || null })
      });
      const data = await res.json();
      return data.reply || "I'm QueueWise AI! You can ask me about your estimated wait time, required documents, or VIP priority tickets.";
    } catch {
      return "I'm QueueWise AI! You can ask me about your estimated wait time, required documents, or VIP priority tickets.";
    }
  };

  const fetchAiInsights = async () => {
    try {
      const res = await fetch(`${API_BASE}/ai/insights`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  const fetchQrCode = async (ticketNumber) => {
    try {
      const res = await fetch(`${API_BASE}/qr/${ticketNumber}`);
      if (res.ok) {
        const data = await res.json();
        return data.qrUrl;
      }
    } catch (err) {
      console.error('Error fetching QR code:', err);
    }
    return null;
  };

  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    if (activeTicket?.ticketNumber) {
      fetchQrCode(activeTicket.ticketNumber).then(url => {
        if (url) setQrCodeUrl(url);
      });
    } else {
      setQrCodeUrl(null);
    }
  }, [activeTicket?.ticketNumber]);


  // If not logged in, gate the entire college platform behind AuthLandingPage
  if (!isAuthenticated || !currentUser) {
    return <AuthLandingPage onLoginSuccess={handleLoginSuccess} theme={theme} setTheme={setTheme} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Floating Simulated SMS / Push Notification Banner */}
      {smsAlert && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-fade-in">
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xl border border-slate-700 flex items-start space-x-3.5 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs font-bold">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-indigo-400">MESSAGES • NOW</span>
                <span>{smsAlert.time}</span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5">
                QueueWise: Ticket #{smsAlert.ticketNumber} is CALLED!
              </p>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                Please proceed to <strong className="text-emerald-400 underline">Counter #{smsAlert.counterNumber}</strong> for {smsAlert.serviceName}. (Sent to {smsAlert.phone})
              </p>
            </div>
            <button
              onClick={() => setSmsAlert(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={switchView}
        serverStatus={serverStatus}
        onSeedDemo={handleSeedDemo}
        isSyncing={isSyncing}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === "kiosk" && (
          <StudentCheckIn
            services={services}
            tickets={adminData.tickets}
            counters={adminData.counters}
            onJoinQueue={handleJoinQueue}
            activeTicket={activeTicket}
            onCancelTicket={async (num) => {
              await handleUpdateStatus(num, "cancelled");
              handleDismissTicket();
            }}
            onDismissTicket={handleDismissTicket}
            onSubmitFeedback={handleFeedbackSubmit}
            qrCodeUrl={qrCodeUrl}
            onTestAlert={handleTestAlert}
            currentUser={currentUser}
            onLoginClick={() => setShowLoginModal(true)}
          />
        )}

        {currentView === "admin" && (
          <StaffDashboard
            summary={adminData.summary}
            tickets={adminData.tickets}
            counters={adminData.counters}
            services={adminData.services}
            onCallNext={handleCallNext}
            onUpdateStatus={handleUpdateStatus}
            selectedCounter={selectedCounter}
            setSelectedCounter={setSelectedCounter}
            currentUser={currentUser}
          />
        )}

        {currentView === "analytics" && (
          <AnalyticsDashboard adminData={adminData} />
        )}

        {currentView === "ai-hub" && (
          <AiHub adminData={adminData} fetchAiInsights={fetchAiInsights} />
        )}

        {currentView === "display" && (
          <TvDisplay tickets={adminData.tickets} counters={adminData.counters} />
        )}
      </main>

      {/* Floating AI Assistant Chatbot */}
      <AiChatbot activeTicket={activeTicket} onSendAiChat={handleSendAiChat} />

      {/* Auth Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
        onLoginSuccess={handleLoginSuccess} 
      />

      {/* Footer */}
      <footer className="py-6 border-t border-white/5 text-center text-xs text-slate-500">
        <p>© 2026 QueueWise AI • Smart Enterprise Virtual Queue & Wait-Time Engine</p>
      </footer>

    </div>
  );
}
