const { GoogleGenAI } = require('@google/genai');

// Calculate Dynamic Estimated Wait Time (in minutes) based on queue length and active counters
function calculateEstimatedWaitTime(waitingCount = 0, avgDurationMins = 10, activeCountersCount = 1, priority = "standard") {
  let count = typeof waitingCount === 'object' ? (waitingCount.waitingCount ?? 0) : Number(waitingCount ?? 0);
  let duration = typeof waitingCount === 'object' ? (waitingCount.avgDurationMins || 10) : Number(avgDurationMins || 10);
  let counters = Math.max(1, Number(activeCountersCount || 1));
  
  if (count <= 0) {
    return 2; // Minimum estimated baseline wait when queue is empty/immediate
  }
  
  let est = Math.ceil((count * duration) / counters);
  
  if (priority === "vip") {
    est = Math.ceil(est * 0.5);
  }
  
  return Math.max(2, est);
}

// Generate Live Campus Queue Intelligence Matrix
async function generateAiQueueInsights(services, tickets, counters) {
  const waitingTickets = tickets.filter(t => t.status === "waiting");
  const inServiceTickets = tickets.filter(t => t.status === "in-service");
  const activeCounters = counters.filter(c => c.status === "active");

  const summaryContext = {
    totalWaiting: waitingTickets.length,
    totalInService: inServiceTickets.length,
    activeCounters: activeCounters.length,
    servicesBreakdown: services.map(s => ({
      serviceName: s.name,
      waitingCount: waitingTickets.filter(t => t.serviceId === s.serviceId).length,
      avgDuration: s.avgDurationMins
    }))
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are QueueWise Campus Operational Intelligence Agent for a University & Placement Office.
Analyze this real-time campus queue data: ${JSON.stringify(summaryContext)}.
Respond with a strictly formatted JSON object matching this schema:
{
  "statusScore": <number between 40 and 99 reflecting queue flow efficiency>,
  "primaryBottleneck": "<brief description of current bottleneck or null>",
  "recommendations": [
    {
      "title": "<actionable directive>",
      "desc": "<brief explanation with estimated time impact>",
      "action": "<short button label>",
      "tag": "<Urgent | Optimization | Staffing>"
    }
  ],
  "predictedPeakHour": "<e.g. 11:30 AM - 1:30 PM>",
  "aiSummary": "<concise 2-sentence executive summary of campus department throughput>"
}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const parsed = JSON.parse(response.text);
      return parsed;
    } catch (err) {
      console.warn("Gemini Live Insights fallback:", err.message);
    }
  }

  // High-accuracy fallback engine for campus departments
  let statusScore = 95;
  let bottleneck = "None (Optimal Campus Flow)";
  let recommendations = [
    { title: "Maintain Balanced Desk Allocation", desc: "Current queue flow is balanced across Placement, IT & Student Desks.", action: "Keep Active", tag: "Optimal" },
    { title: "Fast-Track Student Certificate Requests", desc: "Desk 4 ready to absorb short <5 min verification requests.", action: "Monitor Desk", tag: "Optimization" }
  ];

  if (waitingTickets.length > 3) {
    statusScore = Math.max(50, 95 - (waitingTickets.length * 5));
    const maxWaitingService = summaryContext.servicesBreakdown.sort((a, b) => b.waitingCount - a.waitingCount)[0];
    if (maxWaitingService && maxWaitingService.waitingCount > 1) {
      bottleneck = `High Student Inflow at ${maxWaitingService.serviceName} (${maxWaitingService.waitingCount} waiting)`;
      recommendations = [
        { title: `Reallocate Counter 3 to ${maxWaitingService.serviceName}`, desc: `Divert incoming tickets to Counter 3 to clear the student backlog quickly.`, action: `Reallocate Counter #3`, tag: "Urgent" },
        { title: "Promote Digital Pass Check-in", desc: "Encourage students to take digital QR passes to streamline intake.", action: "Broadcast Kiosk", tag: "Optimization" }
      ];
    }
  }

  const serviceHealth = summaryContext.servicesBreakdown.map(s => {
    let risk = "Low Risk";
    let riskColor = "emerald";
    if (s.waitingCount >= 4) { risk = "High Backlog"; riskColor = "rose"; }
    else if (s.waitingCount >= 2) { risk = "Moderate"; riskColor = "amber"; }

    const estWait = Math.max(2, Math.ceil((s.waitingCount * s.avgDuration) / Math.max(1, activeCounters.length)));

    return {
      serviceName: s.serviceName,
      waitingCount: s.waitingCount,
      avgDuration: s.avgDuration,
      estimatedWait: estWait,
      riskLevel: risk,
      riskColor: riskColor,
      slaCompliance: s.waitingCount > 3 ? "82%" : "98%"
    };
  });

  const hourlySurgeForecast = [
    { hour: "9:00 AM", load: 20, label: "Morning Session (Low)" },
    { hour: "11:00 AM", load: 75, label: "Recruitment Hours (Peak ⚡)" },
    { hour: "1:00 PM", load: 90, label: "Post-Lecture Rush (High ⚠️)" },
    { hour: "3:30 PM", load: 50, label: "Afternoon Advisory (Moderate)" },
    { hour: "5:00 PM", load: 25, label: "Office Wrap-up (Low)" }
  ];

  return {
    statusScore,
    primaryBottleneck: bottleneck,
    recommendations,
    predictedPeakHour: "11:30 AM - 2:00 PM",
    aiSummary: `Campus queue currently has ${waitingTickets.length} waiting student${waitingTickets.length === 1 ? '' : 's'} across ${activeCounters.length} active department counters. Overall facility throughput velocity is ${statusScore > 75 ? 'Optimal' : 'Moderate'}.`,
    serviceHealth,
    hourlySurgeForecast,
    activeCountersCount: activeCounters.length,
    waitingCount: waitingTickets.length
  };
}

// QueueWise AI Assistant Chatbot - Campus & Enterprise Edition
async function processAiChatQuery(userMessage, ticketContext) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = `You are QueueWise AI Assistant, an enthusiastic, friendly, talkative, and comprehensive AI student & campus helper for an enterprise university / training institute queue management system.
Departments: Placement Cell (P), IT Help Desk (IT), Academic Counseling (AC), Student Services (SS).
Current ticket context: ${JSON.stringify(ticketContext || {})}

Guidelines for your responses:
- Be cheerful, polite, conversational, and talkative. Greet students and visitors warmly.
- If the user has an active ticket, provide specific details like their ticket token number, department, position in queue, estimated wait time, and counter desk number.
- Give structured and helpful answers for document checklists (Placement resumes, ID cards, IT repair, academic forms), priority fast-track, notifications, and campus office hours.
- If the user talks in Hindi or Hinglish, reply warmly in natural, friendly Hinglish/English.
- Always offer helpful follow-up suggestions or next steps at the end of your response!`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: userMessage,
        config: { systemInstruction }
      });

      return response.text;
    } catch (err) {
      console.warn("Gemini Chat Fallback:", err.message);
    }
  }

  // Rich, Talkative & Intelligent Knowledge Engine for Campus Departments
  const msgLower = (userMessage || "").toLowerCase().trim();

  // 1. Greetings & Pleasantries
  if (msgLower === "hi" || msgLower === "hello" || msgLower === "hey" || msgLower.startsWith("hi ") || msgLower.startsWith("hello ") || msgLower.includes("namaste") || msgLower.includes("kese ho") || msgLower.includes("how are you")) {
    if (ticketContext && ticketContext.ticketNumber) {
      return `👋 Hello ${ticketContext.customerName || "there"}! Welcome to the Campus Support Portal! 😊\n\nI see you have an active queue pass **#${ticketContext.ticketNumber}** for **${ticketContext.serviceName}**. You are currently **#${ticketContext.position || 1} in line** with an estimated wait of **~${ticketContext.estimatedWaitMins || 5} minutes**.\n\nHow can I assist you today? You can ask about required documents for Placement, IT diagnostics, certificate processing, or priority routing!`;
    }
    return "👋 Hello! Welcome to the QueueWise Campus Queue Assistant! 😊🎓\n\nI am here to guide you across all campus departments today:\n• 💼 **Placement Cell:** Recruitment, resume review & internship support\n• 💻 **IT Help Desk:** Software, campus Wi-Fi & laptop assistance\n• 🎓 **Academic Counseling:** Course guidance & faculty consultation\n• 📄 **Student Services:** ID cards, transcripts & official certificates\n\nWhat can I help you with today?";
  }

  // 2. Wait Time / Status / Position In Line
  if (msgLower.includes("wait") || msgLower.includes("time") || msgLower.includes("long") || msgLower.includes("position") || msgLower.includes("kab") || msgLower.includes("kitna time") || msgLower.includes("status")) {
    if (ticketContext && ticketContext.ticketNumber) {
      if (ticketContext.status === "in-service") {
        return `🎉 Attention! Your token **#${ticketContext.ticketNumber}** is **NOW CALLED** at **Counter Desk #${ticketContext.counterNumber || 1}**! 🔔\n\nPlease proceed directly to the desk. Your representative is ready for your consultation!`;
      }
      return `⏱️ **Live Ticket Status for #${ticketContext.ticketNumber}**:\n\n• **Student/Attendee Name:** ${ticketContext.customerName}\n• **Department:** ${ticketContext.serviceName}\n• **Position in Line:** #${ticketContext.position || 1} ahead of you\n• **Estimated Wait Time:** ~${ticketContext.estimatedWaitMins || 5} minutes\n• **Priority Status:** ${ticketContext.priority === 'vip' ? '⭐ Fast-Track Priority Active' : 'Standard Queue'}\n\n💡 *Tip: Relax in the student lounge. We will notify you with a loud chime and SMS banner the moment your number is called!*`;
    }
    return "⏱️ **General Department Wait Times**:\n• 💼 **Placement Cell:** ~10-20 mins (Comprehensive resume & interview review)\n• 💻 **IT Help Desk:** ~5-10 mins (Quick diagnostics & Wi-Fi setup)\n• 🎓 **Academic Counseling:** ~10-15 mins (Curriculum & course advisory)\n• 📄 **Student Services:** ~4-8 mins (Fast certificate & verification intake)\n\nTake a digital ticket at the Virtual Kiosk to get your exact live countdown!";
  }

  // 3. Documents & Checklist by Department
  if (msgLower.includes("document") || msgLower.includes("paper") || msgLower.includes("bring") || msgLower.includes("kya lana") || msgLower.includes("documents") || msgLower.includes("placement") || msgLower.includes("resume") || msgLower.includes("certificate") || msgLower.includes("id card")) {
    return `📄 **Required Documents Checklist by Department**:\n\n💼 **Placement Cell (Career & Recruitment):**\n• Updated Resume (2 printed copies)\n• College Student ID Card\n• Academic Transcripts / All Semester Grade Sheets\n• Internship Offer Letter / NOC Request Form (if applicable)\n• Portfolio / Project GitHub / LinkedIn links\n\n💻 **IT Help Desk (System & Network Support):**\n• Your Laptop / Device with Power Adapter\n• Student ERP / Portal Login ID & Roll Number\n• Error Screenshots / Software Installation details\n• Device MAC Address (for campus Wi-Fi registration)\n\n🎓 **Academic Counseling (Course Guidance):**\n• Current Semester Registration Form\n• Previous Grade Cards & Attendance Record\n• Specific query notes for faculty consultation\n\n📄 **Student Services (Official Certificates & ID):**\n• Application form for Bonafide / Character / Degree Certificate\n• Fee Clearance Receipt\n• Old ID card or Police Loss Report (for duplicate ID requests)\n\nHaving these ready ensures your counter representative can complete your request in under 5 minutes!`;
  }

  // 4. VIP & Fast-Track Priority
  if (msgLower.includes("vip") || msgLower.includes("priority") || msgLower.includes("fast") || msgLower.includes("urgent") || msgLower.includes("emergency")) {
    return `⭐ **Fast-Track Priority Pass Guide**:\n\nOur Fast-Track queue prioritizes urgent academic and recruitment requests:\n\n**Who is eligible for Fast-Track Priority?**\n• Scheduled Company Interview Candidates (Same-day drive)\n• Senior Faculty & Research Scholars\n• Urgent clearance or deadline-sensitive document submissions\n• Students with physical mobility or medical needs\n\n**How to activate?**\nWhen generating your pass at the Virtual Kiosk, toggle the **"Priority Fast-Track Pass"** button before submitting. The system will automatically place you at the front of the queue!`;
  }

  // 5. Notifications & SMS Alerts
  if (msgLower.includes("notif") || msgLower.includes("sms") || msgLower.includes("phone") || msgLower.includes("sound") || msgLower.includes("chime") || msgLower.includes("alert") || msgLower.includes("call")) {
    return `🔔 **Multi-Channel Turn Notification System**:\n\nYou will never miss your turn on campus! When your desk calls your token, QueueWise automatically triggers:\n\n1. 📱 **Simulated Mobile SMS Push Banner**: Instant pop-up on your device showing your Counter Desk number.\n2. 🔊 **Two-Tone Attention Chime**: A pleasant chime sounds through your device.\n3. 🖥️ **Live TV Flight Monitor**: Your token number flashes on the Campus Waiting Lounge Monitor.\n4. 📳 **Haptic Vibration**: On supported mobile devices, your phone vibrates to alert you.\n\n*You can test the notification anytime using the "Test Alert" button on your active pass!*`;
  }

  // 6. Campus Office Hours & Quiet Hours
  if (msgLower.includes("hour") || msgLower.includes("time") || msgLower.includes("open") || msgLower.includes("close") || msgLower.includes("peak") || msgLower.includes("rush") || msgLower.includes("timing")) {
    return `🕒 **Campus Support Office Hours & Inflow Guide**:\n\n• **Working Hours:** Monday to Saturday: 9:00 AM – 5:30 PM\n• **Sunday:** Closed\n\n📊 **Traffic & Peak Rush Guide:**\n• 🟢 **9:00 AM – 10:30 AM:** Morning Low Flow (Fastest service, <5 min wait)\n• 🔴 **11:30 AM – 1:30 PM:** Pre-Noon & Recruitment Rush (Peak crowd, ~10-15 min wait)\n• 🟡 **2:00 PM – 3:30 PM:** Afternoon Faculty Advisory Hours\n• 🟢 **4:00 PM – 5:30 PM:** Evening Wrap-up (Low rush)\n\n💡 *Tip: Visiting before 11:00 AM or after 3:30 PM guarantees the shortest wait times!*`;
  }

  // 7. Counter Desks & Staff Routing
  if (msgLower.includes("counter") || msgLower.includes("staff") || msgLower.includes("desk") || msgLower.includes("where") || msgLower.includes("kaha jana")) {
    return `🏢 **Campus Department Desks & Staff**:\n\nOur facility operates **4 specialized service counters**:\n• **Counter 1 (Placement Desk):** Priya Sharma – Corporate Relations & Drives\n• **Counter 2 (Academic Counseling):** Prof. Rajesh Kumar – Course Advisory & Faculty\n• **Counter 3 (IT Help Desk):** Amit Patel – Lead Systems & Network Engineer\n• **Counter 4 (Student Services):** Neha Verma – Student Welfare & Certificates\n\nWhen your token is called, your pass and the Live TV display will guide you to the exact counter desk!`;
  }

  // 8. Cancel / Change Ticket
  if (msgLower.includes("cancel") || msgLower.includes("leave") || msgLower.includes("exit") || msgLower.includes("new ticket") || msgLower.includes("hatana")) {
    return `❌ **Canceling or Changing Your Campus Pass**:\n\n• If your schedule changes, tap the **"Cancel Pass"** button on your digital pass card.\n• Your slot will be immediately freed up for the next waiting student.\n• You can generate a new pass for any department whenever you are ready!`;
  }

  // 9. Feedback & Ratings
  if (msgLower.includes("feedback") || msgLower.includes("rating") || msgLower.includes("review") || msgLower.includes("experience")) {
    return `⭐ **Student Experience Feedback**:\n\nAs soon as your consultation is marked **Completed**, a 5-star rating & comment card will appear on your pass. Your ratings help the university maintain fast queue SLAs!`;
  }

  // 10. Thank you & Goodbye
  if (msgLower.includes("thank") || msgLower.includes("dhanyawad") || msgLower.includes("shukriya") || msgLower.includes("bye") || msgLower.includes("goodbye") || msgLower.includes("great")) {
    return `😊 You're very welcome! Best of luck with your academics and placement goals. Have a great day! 🌟🎓`;
  }

  // Default Talkative Fallback
  return `🤖 I am **QueueWise Campus AI Assistant**!\n\nHere are some popular questions you can ask me:\n1. ⏱️ *"How long is my wait time?"*\n2. 📄 *"What documents are needed for Placement Cell?"*\n3. 💻 *"How does IT Help Desk support work?"*\n4. 🎓 *"How do I schedule Academic Counseling?"*\n5. 📄 *"How to request an ID Card or Certificate?"*\n6. ⭐ *"How does Fast-Track Priority work?"*\n7. 🏢 *"Which counter handles my department?"*\n\nType any question above or tell me what you need help with!`;
}

module.exports = {
  calculateEstimatedWaitTime,
  generateAiQueueInsights,
  processAiChatQuery
};
