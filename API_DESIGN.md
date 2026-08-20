# API DESIGN — CEKRIYIN.ID

This document defines the RESTful API contract for **Cekriyin.id**.

---

## Base URL
`http://localhost:5000/api`

---

## 1. System Health

### `GET /api/health`
* **Purpose:** Service health check endpoint.
* **Authentication:** None (Public)
* **Response (200 OK):**
```json
{
  "status": "ok",
  "timestamp": "2026-08-19T15:30:00.000Z",
  "service": "cekriyin-backend",
  "version": "1.0.0"
}
```

---

## 2. Check API (Unified Endpoint)

### `POST /api/check`
* **Purpose:** Core verification endpoint for phone numbers, messages, or URLs.
* **Authentication:** Optional (If Bearer token or session cookie is present, attaches `user_id` to check history).
* **Request Body:**
```json
{
  "type": "number", // "number" | "message" | "link"
  "input": "081234567890"
}
```
* **Response (200 OK - Standard Unified Structure):**
```json
{
  "id": "chk_123456789",
  "type": "number",
  "input": "081234567890",
  "riskLevel": "Risiko Tinggi", // "Tidak Ditemukan Laporan" | "Perlu Waspada" | "Risiko Tinggi"
  "title": "Nomor ini memiliki indikasi penipuan.",
  "description": "Ditemukan beberapa laporan penipuan transfer yang terkait dengan nomor ini.",
  "data": {
    "totalReports": 42,
    "primaryCategory": "Penipuan Transfer",
    "categoryBreakdown": [
      { "category": "Penipuan Transfer", "count": 28 },
      { "category": "Hadiah Palsu", "count": 14 }
    ]
  },
  "indicators": [
    {
      "code": "REPORTS_FOUND",
      "label": "Laporan Komunitas",
      "description": "Terdapat 42 laporan dari pengguna lain."
    }
  ],
  "createdAt": "2026-08-19T15:30:00.000Z"
}
```
* **Error Responses:**
  * `400 Bad Request`: `{ "error": "Validation Error", "details": "Type must be one of: number, message, link" }`
  * `500 Internal Server Error`: `{ "error": "Internal Server Error" }`

---

## 3. Authentication APIs

### `POST /api/auth/register`
* **Purpose:** Register a new user account.
* **Authentication:** None (Public)
* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
* **Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "usr_987654321",
    "email": "user@example.com",
    "createdAt": "2026-08-19T15:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1Ni..."
}
```

### `POST /api/auth/login`
* **Purpose:** Authenticate user and issue session token/cookie.
* **Authentication:** None (Public)
* **Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```
* **Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "usr_987654321",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1Ni..."
}
```

### `POST /api/auth/logout`
* **Purpose:** Terminate user session.
* **Authentication:** Required
* **Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

### `GET /api/auth/me`
* **Purpose:** Retrieve current logged-in user profile.
* **Authentication:** Required
* **Response (200 OK):**
```json
{
  "user": {
    "id": "usr_987654321",
    "email": "user@example.com",
    "createdAt": "2026-08-19T15:30:00.000Z"
  }
}
```

---

## 4. History API

### `GET /api/history`
* **Purpose:** Fetch check history for the authenticated user.
* **Authentication:** Required
* **Response (200 OK):**
```json
{
  "history": [
    {
      "id": "chk_123456789",
      "type": "number",
      "input": "081234567890",
      "riskLevel": "Risiko Tinggi",
      "createdAt": "2026-08-19T15:30:00.000Z"
    }
  ]
}
```

---

## 5. Saved Numbers APIs

### `GET /api/saved-numbers`
* **Purpose:** Fetch list of phone numbers saved by the logged-in user.
* **Authentication:** Required
* **Response (200 OK):**
```json
{
  "savedNumbers": [
    {
      "id": "sn_11223344",
      "phoneNumber": "081234567890",
      "category": "Penipuan Transfer",
      "riskLevel": "Risiko Tinggi",
      "createdAt": "2026-08-19T15:30:00.000Z"
    }
  ]
}
```

### `POST /api/saved-numbers`
* **Purpose:** Save a phone number to user's saved numbers list.
* **Authentication:** Required
* **Request Body:**
```json
{
  "phoneNumber": "081234567890"
}
```
* **Response (201 Created):**
```json
{
  "message": "Phone number saved successfully",
  "savedNumber": {
    "id": "sn_11223344",
    "phoneNumber": "081234567890",
    "createdAt": "2026-08-19T15:30:00.000Z"
  }
}
```

### `DELETE /api/saved-numbers/:id`
* **Purpose:** Remove a phone number from user's saved list.
* **Authentication:** Required
* **Response (200 OK):**
```json
{
  "message": "Saved number removed"
}
```

---

## 6. Comments APIs

### `GET /api/comments`
* **Purpose:** Get comments for a specific target or all user comments.
* **Authentication:** Optional for reading comments by query params (`?targetType=number&targetReference=081234567890`), Required for reading user's own comments (`?myComments=true`).
* **Response (200 OK):**
```json
{
  "comments": [
    {
      "id": "cmt_99887766",
      "targetType": "number",
      "targetReference": "081234567890",
      "content": "Nomor ini mengaku CS bank dan minta transfer DP.",
      "user": {
        "email": "u***r@example.com"
      },
      "createdAt": "2026-08-19T15:30:00.000Z"
    }
  ]
}
```

### `POST /api/comments`
* **Purpose:** Create a comment on a target subject (number, message, or link).
* **Authentication:** Required
* **Request Body:**
```json
{
  "targetType": "number", // "number" | "message" | "link"
  "targetReference": "081234567890",
  "content": "Nomor ini mengaku CS bank dan minta transfer DP."
}
```
* **Response (201 Created):**
```json
{
  "message": "Comment created successfully",
  "comment": {
    "id": "cmt_99887766",
    "targetType": "number",
    "targetReference": "081234567890",
    "content": "Nomor ini mengaku CS bank dan minta transfer DP.",
    "createdAt": "2026-08-19T15:30:00.000Z"
  }
}
```
