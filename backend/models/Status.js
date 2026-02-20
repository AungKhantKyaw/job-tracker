const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  label: { type: String, required: true, unique: true },
  color: { type: String, default: '#888888' }, // hex color for UI
}, { timestamps: true });

module.exports = mongoose.model('Status', statusSchema);