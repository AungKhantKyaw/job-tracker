const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  sendEmail,
  verifyEmailTemplate,
  resetPasswordTemplate,
} = require("../utils/sendEmail");

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// ── Helper ────────────────────────────────────────────────────────────────────

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

// ── POST /api/auth/send-verification ─────────────────────────────────────────
// Resend verification email (called after register or manually)
router.post("/send-verification", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always return 200 — don't reveal if email exists
    if (!user || user.isVerified) {
      return res.json({
        message:
          "If that email exists and is unverified, a link has been sent.",
      });
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.emailVerifyToken = hashToken(rawToken);
    user.emailVerifyExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    const verifyUrl = `${CLIENT_URL}/verify-email?token=${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Verify your OfferFlow email",
      html: verifyEmailTemplate(user.name, verifyUrl),
    });

    res.json({
      message: "If that email exists and is unverified, a link has been sent.",
    });
  } catch (err) {
    console.error("send-verification error:", err);
    res.status(500).json({ message: "Failed to send verification email." });
  }
});

// ── GET /api/auth/verify-email?token=xxx ─────────────────────────────────────
router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ message: "Token is required." });

    const hashed = hashToken(token);
    const user = await User.findOne({
      emailVerifyToken: hashed,
      emailVerifyExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification link." });
    }

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (err) {
    console.error("verify-email error:", err);
    res.status(500).json({ message: "Verification failed." });
  }
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always 200 — don't reveal if email exists
    if (!user) {
      return res.json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(rawToken);
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const resetUrl = `${CLIENT_URL}/reset-password/${rawToken}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your OfferFlow password",
      html: resetPasswordTemplate(user.name, resetUrl),
    });

    res.json({
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (err) {
    console.error("forgot-password error:", err);
    res.status(500).json({ message: "Failed to send reset email." });
  }
});

// ── POST /api/auth/reset-password/:token ─────────────────────────────────────
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters." });
    }

    const hashed = hashToken(token);
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset link." });
    }

    user.password = await bcrypt.hash(password, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("reset-password error:", err);
    res.status(500).json({ message: "Password reset failed." });
  }
});

module.exports = router;
