"use strict";
const Patient  = require("../models/Patient.model");
const Caregiver = require("../models/Caregiver.model");
const { VERIFICATION_STATUS } = require("../constants");

/**
 * AI-style Caregiver Recommendation Engine
 * Scores caregivers based on multiple weighted factors.
 */
const recommendCaregiver = async (patientId, caregiverType = null, limit = 5) => {
  const patient = await Patient.findById(patientId);
  if (!patient) throw new Error("Patient not found");

  const query = { verificationStatus: VERIFICATION_STATUS.VERIFIED, isAvailable: true };
  if (caregiverType) query.caregiverType = caregiverType;

  const caregivers = await Caregiver.find(query)
    .populate("userId", "name city state")
    .lean();

  const scored = caregivers.map(cg => {
    let score = 0;

    // Rating (max 40 points)
    score += (cg.rating / 5) * 40;

    // Experience (max 20 points)
    score += Math.min(cg.experienceYears / 10, 1) * 20;

    // Reviews count — social proof (max 15 points)
    score += Math.min(cg.reviewsCount / 50, 1) * 15;

    // Location match (max 15 points)
    if (patient.emergencyContact && cg.serviceAreas?.includes(patient.careRequirements?.[0])) {
      score += 15;
    }

    // Rate affordability — lower rate gets small bonus (max 10 points)
    if (cg.hourlyRate <= 500) score += 10;
    else if (cg.hourlyRate <= 1000) score += 5;

    return { ...cg, recommendationScore: Math.round(score * 10) / 10 };
  });

  return scored
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, limit);
};

module.exports = { recommendCaregiver };
