/**
 * @file models/User.model.js
 * @description User schema — supports Admin, FamilyMember, Caregiver roles
 */
"use strict";
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const { ROLES, USER_STATUS } = require("../constants");

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true, maxlength: 100 },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:     { type: String, required: true, select: false },
  phone:        { type: String, trim: true },
  role:         { type: String, enum: Object.values(ROLES), required: true },
  profileImage: { type: String, default: null },
  city:         { type: String, trim: true },
  state:        { type: String, trim: true },
  address:      { type: String, trim: true },
  isVerified:   { type: Boolean, default: false },
  status:       { type: String, enum: Object.values(USER_STATUS), default: USER_STATUS.ACTIVE },
  // Email verification
  emailVerificationToken:   { type: String, select: false },
  emailVerificationExpires: { type: Date,   select: false },
  // Password reset
  passwordResetToken:   { type: String, select: false },
  passwordResetExpires: { type: Date,   select: false },
  // Refresh token
  refreshToken: { type: String, select: false },
  // Tracking
  lastLogin:    { type: Date },
}, { timestamps: true });

// ── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ role: 1, status: 1 });

// ── Pre-save: hash password ──────────────────────────────────────────────────
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.emailVerificationToken   = crypto.createHash("sha256").update(token).digest("hex");
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token;
};

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken   = crypto.createHash("sha256").update(token).digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  return token;
};

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password; delete obj.refreshToken;
  delete obj.emailVerificationToken; delete obj.passwordResetToken;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
