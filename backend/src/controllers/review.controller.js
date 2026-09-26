"use strict";
const Review     = require("../models/Review.model");
const Booking    = require("../models/Booking.model");
const Caregiver  = require("../models/Caregiver.model");
const catchAsync = require("../utils/catchAsync");
const AppError   = require("../utils/AppError");
const { sendSuccess } = require("../utils/apiResponse");
const { BOOKING_STATUS } = require("../constants");

exports.createReview = catchAsync(async (req, res, next) => {
  const { bookingId, rating, review } = req.body;
  const booking = await Booking.findById(bookingId);
  if (!booking) return next(new AppError("Booking not found.", 404));
  if (booking.status !== BOOKING_STATUS.COMPLETED) return next(new AppError("Can only review completed bookings.", 400));
  if (booking.familyMemberId.toString() !== req.user.id) return next(new AppError("Access denied.", 403));

  const existing = await Review.findOne({ bookingId });
  if (existing) return next(new AppError("Review already submitted for this booking.", 409));

  const newReview = await Review.create({ bookingId, caregiverId: booking.caregiverId, userId: req.user.id, rating, review });

  // Recalculate caregiver rating
  const stats = await Review.aggregate([
    { $match: { caregiverId: booking.caregiverId } },
    { $group: { _id: "$caregiverId", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Caregiver.findByIdAndUpdate(booking.caregiverId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewsCount: stats[0].count,
    });
  }

  return sendSuccess(res, 201, "Review submitted.", newReview);
});

exports.getCaregiverReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ caregiverId: req.params.caregiverId })
    .populate("userId", "name profileImage")
    .sort({ createdAt: -1 });
  return sendSuccess(res, 200, "Reviews fetched.", reviews);
});
