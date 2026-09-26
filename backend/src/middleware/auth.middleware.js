"use strict";
const { verifyAccessToken } = require("../utils/generateToken");
const User     = require("../models/User.model");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

/** Protect route — verify JWT access token */
const protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("Access denied. No token provided.", 401));

  const decoded = verifyAccessToken(token);
  const user    = await User.findById(decoded.id).select("+refreshToken");
  if (!user)                       return next(new AppError("User no longer exists.", 401));
  if (user.status === "Suspended") return next(new AppError("Your account has been suspended.", 403));

  req.user = user;
  next();
});

/** Restrict access to specific roles */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }
  next();
};

module.exports = { protect, restrictTo };
