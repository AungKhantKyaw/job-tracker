const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { protect } = require('../middleware/auth');

// GET all jobs with pagination and user filtering
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filter by the logged-in user
    const query = { user: req.user.id };

    const [jobs, total] = await Promise.all([
      Job.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalJobs: total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single job
router.get('/:id', protect, async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a job
router.post('/', protect, async (req, res) => {
  try {
    const jobData = { 
      ...req.body, 
      user: req.user.id
    };

    const job = new Job(jobData);
    const saved = await job.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT full update a job
router.put('/:id', protect, async (req, res) => {
  try {
    const existingJob = await Job.findById(req.params.id);
    if (!existingJob) return res.status(404).json({ message: "Job not found" });

    // 1. Prepare the data from the request
    // Extract statusHistory so we don't try to "set" it via req.body
    const { statusHistory, ...updateData } = req.body;

    // 2. Check if the status has actually changed
    if (updateData.status && updateData.status !== existingJob.status) {
      // Add the new status to the existing history array
      existingJob.statusHistory.push({
        status: updateData.status,
        date: new Date()
      });
      
      // Update the status on the main document
      existingJob.status = updateData.status;
    }

    // 3. Update all other fields from updateData
    Object.assign(existingJob, updateData);

    // 4. Save the document (this triggers validation and saves the push)
    const savedJob = await existingJob.save();
    
    res.json(savedJob);
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
});

// PATCH partial update a job
router.patch('/:id', async (req, res) => {
  try {
    const updated = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'Job not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a job
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Job.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;