"use strict";
const cron       = require("node-cron");
const Medication = require("../models/Medication.model");
const Patient    = require("../models/Patient.model");
const User       = require("../models/User.model");
const { sendEmail, emailTemplates } = require("../services/email.service");
const logger     = require("../utils/logger");

const sendReminders = async () => {
  const now     = new Date();
  const hours   = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const currentTime = `${hours}:${minutes}`;

  try {
    const meds = await Medication.find({ isActive: true, reminderTime: currentTime })
      .populate({ path: "patientId", model: Patient })
      .populate({ path: "familyMemberId", model: User, select: "name email" });

    const promises = meds.map(async (med) => {
      if (!med.familyMemberId?.email) return;
      const { subject, html } = emailTemplates.medicationReminder(
        med.familyMemberId.name,
        med.medicineName,
        med.dosage,
        currentTime
      );
      await sendEmail({ to: med.familyMemberId.email, subject, html });
      logger.info(`Medication reminder sent for patient ${med.patientId?.patientName} — ${med.medicineName}`);
    });

    await Promise.allSettled(promises);
  } catch (err) {
    logger.error(`Medication reminder job failed: ${err.message}`);
  }
};

const startMedicationReminderJob = () => {
  // Run every minute to check reminder times
  cron.schedule("* * * * *", sendReminders, { timezone: "Asia/Kolkata" });
  logger.info("Medication reminder cron job started");
};

module.exports = { startMedicationReminderJob };
