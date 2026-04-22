const mongoose = require('mongoose');

const studentRecordSchema = new mongoose.Schema({
  prn: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['internship', 'certificate', 'project', 'activity'],
    required: true 
  },
  title: { type: String, required: true },
  organisation: { type: String },
  duration_weeks: { type: Number },
  start_date: { type: Date },
  end_date: { type: Date },
  description: { type: String },
  document_url: { type: String },
  tags: [{ type: String }],
  status: { 
    type: String, 
    enum: ['PENDING', 'VERIFIED', 'REJECTED'], 
    default: 'PENDING' 
  },
  verified_by: { type: String },
  verified_at: { type: Date },
  rejection_reason: { type: String },
  submitted_at: { type: Date, default: Date.now }
});

studentRecordSchema.index
studentRecordSchema.index({ 
  title: 'text', 
  organisation: 'text', 
  description: 'text', 
  tags: 'text' 
});

module.exports = mongoose.model('StudentRecord', studentRecordSchema);