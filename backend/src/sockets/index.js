"use strict";
const { Server } = require("socket.io");
const { verifyAccessToken } = require("../utils/generateToken");
const logger = require("../utils/logger");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: process.env.CLIENT_URL || "http://localhost:3000", methods: ["GET","POST"] },
    pingTimeout: 60000,
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token"));
    try {
      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.role   = decoded.role;
      next();
    } catch {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`Socket connected: ${socket.id} | User: ${socket.userId}`);
    socket.join(`user:${socket.userId}`);
    if (socket.role === "Admin") socket.join("admin");
    socket.on("join-booking",   (id) => socket.join(`booking:${id}`));
    socket.on("leave-booking",  (id) => socket.leave(`booking:${id}`));
    socket.on("caregiver-arrived", (bookingId) => {
      io.to(`booking:${bookingId}`).emit("caregiver-arrived", { bookingId, timestamp: new Date() });
    });
    socket.on("disconnect", () => logger.info(`Socket disconnected: ${socket.id}`));
  });

  logger.info("Socket.IO initialised");
  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.IO not initialised");
  return io;
};

module.exports = { initSocket, getIO };
