# Elderly Healthcare Platform — API Documentation

**Base URL:** `http://localhost:5000/api/v1`  
**Auth:** Bearer Token (JWT) via `Authorization` header

---

## Authentication

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/auth/register` | ❌ | Any | Register new user |
| POST | `/auth/login` | ❌ | Any | Login & receive tokens |
| POST | `/auth/logout` | ✅ | Any | Logout & invalidate token |
| POST | `/auth/refresh-token` | ❌ | Any | Rotate JWT tokens |
| POST | `/auth/forgot-password` | ❌ | Any | Send password reset email |
| POST | `/auth/reset-password` | ❌ | Any | Reset password with token |
| PATCH | `/auth/change-password` | ✅ | Any | Change password when logged in |

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/profile` | ✅ | Fetch logged-in user's profile |
| PUT | `/users/profile` | ✅ | Update profile (supports image upload) |
| DELETE | `/users/profile` | ✅ | Soft-delete / deactivate account |

---

## Patients

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/patients` | ✅ | FamilyMember, Admin | Create patient profile |
| GET | `/patients` | ✅ | Any | List patients (scoped by role) |
| GET | `/patients/:id` | ✅ | Any | Get single patient |
| PUT | `/patients/:id` | ✅ | FamilyMember, Admin | Update patient |
| DELETE | `/patients/:id` | ✅ | FamilyMember, Admin | Soft-delete patient |

---

## Caregivers

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/caregivers` | ✅ | Caregiver | Create caregiver profile |
| GET | `/caregivers` | ✅ | Any | List with filters (type, rating, city, rate) |
| GET | `/caregivers/:id` | ✅ | Any | Get caregiver detail |
| PUT | `/caregivers/:id` | ✅ | Caregiver, Admin | Update profile |
| DELETE | `/caregivers/:id` | ✅ | Caregiver, Admin | Delete profile |
| GET | `/caregivers/recommend/:patientId` | ✅ | Any | AI-based recommendations |

### Caregiver Filter Query Params
`?caregiverType=Nurse&rating=4&city=Hyderabad&minRate=200&maxRate=600&availability=true&page=1&limit=10`

---

## Services

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/services` | ❌ | Public | List all active services |
| GET | `/services/:id` | ❌ | Public | Get service detail |
| POST | `/services` | ✅ | Admin | Create service |
| PUT | `/services/:id` | ✅ | Admin | Update service |
| DELETE | `/services/:id` | ✅ | Admin | Soft-delete service |

---

## Bookings

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/bookings` | ✅ | FamilyMember | Create booking |
| GET | `/bookings` | ✅ | Any | List bookings (role-scoped) |
| GET | `/bookings/:id` | ✅ | Any | Get booking detail |
| PATCH | `/bookings/status` | ✅ | Caregiver, FamilyMember, Admin | Update booking status |
| DELETE | `/bookings/:id` | ✅ | Admin | Delete booking |

### Booking Status Transitions
- **FamilyMember** → `Cancelled`
- **Caregiver** → `Accepted`, `Rejected`, `InProgress`, `Completed`
- **Admin** → Any

---

## Care Notes

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/care-notes` | ✅ | Caregiver | Add care note after visit |
| GET | `/care-notes` | ✅ | Any | List notes (filter by patientId/bookingId) |
| GET | `/care-notes/:id` | ✅ | Any | Get single note |
| PUT | `/care-notes/:id` | ✅ | Caregiver | Update note |

---

## Complaints

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/complaints` | ✅ | Any | Submit complaint |
| GET | `/complaints` | ✅ | Any | List complaints (role-scoped) |
| PUT | `/complaints/:id` | ✅ | Any | Update complaint (Admin resolves, User edits) |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | ✅ | Get user notifications |
| PATCH | `/notifications/read` | ✅ | Mark notifications as read |
| DELETE | `/notifications/:id` | ✅ | Delete notification |

---

## Reviews

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/reviews` | ✅ | FamilyMember | Submit review for completed booking |
| GET | `/reviews/caregiver/:caregiverId` | ✅ | Any | Get caregiver reviews |

---

## Medications (Reminders)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/medications` | ✅ | FamilyMember, Admin | Add medication reminder |
| GET | `/medications` | ✅ | Any | Get medications |
| PUT | `/medications/:id` | ✅ | Any | Update medication |
| DELETE | `/medications/:id` | ✅ | Any | Delete medication |

---

## SOS Alerts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/sos` | ✅ | Trigger emergency — alerts family, caregiver, admins |
| GET | `/sos` | ✅ | List SOS alerts |
| PATCH | `/sos/:id/resolve` | ✅ (Admin) | Resolve alert |

---

## Documents

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/documents` | ✅ | Upload document (multipart/form-data) |
| GET | `/documents` | ✅ | List user documents |
| DELETE | `/documents/:id` | ✅ | Delete document (removes from Cloudinary) |

---

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/dashboard` | ✅ Admin | Full platform statistics |
| GET | `/admin/reports` | ✅ Admin | Booking/complaint reports with date range |
| GET | `/admin/health-risk` | ✅ Admin | Calculate patient health risk score |
| PATCH | `/admin/caregivers/:id/verify` | ✅ Admin | Verify or reject caregiver |
| PATCH | `/admin/users/:id/status` | ✅ Admin | Suspend or activate user |

---

## Standard Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "meta": { "total": 100, "page": 1, "pages": 10 }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "email", "message": "Valid email is required" }]
}
```

---

## Socket.IO Events

**Connection:** Pass JWT in `auth.token` during handshake.

| Event (server → client) | Trigger |
|--------------------------|---------|
| `booking-created` | New booking request for caregiver |
| `booking-accepted` | Caregiver accepted booking |
| `booking-rejected` | Caregiver rejected booking |
| `caregiver-arrived` | Caregiver marked arrival |
| `service-completed` | Session completed |
| `complaint-updated` | Admin updated complaint |
| `sos-alert` | Emergency SOS triggered |
| `notification` | Any new notification |

**Rooms:** Users join `user:{userId}`. Admins also join `admin`. Booking participants join `booking:{bookingId}`.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict (duplicate) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |
