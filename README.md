# QueueWise AI

QueueWise AI is a real-time virtual queue management and wait-time estimation system built for campus service desks, admissions offices, and student support centers. Students can check in with their roll number from a virtual kiosk, get a digital queue ticket with a QR code and live countdown, and receive audio/visual alerts when their number is called. Staff manage incoming tickets from dedicated counter workstations, while public TV monitors and administrative analytics dashboards stay synchronized in real time over WebSockets.

---

## Why I Built This

Campus service desks—like the Placement Cell, IT Help Desk, and Academic Counseling—often suffer from the same bottlenecks:

- Students crowd waiting areas without knowing how many people are ahead of them or when they will be called.
- Counter staff have to shout token numbers or manage manual paper sign-in sheets.
- Workloads are unbalanced across desks because staff lack visibility into department-specific surges.
- Estimating wait times accurately is difficult when different service types have drastically different average consultation times.

I built QueueWise to replace physical queues with a reactive virtual system that gives visitors predictable wait estimates, keeps staff focused on one attendee at a time, and offers administrators live operational metrics and bottleneck insights.

---

## What It Does

### 1. Student Check-In & Virtual Pass (Kiosk)
- **Role-Based Login / Registration:** Sign in with a student Roll Number (e.g., `22CS101`) or register a new profile with department and mobile number.
- **Department Routing:** Choose from 4 specialized campus services:
  - **Placement Cell (`P`):** Career, internship, and interview drives (~20 min avg).
  - **IT Help Desk (`IT`):** Wi-Fi registration, hardware troubleshooting, and portal access (~10 min avg).
  - **Academic Counseling (`AC`):** Course guidance and faculty advisory (~15 min avg).
  - **Student Services (`SS`):** Bonafide certificates, ID cards, and transcripts (~8 min avg).
- **Live Queue Intelligence Strip:** Real-time visibility into currently serving token, next token in line, total waiting, and estimated wait minutes per department before issuing a pass.
- **Priority Fast-Track (VIP):** Fast-track routing toggle for scheduled interviews, faculty escalations, and urgent clearances.
- **Digital Pass View:** Live position in line countdown, dynamically updated ETA, cancellation button, and a generated QR verification pass.
- **Turn Notification Alerts:** When a ticket is called by staff, the kiosk triggers:
  - Synthesized two-tone audio chime (Web Audio API).
  - Browser system notification (Desktop / Mobile Notification API).
  - Speech synthesis voice announcement (Web Speech API).
  - Mobile device haptic vibration pattern (`navigator.vibrate`).
  - Simulated high-visibility on-screen SMS alert banner.
- **Service Rating & Feedback:** 1-click 5-star experience rating and feedback submission once consultation is marked completed.

### 2. Staff Counter Stations
- **Station Assignment & Isolation:** 4 counter workstations assigned to specific operators. Staff operators are locked to their own desk number, while administrators can operate or switch any counter.
- **Single-Task Serving Guard:** Enforces completing, cancelling, or marking a ticket as a no-show before calling the next customer.
- **Ticket Lifecycle Actions:** Call next, mark in-service, complete consultation, cancel task, or flag no-show.
- **Live Search & Filter Directory:** Search live tickets by ticket token, student name, or department, and filter by status (`waiting`, `in-service`, `completed`).

### 3. Public TV Display Monitor
- **Flight-Board Public Display:** High-contrast monitor view designed for waiting lounge screens.
- **Live Synchronized Clock:** Real-time digital clock display.
- **Active Desks Grid:** Displays token numbers actively called across all 4 counters with assigned staff and department names.
- **Up Next List:** Ordered upcoming queue list with position numbers and VIP badges.

### 4. Facility Analytics & Audit Logs
- **KPI Summary:** Total tickets, completed count, active counter desks, and active queue load.
- **Interactive Charts (Chart.js):**
  - Category demand doughnut chart.
  - Queue lifecycle stage distribution bar chart.
  - Counter throughput comparison bar chart.
  - VIP vs. Standard priority distribution.
- **Historical Audit Log:** Searchable consultation history log with timestamps and student star ratings.
- **CSV Data Export:** 1-click download of the complete service log (`queuewise_service_log_YYYY-MM-DD.csv`).

### 5. AI Queue Intelligence & Chatbot
- **Live Flow Velocity Score:** Algorithmic flow score (0–100%) dynamically calculated from queue backlog and completion rate.
- **Bottleneck Detection:** Identifies which department has the highest wait backlog and suggests counter reallocation actions.
- **What-If Capacity Simulator:** Interactive slider (1 to 6 counters) to simulate how adding or removing counters impacts wait times and throughput for the current live backlog.
- **24-Hour Surge Heatmap:** Projected peak arrival timeframes (e.g., 11:30 AM – 1:30 PM) for pre-staffing planning.
- **Conversational Campus AI Assistant:** Slide-up floating chatbot with quick-action chips. Answers inquiries on wait times, department document checklists (resumes, ID cards, forms), office timings, and priority passes.
- **Gemini + Heuristic Dual Engine:** Powered by Google Gemini (`gemini-2.5-flash`) via `@google/genai` when an API key is present. Automatically falls back to a deterministic heuristic engine when offline or unconfigured.

---

## How It Works

```text
[ Student / Kiosk ]
        │  1. Check-in (Roll No / Name / Service)
        ▼
[ Express API Server ] ──► Stores ticket (MongoDB Atlas or In-Memory)
        │
        │  2. Calculates initial ETA (queuing formula)
        ▼
[ Socket.IO Server ] ──► Broadcasts `queue:updated`
        │
        ├──► Kiosk updates position & ETA
        ├──► TV Display refreshes upcoming list
        └──► Staff Dashboard updates live queue
        │
[ Staff Station ] ──► Calls next ticket (`POST /api/queue/call-next`)
        │
        ▼
[ Socket.IO Server ] ──► Broadcasts `ticket:called`
        │
        ├──► Kiosk plays Web Audio chime + Speech voice + SMS banner
        ├──► TV Display flashes called token on Counter card
        └──► Staff serves customer ──► Marks `completed` + Student rates 1-5★
```

### Queue Calculation Logic

The estimated wait time ($W$) for standard and VIP tickets is derived dynamically:

$$W_{\text{standard}} = \max\left(2, \left\lceil \frac{N_{\text{waiting}} \times D_{\text{avg}}}{C_{\text{active}}} \right\rceil\right)$$

$$W_{\text{vip}} = \max\left(2, \left\lceil W_{\text{standard}} \times 0.5 \right\rceil\right)$$

Where:
- $N_{\text{waiting}}$ = Number of customers currently waiting for that service
- $D_{\text{avg}}$ = Average service duration in minutes (Placement: 20m, Academic: 15m, IT: 10m, Student Services: 8m)
- $C_{\text{active}}$ = Number of active counters assigned to handle that service category

---

## Architecture

```text
                                 ┌─────────────────────────────────┐
                                 │          Client Layer           │
                                 │   React 19 + Vite + Tailwind 4  │
                                 └───────────────┬─────────────────┘
                                                 │
                               HTTP Requests     │     WebSocket Events
                             (REST API / JWT)    │  (`queue:updated`, `ticket:called`)
                                                 │
                                                 ▼
                                 ┌─────────────────────────────────┐
                                 │          Server Layer           │
                                 │    Node.js 20+ / Express 5      │
                                 │       Socket.IO Server          │
                                 └──────┬────────────────────┬─────┘
                                        │                    │
              ┌─────────────────────────┼────────────────────┼────────────────────────┐
              ▼                         ▼                    ▼                        ▼
      ┌───────────────┐         ┌───────────────┐    ┌───────────────┐        ┌───────────────┐
      │ Auth & RBAC   │         │ Queue Logic   │    │  AI Service   │        │ QR Generator  │
      │ JWT + bcrypt  │         │ Validation    │    │ Gemini 2.5 /  │        │ `qrcode`      │
      │ (Admin/Staff/ │         │ Joi schemas   │    │ Heuristic     │        │ base64 output │
      │  Student)     │         │ Status engine │    │ fallback      │        │ for passes    │
      └───────────────┘         └───────┬───────┘    └───────────────┘        └───────────────┘
                                        │
                                        ▼
                        ┌───────────────────────────────┐
                        │       Persistence Layer       │
                        ├───────────────────────────────┤
                        │  Primary: MongoDB Atlas       │
                        │  Fallback: In-Memory Store    │
                        └───────────────────────────────┘
```

---

## Tech Stack

### Frontend
- **Framework:** React 19 (`react`, `react-dom`)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS 4 (`@tailwindcss/vite`)
- **Real-Time Client:** `socket.io-client` (v4.8)
- **Charts:** Chart.js (v4.5) & `react-chartjs-2` (v5.3)
- **Icons:** `lucide-react`
- **Linting:** Oxlint (`oxlint`)

### Backend
- **Runtime:** Node.js (v20+)
- **Framework:** Express 5 (`express` v5.2)
- **Real-Time Server:** Socket.IO (v4.8)
- **Database:** MongoDB Atlas via Mongoose 9 (with in-memory fallback)
- **AI Integration:** Google Gemini 2.5 Flash via `@google/genai` (v2.16)
- **Authentication & Security:** `jsonwebtoken` (JWT), `bcryptjs`, `helmet`, `cors`, `express-rate-limit`
- **Validation:** Joi (v17.13)
- **Utilities:** `qrcode` (ticket QR pass generator), `dotenv`
- **Testing:** Jest (v30.4)

---

## Getting Started

### Prerequisites
- **Node.js:** `v20.0.0` or higher
- **npm:** `v10.0.0` or higher
- **MongoDB Atlas Connection URI** *(optional — runs on in-memory store if omitted)*
- **Google Gemini API Key** *(optional — runs on local heuristic knowledge engine if omitted)*

### 1. Clone Repository & Install Dependencies

```bash
git clone https://github.com/yourusername/QueueWise.git
cd QueueWise

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install

# Return to project root
cd ..
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` folder:

```env
# server/.env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=your-secure-jwt-secret-key-change-in-production

# Optional: Connect to MongoDB Atlas (leave empty to use in-memory store)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/queuewise?retryWrites=true&w=majority

# Optional: Google Gemini API Key for AI Insights & Chatbot
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run the Development Server

From the root directory, start both the Express backend and Vite frontend concurrently:

```bash
npm start
```

- **Frontend Client:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5000](http://localhost:5000)

Alternatively, run each service in separate terminals:

```bash
# Terminal 1 (Backend API)
cd server
node server.js

# Terminal 2 (Frontend Client)
cd client
npm run dev -- --host
```

---

## Demo Accounts

The application includes pre-configured demo profiles for testing and evaluation:

### 🎓 Students

| Name | Roll Number | Department | Password |
| --- | --- | --- | --- |
| Aarav Sharma | `22CS101` | Computer Science | `student123` |
| Ananya Iyer | `23EC204` | Electronics & Comm. | `student123` |
| Rohan Mehta | `22IT105` | Information Tech | `student123` |
| Pooja Gupta | `24ME302` | Mechanical Engg. | `student123` |

*Note: You can also register any new student account directly from the login page.*

### 🏢 Staff Operators & Admin

| Username | Password | Staff Name | Assigned Desk | Role |
| --- | --- | --- | --- | --- |
| `admin` | `admin123` | Campus Administrator | All Desks / Master Access | `admin` |
| `staff1` | `staff123` | Priya Sharma | Counter 1 (Placement) | `staff` |
| `staff2` | `staff123` | Rajesh Kumar | Counter 2 (Academic) | `staff` |
| `staff3` | `staff123` | Amit Patel | Counter 3 (IT Help Desk) | `staff` |
| `staff4` | `staff123` | Neha Verma | Counter 4 (Student Services) | `staff` |

To populate 10 active demo queue tickets across departments along with 4 completed consultation records, click the **Seed Demo Queue** button in the navigation bar or send a `POST` request to `/api/queue/seed`.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Health check, server timestamp, and active database mode (MongoDB vs. In-Memory). |
| `GET` | `/api/services` | List all available campus services with active waiting ticket counts. |
| `POST` | `/api/auth/login` | Authenticate student (roll number), staff member, or admin; returns JWT token. |
| `POST` | `/api/auth/register` | Register a new student profile and return JWT token. |
| `POST` | `/api/queue/join` | Issue a new virtual queue pass (`customerName`, `phone`, `serviceId`, `priority`). |
| `GET` | `/api/queue/ticket/:ticketNumber` | Retrieve real-time position in line, ETA, and status for a specific ticket. |
| `POST` | `/api/queue/feedback` | Submit 1–5 star rating and optional feedback comment for a completed ticket. |
| `GET` | `/api/qr/:ticketNumber` | Generate a base64 Data URL QR code for digital ticket pass verification. |
| `POST` | `/api/ai/chat` | Send queries to the campus AI chatbot assistant with optional ticket context. |

### Authenticated Endpoints (`Authorization: Bearer <token>`)

| Method | Endpoint | Required Role | Description |
| --- | --- | --- | --- |
| `GET` | `/api/auth/me` | Any | Validate current token session and return user profile. |
| `GET` | `/api/queue/admin` | Any authenticated | Fetch admin metrics, active counters, service definitions, and ticket directory. |
| `POST` | `/api/queue/call-next` | `staff` / `admin` | Call the next waiting attendee for a specific counter station. |
| `POST` | `/api/queue/update-status` | `staff` / `admin` | Update ticket status (`in-service`, `completed`, `cancelled`, `no-show`). |
| `POST` | `/api/queue/seed` | `staff` / `admin` | Seed 10 live demo tickets and 4 completed records with ratings. |
| `GET` | `/api/ai/insights` | `admin` | Generate bottleneck analysis, health matrix, and surge predictions. |

---

## Real-Time WebSocket Events

The application communicates bi-directionally using Socket.IO:

| Event Name | Direction | Payload | Trigger / Purpose |
| --- | --- | --- | --- |
| `queue:updated` | Server ➔ Clients | `void` | Emitted when tickets are created, updated, completed, or rated. Triggers automatic background re-fetch across all clients. |
| `ticket:called` | Server ➔ Clients | `{ ticket }` | Emitted when staff calls a ticket. Triggers Web Audio chimes, browser push notifications, speech synthesis, and SMS alerts on the matched client device. |

---

## Testing

Backend unit tests are written with Jest and cover authentication middleware, Joi schema validation, queuing formulas, and AI service fallback handling:

```bash
# Run tests from root
npm test

# Or run directly from server directory
cd server
npm test
```

### Test Suite Coverage:
- **`aiService.test.js`**: Wait-time estimation formula verification, VIP priority calculation, Gemini fallback structure verification, and chatbot knowledge engine response matching.
- **`auth.test.js`**: JWT token signing, verification, expiration rejection, and role-based route guard enforcement (`requireRole`).
- **`validate.test.js`**: Joi payload validation for `/join`, `/call-next`, `/update-status`, `/login`, and `/chat`.

---

## Project Structure

```text
QueueWise/
├── client/                           # React frontend application
│   ├── public/
│   │   ├── favicon.svg               # Application favicon
│   │   └── icons.svg                 # SVG sprite sheet
│   ├── src/
│   │   ├── assets/                   # Static images and icons
│   │   ├── components/
│   │   │   ├── AiChatbot.jsx         # Floating slide-up conversational AI assistant
│   │   │   ├── AiHub.jsx             # AI health score, bottleneck diagnosis & capacity simulator
│   │   │   ├── AnalyticsDashboard.jsx# Throughput charts, audit log table & CSV export
│   │   │   ├── AuthLandingPage.jsx   # Gated portal sign-in & student registration screen
│   │   │   ├── CustomerKiosk.jsx     # (Alias) Student Check-In component
│   │   │   ├── LoginModal.jsx        # Modal for switching accounts / staff sign-in
│   │   │   ├── Navbar.jsx            # Top navigation, status indicator & theme selector
│   │   │   ├── StaffDashboard.jsx    # Counter control stations, desk locking & queue table
│   │   │   ├── StudentCheckIn.jsx    # Department service cards, VIP pass & digital ticket view
│   │   │   └── TvDisplay.jsx         # Fullscreen public waiting lounge flight-board display
│   │   ├── utils/
│   │   │   └── notifications.js      # Web Audio chime, browser notification & haptic handlers
│   │   ├── App.jsx                   # Central state orchestrator & Socket.IO listeners
│   │   ├── index.css                 # Tailwind design tokens, typography & dark/light theme classes
│   │   └── main.jsx                  # React DOM mount point
│   ├── package.json
│   └── vite.config.js
│
├── server/                           # Express backend & WebSocket server
│   ├── __tests__/                    # Jest unit test suites
│   │   ├── aiService.test.js
│   │   ├── auth.test.js
│   │   └── validate.test.js
│   ├── middleware/
│   │   ├── auth.js                   # JWT verification & role-based route guards
│   │   ├── errorHandler.js           # Centralized Express error handler
│   │   └── validate.js               # Joi payload validation middleware
│   ├── models/                       # Mongoose database models
│   │   ├── Counter.js                # Counter desk assignment & status schema
│   │   ├── Service.js                # Department category & average duration schema
│   │   ├── Staff.js                  # Staff and administrator user schema
│   │   └── Ticket.js                 # Queue ticket lifecycle & rating schema
│   ├── routes/                       # Express REST API routes
│   │   ├── aiRoutes.js               # AI insights and chat endpoints
│   │   ├── authRoutes.js             # Sign-in, student sign-up, and session verification
│   │   ├── qrRoutes.js               # QR code Data URL generation endpoint
│   │   ├── queueRoutes.js            # Virtual queue management endpoints (Socket.IO bound)
│   │   └── serviceRoutes.js          # Service category list & waiting counts
│   ├── seed/
│   │   └── seedStaff.js              # Standalone script to seed default staff accounts
│   ├── services/
│   │   └── aiService.js              # Wait-time calculations, Gemini API client & knowledge engine
│   ├── utils/
│   │   └── db.js                     # MongoDB connection manager & in-memory fallback store
│   ├── package.json
│   └── server.js                     # Server entry point, HTTP server & Socket.IO setup
│
├── .github/workflows/
│   └── ci.yml                        # Automated test pipeline on push / pull request
├── CODEBASE_MAP.md                   # File-by-file directory reference
├── package.json                      # Root orchestration scripts (`concurrently`)
└── README.md                         # Project documentation
```

---

## License

This project is licensed under the [MIT License](LICENSE).

