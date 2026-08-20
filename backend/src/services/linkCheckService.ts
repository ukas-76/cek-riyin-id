import { analyzeUrl, parseAndValidateUrl } from '../utils/urlDetector';
import { scamVerifyProvider } from '../providers/scamverifyProvider';
import { CheckRiskLevel, UnifiedCheckResult } from './numberCheckService';

export class LinkCheckService {
  /**
   * Analyzes a URL using ScamVerify URL Verification API with local URL analyzer fallback.
   */
  async checkLink(urlInput: string): Promise<UnifiedCheckResult> {
    const validation = parseAndValidateUrl(urlInput);

    if (!validation.valid) {
      throw new Error(validation.error || 'Format URL tidak valid.');
    }

    const trimmedInput = urlInput.trim();
    console.log(`\n==================================================`);
    console.log(`[CHECK_LINK_START] Input: "${trimmedInput}"`);

    // 1. Try Real ScamVerify URL Verification API
    const scamVerifyResponse = await scamVerifyProvider.analyzeUrl(trimmedInput);

    if (scamVerifyResponse.status === 'success' && scamVerifyResponse.result) {
      const scamVerifyResult = scamVerifyResponse.result;
      let title = 'Risiko Rendah';
      let description = scamVerifyResult.explanation || 'Analisis reputasi URL ScamVerify AI menunjukkan risiko rendah.';

      if (scamVerifyResult.riskSignal === 'HIGH') {
        title = 'Risiko Tinggi — Tautan Mencurigakan';
        description = scamVerifyResult.explanation || 'Sinyal reputasi ScamVerify AI menandai tautan ini memiliki indikasi phishing atau malware.';
      } else if (scamVerifyResult.riskSignal === 'MEDIUM') {
        title = 'Perlu Waspada — Indikasi Tautan';
        description = scamVerifyResult.explanation || 'Sinyal reputasi ScamVerify AI mengidentifikasi beberapa pola mencurigakan.';
      }

      console.log(`[CHECK_LINK_FINAL] riskLevel=${scamVerifyResult.riskSignal} | source=scamverify`);
      console.log(`==================================================\n`);

      return {
        type: 'link',
        input: trimmedInput,
        normalizedInput: validation.urlObj ? validation.urlObj.toString() : trimmedInput,
        riskLevel: scamVerifyResult.riskSignal,
        title,
        description,
        source: 'scamverify',
        confidence: 'high',
        providerScore: scamVerifyResult.score ?? null,
        providerLevel: scamVerifyResult.verdict,
        data: {
          score: scamVerifyResult.score ?? 0,
          parsedUrl: {
            protocol: validation.urlObj?.protocol,
            hostname: validation.urlObj?.hostname,
            pathname: validation.urlObj?.pathname
          }
        },
        indicators: scamVerifyResult.signals || []
      };
    }

    // 2. Fallback to Local URL Analyzer if ScamVerify is unconfigured/unavailable
    const localAnalysis = analyzeUrl(trimmedInput);
    console.log(`[LOCAL_URL_ANALYZER] Score: ${localAnalysis.score} | Risk: ${localAnalysis.riskLevel} | Indicators: [${localAnalysis.indicators.join(', ')}]`);

    let finalRisk: CheckRiskLevel = localAnalysis.riskLevel;
    let finalSource: UnifiedCheckResult['source'] = 'local_rules';
    let finalTitle = localAnalysis.title;
    let finalDesc = localAnalysis.description;

    if (scamVerifyResponse.status === 'error' && localAnalysis.score === 0) {
      finalRisk = 'UNKNOWN';
      finalSource = 'unknown';
      finalTitle = 'Tidak Dapat Menentukan';
      finalDesc = `Layanan verifikasi URL eksternal mengalami kendala (${scamVerifyResponse.errorMessage}) dan tidak ditemukan indikator lokal.`;
    }

    console.log(`[CHECK_LINK_FINAL] riskLevel=${finalRisk} | source=${finalSource}`);
    console.log(`==================================================\n`);

    return {
      type: 'link',
      input: trimmedInput,
      normalizedInput: validation.urlObj ? validation.urlObj.toString() : trimmedInput,
      riskLevel: finalRisk,
      title: finalTitle,
      description: finalDesc,
      source: finalSource,
      confidence: 'high',
      providerScore: localAnalysis.score,
      data: {
        score: localAnalysis.score,
        parsedUrl: localAnalysis.parsedUrl
      },
      indicators: localAnalysis.indicators
    };
  }
}

export const linkCheckService = new LinkCheckService();
