require("dotenv").config(); 
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_PORT === "465",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.html
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || "OfferGrid"}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

// ── Email templates ───────────────────────────────────────────────────────────

const verifyEmailTemplate = (name, verifyUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#2563eb;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">OfferGrid</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#0f172a;font-size:22px;margin:0 0 8px;">Verify your email</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${name}, thanks for signing up! Click the button below to verify your email address.</p>
      <a href="${verifyUrl}" style="display:inline-block;padding:12px 28px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Verify Email Address
      </a>
      <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
        This link expires in <strong>24 hours</strong>. If you didn't create an account, you can safely ignore this email.
      </p>
      <p style="color:#cbd5e1;font-size:12px;margin:16px 0 0;word-break:break-all;">
        Or copy this link: ${verifyUrl}
      </p>
    </div>
  </div>
</body>
</html>`;

const resetPasswordTemplate = (name, resetUrl) => `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',sans-serif;">
  <div style="max-width:520px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:#0f172a;padding:28px 32px;">
      <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">OfferGrid</h1>
    </div>
    <div style="padding:32px;">
      <h2 style="color:#0f172a;font-size:22px;margin:0 0 8px;">Reset your password</h2>
      <p style="color:#64748b;margin:0 0 24px;">Hi ${name}, we received a request to reset your password. Click the button below to choose a new one.</p>
      <a href="${resetUrl}" style="display:inline-block;padding:12px 28px;background:#0f172a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
        Reset Password
      </a>
      <p style="color:#94a3b8;font-size:13px;margin:24px 0 0;">
        This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email.
      </p>
      <p style="color:#cbd5e1;font-size:12px;margin:16px 0 0;word-break:break-all;">
        Or copy this link: ${resetUrl}
      </p>
    </div>
  </div>
</body>
</html>`;

module.exports = { sendEmail, verifyEmailTemplate, resetPasswordTemplate };
