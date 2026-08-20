# DESIGN INVENTORY — CEKRIYIN.ID

This document contains a complete inventory of all UI/UX design screens found in the `design/` reference directory for **Cekriyin.id**.

---

## 1. Homepage (`beranda_cekriyin.id`)
* **Purpose:** Main checking experience where users can input phone numbers, messages, or URLs to verify scam indicators immediately without friction.
* **Viewport:** Desktop (1440 × 1024) & Mobile (390 × 844)
* **Main Components:**
  * Header / Navbar with Logo ("Cekriyin.id"), "Cara Kerja" link, and "Masuk" / "Daftar" button.
  * Hero Header ("Platform Pengecekan Scam Indonesia").
  * Mode Selector Tabs (`Nomor` | `Pesan` | `Tautan`).
  * Check Input Box (Textarea / Input field with placeholder and clear button).
  * Primary Action Button ("Cek Sekarang").
  * Trust / Feature Highlights (COPY → PASTE → CHECK → RESULT workflow badges).
  * Footer with disclaimer and copyright.
* **Interactive Elements:**
  * Mode selector tabs switching active checking mode.
  * Textarea input.
  * "Cek Sekarang" submit button.
  * Navigation links ("Cara Kerja", "Masuk").
* **States:**
  * Default state (Empty input, 'Nomor' selected).
  * Active mode states ('Nomor', 'Pesan', 'Tautan').
  * Validation / Error state (Empty submit).
  * Loading state during check request.
* **Navigation Relationship:** Entry point (`/`). Leads to `/cara-kerja`, `/masuk`, and Result screen upon submission.

---

## 2. How It Works (`cara_kerja_cekriyin.id`)
* **Purpose:** Educational page explaining the 3-step checking mechanism (Copy, Paste, Check), risk levels, and privacy principles.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Page Title & Subtitle ("Cara Kerja Cekriyin.id").
  * Step-by-Step Explanation Cards (Step 1: Copy Data, Step 2: Tempel & Cek, Step 3: Pahami Hasil).
  * Risk Level Explanation Section (Tidak Ditemukan Laporan, Perlu Waspada, Risiko Tinggi).
  * Call to Action ("Mulai Pengecekan").
* **Interactive Elements:**
  * "Mulai Pengecekan" button leading back to homepage checking tool.
  * Header navigation links.
* **States:** Static info page.
* **Navigation Relationship:** Accessible from Navbar (`/cara-kerja`). Leads to `/`.

---

## 3. Login Page (`masuk_cekriyin.id`)
* **Purpose:** Allows registered users to authenticate to access check history, save suspicious numbers, and post comments.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Centered Authentication Card / Form Container.
  * Page Title ("Masuk ke Cekriyin.id").
  * Form Fields: Email input, Password input.
  * Primary Button ("Masuk").
  * Secondary Link ("Belum punya akun? Daftar").
* **Interactive Elements:**
  * Input fields (Email, Password).
  * "Masuk" submit button.
  * Link to Register page (`/daftar`).
* **States:**
  * Default empty form.
  * Filled form.
  * Error state (Invalid credentials, validation errors).
  * Submitting / Loading state.
* **Navigation Relationship:** Accessible from Navbar (`/masuk`). Leads to `/` (authenticated) or `/daftar`.

---

## 4. Registration Page (`daftar_cekriyin.id`)
* **Purpose:** Allows new users to create an account on Cekriyin.id.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Centered Authentication Card / Form Container.
  * Page Title ("Daftar Akun Cekriyin.id").
  * Form Fields: Email input, Password input, Password Confirmation input.
  * Primary Button ("Daftar").
  * Secondary Link ("Sudah punya akun? Masuk").
* **Interactive Elements:**
  * Form inputs.
  * "Daftar" submit button.
  * Link to Login page (`/masuk`).
* **States:**
  * Default empty form.
  * Form validation states (Email format, Password match/length).
  * Submitting / Loading state.
* **Navigation Relationship:** Accessible from Login page or Navbar (`/daftar`). Leads to `/masuk` or `/` on successful registration.

---

## 5. Result: High Risk (`hasil_pengecekan_risiko_tinggi`)
* **Purpose:** Displays high-risk scam result state for a phone number check with report counts, category breakdown, report reasons, and comment section.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Checked Subject Header (e.g. `0812-3456-7890`).
  * Prominent Risk Status Banner (`Risiko Tinggi` - Red/Danger badge and warning text).
  * Summary Cards: Total Reports Count (e.g. 42 Laporan), Primary Category (e.g. Penipuan Transfer).
  * Reported Category Distribution List.
  * Action Bar ("Simpan Nomor" button, "Tambah Komentar" button).
  * Community Comments Section with Comment Form (if logged in) and Comment List.
* **Interactive Elements:**
  * Mode selector for a new search.
  * "Simpan Nomor" button (triggers login prompt if anonymous).
  * Comment input box & submit button (if logged in).
* **States:**
  * High Risk display state.
  * Saved / Unsaved state for phone number.
  * Anonymous view (Prompt to login to save/comment) vs Logged-in view.
* **Navigation Relationship:** Result view after checking (`/hasil` or `/check/:id`).

---

## 6. Result: Message Analysis / Warning (`hasil_pengecekan_analisis_pesan`)
* **Purpose:** Displays rule-based detection results for a suspicious message content check, identifying suspicious indicators (OTP request, suspicious link, urgent tone).
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Risk Status Banner (`Perlu Waspada` - Yellow/Warning badge and explanation).
  * Message Content Box showing quoted input text.
  * Detected Indicators List (e.g. Permintaan OTP, Tautan Tidak Dikenal, Bahasa Mendesak).
  * Risk Analysis Details & Guidance / Recommended Action.
  * Comment Section.
* **Interactive Elements:**
  * Copy message button / Re-check button.
  * Comment input & list.
* **States:**
  * Warning risk state.
  * Indicator highlight states.
* **Navigation Relationship:** Result view after checking message input.

---

## 7. Result: No Reports Found (`hasil_pengecekan_tidak_ada_laporan`)
* **Purpose:** Displays result when no scam indicators or reports exist in the database for the given query.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Subject Header (Query input).
  * Status Banner (`Tidak Ditemukan Laporan` - Neutral/Green badge).
  * Disclaimer Banner ("Belum ada laporan bukan berarti 100% aman. Tetap waspada.").
  * Action Bar ("Simpan Nomor" if number, "Tambah Komentar").
  * Comment Section.
* **Interactive Elements:**
  * "Cek Kembali" button.
  * Save number & Comment actions.
* **States:**
  * Clean / Neutral result state.
* **Navigation Relationship:** Result view after clean check.

---

## 8. Check History (`riwayat_pengecekan_cekriyin.id`)
* **Purpose:** Account page listing all past checks performed by the authenticated user.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Account Navigation Bar / Tabs (Riwayat Pengecekan | Nomor Tersimpan | Komentar Saya).
  * Page Title ("Riwayat Pengecekan").
  * Search / Filter Bar.
  * History List / Table (Query input, Mode/Type badge, Risk Level status, Timestamp, Action/Link to view result).
  * Empty State (if no history exists).
* **Interactive Elements:**
  * Account navigation tabs.
  * Search/filter input.
  * "Lihat Hasil" item click.
* **States:**
  * Populated history list.
  * Empty state.
  * Filtered results state.
* **Navigation Relationship:** `/akun/riwayat` (Requires authentication).

---

## 9. Saved Numbers (`nomor_tersimpan_cekriyin.id`)
* **Purpose:** Account page showing phone numbers bookmarked/saved by the authenticated user for monitoring.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Account Navigation Bar / Tabs.
  * Page Title ("Nomor Tersimpan").
  * Saved Numbers List (Phone number, Category, Current Risk Status, Saved Date, Remove button, View Detail link).
  * Empty State ("Belum ada nomor yang disimpan").
* **Interactive Elements:**
  * Account navigation tabs.
  * "Hapus" (Remove from saved) button.
  * "Lihat Detail" link.
* **States:**
  * Populated list.
  * Empty state.
  * Delete confirmation / removal state.
* **Navigation Relationship:** `/akun/nomor-tersimpan` (Requires authentication).

---

## 10. My Comments (`komentar_saya_cekriyin.id`)
* **Purpose:** Account page displaying all comments written by the authenticated user across numbers, messages, and links.
* **Viewport:** Desktop & Mobile
* **Main Components:**
  * Standard Header & Footer.
  * Account Navigation Bar / Tabs.
  * Page Title ("Komentar Saya").
  * Comments List (Target subject/type, Comment text content, Published date, Link to target result page).
  * Empty State ("Belum ada komentar").
* **Interactive Elements:**
  * Account navigation tabs.
  * "Lihat Halaman Pengecekan" link.
* **States:**
  * Populated comments list.
  * Empty state.
* **Navigation Relationship:** `/akun/komentar` (Requires authentication).
