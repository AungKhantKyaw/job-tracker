const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"          // most people are normal users
  },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('User', userSchema);