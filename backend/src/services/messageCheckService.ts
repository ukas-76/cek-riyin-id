import { analyzeMessage } from '../utils/messageDetector';
import { scamVerifyProvider } from '../providers/scamverifyProvider';
import { CheckRiskLevel, UnifiedCheckResult } from './numberCheckService';

export class MessageCheckService {
  /**
   * Analyzes WhatsApp or SMS message content using ScamVerify Text Analysis API with local rule fallback.
   */
  async checkMessage(messageText: string): Promise<UnifiedCheckResult> {
    const trimmedInput = messageText.trim();
    console.log(`\n==================================================`);
    console.log(`[CHECK_MESSAGE_START] Input: "${trimmedInput}"`);

    // 1. Try Real ScamVerify Text Analysis API
    const scamVerifyResponse = await scamVerifyProvider.analyzeText(trimmedInput);

    if (scamVerifyResponse.status === 'success' && scamVerifyResponse.result) {
      const scamVerifyResult = scamVerifyResponse.result;
      let title = 'Risiko Rendah';
      let description = scamVerifyResult.explanation || 'Hasil analisis teks ScamVerify AI menunjukkan risiko rendah.';

      if (scamVerifyResult.riskSignal === 'HIGH') {
        title = 'Risiko Tinggi — Terindikasi Penipuan';
        description = scamVerifyResult.explanation || 'Analisis ScamVerify AI mendeteksi pesan ini terindikasi kuat sebagai penipuan.';
      } else if (scamVerifyResult.riskSignal === 'MEDIUM') {
        title = 'Perlu Waspada — Indikasi Mencurigakan';
        description = scamVerifyResult.explanation || 'Analisis ScamVerify AI mengidentifikasi beberapa pola mencurigakan.';
      }

      console.log(`[CHECK_MESSAGE_FINAL] riskLevel=${scamVerifyResult.riskSignal} | source=scamverify`);
      console.log(`==================================================\n`);

      return {
        type: 'message',
        input: trimmedInput,
        normalizedInput: trimmedInput,
        riskLevel: scamVerifyResult.riskSignal,
        title,
        description,
        source: 'scamverify',
        confidence: 'high',
        providerScore: scamVerifyResult.score ?? null,
        providerLevel: scamVerifyResult.verdict,
        data: {
          score: scamVerifyResult.score ?? 0
        },
        indicators: scamVerifyResult.signals || []
      };
    }

    // 2. Fallback to Local Rule-Based Analyzer if ScamVerify is unconfigured/unavailable
    const localAnalysis = analyzeMessage(trimmedInput);
    console.log(`[LOCAL_MESSAGE_DETECTOR] Score: ${localAnalysis.score} | Risk: ${localAnalysis.riskLevel} | Indicators: [${localAnalysis.indicators.join(', ')}]`);

    let finalRisk: CheckRiskLevel = localAnalysis.riskLevel;
    let finalSource: UnifiedCheckResult['source'] = 'local_rules';
    let finalTitle = localAnalysis.title;
    let finalDesc = localAnalysis.description;

    if (scamVerifyResponse.status === 'error' && localAnalysis.score === 0) {
      // ScamVerify call failed with HTTP error AND local rule engine found no indicators -> UNKNOWN
      finalRisk = 'UNKNOWN';
      finalSource = 'unknown';
      finalTitle = 'Tidak Dapat Menentukan';
      finalDesc = `Layanan analisis AI eksternal mengalami kendala (${scamVerifyResponse.errorMessage}) dan tidak ditemukan indikator lokal.`;
    }

    console.log(`[CHECK_MESSAGE_FINAL] riskLevel=${finalRisk} | source=${finalSource}`);
    console.log(`==================================================\n`);

    return {
      type: 'message',
      input: trimmedInput,
      normalizedInput: trimmedInput,
      riskLevel: finalRisk,
      title: finalTitle,
      description: finalDesc,
      source: finalSource,
      confidence: 'high',
      providerScore: localAnalysis.score,
      data: {
        score: localAnalysis.score
      },
      indicators: localAnalysis.indicators
    };
  }
}

export const messageCheckService = new MessageCheckService();
