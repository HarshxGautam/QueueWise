const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
  ticketNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  phone: { type: String, default: "" },
  serviceId: { type: String, required: true },
  serviceName: { type: String, required: true },
  status: {
    type: String,
    enum: ["waiting", "in-service", "completed", "cancelled", "no-show"],
    default: "waiting"
  },
  priority: {
    type: String,
    enum: ["standard", "vip"],
    default: "standard"
  },
  position: { type: Number, default: 1 },
  estimatedWaitMins: { type: Number, default: 5 },
  counterId: { type: String, default: null },
  counterNumber: { type: Number, default: null },
  joinedAt: { type: Date, default: Date.now },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  feedback: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  aiNotes: { type: String, default: "" }
});

module.exports = mongoose.model("Ticket", ticketSchema);
