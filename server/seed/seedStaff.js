const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Staff = require('../models/Staff');
require('dotenv').config();

async function seedStaff(standalone = false) {
  try {
    if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("Connected to MongoDB for staff seeding.");
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      const staffList = [
        { username: 'admin', password: bcrypt.hashSync('admin123', 10), name: 'Admin System', role: 'admin', counterNumber: null },
        { username: 'staff1', password: bcrypt.hashSync('staff123', 10), name: 'Priya Sharma', role: 'staff', counterNumber: 1 },
        { username: 'staff2', password: bcrypt.hashSync('staff123', 10), name: 'Rajesh Kumar', role: 'staff', counterNumber: 2 },
        { username: 'staff3', password: bcrypt.hashSync('staff123', 10), name: 'Amit Patel', role: 'staff', counterNumber: 3 },
        { username: 'staff4', password: bcrypt.hashSync('staff123', 10), name: 'Neha Verma', role: 'staff', counterNumber: 4 }
      ];
      await Staff.insertMany(staffList);
      console.log("Seeded staff accounts in MongoDB.");
    } else {
      console.log("Staff accounts already exist, skipping seed.");
    }
  } catch (error) {
    console.error("Error seeding staff:", error.message);
  } finally {
    if (standalone) {
      await mongoose.disconnect();
      console.log("Disconnected from MongoDB (standalone seed).");
    }
  }
}

if (require.main === module) {
  seedStaff(true);
}

module.exports = seedStaff;
