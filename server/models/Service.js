const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  serviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  avgDurationMins: { type: Number, default: 10 },
  icon: { type: String, default: "UserCheck" },
  color: { type: String, default: "indigo" },
  prefix: { type: String, default: "Q" }
});

module.exports = mongoose.model("Service", serviceSchema);
