"use strict";
const SOS        = require("../models/SOS.model");
const Patient    = require("../models/Patient.model");
const Booking    = require("../models/Booking.model");
const User       = require("../models/User.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { sendEmail, emailTemplates } = require("../services/email.service");
const { createNotification } = require("../services/notification.service");
const { NOTIFICATION_TYPES, SOCKET_EVENTS } = require("../constants");
const { getIO } = require("../sockets");

exports.triggerSOS = catchAsync(async (req, res, next) => {
  const { patientId, location, emergencyType } = req.body;
  const patient = await Patient.findById(patientId).populate("familyMemberId");
  if (!patient) return next(new AppError("Patient not found.", 404));

  const sos = await SOS.create({ patientId, triggeredBy: req.user.id, location, emergencyType });

  // Fetch assigned caregiver from active booking
  const activeBooking = await Booking.findOne({ patientId, status: "InProgress" }).populate({
    path: "caregiverId", populate: { path: "userId", select: "name email" },
  });

  // Fetch all admins
  const admins = await User.find({ role: "Admin" }, "email name");

  const alertPromises = [];

  // Alert family
  if (patient.familyMemberId?.email) {
    const { subject, html } = emailTemplates.sosAlert(patient.patientName, emergencyType, location?.address);
    alertPromises.push(sendEmail({ to: patient.familyMemberId.email, subject, html }));
    alertPromises.push(createNotification({ recipientId: patient.familyMemberId._id, title: "🚨 SOS Alert", message: `Emergency triggered for ${patient.patientName}: ${emergencyType}`, type: NOTIFICATION_TYPES.SOS_ALERT, refId: sos._id, refModel: "SOS" }));
    sos.alertsSent.family = true;
  }

  // Alert caregiver
  if (activeBooking?.caregiverId?.userId) {
    const cgUser = activeBooking.caregiverId.userId;
    const { subject, html } = emailTemplates.sosAlert(patient.patientName, emergencyType, location?.address);
    alertPromises.push(sendEmail({ to: cgUser.email, subject, html }));
    alertPromises.push(createNotification({ recipientId: cgUser._id, title: "🚨 SOS Alert", message: `Your patient ${patient.patientName} needs emergency help!`, type: NOTIFICATION_TYPES.SOS_ALERT, refId: sos._id, refModel: "SOS" }));
    sos.alertsSent.caregiver = true;
  }

  // Alert admins
  admins.forEach(admin => {
    const { subject, html } = emailTemplates.sosAlert(patient.patientName, emergencyType, location?.address);
    alertPromises.push(sendEmail({ to: admin.email, subject, html }));
    alertPromises.push(createNotification({ recipientId: admin._id, title: "🚨 SOS Alert", message: `Emergency: ${patient.patientName} — ${emergencyType}`, type: NOTIFICATION_TYPES.SOS_ALERT, refId: sos._id, refModel: "SOS" }));
  });
  sos.alertsSent.admin = admins.length > 0;

  await Promise.allSettled(alertPromises);
  await sos.save();

  // Real-time broadcast
  try { getIO().to("admin").emit(SOCKET_EVENTS.SOS_ALERT, { sos, patient: patient.patientName }); } catch (_) {}

  return sendSuccess(res, 201, "SOS alert triggered. Emergency contacts notified.", sos);
});

exports.getSOSAlerts = catchAsync(async (req, res) => {
  let filter = {};
  if (req.user.role === "FamilyMember") {
    const patientIds = await Patient.find({ familyMemberId: req.user.id, isActive: true }).distinct("_id");
    filter = { patientId: { $in: patientIds } };
  } else if (req.user.role === "Caregiver") {
    filter = { triggeredBy: req.user.id };
  }
  const alerts = await SOS.find(filter)
    .populate("patientId", "patientName age")
    .populate("triggeredBy", "name role")
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, "SOS alerts fetched.", alerts);
});

exports.resolveSOSAlert = catchAsync(async (req, res, next) => {
  const sos = await SOS.findByIdAndUpdate(req.params.id, { status: "Resolved", resolvedAt: new Date(), notes: req.body.notes }, { new: true });
  if (!sos) return next(new AppError("SOS alert not found.", 404));
  return sendSuccess(res, 200, "SOS alert resolved.", sos);
});
