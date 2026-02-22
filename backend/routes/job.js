const express = require("express");
const router = express.Router();
const Job = require("../models/Job");
const { protect } = require("../middleware/auth");

/* ======================================================
   GET ALL JOBS (with pagination + populated status)
====================================================== */
router.get("/", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate("status")
        .populate("statusHistory.status")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Job.countDocuments(query),
    ]);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalJobs: total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   GET SINGLE JOB
====================================================== */
router.get("/:id", protect, async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      user: req.user.id,
    })
      .populate("status")
      .populate("statusHistory.status");

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ======================================================
   CREATE JOB
====================================================== */
router.post("/", protect, async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      user: req.user.id,
    };

    const job = new Job(jobData);

    // Add initial status history
    if (job.status) {
      job.statusHistory.push({
        status: job.status,
        date: new Date(),
      });
    }

    const saved = await job.save();

    const populatedJob = await saved.populate("status");

    res.status(201).json(populatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ======================================================
   UPDATE JOB (FULL UPDATE)
====================================================== */
router.put("/:id", protect, async (req, res) => {
  try {
    const existingJob = await Job.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    const { statusHistory, ...updateData } = req.body;

    if (
      updateData.status &&
      updateData.status.toString() !== existingJob.status?.toString()
    ) {
      existingJob.statusHistory.push({
        status: updateData.status,
        date: new Date(),
      });

      existingJob.status = updateData.status;
    }

    // Update other fields
    Object.assign(existingJob, updateData);

    const savedJob = await existingJob.save();

    const populatedJob = await savedJob.populate([
      { path: "status" },
      { path: "statusHistory.status" },
    ]);

    res.json(populatedJob);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

/* ======================================================
   PATCH JOB (PARTIAL UPDATE)
====================================================== */
router.patch("/:id", protect, async (req, res) => {
  try {
    const existingJob = await Job.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!existingJob) {
      return res.status(404).json({ message: "Job not found" });
    }

    const updateData = req.body;

    // If status changed
    if (
      updateData.status &&
      updateData.status.toString() !== existingJob.status?.toString()
    ) {
      existingJob.statusHistory.push({
        status: updateData.status,
        date: new Date(),
      });

      existingJob.status = updateData.status;
    }

    Object.assign(existingJob, updateData);

    const savedJob = await existingJob.save();

    const populatedJob = await savedJob.populate([
      { path: "status" },
      { path: "statusHistory.status" },
    ]);

    res.json(populatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/* ======================================================
   DELETE JOB
====================================================== */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Job.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Job not found" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
