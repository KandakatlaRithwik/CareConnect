"use strict";
const Document   = require("../models/Document.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { cloudinary } = require("../config/cloudinary");
const { sendSuccess } = require("../utils/apiResponse");

exports.uploadDocument = catchAsync(async (req, res, next) => {
  if (!req.file) return next(new AppError("No file uploaded.", 400));
  const doc = await Document.create({
    ownerId:      req.user.id,
    patientId:    req.body.patientId || null,
    documentType: req.body.documentType,
    title:        req.body.title,
    fileUrl:      req.file.path,
    publicId:     req.file.filename,
    fileSize:     req.file.size,
    mimeType:     req.file.mimetype,
  });
  return sendSuccess(res, 201, "Document uploaded.", doc);
});

exports.getDocuments = catchAsync(async (req, res) => {
  const filter = { ownerId: req.user.id };
  if (req.query.patientId)    filter.patientId    = req.query.patientId;
  if (req.query.documentType) filter.documentType = req.query.documentType;
  const docs = await Document.find(filter).sort({ createdAt: -1 });
  return sendSuccess(res, 200, "Documents fetched.", docs);
});

exports.deleteDocument = catchAsync(async (req, res, next) => {
  const doc = await Document.findOne({ _id: req.params.id, ownerId: req.user.id });
  if (!doc) return next(new AppError("Document not found.", 404));
  await cloudinary.uploader.destroy(doc.publicId, { resource_type: "auto" }).catch(() => {});
  await Document.findByIdAndDelete(req.params.id);
  return sendSuccess(res, 200, "Document deleted.");
});
