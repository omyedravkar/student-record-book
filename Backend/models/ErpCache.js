const mongoose = require('mongoose');

const erpCacheSchema = new mongoose.Schema({
  prn: { type: String, required: true, unique: true },
  cgpa: { type: Number },
  attendance: { type: Object },
  marks: { type: Object },
  last_fetched: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ErpCache', erpCacheSchema);