/**
 * Utility functions for validating and normalizing phone numbers in Cekriyin.id
 */

export interface PhoneValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
}

export interface CountryCodeInfo {
  countryCode: string;
  countryName: string;
  isHighRisk: boolean;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
}

/**
 * Mapping of known high-risk international calling codes frequently associated with online fraud/scams.
 */
export const highRiskCountryMap: Record<string, Omit<CountryCodeInfo, 'countryCode'>> = {
  '234': {
    countryName: 'Nigeria',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan modus 419 scam, penipuan hadiah, dan romance scam internasional.'
  },
  '855': {
    countryName: 'Kamboja',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan sindikat penipuan online (cyber scam) & judi online ilegal.'
  },
  '95': {
    countryName: 'Myanmar',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan sindikat penipuan online & modus lowongan kerja palsu luar negeri.'
  },
  '92': {
    countryName: 'Pakistan',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan penipuan WhatsApp & panggilan misterius luar negeri.'
  },
  '91': {
    countryName: 'India',
    isHighRisk: true,
    riskLevel: 'MEDIUM',
    description: 'Banyak terdeteksi spam call & pusat pendaftaran/layanan palsu.'
  },
  '233': {
    countryName: 'Ghana',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan modus penipuan internasional & klaim dana palsu.'
  },
  '254': {
    countryName: 'Kenya',
    isHighRisk: true,
    riskLevel: 'HIGH',
    description: 'Wilayah rawan penipuan SMS & telepon luar negeri.'
  },
  '63': {
    countryName: 'Filipina',
    isHighRisk: true,
    riskLevel: 'MEDIUM',
    description: 'Wilayah rawan spam & penipuan judi/kredit online.'
  },
  '84': {
    countryName: 'Vietnam',
    isHighRisk: true,
    riskLevel: 'MEDIUM',
    description: 'Wilayah rawan spam call & panggilan tak dikenal.'
  },
  '966': {
    countryName: 'Arab Saudi',
    isHighRisk: true,
    riskLevel: 'MEDIUM',
    description: 'Nomor luar negeri, sering digunakan modus penipuan visa/hadiah umrah/haji.'
  }
};

/**
 * Normalizes a phone number string.
 * Converts formats like:
 * - 081234567890 -> 6281234567890
 * - +6281234567890 -> 6281234567890
 * - +234 801 234 5678 -> 2348012345678
 * - 62 812-3456-7890 -> 6281234567890
 */
export function normalizePhoneNumber(input: string): string {
  if (!input) return '';

  // Clean string: remove spaces, dashes, parentheses, dots
  let cleaned = input.replace(/[\s\-\(\)\.]/g, '').trim();

  // If starts with +, remove +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  // If starts with 08, convert to Indonesian 628
  if (cleaned.startsWith('08')) {
    cleaned = '628' + cleaned.substring(2);
  }

  return cleaned;
}

/**
 * Identifies country information and high-risk status from a normalized phone number.
 */
export function getCountryCodeInfo(normalizedPhone: string): CountryCodeInfo | null {
  if (!normalizedPhone) return null;

  // Check if it's Indonesia (62)
  if (normalizedPhone.startsWith('62')) {
    return {
      countryCode: '62',
      countryName: 'Indonesia',
      isHighRisk: false,
      riskLevel: 'LOW',
      description: 'Nomor domestik Indonesia.'
    };
  }

  // Check against known high-risk country codes (ordered by prefix length long to short)
  const sortedCodes = Object.keys(highRiskCountryMap).sort((a, b) => b.length - a.length);

  for (const code of sortedCodes) {
    if (normalizedPhone.startsWith(code)) {
      const info = highRiskCountryMap[code];
      return {
        countryCode: code,
        ...info
      };
    }
  }

  // Other international country (not specifically listed in high-risk map)
  return {
    countryCode: 'INTL',
    countryName: 'Luar Negeri (Internasional)',
    isHighRisk: true,
    riskLevel: 'MEDIUM',
    description: 'Nomor telepon internasional dari luar Indonesia.'
  };
}

/**
 * Validates whether an input string is a valid phone number (Indonesian or International).
 */
export function validatePhoneNumber(input: string): PhoneValidationResult {
  if (!input || !input.trim()) {
    return {
      isValid: false,
      error: 'Masukkan nomor telepon yang ingin dicek.'
    };
  }

  const normalized = normalizePhoneNumber(input);

  // Valid phone numbers are digits between 7 and 15 characters
  const phoneRegex = /^\d{7,15}$/;

  if (!phoneRegex.test(normalized)) {
    return {
      isValid: false,
      error: 'Nomor telepon tidak valid. Masukkan nomor telepon yang benar (contoh: +62 812-3456-7890 atau 081234567890).'
    };
  }

  return {
    isValid: true,
    normalized
  };
}
