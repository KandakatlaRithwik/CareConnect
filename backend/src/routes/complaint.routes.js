"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/complaint.controller");
const { protect } = require("../middleware/auth.middleware");
router.use(protect);
router.post("/",   ctrl.createComplaint);
router.get("/",    ctrl.getComplaints);
router.put("/:id", ctrl.updateComplaint);
module.exports = router;
