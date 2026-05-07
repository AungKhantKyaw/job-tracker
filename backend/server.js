const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
require("dotenv").config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/api/test-email", async (req, res) => {
  const { sendEmail } = require("./utils/sendEmail");
  try {
    await sendEmail({
      to: "your@gmail.com",
      subject: "Test",
      html: "<p>Test email from JobTracker</p>",
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

app.get("/", (req, res) => {
  res.send("Server is up and running!");
});

app.set("trust proxy", 1);

// Routes
const jobRoutes = require("./routes/job");
app.use("/api/job", jobRoutes);

const statusRoutes = require("./routes/status");
app.use("/api/status", statusRoutes);

const userRoutes = require("./routes/user");
app.use("/api/user", userRoutes);

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err));
