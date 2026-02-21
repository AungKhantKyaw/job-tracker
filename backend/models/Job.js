const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: { type: String, required: true },
    role: { type: String, required: true },
    location: { type: String },
    salaryRange: { type: String },
    description: { type: String },
    followupDate: { type: Date },
    contactPerson: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String },

    status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
    statusHistory: [
      {
        status: { type: mongoose.Schema.Types.ObjectId, ref: "Status" },
        date: { type: Date, default: Date.now },
      },
    ],

    appliedDate: { type: Date, default: Date.now },
    notes: { type: String },
    link: { type: String },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Job", jobSchema);
