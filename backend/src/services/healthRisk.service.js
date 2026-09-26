"use strict";
const { HEALTH_RISK } = require("../constants");

/**
 * Calculate health risk based on patient vitals and history.
 * @param {object} params
 * @returns {{ riskLevel: string, score: number, factors: string[] }}
 */
const calculateHealthRisk = ({ age, systolicBP, diastolicBP, sugarLevel, chronicDiseases = [] }) => {
  let score = 0;
  const factors = [];

  // Age risk
  if (age >= 80)       { score += 30; factors.push("Age 80+: High risk group"); }
  else if (age >= 65)  { score += 15; factors.push("Age 65-79: Moderate risk group"); }

  // Blood pressure
  if (systolicBP >= 180 || diastolicBP >= 120) { score += 30; factors.push("Hypertensive crisis (Stage 3)"); }
  else if (systolicBP >= 140 || diastolicBP >= 90) { score += 15; factors.push("Hypertension Stage 2"); }
  else if (systolicBP >= 130 || diastolicBP >= 80) { score += 8;  factors.push("Hypertension Stage 1"); }

  // Sugar level (mg/dL)
  if (sugarLevel >= 300)      { score += 25; factors.push("Severely high blood sugar (>300)"); }
  else if (sugarLevel >= 200) { score += 15; factors.push("High blood sugar (200-299)"); }
  else if (sugarLevel >= 140) { score += 8;  factors.push("Elevated blood sugar (140-199)"); }

  // Chronic diseases
  const highRiskDiseases = ["diabetes", "heart disease", "stroke", "kidney failure", "cancer", "copd"];
  const matched = chronicDiseases.filter(d => highRiskDiseases.some(h => d.toLowerCase().includes(h)));
  score += matched.length * 10;
  if (matched.length) factors.push(`Chronic conditions: ${matched.join(", ")}`);

  let riskLevel;
  if (score >= 50)      riskLevel = HEALTH_RISK.HIGH;
  else if (score >= 25) riskLevel = HEALTH_RISK.MEDIUM;
  else                  riskLevel = HEALTH_RISK.LOW;

  return { riskLevel, score, factors };
};

module.exports = { calculateHealthRisk };
