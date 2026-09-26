"use strict";
const Medication = require("../models/Medication.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

exports.addMedication = catchAsync(async (req, res, next) => {
  const Patient = require("../models/Patient.model");
  const patient = await Patient.findById(req.body.patientId);
  if (!patient) return next(new AppError("Patient not found", 404));
  
  const med = await Medication.create({ 
    ...req.body, 
    familyMemberId: patient.familyMemberId 
  });

  if (req.user.role === "Caregiver") {
    const { createNotification } = require("../services/notification.service");
    const { NOTIFICATION_TYPES, SOCKET_EVENTS } = require("../constants");
    const { getIO } = require("../sockets");
    
    await createNotification({
      recipientId: patient.familyMemberId,
      title: "💊 New Medication Added",
      message: `A new medication (${med.medicineName}) was added for ${patient.patientName}.`,
      type: NOTIFICATION_TYPES.MEDICATION_REMINDER,
      refId: med._id,
      refModel: "Medication"
    });
    
    try {
      getIO().to(patient.familyMemberId.toString()).emit(SOCKET_EVENTS.NOTIFICATION, {
        title: "💊 New Medication Added",
        message: `A new medication (${med.medicineName}) was added for ${patient.patientName}.`
      });
    } catch (e) {}
  }

  return sendSuccess(res, 201, "Medication reminder created.", med);
});

exports.getMedications = catchAsync(async (req, res) => {
  let filter = {};
  if (req.user.role === "Admin") {
    // all
  } else if (req.user.role === "Caregiver") {
    const Caregiver = require("../models/Caregiver.model");
    const Booking = require("../models/Booking.model");
    const cg = await Caregiver.findOne({ userId: req.user.id });
    if (!cg) return sendSuccess(res, 200, "Medications fetched.", []);
    const bookings = await Booking.find({ caregiverId: cg._id, status: { $in: ["Accepted", "InProgress"] } });
    const patientIds = bookings.map(b => b.patientId);
    filter = { patientId: { $in: patientIds } };
  } else {
    filter = { familyMemberId: req.user.id };
  }
  
  if (req.query.patientId) filter.patientId = req.query.patientId;
  const meds = await Medication.find(filter).populate("patientId", "patientName age");
  return sendSuccess(res, 200, "Medications fetched.", meds);
});

exports.updateMedication = catchAsync(async (req, res, next) => {
  const med = await Medication.findById(req.params.id);
  if (!med) return next(new AppError("Medication not found.", 404));
  
  if (req.user.role !== "Admin" && req.user.role !== "Caregiver" && med.familyMemberId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  
  const updated = await Medication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  return sendSuccess(res, 200, "Medication updated.", updated);
});

exports.deleteMedication = catchAsync(async (req, res, next) => {
  const med = await Medication.findById(req.params.id);
  if (!med) return next(new AppError("Medication not found.", 404));

  if (req.user.role !== "Admin" && req.user.role !== "Caregiver" && med.familyMemberId.toString() !== req.user.id) {
    return next(new AppError("Access denied.", 403));
  }
  
  await Medication.findByIdAndDelete(req.params.id);
  return sendSuccess(res, 200, "Medication deleted.");
});
