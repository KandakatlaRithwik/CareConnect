"use strict";
const Service    = require("../models/Service.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");

exports.createService = catchAsync(async (req, res) => {
  const service = await Service.create({ ...req.body, createdBy: req.user.id });
  return sendSuccess(res, 201, "Service created.", service);
});

exports.getServices = catchAsync(async (req, res) => {
  const { category } = req.query;
  const filter = { isActive: true };
  if (category) filter.category = category;
  const services = await Service.find(filter).sort({ category: 1 });
  return sendSuccess(res, 200, "Services fetched.", services);
});

exports.getService = catchAsync(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service || !service.isActive) return next(new AppError("Service not found.", 404));
  return sendSuccess(res, 200, "Service fetched.", service);
});

exports.updateService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!service) return next(new AppError("Service not found.", 404));
  return sendSuccess(res, 200, "Service updated.", service);
});

exports.deleteService = catchAsync(async (req, res, next) => {
  const service = await Service.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!service) return next(new AppError("Service not found.", 404));
  return sendSuccess(res, 200, "Service deleted.");
});
