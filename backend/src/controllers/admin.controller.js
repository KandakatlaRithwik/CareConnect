"use strict";
const User       = require("../models/User.model");
const Patient    = require("../models/Patient.model");
const Caregiver  = require("../models/Caregiver.model");
const Booking    = require("../models/Booking.model");
const Complaint  = require("../models/Complaint.model");
const Review     = require("../models/Review.model");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const { calculateHealthRisk } = require("../services/healthRisk.service");

// GET /api/v1/admin/dashboard
exports.getDashboard = catchAsync(async (req, res) => {
  const [
    totalUsers, totalPatients, totalCaregivers, verifiedCaregivers,
    totalBookings, activeBookings, completedBookings,
    openComplaints, resolvedComplaints, avgRatingResult, monthlyRevenue,
  ] = await Promise.all([
    User.countDocuments(),
    Patient.countDocuments({ isActive: true }),
    Caregiver.countDocuments(),
    Caregiver.countDocuments({ verificationStatus: "Verified" }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: "InProgress" }),
    Booking.countDocuments({ status: "Completed" }),
    Complaint.countDocuments({ status: { $in: ["Open", "InReview"] } }),
    Complaint.countDocuments({ status: "Resolved" }),
    Review.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
    Booking.aggregate([
      { $match: { status: "Completed", createdAt: { $gte: new Date(new Date().setDate(1)) } } },
      { $lookup: { from: "services", localField: "serviceId", foreignField: "_id", as: "service" } },
      { $unwind: "$service" },
      { $group: { _id: null, revenue: { $sum: "$service.price" } } },
    ]),
  ]);

  const totalComplaints = openComplaints + resolvedComplaints;
  const complaintResolutionRate = totalComplaints
    ? Math.round((resolvedComplaints / totalComplaints) * 100)
    : 0;

  return sendSuccess(res, 200, "Dashboard data fetched.", {
    users:       { total: totalUsers },
    patients:    { total: totalPatients },
    caregivers:  { total: totalCaregivers, verified: verifiedCaregivers },
    bookings:    { total: totalBookings, active: activeBookings, completed: completedBookings },
    complaints:  { open: openComplaints, resolved: resolvedComplaints, resolutionRate: `${complaintResolutionRate}%` },
    averageRating: avgRatingResult[0] ? Math.round(avgRatingResult[0].avg * 10) / 10 : 0,
    monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
  });
});

// GET /api/v1/admin/reports
exports.getReports = catchAsync(async (req, res) => {
  const { from, to } = req.query;
  const dateFilter = {};
  if (from) dateFilter.$gte = new Date(from);
  if (to)   dateFilter.$lte = new Date(to);

  const bookingFilter = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [bookingsByStatus, bookingsByType, topCaregivers, recentComplaints] = await Promise.all([
    Booking.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Booking.aggregate([{ $group: { _id: "$bookingType", count: { $sum: 1 } } }]),
    Caregiver.find({ verificationStatus: "Verified" })
      .sort({ rating: -1 })
      .limit(10)
      .populate("userId", "name city"),
    Complaint.find({ ...bookingFilter }).sort({ priority: -1, createdAt: -1 }).limit(20)
      .populate("userId", "name email"),
  ]);

  return sendSuccess(res, 200, "Reports fetched.", { bookingsByStatus, bookingsByType, topCaregivers, recentComplaints });
});

// GET /api/v1/admin/health-risk
exports.assessHealthRisk = catchAsync(async (req, res) => {
  const { age, systolicBP, diastolicBP, sugarLevel, chronicDiseases } = req.query;
  const result = calculateHealthRisk({
    age:           parseInt(age),
    systolicBP:    parseFloat(systolicBP),
    diastolicBP:   parseFloat(diastolicBP),
    sugarLevel:    parseFloat(sugarLevel),
    chronicDiseases: chronicDiseases ? chronicDiseases.split(",") : [],
  });
  return sendSuccess(res, 200, "Health risk assessed.", result);
});

// PATCH /api/v1/admin/users/:id/status
exports.updateUserStatus = catchAsync(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  return sendSuccess(res, 200, "User status updated.", user?.toSafeObject());
});

// PATCH /api/v1/admin/caregivers/:id/verify
exports.verifyCaregiver = catchAsync(async (req, res) => {
  const cg = await Caregiver.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: req.body.verificationStatus },
    { new: true }
  ).populate("userId", "name email");
  return sendSuccess(res, 200, "Caregiver verification updated.", cg);
});
