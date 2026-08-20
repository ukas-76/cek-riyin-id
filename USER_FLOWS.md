# USER FLOWS — CEKRIYIN.ID

This document outlines the user interaction flows supported by **Cekriyin.id** based on the PRD and UI designs.

---

## 1. Flow: Anonymous Checking (Core Product Loop)

```text
+-----------------------+
|  User Opens Website   |
|   (Cekriyin.id `/`)   |
+-----------+-----------+
            |
            v
+-----------------------+
| Select Checking Mode  |
| (Nomor|Pesan|Tautan)  |
+-----------+-----------+
            |
            v
+-----------------------+
| Paste / Enter Input   |
|  (Data to verify)     |
+-----------+-----------+
            |
            v
+-----------------------+
| Click "Cek Sekarang"  |
|  (POST /api/check)    |
+-----------+-----------+
            |
            v
+-----------------------+
| View Check Result     |
| (Risk Level Status &  |
| Indicators / Reports) |
+-----------------------+
```

### Description:
1. User opens Cekriyin.id homepage. No login is required.
2. User selects the checking mode: `Nomor`, `Pesan`, or `Tautan`.
3. User pastes or types the input into the textarea.
4. User clicks "Cek Sekarang".
5. Backend processes request via rule-based detection or database report matching.
6. System displays the result page with risk status (`Tidak Ditemukan Laporan`, `Perlu Waspada`, or `Risiko Tinggi`), report counts, or rule indicators.

---

## 2. Flow: User Authentication (Login & Register)

### 2.1 Registration
```text
Homepage / Header -> Click "Daftar" -> Navigate to `/daftar`
 -> Input Email & Password & Password Confirmation
 -> Submit (POST /api/auth/register)
 -> Account Created & Auto-Login / Redirect to Homepage
```

### 2.2 Login
```text
Homepage / Header -> Click "Masuk" -> Navigate to `/masuk`
 -> Input Email & Password
 -> Submit (POST /api/auth/login)
 -> Authenticated Session Established
 -> Redirect to Homepage or Previous Page
```

---

## 3. Flow: Authenticated Checking & Personal Features

```text
+------------------------+
|  Logged-In User Checks |
|   (POST /api/check)    |
+-----------+------------+
            |
            +-----------------------+------------------------+
            |                       |                        |
            v                       v                        v
+-----------------------+ +--------------------+ +-----------------------+
| Check Auto-Saved to   | | Click "Simpan      | | Submit Comment on     |
| User History          | | Nomor" (Number)    | | Result Page           |
| (GET /api/history)    | | (POST /api/saved)  | | (POST /api/comments)  |
+-----------------------+ +---------+----------+ +-----------+-----------+
                                    |                        |
                                    v                        v
                          +--------------------+ +-----------------------+
                          | View in "Nomor     | | View in "Komentar     |
                          | Tersimpan" Account | | Saya" Account Page    |
                          | Page (`/akun/...`) | | (`/akun/komentar`)   |
                          +--------------------+ +-----------------------+
```

### Description:
* **Automatic History:** When an authenticated user performs any check, the query and result are automatically saved to their history (`checks.user_id` populated).
* **Save Number:** On a number result page, an authenticated user can click "Simpan Nomor". If an anonymous user clicks it, they are prompted to log in. Saved numbers can be viewed and deleted in `/akun/nomor-tersimpan`.
* **Comment:** On any result page (number, message, or link), an authenticated user can post a comment. Comments appear on the result page and under `/akun/komentar`.

---

## 4. Flow: Account Management

```text
Logged-In User -> Click Account Header -> Navigate to `/akun/riwayat`
 -> Switch between tabs:
    - [Riwayat Pengecekan] -> View past checks & click to view detail
    - [Nomor Tersimpan]    -> View bookmarked numbers & delete item
    - [Komentar Saya]      -> View user's submitted comments
```
