export interface AbstractApiRiskResult {
  providerName: string;
  valid: boolean;
  type: string; // MOBILE, LANDLINE, VOIP, UNKNOWN, etc.
  carrier: string;
  countryName: string;
  countryCode: string;
  qualityScore: number; // 0.0 - 1.0
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  rawResponse?: any;
}

export interface AbstractApiResponseWrapper {
  status: 'success' | 'unconfigured' | 'error';
  statusCode?: number;
  errorMessage?: string;
  result?: AbstractApiRiskResult;
}

export class AbstractApiProvider {
  public isConfigured(): boolean {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
    return !!(apiKey && apiKey.trim() !== '');
  }

  private get apiKey(): string | null {
    const apiKey = process.env.ABSTRACT_PHONE_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    return apiKey.trim();
  }

  /**
   * Performs real HTTP GET request to AbstractAPI Phone Validation API.
   * Endpoint: https://phonevalidation.abstractapi.com/v1/?api_key=KEY&phone=PHONE
   */
  async checkNumber(phoneNumber: string): Promise<AbstractApiResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[ABSTRACT_API] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const key = this.apiKey;
    if (!key) {
      console.log('[ABSTRACT_API] Missing API key. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const endpoint = `https://phonevalidation.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&phone=${encodeURIComponent(cleanPhone)}`;

    console.log(`[ABSTRACT_API] [REQUEST] URL: https://phonevalidation.abstractapi.com/v1/ | Phone: ${cleanPhone}`);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log(`[ABSTRACT_API] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[ABSTRACT_API] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[ABSTRACT_API] [RESPONSE PARSED]:', JSON.stringify(data));

      const valid = data.valid ?? true;
      const type = (data.type || 'UNKNOWN').toUpperCase();
      const carrier = data.carrier || 'Unknown Operator';
      const countryName = data.country?.name || 'Unknown';
      const countryCode = data.country?.code || '';
      const qualityScore = data.quality_score ? parseFloat(data.quality_score) : 1.0;

      // Risk Mapping Logic:
      // - Invalid phone format -> HIGH risk
      // - VOIP / Virtual Phone number -> HIGH/MEDIUM risk (often used in scams)
      // - Low quality score (< 0.5) -> HIGH risk
      // - Low quality score (< 0.8) -> MEDIUM risk
      // - Valid Mobile/Landline with score >= 0.8 -> LOW risk
      let riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'LOW';

      if (!valid || type === 'VOIP' || qualityScore < 0.5) {
        riskSignal = 'HIGH';
      } else if (qualityScore < 0.8 || type === 'LANDLINE' || type === 'PAGING') {
        riskSignal = 'MEDIUM';
      } else {
        riskSignal = 'LOW';
      }

      console.log(`[ABSTRACT_API] [MAPPED RISK]: ${riskSignal} | Type: ${type} | Quality: ${qualityScore}`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'abstract_api',
          valid,
          type,
          carrier,
          countryName,
          countryCode,
          qualityScore,
          riskSignal,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[ABSTRACT_API] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }
}

export const abstractApiProvider = new AbstractApiProvider();
