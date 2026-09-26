"use strict";
const router = require("express").Router();
const ctrl   = require("../controllers/sos.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
router.use(protect);
router.post("/",               ctrl.triggerSOS);
router.get("/",                ctrl.getSOSAlerts);
router.patch("/:id/resolve",   restrictTo("Admin"), ctrl.resolveSOSAlert);
module.exports = router;
