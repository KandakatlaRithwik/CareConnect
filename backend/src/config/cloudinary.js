/**
 * @file config/cloudinary.js
 * @description Cloudinary configuration and multer-cloudinary storage setup
 */

"use strict";

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const createStorage = (folder, allowedFormats = ["jpg", "jpeg", "png", "pdf"]) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `healthcare/${folder}`,
      allowed_formats: allowedFormats,
      resource_type: "auto",
    },
  });

const profileImageUpload  = multer({ storage: createStorage("profiles",     ["jpg","jpeg","png"]), limits: { fileSize: 2 * 1024 * 1024 } });
const documentUpload      = multer({ storage: createStorage("documents",    ["jpg","jpeg","png","pdf"]), limits: { fileSize: 10 * 1024 * 1024 } });
const certificateUpload   = multer({ storage: createStorage("certificates", ["jpg","jpeg","png","pdf"]), limits: { fileSize: 5  * 1024 * 1024 } });

module.exports = { cloudinary, profileImageUpload, documentUpload, certificateUpload };
