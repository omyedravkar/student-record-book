const mongoose = require('mongoose');

const timeLockSchema = new mongoose.Schema({
  semester: { type: String, required: true },
  open_from: { type: Date, required: true },
  lock_after: { type: Date, required: true },
  created_by: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TimeLock', timeLockSchema);