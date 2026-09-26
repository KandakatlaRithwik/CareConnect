"use strict";

require("dotenv").config({ path: "../../.env" }); // Try relative to utils
// Also try relative to project root if run from backend folder
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("../models/User.model");
const Caregiver = require("../models/Caregiver.model");
const Patient = require("../models/Patient.model");
const Service = require("../models/Service.model");
const Booking = require("../models/Booking.model");

const seedDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/elderly-care";
    await mongoose.connect(uri, { autoIndex: false });
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Caregiver.deleteMany({}),
      Patient.deleteMany({}),
      Service.deleteMany({}),
      Booking.deleteMany({}),
    ]);
    console.log("Cleared existing data.");

    // Seed Services
    const service1 = await Service.create({
      serviceName: "Elderly Nursing Care",
      category: "NursingCare",
      description: "Professional nursing care for elderly patients.",
      price: 500,
      duration: 1
    });
    
    const service2 = await Service.create({
      serviceName: "Physiotherapy Session",
      category: "Physiotherapy",
      description: "In-home physiotherapy for mobility and recovery.",
      price: 800,
      duration: 1
    });

    // Seed Users
    const familyMember = await User.create({
      name: "Rahul Sharma",
      email: "patient@careconnect.com",
      password: "password123",
      role: "FamilyMember",
      phone: "+919876543211",
      city: "Mumbai",
      isVerified: true
    });

    const userCaregiver1 = await User.create({
      name: "Anita Krishnan",
      email: "anita@careconnect.com",
      password: "password123",
      role: "Caregiver",
      phone: "+919876543212",
      city: "Mumbai",
      isVerified: true
    });

    const userCaregiver2 = await User.create({
      name: "David D'Souza",
      email: "david@careconnect.com",
      password: "password123",
      role: "Caregiver",
      phone: "+919876543213",
      city: "Mumbai",
      isVerified: true
    });

    // Seed Caregiver Profiles
    const caregiver1 = await Caregiver.create({
      userId: userCaregiver1._id,
      caregiverType: "Nurse",
      experienceYears: 5,
      languages: ["English", "Hindi", "Marathi"],
      serviceAreas: ["Mumbai", "Navi Mumbai"],
      hourlyRate: 400,
      rating: 4.8,
      reviewsCount: 24,
      verificationStatus: "Verified",
      isAvailable: true,
      profileDescription: "Experienced registered nurse specializing in elderly care and post-operative recovery."
    });

    const caregiver2 = await Caregiver.create({
      userId: userCaregiver2._id,
      caregiverType: "Physiotherapist",
      experienceYears: 8,
      languages: ["English", "Hindi"],
      serviceAreas: ["Mumbai"],
      hourlyRate: 800,
      rating: 4.9,
      reviewsCount: 56,
      verificationStatus: "Verified",
      isAvailable: true,
      profileDescription: "Certified physiotherapist helping elderly patients regain mobility and independence."
    });

    // Seed Patients
    const patient1 = await Patient.create({
      familyMemberId: familyMember._id,
      patientName: "Meera Sharma",
      age: 78,
      gender: "Female",
      bloodGroup: "O+",
      allergies: ["Penicillin"],
      medicalConditions: ["Hypertension", "Arthritis"],
      emergencyContact: {
        name: "Rahul Sharma",
        phone: "+919876543211",
        relationship: "Son"
      }
    });

    // Seed Bookings
    await Booking.create({
      patientId: patient1._id,
      caregiverId: caregiver1._id,
      serviceId: service1._id,
      familyMemberId: familyMember._id,
      bookingDate: new Date(Date.now() + 86400000), // Tomorrow
      startTime: "10:00 AM",
      endTime: "02:00 PM",
      bookingType: "Hourly",
      status: "Accepted",
      totalAmount: 1600
    });

    console.log("Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
