/**
 * Modular Rule-Based URL Analyzer for Cekriyin.id
 */

export interface UrlIndicator {
  code: string;
  label: string;
  description: string;
  weight: number;
}

export interface UrlAnalysisResult {
  score: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  title: string;
  description: string;
  indicators: string[];
  detailedIndicators: UrlIndicator[];
  parsedUrl?: {
    protocol: string;
    hostname: string;
    pathname: string;
  };
}

/**
 * Validates and normalizes URL string for analysis.
 */
export function parseAndValidateUrl(input: string): { valid: boolean; urlObj?: URL; error?: string } {
  if (!input || !input.trim()) {
    return { valid: false, error: 'Masukkan link / URL yang ingin dicek.' };
  }

  let cleaned = input.trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'http://' + cleaned;
  }

  try {
    const urlObj = new URL(cleaned);
    if (!urlObj.hostname || !urlObj.hostname.includes('.')) {
      // Check if raw IP
      const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(urlObj.hostname);
      if (!isIp && urlObj.hostname !== 'localhost') {
        return { valid: false, error: 'Format domain / URL tidak valid.' };
      }
    }
    return { valid: true, urlObj };
  } catch (err) {
    return { valid: false, error: 'Format URL tidak valid. Gunakan format (contoh: https://example.com).' };
  }
}

/**
 * Analyzes a URL for suspicious structural patterns.
 */
export function analyzeUrl(input: string): UrlAnalysisResult {
  const validation = parseAndValidateUrl(input);

  if (!validation.valid || !validation.urlObj) {
    return {
      score: 0,
      riskLevel: 'LOW',
      title: 'Format URL Tidak Valid',
      description: validation.error || 'URL tidak dapat dianalisis.',
      indicators: [],
      detailedIndicators: [],
    };
  }

  const urlObj = validation.urlObj;
  const hostname = urlObj.hostname.toLowerCase();
  const fullUrl = urlObj.toString().toLowerCase();
  const pathname = urlObj.pathname.toLowerCase();

  let totalScore = 0;
  const indicators: string[] = [];
  const detailedIndicators: UrlIndicator[] = [];

  // Rule 1: Host is an IP address
  const isIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  if (isIpHost) {
    totalScore += 3;
    indicators.push('Host Menggunakan IP Address');
    detailedIndicators.push({
      code: 'IP_HOST',
      label: 'Host Menggunakan IP Address',
      description: 'URL menggunakan alamat IP langsung, bukan nama domain resmi.',
      weight: 3,
    });
  }

  // Rule 2: Credential & Login Path Triggers
  const credentialPathRegex = /\b(login|masuk|verify|verifikasi|akun|account|password|sandi|security|keamanan|bca|mandiri|bri|bni|gopay|ovo|dana)\b/i;
  if (credentialPathRegex.test(pathname) || credentialPathRegex.test(urlObj.search)) {
    totalScore += 2;
    indicators.push('Path Mengarah ke Halaman Login / Verifikasi');
    detailedIndicators.push({
      code: 'CREDENTIAL_PATH',
      label: 'Path Mengarah ke Halaman Login / Verifikasi',
      description: 'Struktur URL mengandung kata kunci sensitif seperti login, verifikasi, atau perbankan.',
      weight: 2,
    });
  }

  // Rule 3: Prize & Claim Path Triggers
  const claimPathRegex = /\b(claim|hadiah|undian|giveaway|bonus|promo|menang|reward)\b/i;
  if (claimPathRegex.test(pathname) || claimPathRegex.test(urlObj.search)) {
    totalScore += 2;
    indicators.push('Struktur URL Terindikasi Klaim Hadiah');
    detailedIndicators.push({
      code: 'CLAIM_PATH',
      label: 'Struktur URL Terindikasi Klaim Hadiah',
      description: 'Struktur URL mengarah pada klaim hadiah atau bonus tak resmi.',
      weight: 2,
    });
  }

  // Rule 4: URL Obfuscation (@ symbol or excessive percent encoding)
  if (fullUrl.includes('@') || (fullUrl.match(/%[0-9a-f]{2}/gi) || []).length > 3) {
    totalScore += 2;
    indicators.push('URL Menggunakan Obfuscation / Karakter Samaran');
    detailedIndicators.push({
      code: 'URL_OBFUSCATION',
      label: 'URL Menggunakan Obfuscation / Karakter Samaran',
      description: 'URL menggunakan simbol @ atau encoding berlebihan untuk menyamarkan tujuan asli.',
      weight: 2,
    });
  }

  // Rule 5: Suspicious TLD / Domain Subdomain Stacking
  const parts = hostname.split('.');
  if (parts.length > 3 && !hostname.endsWith('.co.id') && !hostname.endsWith('.go.id') && !hostname.endsWith('.ac.id')) {
    totalScore += 1;
    indicators.push('Penggunaan Subdomain Berlebihan');
    detailedIndicators.push({
      code: 'EXCESSIVE_SUBDOMAINS',
      label: 'Penggunaan Subdomain Berlebihan',
      description: 'URL memiliki banyak level subdomain yang berpotensi meniru nama brand resmi.',
      weight: 1,
    });
  }

  // Rule 6: Suspicious Free/Unusual TLDs
  const suspiciousTlds = ['.xyz', '.top', '.online', '.site', '.club', '.tk', '.ml', '.ga', '.cf', '.gq', '.rf.gd'];
  if (suspiciousTlds.some((tld) => hostname.endsWith(tld))) {
    totalScore += 1;
    indicators.push('Penggunaan Domain TLD Tidak Umum');
    detailedIndicators.push({
      code: 'SUSPICIOUS_TLD',
      label: 'Penggunaan Domain TLD Tidak Umum',
      description: 'Menggunakan domain level atas (TLD) gratis/murah yang sering disalahgunakan.',
      weight: 1,
    });
  }

  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  let title = 'Risiko Rendah';
  let description = 'Tidak ditemukan pola URL mencurigakan yang kuat.';

  if (totalScore >= 4) {
    riskLevel = 'HIGH';
    title = 'Risiko Tinggi — Tautan Mencurigakan';
    description = 'Tautan ini memiliki beberapa karakteristik struktur yang berpotensi berbahaya atau menipu.';
  } else if (totalScore >= 2) {
    riskLevel = 'MEDIUM';
    title = 'Perlu Waspada — Indikasi Tautan';
    description = 'Terdapat beberapa indikasi pada struktur tautan yang memerlukan kewaspadaan sebelum diklik.';
  }

  return {
    score: totalScore,
    riskLevel,
    title,
    description,
    indicators,
    detailedIndicators,
    parsedUrl: {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname,
    },
  };
}
