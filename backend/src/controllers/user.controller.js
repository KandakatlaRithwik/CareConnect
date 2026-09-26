"use strict";
const User       = require("../models/User.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { cloudinary } = require("../config/cloudinary");

// GET /api/v1/users/profile
exports.getProfile = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  return sendSuccess(res, 200, "Profile fetched.", user.toSafeObject());
});

// PUT /api/v1/users/profile
exports.updateProfile = catchAsync(async (req, res) => {
  const allowed = ["name", "phone", "city", "state", "address"];
  const updates = {};
  allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

  // Handle profile image upload
  if (req.file?.path) {
    // Delete old image from Cloudinary if it exists
    const user = await User.findById(req.user.id);
    if (user.profileImage) {
      const publicId = user.profileImage.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`healthcare/profiles/${publicId}`).catch(() => {});
    }
    updates.profileImage = req.file.path;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
  return sendSuccess(res, 200, "Profile updated.", user.toSafeObject());
});

// DELETE /api/v1/users/profile
exports.deleteProfile = catchAsync(async (req, res, next) => {
  if (req.user.role === "Admin") return next(new AppError("Admin account cannot be deleted this way.", 400));
  await User.findByIdAndUpdate(req.user.id, { status: "Inactive" });
  return sendSuccess(res, 200, "Account deactivated successfully.");
});
