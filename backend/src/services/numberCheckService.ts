import { pool } from '../db';
import { normalizePhoneNumber, getCountryCodeInfo } from '../utils/phoneUtils';
import { kredibelProvider } from '../providers/kredibelProvider';
import { veriphoneProvider } from '../providers/veriphoneProvider';
import { abstractApiProvider } from '../providers/abstractApiProvider';
import { telesignProvider } from '../providers/telesignProvider';

export type CheckRiskLevel = 'NO_REPORT' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface UnifiedCheckResult {
  type: 'number' | 'message' | 'link';
  input: string;
  normalizedInput: string;
  riskLevel: CheckRiskLevel;
  title: string;
  description: string;
  source: 'kredibel' | 'veriphone' | 'abstract_api' | 'telesign' | 'scamverify' | 'local_report' | 'local_rules' | 'combined' | 'unknown';
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
   * Performs reputation lookup on phone numbers combining local reports, Kredibel.co.id, Veriphone, AbstractAPI, and Telesign.
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

    // 2. Real External Provider Lookup (Priority 1: Kredibel, Priority 2: Veriphone, Priority 3: AbstractAPI, Priority 4: Telesign)
    let apiProviderResult: {
      providerName: 'kredibel' | 'veriphone' | 'abstract_api' | 'telesign';
      riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
      score?: number;
      type?: string;
      carrier?: string;
      details?: string;
    } | null = null;

    let providerErrorMessage: string | undefined;

    if (kredibelProvider.isConfigured()) {
      const kredibelRes = await kredibelProvider.checkNumber(normalizedInput);
      if (kredibelRes.status === 'success' && kredibelRes.result) {
        apiProviderResult = {
          providerName: 'kredibel',
          riskSignal: kredibelRes.result.riskSignal,
          score: kredibelRes.result.reportCount,
          details: `Kredibel.co.id Fraud DB (${kredibelRes.result.reportCount} Laporan Penipuan)`
        };
      } else if (kredibelRes.status === 'error') {
        providerErrorMessage = kredibelRes.errorMessage;
      }
    } else if (veriphoneProvider.isConfigured()) {
      const veriphoneRes = await veriphoneProvider.checkNumber(normalizedInput);
      if (veriphoneRes.status === 'success' && veriphoneRes.result) {
        apiProviderResult = {
          providerName: 'veriphone',
          riskSignal: veriphoneRes.result.riskSignal,
          type: veriphoneRes.result.phoneType,
          carrier: veriphoneRes.result.carrier,
          details: `Veriphone API (Tipe: ${veriphoneRes.result.phoneType.toUpperCase()}, Operator: ${veriphoneRes.result.carrier}, Negara: ${veriphoneRes.result.country})`
        };
      } else if (veriphoneRes.status === 'error') {
        providerErrorMessage = veriphoneRes.errorMessage;
      }
    } else if (abstractApiProvider.isConfigured()) {
      const abstractRes = await abstractApiProvider.checkNumber(normalizedInput);
      if (abstractRes.status === 'success' && abstractRes.result) {
        apiProviderResult = {
          providerName: 'abstract_api',
          riskSignal: abstractRes.result.riskSignal,
          score: Math.round(abstractRes.result.qualityScore * 100),
          type: abstractRes.result.type,
          carrier: abstractRes.result.carrier,
          details: `AbstractAPI Phone Validation (Tipe: ${abstractRes.result.type}, Operator: ${abstractRes.result.carrier})`
        };
      } else if (abstractRes.status === 'error') {
        providerErrorMessage = abstractRes.errorMessage;
      }
    } else if (telesignProvider.isConfigured()) {
      const telesignRes = await telesignProvider.checkNumber(normalizedInput);
      if (telesignRes.status === 'success' && telesignRes.result) {
        apiProviderResult = {
          providerName: 'telesign',
          riskSignal: telesignRes.result.riskSignal,
          score: telesignRes.result.score,
          details: `Telesign Intelligence (Score: ${telesignRes.result.score}, Recommendation: ${telesignRes.result.recommendation})`
        };
      } else if (telesignRes.status === 'error') {
        providerErrorMessage = telesignRes.errorMessage;
      }
    }

    // 3. Risk Aggregation & Decision Logic
    let riskLevel: CheckRiskLevel = 'NO_REPORT';
    let title = 'Belum Ada Laporan';
    let description = 'Belum ditemukan laporan terkait nomor ini di Cekriyin.';
    let source: UnifiedCheckResult['source'] = 'local_report';
    let confidence: UnifiedCheckResult['confidence'] = 'high';
    const indicators: string[] = [];

    if (apiProviderResult) {
      const isHigh = apiProviderResult.riskSignal === 'HIGH';
      const isMedium = apiProviderResult.riskSignal === 'MEDIUM';
      const isLow = apiProviderResult.riskSignal === 'LOW';

      const providerLabel = apiProviderResult.providerName === 'kredibel' ? 'Kredibel.co.id' : apiProviderResult.providerName === 'veriphone' ? 'Veriphone' : apiProviderResult.providerName === 'abstract_api' ? 'AbstractAPI' : 'Telesign';

      if (reportCount >= 3 || isHigh) {
        riskLevel = 'HIGH';
        title = 'Risiko Tinggi';
        description = `Nomor ini memiliki indikasi penipuan/risiko berdasarkan sinyal ${providerLabel} & laporan komunitas.`;
        confidence = 'high';
        source = reportCount >= 3 ? 'combined' : apiProviderResult.providerName;

        if (reportCount > 0) indicators.push(`Terdapat ${reportCount} laporan penipuan dari komunitas`);
        if (apiProviderResult.details) indicators.push(apiProviderResult.details);
      } else if (reportCount >= 1 || isMedium) {
        riskLevel = 'MEDIUM';
        title = 'Perlu Waspada';
        description = 'Terdapat beberapa indikasi atau laporan yang perlu diperhatikan terkait nomor ini.';
        confidence = 'medium';
        source = reportCount > 0 ? 'combined' : apiProviderResult.providerName;

        if (reportCount > 0) indicators.push(`Terdapat ${reportCount} laporan dari komunitas`);
        if (apiProviderResult.details) indicators.push(apiProviderResult.details);
      } else if (isLow && reportCount === 0) {
        riskLevel = 'LOW';
        title = 'Risiko Rendah';
        description = `Sinyal verifikasi ${providerLabel} menunjukkan status nomor valid dan tingkat risiko rendah.`;
        source = apiProviderResult.providerName;
        confidence = 'medium';
        if (apiProviderResult.details) indicators.push(apiProviderResult.details);
      }
    } else if (providerErrorMessage) {
      console.warn(`[CHECK_NUMBER] Provider call failed: ${providerErrorMessage}`);
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
        description = `Layanan verifikasi reputasi eksternal mengalami kendala (${providerErrorMessage}) dan belum ada laporan komunitas.`;
        source = 'unknown';
        confidence = 'low';
      }
    } else {
      // All API Providers unconfigured -> Use Local DB Lookup & Country Rules
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
      providerScore: apiProviderResult ? apiProviderResult.score : null,
      providerLevel: apiProviderResult ? apiProviderResult.type : null,
      providerRecommendation: apiProviderResult ? apiProviderResult.carrier : null,
      data: {
        reportCount,
        categories,
        carrier: apiProviderResult?.carrier,
        phoneType: apiProviderResult?.type
      },
      indicators
    };
  }
}

export const numberCheckService = new NumberCheckService();
