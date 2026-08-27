# 🗺️ QueueWise Codebase Directory & Architecture Map

This guide provides a comprehensive breakdown of the entire QueueWise codebase for developers, recruiters, and contributors.

---

## 📁 Root Directory Overview

```
QueueWise/
├── client/                     # Frontend Application (React 19 + Vite 8 + Tailwind CSS 4)
├── server/                     # Backend API & WebSocket Server (Node.js + Express 5 + Socket.io)
├── .github/workflows/ci.yml    # CI/CD Automated Test Pipeline
├── CODEBASE_MAP.md             # Detailed Codebase Reference & Architecture Map (This file)
├── README.md                   # Project Documentation, Live Setup & System Overview
└── package.json                # Root orchestration scripts (concurrent dev runner)
```

---

## 🖥️ Frontend Architecture (`/client`)

The frontend is built with **React 19**, **Vite 8**, and **Tailwind CSS 4** using a modern component-driven SaaS design system.

### Directory Structure: `client/src/`

```
client/src/
├── components/
│   ├── StudentCheckIn.jsx      # 🎫 Campus Check-In, Digital Pass, QR Verification & Star Rating Widget
│   ├── StaffDashboard.jsx      # 🏢 Staff Control Stations, Desk Isolation, Call Next & Live Queue Directory
│   ├── AnalyticsDashboard.jsx  # 📊 SLA Charts, Department Throughput, Completed Audit Log & CSV Export
│   ├── AiHub.jsx               # 🤖 Executive AI Intelligence, Live Bottleneck Analysis & Surge Heatmaps
│   ├── TvDisplay.jsx           # 📺 Public Waiting Lounge Live Announcement Monitor Board
│   ├── AiChatbot.jsx           # 💬 Floating Slide-Up Campus AI Assistant with Quick Suggestion Chips
│   ├── LoginModal.jsx          # 🔐 Staff & Facility Admin JWT Authentication Modal
│   └── Navbar.jsx              # 🧭 Header Navigation, Flat Tabs, Theme Toggle & Seed Demo Button
│
├── App.jsx                     # 🌐 Root State Orchestrator, WebSockets, Audio Chimes & SMS Alerts
├── index.css                   # 🎨 Design Tokens (Light/Dark Mode, Linear/Stripe style borders, Soft Shadows)
└── main.jsx                    # 🚀 Vite React DOM Mount Entry Point
```

### Component Details:

1. **`CustomerKiosk.jsx`**
   - Renders 4 Enterprise Campus Service Cards:
     - 💼 **Placement Cell** (`P-101`, `P-102`)
     - 💻 **IT Help Desk** (`IT-101`, `IT-102`)
     - 🎓 **Academic Counseling** (`AC-101`, `AC-102`)
     - 📄 **Student Services** (`SS-101`, `SS-102`)
   - Embeds Live Intelligence Metrics: Serving Token, Next Token, In Queue, and Estimated Wait Time.
   - Interactive Ticket Pass with live Position in Queue, Verification QR code, and **Optional 5-Star Experience Rating Widget**.

2. **`StaffDashboard.jsx`**
   - Counter Desks 1 to 4 with staff assignment and lock restrictions for operators.
   - Single-task serving enforcement with "Call Next", "Mark Done", "Cancel", and "No-Show" actions.
   - Searchable, filterable Live Queue Table.

3. **`AnalyticsDashboard.jsx`**
   - Real-time SLA charts (Service breakdown, Lifecycle status, Desk throughput, VIP ratio).
   - Historical completed consultation audit log with star ratings.
   - 1-Click CSV Service Log Export.

4. **`AiHub.jsx`**
   - AI Queue Health Score, Bottleneck identification, and 24-hour predictive arrival heatmap.

5. **`TvDisplay.jsx`**
   - Fullscreen public announcement board with live clock, active serving counters, and upcoming tokens.

6. **`AiChatbot.jsx`**
   - Conversational assistant with 8 campus suggestion chips, powered by Gemini 2.5 Flash with fallback logic.

7. **`Navbar.jsx` & `LoginModal.jsx`**
   - Multi-role JWT login (Admin System vs. Staff Operators) and theme toggle (Bright/Dark/System).

---

## ⚙️ Backend Architecture (`/server`)

The backend is built with **Node.js**, **Express 5**, and **Socket.io** with dual persistence (MongoDB Atlas + In-Memory Fallback).

### Directory Structure: `server/`

```
server/
├── models/
│   ├── Ticket.js               # 📄 Mongoose Schema for Queue Tickets (token, attendee, priority, rating, timestamps)
│   ├── Service.js              # 🏛️ Mongoose Schema for Campus Departments (name, prefix, avg duration)
│   ├── Counter.js              # 🏢 Mongoose Schema for Service Desks (counterNumber, staffName, currentTicket)
│   └── Staff.js                # 👤 Mongoose Schema for Users (username, passwordHash, role, counterNumber)
│
├── routes/
│   ├── queueRoutes.js          # 🎟️ Virtual Queue APIs: /join, /call-next, /status, /feedback, /seed, /ticket/:id
│   ├── authRoutes.js           # 🔐 Authentication APIs: /login, /verify, /staff
│   └── aiRoutes.js             # 🤖 AI Endpoints: /insights (Queue analytics), /chat (Conversational assistant)
│
├── services/
│   ├── aiService.js            # 🧠 Gemini 2.5 AI Analytics Engine + Campus Q&A Knowledge Base
│   └── queueService.js         # 📐 Queuing Theory Formulas ($M/M/c$), Token Sequencing & SLA Calculations
│
├── middleware/
│   ├── auth.js                 # 🛡️ JWT Token Verification & Role-Based Access Control (Admin/Staff)
│   └── validate.js             # 🔍 Joi Request Payload Validation & Sanitization
│
├── utils/
│   └── db.js                   # 🗄️ Database Connector & Resilient In-Memory Data Store with Campus Seed Models
│
└── server.js                   # 🔌 Express Server Entry Point, Socket.io Real-Time Events & Global Error Handlers
```

---

## 📡 REST API & Socket.io Event Map

### Queue APIs (`/api/queue`)
- `POST /api/queue/join` — Issue a new virtual ticket pass.
- `GET /api/queue/ticket/:ticketNumber` — Get live position & status for a specific ticket.
- `POST /api/queue/call-next` — Staff calls next waiting customer to their desk.
- `PATCH /api/queue/ticket/:ticketNumber/status` — Update ticket status (`in-service`, `completed`, `cancelled`, `no-show`).
- `POST /api/queue/feedback` — Submit customer star rating (1–5) and optional comment.
- `POST /api/queue/seed` — Populate 10 live campus demo tickets across all departments.

### AI & Analytics APIs (`/api/ai`)
- `GET /api/ai/insights` — Retrieve real-time bottleneck analysis & surge forecasts.
- `POST /api/ai/chat` — Conversational Q&A assistant queries.

### Authentication APIs (`/api/auth`)
- `POST /api/auth/login` — Sign in as Facility Admin or Staff Desk Operator.
- `GET /api/auth/verify` — Validate active JWT token session.

### Real-Time Socket.io Events
- `queue:updated` — Broadcasted whenever any ticket is created, called, served, or rated.
- `ticket:called` — Broadcasted to trigger multi-channel SMS banners, speech announcements, and 2-tone chimes.

---

## 🔒 Security & Architecture Highlights
- **100% Zero Manual Polling**: Fully reactive WebSockets sync data between all clients in sub-millisecond real time.
- **Resilient In-Memory Fallback**: If MongoDB or Gemini API are not configured, the platform runs with full offline intelligence.
- **Strict Desk Isolation**: Staff members can only call and serve tickets at their designated counter station.
