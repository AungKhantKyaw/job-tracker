const express = require('express');
const router = express.Router();
const Status = require('../models/Status');
const Job = require('../models/Job');

// GET all statuses
router.get('/', async (req, res) => {
  try {
    const statuses = await Status.find().sort({ createdAt: 1 });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single status
router.get('/:id', async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ message: 'Status not found' });
    res.json(status);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a status
router.post('/', async (req, res) => {
  try {
    const status = new Status(req.body);
    const saved = await status.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT full update a status
router.put('/:id', async (req, res) => {
  try {
    const old = await Status.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Status not found' });

    const updated = await Status.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If label changed, update all jobs using the old label
    if (req.body.label && req.body.label !== old.label) {
      await Job.updateMany({ status: old.label }, { $set: { status: req.body.label } });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH partial update a status
router.patch('/:id', async (req, res) => {
  try {
    const old = await Status.findById(req.params.id);
    if (!old) return res.status(404).json({ message: 'Status not found' });

    const updated = await Status.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    // If label changed, sync all jobs that used the old label
    if (req.body.label && req.body.label !== old.label) {
      await Job.updateMany({ status: old.label }, { $set: { status: req.body.label } });
    }

    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a status
router.delete('/:id', async (req, res) => {
  try {
    const status = await Status.findById(req.params.id);
    if (!status) return res.status(404).json({ message: 'Status not found' });

    // Prevent deleting if jobs are still using this status
    const jobCount = await Job.countDocuments({ status: status.label });
    if (jobCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete — ${jobCount} job(s) are using this status. Reassign them first.` 
      });
    }

    await Status.findByIdAndDelete(req.params.id);
    res.json({ message: 'Status deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;