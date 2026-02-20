const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  company:     { type: String, required: true },
  role:        { type: String, required: true },
  location:    { type: String },
  salaryRange:      { type: String },
  description:     { type: String },
  followupDate:     { type: Date },
  contactPerson:   { type: String },
  contactEmail:    { type: String },
  contactPhone:    { type: String },
  status: { 
    type: String,
    default: 'Applied'
  },
  appliedDate: { type: Date, default: Date.now },
  notes:       { type: String },
  link:        { type: String },
  statusHistory: [{
    status: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Job', jobSchema);