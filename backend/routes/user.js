const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/auth");


// POST - Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "user",
    });

    const savedUser = await newUser.save();
    const userResponse = savedUser.toObject();
    delete userResponse.password;
    res.status(201).json(userResponse);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Login User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid Email or Password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Email or Password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" },
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// --- PROFILE ROUTE (Protected - User updating own data) ---
// IMPORTANT: This MUST come before any route with /:id

router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await user.save();

      res.json({
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- CRUD ROUTES (Admin Protected) ---

// GET - List all users
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT - Update specific user by ID (Admin only)
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, role, isVerified, password } = req.body;

    // Find user first
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    // Manually set verification status
    if (typeof isVerified !== "undefined") {
      user.isVerified = isVerified;
    }

    // If admin provided a new password in the edit form
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Remove user (Admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res
        .status(400)
        .json({ message: "You cannot delete your own admin account." });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
