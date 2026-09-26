"use strict";
const Patient    = require("../models/Patient.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

// POST /api/v1/patients
exports.createPatient = catchAsync(async (req, res) => {
  const patient = await Patient.create({ ...req.body, familyMemberId: req.user.id });
  return sendSuccess(res, 201, "Patient profile created.", patient);
});

// GET /api/v1/patients
exports.getPatients = catchAsync(async (req, res) => {
  // Caregiver: return patients from their accepted/in-progress bookings
  if (req.user.role === "Caregiver") {
    const Caregiver = require("../models/Caregiver.model");
    const Booking   = require("../models/Booking.model");
    const cg = await Caregiver.findOne({ userId: req.user.id });
    if (!cg) return sendSuccess(res, 200, "Patients fetched.", []);
    const bookings = await Booking.find({
      caregiverId: cg._id,
      status: { $in: ["Accepted", "InProgress"] }
    }).populate("patientId");
    // unique patients
    const seen = new Set();
    const patients = [];
    for (const b of bookings) {
      if (b.patientId && !seen.has(String(b.patientId._id))) {
        seen.add(String(b.patientId._id));
        patients.push({ ...b.patientId.toObject(), bookingId: b._id, bookingDate: b.bookingDate, startTime: b.startTime, endTime: b.endTime });
      }
    }
    return sendSuccess(res, 200, "Patients fetched.", patients);
  }
  // FamilyMember / Admin
  const filter = req.user.role === "Admin" ? {} : { familyMemberId: req.user.id };
  const patients = await Patient.find({ ...filter, isActive: true });
  return sendSuccess(res, 200, "Patients fetched.", patients);
});

// GET /api/v1/patients/:id
exports.getPatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient || !patient.isActive) return next(new AppError("Patient not found.", 404));
  if (req.user.role !== "Admin" && patient.familyMemberId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  return sendSuccess(res, 200, "Patient fetched.", patient);
});

// PUT /api/v1/patients/:id
exports.updatePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient || !patient.isActive) return next(new AppError("Patient not found.", 404));
  let isAuthorized = req.user.role === "Admin" || patient.familyMemberId.toString() === req.user.id;
  if (req.user.role === "Caregiver") {
    const Caregiver = require("../models/Caregiver.model");
    const Booking = require("../models/Booking.model");
    const caregiver = await Caregiver.findOne({ userId: req.user.id });
    isAuthorized = !!caregiver && await Booking.exists({
      patientId: patient._id,
      caregiverId: caregiver._id,
      status: { $in: ["Accepted", "InProgress"] },
    });
  }
  if (!isAuthorized) {
    return next(new AppError("Access denied.", 403));
  }
  const updated = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, 200, "Patient updated.", updated);
});

// DELETE /api/v1/patients/:id
exports.deletePatient = catchAsync(async (req, res, next) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient || !patient.isActive) return next(new AppError("Patient not found.", 404));
  if (req.user.role !== "Admin" && patient.familyMemberId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  await Patient.findByIdAndUpdate(req.params.id, { isActive: false });
  return sendSuccess(res, 200, "Patient deleted.");
});
