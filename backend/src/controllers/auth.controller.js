"use strict";
const crypto   = require("crypto");
const User     = require("../models/User.model");
const Patient  = require("../models/Patient.model");
const Caregiver= require("../models/Caregiver.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/generateToken");
const { sendEmail, emailTemplates } = require("../services/email.service");

const issueTokens = (user) => {
  const payload = { id: user._id, role: user.role };
  return {
    accessToken:  generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

// POST /api/v1/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const {
    name, email, password, phone, role, city, state, address,
    // Caregiver-specific fields passed from frontend
    caregiverType, experienceYears, hourlyRate, languages,
    profileDescription, qualifications, serviceAreas
  } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return next(new AppError("Email already registered.", 409));

  const user = await User.create({ name, email, password, phone, role, city, state, address });

  // Auto-create a Patient profile if FamilyMember
  if (role === "FamilyMember") {
    await Patient.create({
      familyMemberId: user._id,
      patientName: user.name,
      age: 65,
      gender: "Other",
      address: { line1: user.address || user.city || "Not provided", city: user.city || "Not provided", state: user.state || "Not provided", pinCode: "000000" },
      emergencyContact: { name: user.name, phone: user.phone || "0000000000", relationship: "Self" }
    });
  }

  // Auto-create a Caregiver profile if Caregiver — use fields from request if provided
  if (role === "Caregiver") {
    await Caregiver.create({
      userId:            user._id,
      caregiverType:     caregiverType     || "Nurse",
      experienceYears:   parseInt(experienceYears) || 1,
      languages:         Array.isArray(languages) ? languages : (languages ? [languages] : ["English"]),
      serviceAreas:      Array.isArray(serviceAreas) ? serviceAreas : (serviceAreas ? [serviceAreas] : [user.city || "Not provided"]),
      hourlyRate:        parseInt(hourlyRate) || 300,
      qualifications:    Array.isArray(qualifications) ? qualifications : (qualifications ? [qualifications] : []),
      rating:            5,
      verificationStatus: "Verified",
      isAvailable:       true,
      profileDescription: profileDescription || "New Caregiver ready to assist.",
    });
  }

  // Send email verification
  const rawToken = user.generateEmailVerificationToken();
  await user.save({ validateBeforeSave: false });
  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;
  const { subject, html } = emailTemplates.verifyEmail(user.name, verifyLink);
  await sendEmail({ to: user.email, subject, html }).catch(() => {});

  const { accessToken, refreshToken } = issueTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, 201, "Registration successful. Please verify your email.", {
    user: user.toSafeObject(), accessToken, refreshToken,
  });
});

// POST /api/v1/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password.", 401));
  }
  if (user.status === "Suspended") return next(new AppError("Your account has been suspended.", 403));

  user.lastLogin = new Date();
  const { accessToken, refreshToken } = issueTokens(user);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, 200, "Login successful.", { user: user.toSafeObject(), accessToken, refreshToken });
});

// POST /api/v1/auth/logout
exports.logout = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { refreshToken: null });
  return sendSuccess(res, 200, "Logged out successfully.");
});

// POST /api/v1/auth/refresh-token
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return next(new AppError("Refresh token required.", 400));

  const decoded = verifyRefreshToken(refreshToken);
  const user    = await User.findById(decoded.id).select("+refreshToken");
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError("Invalid or expired refresh token.", 401));
  }

  const tokens = issueTokens(user);
  user.refreshToken = tokens.refreshToken;
  await user.save({ validateBeforeSave: false });

  return sendSuccess(res, 200, "Token refreshed.", tokens);
});

// POST /api/v1/auth/forgot-password
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No account with that email.", 404));

  const rawToken = user.generatePasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
  const { subject, html } = emailTemplates.forgotPassword(user.name, resetLink);
  await sendEmail({ to: user.email, subject, html });

  return sendSuccess(res, 200, "Password reset email sent.");
});

// POST /api/v1/auth/reset-password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto.createHash("sha256").update(req.body.token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is invalid or has expired.", 400));

  user.password = req.body.password;
  user.passwordResetToken   = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return sendSuccess(res, 200, "Password reset successful. Please login.");
});

// PATCH /api/v1/auth/change-password
exports.changePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!(await user.comparePassword(req.body.currentPassword))) {
    return next(new AppError("Current password is incorrect.", 401));
  }
  user.password = req.body.newPassword;
  await user.save();
  return sendSuccess(res, 200, "Password changed successfully.");
});
