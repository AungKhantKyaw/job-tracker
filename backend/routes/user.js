const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protect, admin } = require("../middleware/auth");
const { sendEmail, verifyEmailTemplate } = require("../utils/sendEmail");
const crypto = require("crypto");
const hashToken = (t) => crypto.createHash("sha256").update(t).digest("hex");

// ─── Helpers ────────────────────────────────────────────────────────────────

const SALT_ROUNDS = 12;

const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Sanitize a plain object by removing any keys whose values are objects
 * (catches basic NoSQL injection like { email: { $gt: "" } }).
 */
const sanitizeBody = (obj) => {
  const clean = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== "object" || v === null) clean[k] = v;
  }
  return clean;
};

const serverError = (res, err) => {
  console.error(err);
  const message =
    process.env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message;
  return res.status(500).json({ message });
};

// ─── Register ────────────────────────────────────────────────────────────────

// POST /user/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = sanitizeBody(req.body);

    // Validate required fields
    if (!name?.trim())
      return res.status(400).json({ message: "Name is required." });
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ message: "A valid email is required." });
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(409).json({ message: "Email is already registered." });

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: await hashPassword(password),
      name: name.trim(),
      role: "user",
    });

    const rawToken = crypto.randomBytes(32).toString("hex");
    newUser.emailVerifyToken = hashToken(rawToken);
    newUser.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000;
    await newUser.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
    await sendEmail({
      to: newUser.email,
      subject: "Verify your OfferGrid email",
      html: verifyEmailTemplate(newUser.name, verifyUrl),
    });

    return res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────

// POST /user/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user)
      return res.status(401).json({ message: "Invalid email or password." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password." });

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // Adjust based on your client URL and CORS settings
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
});

// ─── Logout ──────────────────────────────────────────────────────────────────

// POST /user/logout
router.post("/logout", (_req, res) => {
  res.clearCookie("token", { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/" 
  });
  return res.json({ message: "Logged out successfully." });
});

// ─── Profile (self-update) ───────────────────────────────────────────────────

// PUT /user/profile
router.put("/profile", protect, async (req, res) => {
  try {
    const { name, email, password } = sanitizeBody(req.body);
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name.trim();

    if (email) {
      if (!EMAIL_RE.test(email))
        return res.status(400).json({ message: "Invalid email format." });

      const taken = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (taken)
        return res.status(409).json({ message: "Email is already in use." });

      user.email = email.toLowerCase();
    }

    if (password) {
      if (password.length < 8)
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters." });
      user.password = await hashPassword(password);
    }

    const updated = await user.save();

    return res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /user/profile - get current user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    serverError(res, err);
  }
});

// ─── Admin: List Users ───────────────────────────────────────────────────────

// GET /user?page=1&limit=20
router.get("/", protect, admin, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().select("-password").skip(skip).limit(limit).lean(),
      User.countDocuments(),
    ]);

    return res.json({
      users,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// POST /api/user/create (Admin only)
router.post("/create", protect, admin, async (req, res) => {
  try {
    const { email, password, name, role } = sanitizeBody(req.body);
    const ALLOWED_ROLES = ["user", "editor", "admin"];

    if (!name?.trim())
      return res.status(400).json({ message: "Name is required." });
    if (!email || !EMAIL_RE.test(email))
      return res.status(400).json({ message: "A valid email is required." });
    if (!password || password.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ message: "Email is already registered." });

    const newUser = await User.create({
      email: email.toLowerCase(),
      password: await hashPassword(password),
      name: name.trim(),
      role: ALLOWED_ROLES.includes(role) ? role : "user",
    });

    return res.status(201).json({
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    });
  } catch (err) {
    return serverError(res, err);
  }
});

// GET /api/user/:id (Admin only)
router.get("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    return res.json(user);
  } catch (err) {
    return serverError(res, err);
  }
});

// ─── Admin: Update User ───────────────────────────────────────────────────────

// PUT /user/:id
router.put("/:id", protect, admin, async (req, res) => {
  try {
    const { name, email, role, isVerified, password } = sanitizeBody(req.body);
    const ALLOWED_ROLES = ["user", "editor", "admin"];

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (name) user.name = name.trim();

    if (email) {
      if (!EMAIL_RE.test(email))
        return res.status(400).json({ message: "Invalid email format." });
      user.email = email.toLowerCase();
    }

    // ✅ Validate role against an allowlist
    if (role) {
      if (!ALLOWED_ROLES.includes(role))
        return res.status(400).json({ message: "Invalid role value." });
      user.role = role;
    }

    if (typeof isVerified === "boolean") user.isVerified = isVerified;

    if (password) {
      if (password.length < 8)
        return res
          .status(400)
          .json({ message: "Password must be at least 8 characters." });
      user.password = await hashPassword(password);
    }

    await user.save();
    return res.json({ message: "User updated successfully." });
  } catch (err) {
    return serverError(res, err);
  }
});

// ─── Admin: Delete User ───────────────────────────────────────────────────────

// DELETE /user/:id
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id)
      return res
        .status(400)
        .json({ message: "You cannot delete your own account." });

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "User not found." });

    return res.json({ message: "User deleted successfully." });
  } catch (err) {
    return serverError(res, err);
  }
});

module.exports = router;
