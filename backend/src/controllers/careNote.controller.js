"use strict";
const CareNote   = require("../models/CareNote.model");
const Booking    = require("../models/Booking.model");
const Caregiver  = require("../models/Caregiver.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

exports.createCareNote = catchAsync(async (req, res, next) => {
  const booking = await Booking.findById(req.body.bookingId);
  if (!booking) return next(new AppError("Booking not found.", 404));

  const caregiver = await Caregiver.findOne({ userId: req.user.id });
  if (!caregiver || booking.caregiverId.toString() !== caregiver._id.toString()) {
    return next(new AppError("You are not assigned to this booking.", 403));
  }

  const careNote = await CareNote.create({ ...req.body, caregiverId: caregiver._id, patientId: booking.patientId });
  return sendSuccess(res, 201, "Care note created.", careNote);
});

exports.getCareNotes = catchAsync(async (req, res) => {
  const { patientId, bookingId } = req.query;
  const filter = {};
  if (patientId) filter.patientId = patientId;
  if (bookingId) filter.bookingId = bookingId;
  const notes = await CareNote.find(filter)
    .populate({ path: "caregiverId", populate: { path: "userId", select: "name" } })
    .populate("patientId", "patientName age")
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, "Care notes fetched.", notes);
});

exports.getCareNote = catchAsync(async (req, res, next) => {
  const note = await CareNote.findById(req.params.id).populate("caregiverId").populate("patientId");
  if (!note) return next(new AppError("Care note not found.", 404));
  return sendSuccess(res, 200, "Care note fetched.", note);
});

exports.updateCareNote = catchAsync(async (req, res, next) => {
  const note = await CareNote.findById(req.params.id);
  if (!note) return next(new AppError("Care note not found.", 404));
  const caregiver = await Caregiver.findOne({ userId: req.user.id });
  if (!caregiver || note.caregiverId.toString() !== caregiver._id.toString()) {
    return next(new AppError("Access denied.", 403));
  }
  const updated = await CareNote.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, 200, "Care note updated.", updated);
});
