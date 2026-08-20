# COMPONENT MAP — CEKRIYIN.ID

This document maps all reusable visual and interactive components identified across the Cekriyin.id UI design screens.

---

## 1. Global / Layout Components

### `Navbar`
* **Used in:** All pages (`/`, `/cara-kerja`, `/masuk`, `/daftar`, `/hasil`, `/akun/*`)
* **Description:** Top navigation header (height: 64px, background: white, 1px bottom border `#e5e7eb`).
* **Elements:**
  * Brand Logo ("Cekriyin.id" with Teal accent).
  * Main Navigation Link ("Cara Kerja").
  * User Account Control (Displays "Masuk" button when unauthenticated; User profile/dropdown or email when authenticated).

### `Footer`
* **Used in:** All pages
* **Description:** Page footer containing brand description, legal disclaimer ("Platform pengecekan independen. Bukan jaminan hukum/keamanan 100%."), and copyright notice.

### `AccountNavTabs`
* **Used in:** `/akun/riwayat`, `/akun/nomor-tersimpan`, `/akun/komentar`
* **Description:** Horizontal navigation tabs for account section.
* **Tabs:**
  * `Riwayat Pengecekan`
  * `Nomor Tersimpan`
  * `Komentar Saya`

---

## 2. Checking Tool Components

### `ModeSelector`
* **Used in:** Homepage (`/`), Result screens (`/hasil`)
* **Description:** Tabbed selector for switching checking mode.
* **Options:** `Nomor` | `Pesan` | `Tautan`
* **Styling:** Pill/Tab buttons with active teal highlight (`bg-primary-container` / `text-primary`).

### `CheckInput`
* **Used in:** Homepage (`/`), Result screens (`/hasil`)
* **Description:** Main input area for checking.
* **Features:**
  * Dynamic placeholder based on active mode:
    * Mode `Nomor`: *"Masukkan nomor telepon (contoh: 081234567890)"*
    * Mode `Pesan`: *"Tempel isi pesan WhatsApp atau SMS yang mencurigakan di sini..."*
    * Mode `Tautan`: *"Masukkan link / URL website (contoh: https://bit.ly/...)"*
  * Clear input action button.
  * Preserves line breaks for multiline message inputs.

### `PrimaryButton`
* **Used in:** Homepage, Login, Register, Comment form
* **Styling:** Solid Teal background (`#00685f`), white text, hover effect, rounded `0.25rem` (4px).

### `SecondaryButton` / `GhostButton`
* **Used in:** Secondary actions (e.g. "Simpan Nomor", "Kembali", "Cek Kembali")
* **Styling:** Transparent background with dark charcoal border (`#6d7a77` / `#3d4947`) and text.

---

## 3. Result & Status Components

### `RiskStatusBadge`
* **Used in:** Result screens, Check History items, Saved Number items
* **Description:** Color-coded status badge showing the risk level of the query.
* **Variants:**
  * **Tidak Ditemukan Laporan:** Green / Neutral background (`#e6f4ea`), dark green text (`#137333`).
  * **Perlu Waspada:** Yellow / Warning background (`#fef7e0`), dark yellow/amber text (`#b06000`).
  * **Risiko Tinggi:** Red / Danger background (`#fce8e6`), dark red text (`#c5221f`).

### `ResultSummaryCard`
* **Used in:** Result screens
* **Description:** Summary header card containing the checked query subject, status badge, total reports count, and primary category tag.

### `IndicatorListCard`
* **Used in:** Result screen (Message & Link detection)
* **Description:** Card listing specific suspicious indicators found during rule-based detection (e.g. "Permintaan OTP", "Tautan Mencurigakan", "Kata Kunci Mendadak/Mendesak").

### `DisclaimerBanner`
* **Used in:** Result screens
* **Description:** Informational callout banner reminding users that check results are based on available reports and rule heuristics, not absolute legal guarantees.

---

## 4. Account & Interactive Components

### `CommentForm`
* **Used in:** Result screens
* **Description:** Textarea input and submit button for authenticated users to post feedback on a checked subject.

### `CommentItem`
* **Used in:** Result screens, My Comments page (`/akun/komentar`)
* **Description:** Component displaying individual user comment with author email, timestamp, comment text, and reference target link.

### `HistoryRowItem`
* **Used in:** Check History page (`/akun/riwayat`)
* **Description:** Table row or list item displaying query input, mode badge, risk status badge, timestamp, and a link to view result details.

### `SavedNumberItem`
* **Used in:** Saved Numbers page (`/akun/nomor-tersimpan`)
* **Description:** Card or list item displaying saved phone number, report category, current risk status, saved date, and a "Hapus" button.

### `EmptyState`
* **Used in:** History, Saved Numbers, My Comments pages when no records exist.
* **Description:** Centered layout with muted icon, title, description, and action button.
