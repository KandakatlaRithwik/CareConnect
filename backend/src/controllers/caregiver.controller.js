"use strict";
const Caregiver  = require("../models/Caregiver.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { recommendCaregiver } = require("../services/caregiverRecommendation.service");

// POST /api/v1/caregivers
exports.createCaregiverProfile = catchAsync(async (req, res, next) => {
  const existing = await Caregiver.findOne({ userId: req.user.id });
  if (existing) return next(new AppError("Caregiver profile already exists.", 409));
  const caregiver = await Caregiver.create({ ...req.body, userId: req.user.id });
  return sendSuccess(res, 201, "Caregiver profile created.", caregiver);
});

// GET /api/v1/caregivers
exports.getCaregivers = catchAsync(async (req, res) => {
  const { city, rating, caregiverType, availability, minRate, maxRate, page = 1, limit = 10 } = req.query;

  const filter = { verificationStatus: "Verified" };
  if (caregiverType) filter.caregiverType = caregiverType;
  if (availability === "true") filter.isAvailable = true;
  if (rating)   filter.rating    = { $gte: parseFloat(rating) };
  if (minRate || maxRate) {
    filter.hourlyRate = {};
    if (minRate) filter.hourlyRate.$gte = parseFloat(minRate);
    if (maxRate) filter.hourlyRate.$lte = parseFloat(maxRate);
  }
  if (city) filter.serviceAreas = { $in: [city] };

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Caregiver.countDocuments(filter);
  const caregivers = await Caregiver.find(filter)
    .populate("userId", "name email phone city state profileImage")
    .sort({ rating: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  return sendSuccess(res, 200, "Caregivers fetched.", caregivers, {
    total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)),
  });
});

// GET /api/v1/caregivers/:id
exports.getCaregiver = catchAsync(async (req, res, next) => {
  const caregiver = await Caregiver.findById(req.params.id).populate("userId", "name email phone city state profileImage");
  if (!caregiver) return next(new AppError("Caregiver not found.", 404));
  return sendSuccess(res, 200, "Caregiver fetched.", caregiver);
});

// PUT /api/v1/caregivers/:id
exports.updateCaregiver = catchAsync(async (req, res, next) => {
  const caregiver = await Caregiver.findById(req.params.id);
  if (!caregiver) return next(new AppError("Caregiver not found.", 404));
  if (req.user.role !== "Admin" && caregiver.userId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  // Admin-only fields
  const protectedFields = ["verificationStatus", "rating", "reviewsCount", "totalEarnings"];
  if (req.user.role !== "Admin") protectedFields.forEach(f => delete req.body[f]);

  const updated = await Caregiver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, 200, "Caregiver updated.", updated);
});

// DELETE /api/v1/caregivers/:id
exports.deleteCaregiver = catchAsync(async (req, res, next) => {
  const caregiver = await Caregiver.findById(req.params.id);
  if (!caregiver) return next(new AppError("Caregiver not found.", 404));
  if (req.user.role !== "Admin" && caregiver.userId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  await Caregiver.findByIdAndDelete(req.params.id);
  return sendSuccess(res, 200, "Caregiver profile deleted.");
});

// GET /api/v1/caregivers/recommend/:patientId
exports.getRecommendations = catchAsync(async (req, res) => {
  const { patientId } = req.params;
  const { caregiverType, limit } = req.query;
  const recommendations = await recommendCaregiver(patientId, caregiverType, parseInt(limit) || 5);
  return sendSuccess(res, 200, "Recommendations fetched.", recommendations);
});
