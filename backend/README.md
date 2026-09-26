# 🏥 Elderly Nursing & Healthcare Assistance Platform — Backend

> Production-grade MERN stack backend with real-time Socket.IO, RBAC, AI caregiver recommendations, SOS alerts, and medication reminders.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Fill in your MongoDB URI, JWT secrets, Cloudinary & SMTP credentials

# 3. Start development server
npm run dev

# 4. Production
npm start
```

---

## 📁 Project Structure

```
backend/
├── server.js                    # Entry point — HTTP server, Socket.IO, cron
├── .env.example                 # Environment variables template
├── package.json
└── src/
    ├── app.js                   # Express app, middleware, routes
    ├── config/
    │   ├── database.js          # MongoDB connection with retry logic
    │   └── cloudinary.js        # Cloudinary + Multer storage setup
    ├── constants/
    │   └── index.js             # App-wide enums (roles, statuses, types)
    ├── controllers/             # Business logic handlers
    │   ├── auth.controller.js
    │   ├── user.controller.js
    │   ├── patient.controller.js
    │   ├── caregiver.controller.js
    │   ├── service.controller.js
    │   ├── booking.controller.js
    │   ├── careNote.controller.js
    │   ├── complaint.controller.js
    │   ├── notification.controller.js
    │   ├── review.controller.js
    │   ├── document.controller.js
    │   ├── sos.controller.js
    │   ├── medication.controller.js
    │   └── admin.controller.js
    ├── middleware/
    │   ├── auth.middleware.js   # JWT protect + RBAC restrictTo
    │   ├── validate.middleware.js
    │   └── errorHandler.js      # Global error handler + 404
    ├── models/                  # Mongoose schemas
    │   ├── User.model.js
    │   ├── Patient.model.js
    │   ├── Caregiver.model.js
    │   ├── Service.model.js
    │   ├── Booking.model.js
    │   ├── CareNote.model.js
    │   ├── Complaint.model.js
    │   ├── Notification.model.js
    │   ├── Review.model.js
    │   ├── Medication.model.js
    │   ├── SOS.model.js
    │   └── Document.model.js
    ├── routes/                  # Express routers (all versioned under /api/v1)
    ├── services/
    │   ├── email.service.js     # Nodemailer + HTML templates
    │   ├── notification.service.js
    │   ├── healthRisk.service.js          # Health risk scoring engine
    │   └── caregiverRecommendation.service.js  # AI recommendation engine
    ├── sockets/
    │   └── index.js             # Socket.IO init + JWT auth middleware
    ├── jobs/
    │   └── medicationReminder.job.js  # Cron — email reminders every minute
    ├── validators/              # express-validator schemas
    └── utils/
        ├── logger.js            # Winston logger
        ├── AppError.js          # Custom operational error class
        ├── catchAsync.js        # Async error wrapper
        ├── generateToken.js     # JWT access + refresh token helpers
        └── apiResponse.js       # Standardised JSON response helpers
```

---

## 🔐 Authentication Flow

```
Register → Email Verification → Login → [Access Token (15m) + Refresh Token (7d)]
                                           ↓
                                    Authenticated Requests
                                           ↓
                                   Access Token Expires
                                           ↓
                              POST /auth/refresh-token → New Token Pair
```

---

## 👥 Roles & Permissions (RBAC)

| Feature | Admin | FamilyMember | Caregiver |
|---------|-------|--------------|-----------|
| Manage Users | ✅ | ❌ | ❌ |
| Create Patient | ✅ | ✅ | ❌ |
| Create Booking | ✅ | ✅ | ❌ |
| Accept/Complete Booking | ❌ | ❌ | ✅ |
| Add Care Notes | ❌ | ❌ | ✅ |
| Submit Review | ✅ | ✅ | ❌ |
| Trigger SOS | ✅ | ✅ | ✅ |
| Verify Caregiver | ✅ | ❌ | ❌ |
| Admin Dashboard | ✅ | ❌ | ❌ |

---

## ⚡ Premium Features

| Feature | Implementation |
|---------|---------------|
| 🤖 AI Caregiver Recommendation | Multi-factor scoring (rating, exp, location, rate) |
| 🏥 Health Risk Assessment | BP + sugar + age + chronic disease scoring engine |
| 💊 Medication Reminders | Node-cron every minute + Nodemailer email alerts |
| 🚨 Emergency SOS | Multi-target alerts (family + caregiver + admin) via email + Socket.IO |
| 📁 Document Management | Cloudinary with auto-deletion on document removal |
| ⭐ Rating System | Auto-recalculates caregiver rating on each review submission |

---

## 🔒 Security

- **Helmet** — HTTP security headers
- **CORS** — restricted to configured client origin
- **Rate Limiting** — 100 req/15min globally, 20/15min on auth routes
- **MongoDB Sanitize** — NoSQL injection protection
- **XSS Clean** — cross-site scripting protection
- **Bcrypt** — password hashing (configurable salt rounds)
- **JWT** — short-lived access tokens + rotating refresh tokens
- **Input Validation** — express-validator on all mutation endpoints

---

## 🌐 Environment Variables

See `.env.example` for complete reference. Key variables:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |
| `CLOUDINARY_*` | Cloudinary account credentials |
| `SMTP_*` | Email server credentials |
| `CLIENT_URL` | Frontend URL for CORS + email links |

---

## 📖 API Docs & Postman

- Full API reference: `src/docs/API_DOCUMENTATION.md`
- Postman collection: `src/docs/postman_collection.json`

Import the Postman collection, set `BASE_URL` to `http://localhost:5000/api/v1`, register a user, copy the `accessToken` into the `ACCESS_TOKEN` variable, and all authenticated requests will work immediately.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh) |
| Real-time | Socket.IO |
| File Storage | Cloudinary |
| Email | Nodemailer (SMTP) |
| Scheduling | node-cron |
| Logging | Winston |
| Security | Helmet, express-rate-limit, mongo-sanitize, xss-clean |
| Validation | express-validator |
