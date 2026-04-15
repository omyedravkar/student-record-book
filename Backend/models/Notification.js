const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  to_prn: { type: String, required: true },
  from_prn: { type: String },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['SUBMITTED', 'VERIFIED', 'REJECTED', 'LOCKED'],
  },
  record_id: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentRecord' },
  read: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);