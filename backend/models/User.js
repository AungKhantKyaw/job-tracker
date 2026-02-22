const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true 
  },
  password: { 
    type: String, 
    required: true, 
    select: false
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  // Verification Fields
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  emailVerifyToken: { 
    type: String, 
    select: false 
  },
  emailVerifyExpires: { 
    type: Date, 
    select: false 
  },
  // Password Reset Fields
  resetPasswordToken: { 
    type: String, 
    select: false 
  },
  resetPasswordExpires: { 
    type: Date, 
    select: false 
  },
}, { 
  timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model("User", userSchema);
