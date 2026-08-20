# CEKRIYIN.ID — Platform Pengecekan Scam Indonesia

Cekriyin.id adalah platform web sederhana untuk membantu masyarakat mengecek apakah nomor telepon, pesan WhatsApp/SMS, atau tautan/URL memiliki indikasi penipuan (scam).

Core Philosophy: **COPY → PASTE → CHECK → RESULT**

---

## 🛠️ Tech Stack

* **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, React Router v6
* **Backend:** Node.js, Express, TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** bcrypt + Session/JWT mechanism

---

## 📁 Project Structure

```text
cekriyin/
│
├── design/                          # UI/UX design specifications & HTML mockups
│   ├── beranda_cekriyin.id/
│   ├── cara_kerja_cekriyin.id/
│   ├── cekriyin_ui/
│   ├── daftar_cekriyin.id/
│   ├── hasil_pengecekan_analisis_pesan/
│   ├── hasil_pengecekan_risiko_tinggi/
│   ├── hasil_pengecekan_tidak_ada_laporan/
│   ├── komentar_saya_cekriyin.id/
│   ├── masuk_cekriyin.id/
│   ├── nomor_tersimpan_cekriyin.id/
│   └── riwayat_pengecekan_cekriyin.id/
│
├── frontend/                        # React + Vite + TypeScript + Tailwind CSS application
│   ├── src/
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                         # Express + TypeScript API server
│   ├── prisma/
│   │   └── schema.prisma            # PostgreSQL data model
│   └── src/
│       └── server.ts                # Express server entrypoint
│
├── DESIGN_INVENTORY.md              # Screen-by-screen UI inventory
├── COMPONENT_MAP.md                 # Shared visual/interactive components mapping
├── USER_FLOWS.md                    # Core user interaction flows
├── API_DESIGN.md                    # Backend REST API contracts
└── README.md
```

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- PostgreSQL installed and running locally (or remote PostgreSQL instance)

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables (.env)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cekriyin_db?schema=public"

# Generate Prisma Client
npm run prisma:generate

# Run dev server
npm run dev
```
Backend will start on `http://localhost:5000`.

Health Check:
```bash
curl http://localhost:5000/api/health
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Run dev server
npm run dev
```
Frontend will start on `http://localhost:3000`.

---

## 🗄️ Database Entities

* `users`: User accounts (email, password_hash)
* `checks`: Verification history (`user_id` nullable for anonymous checks, `type`, `input`, `risk_level`, `result`)
* `phone_reports`: Community reports database for phone numbers
* `saved_numbers`: Bookmarked phone numbers for authenticated users
* `comments`: User comments on numbers, messages, or links

---

## 🛑 Product Boundaries (Non-Goals)
* No chat or community forum features
* No push/email notifications
* No official police/institution reporting integration inside app
* No subscriptions or premium plans
* No saved links or saved messages (only numbers can be saved)
* No ratings, likes, reactions, or voting
* No browser extension, QR scanner, or cybersecurity tech dashboard
