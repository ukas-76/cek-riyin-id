export interface TelesignRiskResult {
  providerName: string;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  score: number;
  level: string;
  recommendation: string;
  rawResponse?: any;
}

export interface TelesignResponseWrapper {
  status: 'success' | 'unconfigured' | 'error';
  statusCode?: number;
  errorMessage?: string;
  result?: TelesignRiskResult;
}

export class TelesignProvider {
  public isConfigured(): boolean {
    const customerId = process.env.TELESIGN_CUSTOMER_ID;
    const apiKey = process.env.TELESIGN_API_KEY;
    return !!(customerId && apiKey && customerId.trim() !== '' && apiKey.trim() !== '');
  }

  private get credentials(): { customerId: string; apiKey: string } | null {
    const customerId = process.env.TELESIGN_CUSTOMER_ID;
    const apiKey = process.env.TELESIGN_API_KEY;

    if (!customerId || !apiKey || customerId.trim() === '' || apiKey.trim() === '') {
      return null;
    }
    return { customerId: customerId.trim(), apiKey: apiKey.trim() };
  }

  /**
   * Performs a real HTTP POST request to Telesign Intelligence Cloud API.
   * Endpoint: https://detect.telesign.com/intelligence/phone
   */
  async checkNumber(phoneNumber: string): Promise<TelesignResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[TELESIGN] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const creds = this.credentials;
    if (!creds) {
      console.log('[TELESIGN] Missing credentials. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const endpoint = 'https://detect.telesign.com/intelligence/phone';
    const authHeader = 'Basic ' + Buffer.from(`${creds.customerId}:${creds.apiKey}`).toString('base64');

    const formBody = new URLSearchParams();
    formBody.append('phone_number', phoneNumber);
    formBody.append('account_lifecycle_event', 'transact');

    console.log(`[TELESIGN] [REQUEST] URL: ${endpoint} | Phone: ${phoneNumber}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody.toString()
      });

      console.log(`[TELESIGN] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[TELESIGN] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[TELESIGN] [RESPONSE PARSED]:', JSON.stringify(data));

      // Parse Telesign response fields: risk.score (0-1000), risk.level, risk.recommendation
      const score = data.risk?.score ?? 0;
      const level = data.risk?.level || 'unknown';
      const recommendation = data.risk?.recommendation || 'unknown';

      console.log(`[TELESIGN] [RISK FIELDS] Score: ${score} | Level: ${level} | Recommendation: ${recommendation}`);

      // Map score scale 0-1000:
      // 0-400 -> LOW
      // 401-800 -> MEDIUM
      // 801-1000 -> HIGH
      let riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'LOW';
      if (score >= 801 || recommendation.toLowerCase() === 'block' || level.toLowerCase() === 'high') {
        riskSignal = 'HIGH';
      } else if (score >= 401 || recommendation.toLowerCase() === 'flag' || level.toLowerCase() === 'medium') {
        riskSignal = 'MEDIUM';
      } else if (score >= 0) {
        riskSignal = 'LOW';
      } else {
        riskSignal = 'UNKNOWN';
      }

      console.log(`[TELESIGN] [MAPPED RISK]: ${riskSignal}`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'telesign',
          riskSignal,
          score,
          level,
          recommendation,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[TELESIGN] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }
}

export const telesignProvider = new TelesignProvider();
