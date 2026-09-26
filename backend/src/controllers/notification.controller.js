"use strict";
const Notification = require("../models/Notification.model");
const catchAsync   = require("../utils/catchAsync");
const { sendSuccess } = require("../utils/apiResponse");

exports.getNotifications = catchAsync(async (req, res) => {
  const { isRead, page = 1, limit = 20 } = req.query;
  const filter = { recipientId: req.user.id };
  if (isRead !== undefined) filter.isRead = isRead === "true";
  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
  const unreadCount   = await Notification.countDocuments({ recipientId: req.user.id, isRead: false });
  return sendSuccess(res, 200, "Notifications fetched.", notifications, { total, unreadCount, page: parseInt(page) });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const { ids } = req.body; // array of notification IDs
  if (ids?.length) {
    await Notification.updateMany({ _id: { $in: ids }, recipientId: req.user.id }, { isRead: true });
  } else {
    await Notification.updateMany({ recipientId: req.user.id, isRead: false }, { isRead: true });
  }
  return sendSuccess(res, 200, "Notifications marked as read.");
});

exports.deleteNotification = catchAsync(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, recipientId: req.user.id });
  return sendSuccess(res, 200, "Notification deleted.");
});
