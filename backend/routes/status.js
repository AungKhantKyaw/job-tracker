const express = require("express");
const router = express.Router();
const Status = require("../models/Status");
const Job = require("../models/Job");
const { protect, admin } = require("../middleware/auth");

// GET all statuses
router.get("/", async (req, res) => {
  try {
    const statuses = await Status.find().sort({ createdAt: 1 });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single status
router.get("/:id", async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found." });
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a status
router.post("/", protect, admin, async (req, res) => {
  try {
    const { label, color } = req.body;
    if (!label?.trim())
      return res.status(400).json({ message: "Label is required." });

    const existing = await Status.findOne({ label: label.trim() });
    if (existing)
      return res.status(409).json({ message: "Status label already exists." });

    const status = await Status.create({ label: label.trim(), color });
    return res.status(201).json(status);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT full update a status
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const old = await Status.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Status not found." });

    const updated = await Status.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // ✅ Jobs store status as ObjectId — no label sync needed
    // The populated label updates automatically since it reads from the Status doc

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH partial update a status
router.patch("/:id", protect, admin, async (req, res) => {
  try {
    const old = await Status.findById(req.params.id);
    if (!old) return res.status(404).json({ message: "Status not found." });

    const updated = await Status.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true },
    );

    // ✅ Same — no label sync needed, jobs reference by ObjectId
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a status
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ message: "Status not found." });

    // ✅ Query by ObjectId (_id), not by label string
    const jobCount = await Job.countDocuments({ status: status._id });
    if (jobCount > 0) {
      return res.status(400).json({
        message: `Cannot delete — ${jobCount} job(s) are using this status. Reassign them first.`,
      });
    }

    await Status.findByIdAndDelete(req.params.id);
    res.json({ message: "Status deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
