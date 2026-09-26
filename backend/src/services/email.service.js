"use strict";
const nodemailer = require("nodemailer");
const logger     = require("../utils/logger");

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_PORT === "465",
  auth:   { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from:    `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to, subject, html, text,
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed to ${to}: ${err.message}`);
    throw err;
  }
};

const emailTemplates = {
  verifyEmail: (name, link) => ({
    subject: "Verify your email — Healthcare Platform",
    html: `<h2>Hello ${name},</h2><p>Please verify your email by clicking the link below:</p><a href="${link}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Verify Email</a><p>This link expires in 24 hours.</p>`,
  }),
  forgotPassword: (name, link) => ({
    subject: "Password Reset Request — Healthcare Platform",
    html: `<h2>Hello ${name},</h2><p>You requested a password reset. Click below to reset it:</p><a href="${link}" style="background:#dc2626;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none">Reset Password</a><p>This link expires in 30 minutes. If you did not request this, please ignore.</p>`,
  }),
  medicationReminder: (name, medicine, dosage, time) => ({
    subject: `💊 Medication Reminder: ${medicine}`,
    html: `<h2>Hello ${name},</h2><p>This is a reminder to take <strong>${medicine}</strong> — Dosage: <strong>${dosage}</strong></p><p>Scheduled time: <strong>${time}</strong></p><p>Please take your medication as prescribed.</p>`,
  }),
  bookingConfirmation: (name, bookingId, date) => ({
    subject: "Booking Confirmed — Healthcare Platform",
    html: `<h2>Hello ${name},</h2><p>Your booking <strong>#${bookingId}</strong> has been confirmed for <strong>${new Date(date).toDateString()}</strong>.</p>`,
  }),
  sosAlert: (patientName, emergencyType, location) => ({
    subject: "🚨 SOS EMERGENCY ALERT",
    html: `<h1 style="color:red">🚨 Emergency Alert</h1><p>Patient <strong>${patientName}</strong> has triggered an SOS alert.</p><p>Type: <strong>${emergencyType}</strong></p><p>Location: <strong>${location || "Unknown"}</strong></p><p>Please respond immediately.</p>`,
  }),
};

module.exports = { sendEmail, emailTemplates };
