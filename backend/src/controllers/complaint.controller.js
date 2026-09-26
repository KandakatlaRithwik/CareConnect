"use strict";
const Complaint  = require("../models/Complaint.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { SOCKET_EVENTS } = require("../constants");
const { notifyComplaintUpdated } = require("../services/notification.service");
const { getIO } = require("../sockets");

exports.createComplaint = catchAsync(async (req, res) => {
  const complaint = await Complaint.create({ ...req.body, userId: req.user.id });
  return sendSuccess(res, 201, "Complaint submitted.", complaint);
});

exports.getComplaints = catchAsync(async (req, res) => {
  const { status, priority, page = 1, limit = 10 } = req.query;
  const filter = req.user.role === "Admin" ? {} : { userId: req.user.id };
  if (status)   filter.status   = status;
  if (priority) filter.priority = priority;

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Complaint.countDocuments(filter);
  const complaints = await Complaint.find(filter)
    .populate("userId", "name email")
    .populate("bookingId")
    .sort({ priority: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return sendSuccess(res, 200, "Complaints fetched.", complaints, { total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

exports.updateComplaint = catchAsync(async (req, res, next) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return next(new AppError("Complaint not found.", 404));

  const updates = {};
  if (req.user.role === "Admin") {
    if (req.body.status)        updates.status        = req.body.status;
    if (req.body.adminResponse) updates.adminResponse = req.body.adminResponse;
    if (req.body.status === "Resolved") updates.resolvedAt = new Date();
  } else {
    if (complaint.userId.toString() !== req.user.id) return next(new AppError("Access denied.", 403));
    if (complaint.status !== "Open") return next(new AppError("Cannot edit a complaint that is already in review or resolved.", 400));
    if (req.body.title)       updates.title       = req.body.title;
    if (req.body.description) updates.description = req.body.description;
  }

  const updated = await Complaint.findByIdAndUpdate(req.params.id, updates, { new: true });
  await notifyComplaintUpdated(complaint.userId, complaint._id);
  try { getIO().to(`user:${complaint.userId}`).emit(SOCKET_EVENTS.COMPLAINT_UPDATED, updated); } catch (_) {}

  return sendSuccess(res, 200, "Complaint updated.", updated);
});
