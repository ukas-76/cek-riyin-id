/**
 * Modular Rule-Based Message Detector for Cekriyin.id
 * Enhanced for Indonesian Scam Patterns (APK Malware, Package/Courier Fraud, OTP, Financial, Urgency).
 */

export interface MessageIndicator {
  code: string;
  label: string;
  description: string;
  weight: number;
}

export interface MessageAnalysisResult {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  description: string;
  indicators: string[];
  detailedIndicators: MessageIndicator[];
}

// Rule definitions with Indonesian scam patterns
const MESSAGE_RULES: { [key: string]: { label: string; description: string; weight: number; regex: RegExp } } = {
  APK_MALWARE: {
    label: 'Bahaya File Aplikasi (.APK)',
    description: 'Pesan menyertakan file aplikasi (.APK) yang berpotensi mencuri data/SMS/OTP dari HP.',
    weight: 4,
    regex: /\b[a-zA-Z0-9_-]+\.apk\b|\b\.apk\b|\b[a-zA-Z0-9_-]+_apk\b|lacak_paket|undangan_pernikahan|surat_tilang|cek_resi/i,
  },
  PACKAGE_COURIER_SCAM: {
    label: 'Indikasi Penipuan Paket / Kurir / Resi',
    description: 'Pesan menggunakan modus kendala pengiriman paket, resi terhambat, atau kurir palsu.',
    weight: 3,
    regex: /\b(paket|resi|no\. resi|nomor resi|terhambat|transit|kurir|ekspedisi|lacak paket|surat tilang|undangan pernikahan|tagihan listrik)\b/i,
  },
  OTP_REQUEST: {
    label: 'Meminta OTP / Kode Keamanan',
    description: 'Pesan meminta kode OTP, PIN, password, CVV, atau verifikasi rahasia.',
    weight: 3,
    regex: /\b(otp|kode otp|kode verifikasi|pin|password|sandi|cvv|pasword|kata sandi)\b/i,
  },
  SENSITIVE_DATA: {
    label: 'Meminta Data Pribadi / Perbankan',
    description: 'Pesan meminta NIK, nomor KTP, nomor rekening, atau data perbankan.',
    weight: 3,
    regex: /\b(nik|no\. ktp|nomor KTP|no\. rekening|nomor rekening|data pribadi|foto ktp|bca|mandiri|bri|bni)\b/i,
  },
  APP_DOWNLOAD_INSTRUCTION: {
    label: 'Instruksi Unduh / Install Aplikasi',
    description: 'Pesan menginstruksikan pengguna untuk memasang file atau aplikasi luar.',
    weight: 2,
    regex: /\b(unduh|download|pasang|install|aplikasi|file|unduh file|buka file|aplikasi resmi)\b/i,
  },
  FINANCIAL_REQUEST: {
    label: 'Indikasi Permintaan Transfer / Uang',
    description: 'Pesan meminta transfer uang, bayar admin, uang muka, atau pengisian saldo.',
    weight: 2,
    regex: /\b(transfer|bayar|biaya admin|uang muka|dp|kirim uang|saldo|rekening|isi saldo|biaya pencairan)\b/i,
  },
  PRIZE_SCAM: {
    label: 'Tawaran Hadiah / Undian Palsu',
    description: 'Pesan mengklaim kemenangan undian, hadiah uang, giveaway, atau bonus tak terduga.',
    weight: 2,
    regex: /\b(hadiah|menang|undian|giveaway|selamat anda|pemenang|dapat rp|saldo gratis|bonus rp)\b/i,
  },
  URGENCY_THREAT: {
    label: 'Bahasa Mendesak / Mengancam',
    description: 'Pesan menekan pengguna dengan ancaman pemblokiran akun atau batas waktu mendadak.',
    weight: 2,
    regex: /\b(segera|sekarang|hari ini juga|batas waktu|terakhir|dibloke?r|ditutup|terblokir|ancaman|tindak lanjut|1x24 jam|24 jam)\b/i,
  },
  EMBEDDED_URL: {
    label: 'Tautan Mencurigakan Dalam Pesan',
    description: 'Pesan menyertakan link/tautan website yang perlu diwaspadai.',
    weight: 2,
    regex: /(https?:\/\/[^\s]+|bit\.ly\/[^\s]+|tinyurl\.com\/[^\s]+|t\.me\/[^\s]+|wa\.me\/[^\s]+)/i,
  },
  SUSPICIOUS_ACTION: {
    label: 'Instruksi Tindakan Mencurigakan',
    description: 'Pesan menginstruksikan pengguna untuk mengklik tautan atau mengonfirmasi data.',
    weight: 1,
    regex: /\b(klik|kllick|login|verifikasi|kirim kode|konfirmasi|hubungi no|hubungi wa)\b/i,
  },
};

/**
 * Analyzes a text message for scam patterns using deterministic rules.
 */
export function analyzeMessage(text: string): MessageAnalysisResult {
  if (!text || !text.trim()) {
    return {
      score: 0,
      riskLevel: 'LOW',
      title: 'Tidak Ditemukan Pola Mencurigakan',
      description: 'Pesan kosong atau tidak dapat dianalisis.',
      indicators: [],
      detailedIndicators: [],
    };
  }

  let totalScore = 0;
  const matchedIndicators: string[] = [];
  const detailedIndicators: MessageIndicator[] = [];

  for (const [code, rule] of Object.entries(MESSAGE_RULES)) {
    if (rule.regex.test(text)) {
      totalScore += rule.weight;
      matchedIndicators.push(rule.label);
      detailedIndicators.push({
        code,
        label: rule.label,
        description: rule.description,
        weight: rule.weight,
      });
    }
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let title = 'Risiko Rendah';
  let description = 'Tidak ditemukan pola mencurigakan yang kuat pada pesan ini.';

  if (totalScore >= 4) {
    riskLevel = 'HIGH';
    title = 'Risiko Tinggi — Terindikasi Penipuan / Malware';
    description = 'Pesan ini mengandung indikasi kuat modus penipuan atau penyebaran file berbahaya (.APK).';
  } else if (totalScore >= 1) {
    riskLevel = 'MEDIUM';
    title = 'Perlu Waspada — Indikasi Mencurigakan';
    description = 'Terdapat beberapa indikasi atau frasa yang perlu diwaspadai dalam pesan ini.';
  }

  return {
    score: totalScore,
    riskLevel,
    title,
    description,
    indicators: matchedIndicators,
    detailedIndicators,
  };
}
