import { pool } from '../db';
import { normalizePhoneNumber, getCountryCodeInfo } from '../utils/phoneUtils';
import { telesignProvider } from '../providers/telesignProvider';

export type CheckRiskLevel = 'NO_REPORT' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface UnifiedCheckResult {
  type: 'number' | 'message' | 'link';
  input: string;
  normalizedInput: string;
  riskLevel: CheckRiskLevel;
  title: string;
  description: string;
  source: 'telesign' | 'scamverify' | 'local_report' | 'local_rules' | 'combined' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  providerScore?: number | null;
  providerLevel?: string | null;
  providerRecommendation?: string | null;
  data: {
    reportCount?: number;
    categories?: string[];
    score?: number;
    [key: string]: any;
  };
  indicators: string[];
}

export class NumberCheckService {
  /**
   * Performs reputation lookup on phone numbers combining local reports, country risk rules, and Telesign Intelligence Cloud.
   */
  async checkNumber(rawInput: string): Promise<UnifiedCheckResult> {
    const normalizedInput = normalizePhoneNumber(rawInput);
    console.log(`\n==================================================`);
    console.log(`[CHECK_NUMBER_START] Input: ${rawInput} -> Normalized: ${normalizedInput}`);

    // 0. Country Code Analysis
    const countryInfo = getCountryCodeInfo(normalizedInput);
    console.log(`[COUNTRY_ANALYSIS] Country: ${countryInfo?.countryName || 'Unknown'} | HighRisk: ${countryInfo?.isHighRisk} | Code: +${countryInfo?.countryCode}`);

    // 1. Local Database Lookup
    let reports: any[] = [];
    try {
      const dbRes = await pool.query(
        'SELECT * FROM phone_reports WHERE phone_number = $1 OR phone_number = $2 OR phone_number = $3',
        [normalizedInput, rawInput.trim(), '0' + normalizedInput.substring(3)]
      );
      reports = dbRes.rows;
    } catch (e: any) {
      console.warn('[LOCAL_DB] Database lookup skipped:', e.message);
    }

    const reportCount = reports.length;
    const categoriesSet = new Set<string>();
    reports.forEach((r) => {
      if (r.category) categoriesSet.add(r.category);
    });
    const categories = Array.from(categoriesSet);
    console.log(`[LOCAL_DB] Phone Reports Found: ${reportCount} (Categories: ${categories.join(', ') || 'None'})`);

    // 2. Real Telesign Intelligence Cloud Call
    const telesignResponse = await telesignProvider.checkNumber(normalizedInput);

    // 3. Risk Aggregation & Decision Logic
    let riskLevel: CheckRiskLevel = 'NO_REPORT';
    let title = 'Belum Ada Laporan';
    let description = 'Belum ditemukan laporan terkait nomor ini di Cekriyin.';
    let source: UnifiedCheckResult['source'] = 'local_report';
    let confidence: UnifiedCheckResult['confidence'] = 'high';
    const indicators: string[] = [];

    const telesignResult = telesignResponse.status === 'success' ? telesignResponse.result : null;

    if (telesignResult) {
      const hasTelesignHigh = telesignResult.riskSignal === 'HIGH';
      const hasTelesignMedium = telesignResult.riskSignal === 'MEDIUM';
      const hasTelesignLow = telesignResult.riskSignal === 'LOW';

      if (reportCount >= 3 || hasTelesignHigh) {
        riskLevel = 'HIGH';
        title = 'Risiko Tinggi';
        description = 'Nomor ini memiliki indikasi penipuan berdasarkan sinyal Telesign Intelligence / laporan komunitas.';
        confidence = 'high';
        source = reportCount >= 3 && telesignResult ? 'combined' : 'telesign';

        if (reportCount > 0) indicators.push(`Terdapat ${reportCount} laporan penipuan dari komunitas`);
        indicators.push(`Sinyal Telesign Score: ${telesignResult.score}/1000 (${telesignResult.recommendation})`);
      } else if (reportCount >= 1 || hasTelesignMedium) {
        riskLevel = 'MEDIUM';
        title = 'Perlu Waspada';
        description = 'Terdapat beberapa indikasi atau laporan yang perlu diperhatikan terkait nomor ini.';
        confidence = 'medium';
        source = reportCount > 0 ? 'combined' : 'telesign';

        if (reportCount > 0) indicators.push(`Terdapat ${reportCount} laporan dari komunitas`);
        indicators.push(`Sinyal Telesign Score: ${telesignResult.score}/1000 (${telesignResult.recommendation})`);
      } else if (hasTelesignLow && reportCount === 0) {
        riskLevel = 'LOW';
        title = 'Risiko Rendah';
        description = 'Sinyal Telesign Intelligence menunjukkan tingkat risiko rendah.';
        source = 'telesign';
        confidence = 'medium';
        indicators.push(`Sinyal Telesign Score: ${telesignResult.score}/1000 (${telesignResult.recommendation})`);
      }
    } else if (telesignResponse.status === 'error') {
      console.warn(`[CHECK_NUMBER] Provider call failed: ${telesignResponse.errorMessage}`);
      if (reportCount >= 3) {
        riskLevel = 'HIGH';
        title = 'Risiko Tinggi';
        description = `Terdapat ${reportCount} laporan penipuan pada database komunitas (Layanan eksternal mengalami kendala).`;
        source = 'local_report';
        indicators.push(`Terdapat ${reportCount} laporan penipuan dari komunitas`);
      } else if (reportCount >= 1) {
        riskLevel = 'MEDIUM';
        title = 'Perlu Waspada';
        description = `Terdapat ${reportCount} laporan pada database komunitas (Layanan eksternal mengalami kendala).`;
        source = 'local_report';
        indicators.push(`Terdapat ${reportCount} laporan dari komunitas`);
      } else {
        riskLevel = 'UNKNOWN';
        title = 'Tidak Dapat Menentukan';
        description = `Layanan verifikasi reputasi eksternal mengalami kendala (${telesignResponse.errorMessage}) dan belum ada laporan komunitas.`;
        source = 'unknown';
        confidence = 'low';
      }
    } else {
      // Telesign unconfigured & DB lookup
      if (reportCount >= 3) {
        riskLevel = 'HIGH';
        title = 'Risiko Tinggi';
        description = `Terdapat ${reportCount} laporan penipuan terkait nomor ini pada database komunitas.`;
        source = 'local_report';
        indicators.push(`Terdapat ${reportCount} laporan penipuan dari komunitas`);
      } else if (reportCount >= 1) {
        riskLevel = 'MEDIUM';
        title = 'Perlu Waspada';
        description = `Terdapat ${reportCount} laporan terkait nomor ini pada database komunitas.`;
        source = 'local_report';
        indicators.push(`Terdapat ${reportCount} laporan dari komunitas`);
      } else {
        riskLevel = 'NO_REPORT';
        title = 'Belum Ada Laporan';
        description = 'Belum ditemukan laporan terkait nomor ini pada database komunitas.';
        source = 'local_report';
        confidence = 'medium';
      }
    }

    // 4. Override / Enhance with Country Code Risk Rules
    if (countryInfo && countryInfo.isHighRisk) {
      if (countryInfo.riskLevel === 'HIGH') {
        if (riskLevel !== 'HIGH') {
          riskLevel = 'HIGH';
          title = `Risiko Tinggi — Nomor Luar Negeri (${countryInfo.countryName})`;
          description = `Nomor ini berasal dari negara ${countryInfo.countryName} (+${countryInfo.countryCode}). ${countryInfo.description}`;
          source = 'local_rules';
        }
        indicators.unshift(`Peringatan Nomor Luar Negeri Rawan Fraud (${countryInfo.countryName} +${countryInfo.countryCode}): ${countryInfo.description}`);
      } else if (countryInfo.riskLevel === 'MEDIUM') {
        if (riskLevel === 'NO_REPORT' || riskLevel === 'LOW') {
          riskLevel = 'MEDIUM';
          title = `Perlu Waspada — Nomor Luar Negeri (${countryInfo.countryName})`;
          description = `Nomor ini terdeteksi berasal dari luar Indonesia (${countryInfo.countryName}). Selalu berhati-hati saat berinteraksi dengan nomor internasional asing.`;
          source = 'local_rules';
        }
        indicators.unshift(`Catatan Nomor Luar Negeri (${countryInfo.countryName} +${countryInfo.countryCode}): ${countryInfo.description}`);
      }
    }

    console.log(`[CHECK_NUMBER_FINAL] riskLevel=${riskLevel} | source=${source} | indicatorsCount=${indicators.length}`);
    console.log(`==================================================\n`);

    return {
      type: 'number',
      input: rawInput.trim(),
      normalizedInput,
      riskLevel,
      title,
      description,
      source,
      confidence,
      providerScore: telesignResult ? telesignResult.score : null,
      providerLevel: telesignResult ? telesignResult.level : null,
      providerRecommendation: telesignResult ? telesignResult.recommendation : null,
      data: {
        reportCount,
        categories
      },
      indicators
    };
  }
}

export const numberCheckService = new NumberCheckService();
