const bcrypt = require('bcryptjs');
const Service = require("../models/Service");
const Counter = require("../models/Counter");

const adminPasswordHash = bcrypt.hashSync('admin123', 10);
const staffPasswordHash = bcrypt.hashSync('staff123', 10);
const studentPasswordHash = bcrypt.hashSync('student123', 10);

const inMemoryStore = {
  services: [
    { 
      serviceId: "placement", 
      name: "Placement Cell", 
      subtitle: "Internship, Job & Campus Recruitment Support",
      category: "Career & Recruitment", 
      avgDurationMins: 20, 
      icon: "Briefcase", 
      color: "blue", 
      prefix: "P" 
    },
    { 
      serviceId: "it-helpdesk", 
      name: "IT Help Desk", 
      subtitle: "Software, Network & System Assistance",
      category: "IT Support", 
      avgDurationMins: 10, 
      icon: "Laptop", 
      color: "emerald", 
      prefix: "IT" 
    },
    { 
      serviceId: "academic", 
      name: "Academic Counseling", 
      subtitle: "Course Guidance & Faculty Consultation",
      category: "Academics", 
      avgDurationMins: 15, 
      icon: "GraduationCap", 
      color: "purple", 
      prefix: "AC" 
    },
    { 
      serviceId: "student-services", 
      name: "Student Services", 
      subtitle: "Certificates, ID Cards & Official Requests",
      category: "Administration", 
      avgDurationMins: 8, 
      icon: "FileText", 
      color: "amber", 
      prefix: "SS" 
    }
  ],
  counters: [
    { counterNumber: 1, staffName: "Priya Sharma", assignedServices: ["placement", "student-services"], status: "active", currentTicket: null, servedTodayCount: 0 },
    { counterNumber: 2, staffName: "Rajesh Kumar", assignedServices: ["academic"], status: "active", currentTicket: null, servedTodayCount: 0 },
    { counterNumber: 3, staffName: "Amit Patel", assignedServices: ["it-helpdesk", "student-services"], status: "active", currentTicket: null, servedTodayCount: 0 },
    { counterNumber: 4, staffName: "Neha Verma", assignedServices: ["student-services", "placement"], status: "active", currentTicket: null, servedTodayCount: 0 }
  ],
  tickets: [],
  staff: [
    {
      _id: "staff-admin-id",
      username: "admin",
      passwordHash: adminPasswordHash,
      name: "Campus Administrator",
      role: "admin",
      counterNumber: null
    },
    {
      _id: "staff-1-id",
      username: "staff1",
      passwordHash: staffPasswordHash,
      name: "Priya Sharma",
      role: "staff",
      counterNumber: 1
    },
    {
      _id: "staff-2-id",
      username: "staff2",
      passwordHash: staffPasswordHash,
      name: "Rajesh Kumar",
      role: "staff",
      counterNumber: 2
    },
    {
      _id: "staff-3-id",
      username: "staff3",
      passwordHash: staffPasswordHash,
      name: "Amit Patel",
      role: "staff",
      counterNumber: 3
    },
    {
      _id: "staff-4-id",
      username: "staff4",
      passwordHash: staffPasswordHash,
      name: "Neha Verma",
      role: "staff",
      counterNumber: 4
    }
  ],
  students: [
    {
      _id: "student-1-id",
      rollNo: "22CS101",
      passwordHash: studentPasswordHash,
      name: "Aarav Sharma",
      department: "Computer Science",
      phone: "9876543210",
      role: "student"
    },
    {
      _id: "student-2-id",
      rollNo: "23EC204",
      passwordHash: studentPasswordHash,
      name: "Ananya Iyer",
      department: "Electronics & Comm.",
      phone: "9812345678",
      role: "student"
    },
    {
      _id: "student-3-id",
      rollNo: "22IT105",
      passwordHash: studentPasswordHash,
      name: "Rohan Mehta",
      department: "Information Tech",
      phone: "9765432109",
      role: "student"
    },
    {
      _id: "student-4-id",
      rollNo: "24ME302",
      passwordHash: studentPasswordHash,
      name: "Pooja Gupta",
      department: "Mechanical Engg.",
      phone: "9898989898",
      role: "student"
    }
  ]
};

let _isDbConnected = false;

function setDbConnected(status) {
  _isDbConnected = status;
}

function getIsDbConnected() {
  return _isDbConnected;
}

function getStore() {
  return inMemoryStore;
}

async function seedDefaultData() {
  try {
    const serviceCount = await Service.countDocuments();
    if (serviceCount === 0) {
      await Service.insertMany(inMemoryStore.services);
      console.log("Default Campus Services seeded to MongoDB.");
    }

    const counterCount = await Counter.countDocuments();
    if (counterCount === 0) {
      await Counter.insertMany(inMemoryStore.counters);
      console.log("Default Campus Counters seeded to MongoDB.");
    }
  } catch (err) {
    console.error("Error seeding initial MongoDB data:", err.message);
  }
}

module.exports = {
  inMemoryStore,
  get isDbConnected() { return getIsDbConnected(); },
  setDbConnected,
  getStore,
  seedDefaultData
};
