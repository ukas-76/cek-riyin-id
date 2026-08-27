export interface ScamVerifyAnalysisResult {
  providerName: string;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  verdict: string;
  score?: number;
  explanation?: string;
  signals?: string[];
  rawResponse?: any;
}

export interface ScamVerifyResponseWrapper {
  status: 'success' | 'unconfigured' | 'error';
  statusCode?: number;
  errorMessage?: string;
  result?: ScamVerifyAnalysisResult;
}

export class ScamVerifyProvider {
  public isConfigured(): boolean {
    const key = process.env.SCAMVERIFY_API_KEY;
    return !!(key && key.trim() !== '');
  }

  private get apiKey(): string | null {
    const key = process.env.SCAMVERIFY_API_KEY;
    if (!key || key.trim() === '') {
      return null;
    }
    return key.trim();
  }

  private get baseUrl(): string {
    return process.env.SCAMVERIFY_API_BASE_URL || 'https://scamverify.ai/api/v1';
  }

  /**
   * Helper to map ScamVerify verdict string to Cekriyin risk signal.
   */
  private mapVerdictToRiskSignal(verdictStr: string, score?: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' {
    const lower = (verdictStr || '').toLowerCase();
    if (lower.includes('high') || lower.includes('danger') || lower.includes('scam')) {
      return 'HIGH';
    }
    if (lower.includes('medium') || lower.includes('warning') || lower.includes('suspicious')) {
      return 'MEDIUM';
    }
    if (lower.includes('low') || lower.includes('safe') || lower.includes('clean')) {
      return 'LOW';
    }
    if (score !== undefined) {
      if (score >= 70) return 'HIGH';
      if (score >= 40) return 'MEDIUM';
      if (score >= 0) return 'LOW';
    }
    return 'UNKNOWN';
  }

  /**
   * Performs real HTTP POST request to ScamVerify Text Analysis API.
   * Endpoint: POST https://scamverify.ai/api/v1/text/analyze
   */
  async analyzeText(text: string): Promise<ScamVerifyResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[SCAMVERIFY_TEXT] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const key = this.apiKey;
    if (!key) {
      console.log('[SCAMVERIFY_TEXT] Missing API key. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const endpoint = `${this.baseUrl}/text/analyze`;
    console.log(`[SCAMVERIFY_TEXT] [REQUEST] Endpoint: ${endpoint}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ message: text, text, input: text })
      });

      console.log(`[SCAMVERIFY_TEXT] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[SCAMVERIFY_TEXT] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[SCAMVERIFY_TEXT] [RESPONSE PARSED]:', JSON.stringify(data));

      const verdict = data.verdict || data.risk_level || data.result || 'unknown';
      const score = data.risk_score ?? data.score;
      const explanation = data.explanation || data.description;
      const signals = data.signals || data.indicators || [];

      const riskSignal = this.mapVerdictToRiskSignal(verdict, score);
      console.log(`[SCAMVERIFY_TEXT] [MAPPED RISK]: ${riskSignal} (Verdict: ${verdict}, Score: ${score})`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'scamverify',
          riskSignal,
          verdict,
          score,
          explanation,
          signals,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[SCAMVERIFY_TEXT] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }

  /**
   * Performs real HTTP POST request to ScamVerify URL Verification API.
   * Endpoint: POST https://scamverify.ai/api/v1/url/lookup
   */
  async analyzeUrl(url: string): Promise<ScamVerifyResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[SCAMVERIFY_URL] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const key = this.apiKey;
    if (!key) {
      console.log('[SCAMVERIFY_URL] Missing API key. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const endpoint = `${this.baseUrl}/url/lookup`;
    console.log(`[SCAMVERIFY_URL] [REQUEST] Endpoint: ${endpoint} | URL: ${url}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ url: url, link: url, input: url })
      });

      console.log(`[SCAMVERIFY_URL] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[SCAMVERIFY_URL] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[SCAMVERIFY_URL] [RESPONSE PARSED]:', JSON.stringify(data));

      const verdict = data.verdict || data.risk_level || data.result || 'unknown';
      const score = data.risk_score ?? data.score;
      const explanation = data.explanation || data.description;
      const signals = data.signals || data.indicators || [];

      const riskSignal = this.mapVerdictToRiskSignal(verdict, score);
      console.log(`[SCAMVERIFY_URL] [MAPPED RISK]: ${riskSignal} (Verdict: ${verdict}, Score: ${score})`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'scamverify',
          riskSignal,
          verdict,
          score,
          explanation,
          signals,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[SCAMVERIFY_URL] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }
}

export const scamVerifyProvider = new ScamVerifyProvider();
