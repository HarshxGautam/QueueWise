# 🎫 QueueWise

> A real-time virtual queue system built to end physical waiting lines in colleges, placement drives, and student service centers.

🚀 **Live App:** [https://queue-wise-azure.vercel.app](https://queue-wise-azure.vercel.app)  
⚙️ **Backend API:** [https://queuewise-hdfw.onrender.com](https://queuewise-hdfw.onrender.com)  
💻 **Repository:** [https://github.com/HarshxGautam/QueueWise](https://github.com/HarshxGautam/QueueWise)

---

## 📌 Why I Built This

During placement drives and semester clearances at my college, I saw the same problem every time:
- Students standing in crowded hallways for hours with no idea when their turn would come.
- Staff members calling out roll numbers manually from paper sheets.
- Desks having no way to balance sudden student rushes across departments.

I built **QueueWise** to turn physical lines into a clean digital queue. Students can take a virtual token from their phone or kiosk, see their live position and countdown time, and get a sound chime when their turn arrives. Staff get a simple desk dashboard to call and manage students one by one, while waiting rooms can display a live TV board.

---

## ✨ Features

### 🎓 1. Student Check-In & Virtual Pass
- **Quick Check-In:** Sign in with your Roll Number (e.g. `22CS101`) or enter as a guest.
- **Department Desks:**
  - 💼 **Placement Cell:** Interviews, resumes & company drives (~20 min avg)
  - 💻 **IT Help Desk:** Campus Wi-Fi, portal logins & lab issues (~10 min avg)
  - 📚 **Academic Counseling:** Course guidance & faculty approvals (~15 min avg)
  - 🏢 **Student Services:** ID cards, transcripts & official forms (~8 min avg)
- **VIP Priority Pass:** Fast-track option for scheduled interviews or urgent faculty clearances.
- **Live Digital Ticket:** Real-time position in line, countdown timer, and a generated QR verification pass.
- **Turn Alerts:** When your ticket is called, the app plays an audio chime, speaks your token number, and shows a pop-up alert.
- **5-Star Rating:** Rate your consultation experience right after your session ends.

### 🖥️ 2. Staff Control Station
- **Assigned Counters (1–4):** Each counter is locked to its assigned staff member. Administrators have master access to manage any desk.
- **Single-Student Focus:** Staff can **Call Next**, mark a consultation as **Done**, **Cancel**, or flag a **No-Show** before taking the next student.
- **Live Search & Filter:** Quickly find students by name or token number.

### 📺 3. Public TV Display (`/display`)
- High-contrast flight-board view designed for waiting lounge monitors.
- Shows which token is actively being served at Counters 1–4 alongside the upcoming queue.
- Updates in real time over WebSockets without needing a page refresh.

### 📊 4. Admin Analytics & History (`/analytics`)
- Visual charts showing daily student traffic, department demand, and counter turnaround times.
- Searchable consultation history with a 1-click **CSV download** for daily record keeping.

### 🤖 5. Campus Assistant & Capacity Tool (`/ai-hub`)
- **Capacity Simulator:** Test how adding or removing counter desks changes wait times for the current queue backlog.
- **Student Chat Assistant:** A slide-up chatbot that answers common questions about office hours, document checklists, and queue status.

---

## 🔍 How It Works

```text
[ Student / Kiosk ]
        │  1. Takes digital token (Roll No / Department)
        ▼
[ Express Backend ] ──► Saves ticket to MongoDB (or In-Memory store)
        │
        │  2. Calculates live wait time
        ▼
[ Socket.IO Server ] ──► Broadcasts update
        │
        ├──► Student phone shows live countdown
        ├──► Lounge TV screen updates upcoming list
        └──► Staff dashboard adds student to queue
        │
[ Staff Counter ] ──► Clicks "Call Next"
        │
        ▼
[ Socket.IO Server ] ──► Broadcasts call event
        │
        ├──► Student device plays sound chime + voice announcement
        ├──► Lounge TV flashes called token on Counter Desk
        └──► Staff marks Done ──► Student rates consultation (1–5★)
```

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Chart.js, Socket.IO Client, Lucide Icons
- **Backend:** Node.js, Express.js, Socket.IO Server, JWT Authentication, Joi
- **Database:** MongoDB Atlas with Mongoose (plus an automated in-memory backup engine if the database drops)
- **Deployment:** Vercel (Frontend) + Render (Backend)

---

## 🚀 Running Locally

If you'd like to run this project on your own machine:

### 1. Clone the repository
```bash
git clone https://github.com/HarshxGautam/QueueWise.git
cd QueueWise
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install

# Return to root directory
cd ..
```

### 3. Setup environment variables
Create a `.env` file inside the `server/` folder:
```env
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=my_super_secret_jwt_key

# Optional: MongoDB URI (leave blank to run in-memory)
MONGO_URI=

# Optional: Google Gemini API key for assistant
GEMINI_API_KEY=
```

### 4. Start the app
From the root folder, run:
```bash
npm start
```
- 🌐 **Frontend:** `http://localhost:5173`
- ⚙️ **Backend:** `http://localhost:5000`

---

## 🔑 Demo Accounts

You can test different roles using these pre-configured logins:

| Role | Username / Roll No | Password | Notes |
|---|---|---|---|
| 👑 **Campus Admin** | `admin` | `admin123` | Master control for all desks & analytics |
| 💼 **Placement Staff** | `staff1` | `staff123` | Counter #1 (Placement) |
| 📚 **Academic Staff** | `staff2` | `staff123` | Counter #2 (Academic) |
| 💻 **IT Staff** | `staff3` | `staff123` | Counter #3 (IT Support) |
| 🎓 **Student** | `22CS101` | `student123` | Student Roll Number profile |

*Tip: Click the **"Seed Demo Queue"** button in the navbar to populate 10 active demo tickets instantly.*

---

## 🧪 Tests

To run the backend test suite:
```bash
cd server
npm test
```

---

## 👨‍💻 Author

**Harsh Gautam**
- 🌐 **Live Website:** [https://queue-wise-azure.vercel.app](https://queue-wise-azure.vercel.app)
- 🐙 **GitHub:** [@HarshxGautam](https://github.com/HarshxGautam)


