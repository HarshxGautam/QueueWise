const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  counterNumber: { type: Number, required: true, unique: true },
  staffName: { type: String, default: "Staff Member" },
  assignedServices: [{ type: String }],
  status: {
    type: String,
    enum: ["active", "paused", "offline"],
    default: "active"
  },
  currentTicket: { type: String, default: null },
  servedTodayCount: { type: Number, default: 0 }
});

module.exports = mongoose.model("Counter", counterSchema);
