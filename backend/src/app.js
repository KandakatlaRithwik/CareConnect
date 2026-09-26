/**
 * @file app.js
 * @description Express application — middleware stack, routes, and global error handler
 */

"use strict";

const express      = require("express");
const cors         = require("cors");
const helmet       = require("helmet");
const morgan       = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean     = require("xss-clean");
const rateLimit    = require("express-rate-limit");

const { errorHandler, notFound } = require("./middleware/errorHandler");
const logger = require("./utils/logger");

// ── Route Imports ────────────────────────────────────────────────────────────
const authRoutes         = require("./routes/auth.routes");
const userRoutes         = require("./routes/user.routes");
const patientRoutes      = require("./routes/patient.routes");
const caregiverRoutes    = require("./routes/caregiver.routes");
const serviceRoutes      = require("./routes/service.routes");
const bookingRoutes      = require("./routes/booking.routes");
const careNoteRoutes     = require("./routes/careNote.routes");
const complaintRoutes    = require("./routes/complaint.routes");
const notificationRoutes = require("./routes/notification.routes");
const reviewRoutes       = require("./routes/review.routes");
const documentRoutes     = require("./routes/document.routes");
const sosRoutes          = require("./routes/sos.routes");
const medicationRoutes   = require("./routes/medication.routes");
const adminRoutes        = require("./routes/admin.routes");

const app = express();

// ── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet());

// Allow flexible CORS in development so Vite (default 5173) can talk to the API.
// In production, `CLIENT_URL` should be set to the deployed frontend origin.
const corsOptions = {
  origin: process.env.NODE_ENV === "development"
    ? true // reflect request origin for dev convenience
    : process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ── Rate Limiting ────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  skip: (req) => req.path.startsWith("/v1/auth"),
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: "Too many requests. Please try again later." },
});
app.use("/api", limiter);

// Stricter limiter for auth routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts. Please try again in 15 minutes." },
});

// ── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ── Data Sanitisation ────────────────────────────────────────────────────────
app.use(mongoSanitize()); // NoSQL injection protection
app.use(xssClean());      // XSS protection

// ── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan("combined", {
  stream: { write: (msg) => logger.http(msg.trim()) },
  skip: () => process.env.NODE_ENV === "test",
}));

// ── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Healthcare Platform API is running",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
const API = "/api/v1";

app.use(`${API}/auth`,          authLimiter, authRoutes);
app.use(`${API}/users`,         userRoutes);
app.use(`${API}/patients`,      patientRoutes);
app.use(`${API}/caregivers`,    caregiverRoutes);
app.use(`${API}/services`,      serviceRoutes);
app.use(`${API}/bookings`,      bookingRoutes);
app.use(`${API}/care-notes`,    careNoteRoutes);
app.use(`${API}/complaints`,    complaintRoutes);
app.use(`${API}/notifications`, notificationRoutes);
app.use(`${API}/reviews`,       reviewRoutes);
app.use(`${API}/documents`,     documentRoutes);
app.use(`${API}/sos`,           sosRoutes);
app.use(`${API}/medications`,   medicationRoutes);
app.use(`${API}/admin`,         adminRoutes);

// ── 404 & Global Error Handler ───────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
