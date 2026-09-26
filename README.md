# 🏥 CareConnect — Elderly Nursing & Healthcare Assistance Platform

**CareConnect** is a web-based elderly healthcare assistance platform designed to connect elderly individuals and their families with caregivers and healthcare professionals for reliable, accessible, and convenient home-based care.

The platform enables patients to discover caregivers, book care services, manage appointments, and receive care-related updates, while caregivers can manage bookings, availability, and patient care activities.

🌐 **Live Demo:** [CareConnect](https://careconnect-krc-omega.vercel.app/)

---

## 📌 Table of Contents

* [About the Project](#-about-the-project)
* [Problem Statement](#-problem-statement)
* [Objectives](#-objectives)
* [Key Features](#-key-features)
* [User Roles](#-user-roles)
* [Technology Stack](#-technology-stack)
* [System Architecture](#-system-architecture)
* [Project Structure](#-project-structure)
* [Installation and Setup](#-installation-and-setup)
* [Environment Variables](#-environment-variables)
* [Deployment](#-deployment)
* [Future Enhancements](#-future-enhancements)
* [Contributing](#-contributing)
* [License](#-license)

---

## 📖 About the Project

Elderly individuals often require regular medical attention, personal care, assistance with daily activities, and companionship. Finding trusted caregivers and coordinating care services can be challenging for patients and their families.

CareConnect addresses these challenges through a centralized platform that connects patients with caregivers and provides a structured system for booking, scheduling, and managing elderly care services.

The platform focuses on improving accessibility, transparency, and continuity of elderly care through a simple and user-friendly interface.

---

## 🎯 Problem Statement

Traditional elderly care services often face the following challenges:

* Difficulty finding trusted and verified caregivers.
* Lack of transparency in caregiver availability and service charges.
* Manual coordination of appointments and care services.
* Limited visibility into booking status and care activities.
* Difficulty maintaining consistent communication between patients and caregivers.

CareConnect aims to address these challenges by digitizing the elderly care service process.

---

## 🎯 Objectives

* Digitize elderly nursing and healthcare assistance services.
* Connect patients and families with caregivers.
* Enable convenient caregiver discovery and service booking.
* Provide separate dashboards for patients, caregivers, and administrators.
* Improve communication and coordination between patients and caregivers.
* Support care scheduling, medication reminders, and service tracking.

---

## ✨ Key Features

### 👨‍🦳 Patient Dashboard

* Secure registration and login.
* Patient profile and care requirement management.
* Browse available caregivers and view their profiles.
* View caregiver qualifications, availability, and ratings.
* Book caregivers based on service requirements and schedules.
* Track booking status and service history.
* Receive care-related notifications and medication reminders.

### 🩺 Caregiver Dashboard

* Caregiver registration and profile management.
* Manage availability and service details.
* View incoming patient booking requests.
* Accept or reject booking requests.
* View assigned patients and scheduled services.
* Update service status and maintain care notes.
* Send medication-related alerts and care updates.

### 🛡️ Admin Dashboard

* Manage patient and caregiver accounts.
* Review and verify caregiver registrations.
* Manage service categories and platform information.
* Monitor bookings and service activities.
* Handle complaints and user management.
* View platform statistics and reports.

### 🔔 Notifications and Communication

* Booking status updates.
* Care-related notifications.
* Medication reminders and alerts.
* Real-time communication and status updates where configured.

---

## 👥 User Roles

| Role             | Responsibilities                                                    |
| ---------------- | ------------------------------------------------------------------- |
| Patient / Family | Discover caregivers, book services, and track care activities.      |
| Caregiver        | Manage availability, respond to bookings, and provide care updates. |
| Administrator    | Verify caregivers, manage users, and monitor platform operations.   |

---

## 🛠️ Technology Stack

| Component               | Technologies                      |
| ----------------------- | --------------------------------- |
| Frontend                | React.js, JavaScript, HTML5, CSS3 |
| Backend                 | Node.js, Express.js               |
| Database                | MongoDB Atlas                     |
| ODM                     | Mongoose                          |
| API                     | REST API                          |
| Authentication          | JWT-based authentication          |
| Real-Time Communication | Socket.IO                         |
| Frontend Deployment     | Vercel                            |
| Backend Deployment      | Render                            |
| Version Control         | Git and GitHub                    |

---

## 🏗️ System Architecture

```text
             ┌──────────────────────────┐
             │     React Frontend       │
             │       (Vercel)           │
             └────────────┬─────────────┘
                          │
                    REST API / Socket.IO
                          │
             ┌────────────▼─────────────┐
             │     Node.js + Express    │
             │        (Render)          │
             └────────────┬─────────────┘
                          │
             ┌────────────▼─────────────┐
             │       MongoDB Atlas      │
             │       Cloud Database     │
             └──────────────────────────┘
```

---

## 📂 Project Structure

```text
CareConnect/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── .env
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

*The exact folder structure may vary depending on the project implementation.*

---

## ⚙️ Installation and Setup

### Prerequisites

Make sure you have the following installed:

* Node.js (LTS version)
* npm
* Git
* MongoDB Atlas account

### 1. Clone the Repository

```bash
git clone https://github.com/KandakatlaRithwik/CareConnect.git
```

Navigate to the project directory:

```bash
cd CareConnect
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory and configure the required environment variables.

Start the backend development server:

```bash
npm run dev
```

The backend will run at:

`http://localhost:5000`

### 3. Configure the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file inside the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the frontend development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

Configure the following variables according to your environment:

```env
NODE_ENV=development
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=12

CLIENT_URL=http://localhost:5173
```

Additional environment variables may be required depending on the services enabled in your backend, such as email notifications or cloud storage.

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

For production, configure the frontend API URL as:

```env
VITE_API_URL=https://careconnect-backend-spi6.onrender.com/api/v1
```

**Security Note:** Never commit `.env` files, database credentials, JWT secrets, or API keys to GitHub. Configure production environment variables through the respective deployment platforms.

---

## 🚀 Deployment

CareConnect is deployed using Vercel, Render, and MongoDB Atlas.

| Component | Platform      | URL                                                              |
| --------- | ------------- | ---------------------------------------------------------------- |
| Frontend  | Vercel        | [Live Application](https://careconnect-krc-omega.vercel.app/)    |
| Backend   | Render        | [Backend Service](https://careconnect-backend-spi6.onrender.com) |
| Database  | MongoDB Atlas | Managed cloud database                                           |

### Deployment Configuration

1. Push the project to GitHub.
2. Deploy the frontend using Vercel.
3. Deploy the backend using Render.
4. Configure MongoDB Atlas connection settings.
5. Set the production environment variables.
6. Configure backend CORS to allow the deployed frontend origin.
7. Verify API connectivity and test application workflows.

---

## 🔮 Future Enhancements

* Online payments and insurance support.
* Dedicated mobile application.
* Teleconsultation with healthcare professionals.
* Emergency SOS functionality.
* Advanced caregiver matching and recommendations.
* Enhanced healthcare analytics and reporting.
* Integration with wearable health monitoring devices.

---

## 🤝 Contributing

Contributions, suggestions, and improvements are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Commit your changes.
4. Push the branch to your fork.
5. Open a Pull Request.

---

## 📄 License

This project is developed for educational and academic purposes.

A formal open-source license can be added to define permissions for reuse and distribution.

---

## 👨‍💻 Developed By

**Rithwik Kandakatla**

B.Tech — Computer Science and Engineering

Kakatiya Institute of Technology and Science, Warangal

🔗 **GitHub:** [KandakatlaRithwik](https://github.com/KandakatlaRithwik)

🌐 **Project:** [CareConnect Live](https://careconnect-krc-omega.vercel.app/)

---

⭐ If you find this project useful, consider giving the repository a star!
