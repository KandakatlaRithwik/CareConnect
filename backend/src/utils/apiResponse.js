"use strict";
const sendSuccess = (res, code = 200, message = "Success", data = null, meta = null) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return res.status(code).json(response);
};
const sendError = (res, code = 500, message = "Internal Server Error", errors = null) => {
  const response = { success: false, message };
  if (errors !== null) response.errors = errors;
  return res.status(code).json(response);
};
module.exports = { sendSuccess, sendError };
