const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  counterNumber: { type: Number, default: null }
});

module.exports = mongoose.model('Staff', staffSchema);
