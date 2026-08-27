export interface VeriphoneRiskResult {
  providerName: string;
  phoneValid: boolean;
  phoneType: string; // mobile, landline, voip, etc.
  carrier: string;
  country: string;
  countryCode: string;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  rawResponse?: any;
}

export interface VeriphoneResponseWrapper {
  status: 'success' | 'unconfigured' | 'error';
  statusCode?: number;
  errorMessage?: string;
  result?: VeriphoneRiskResult;
}

export class VeriphoneProvider {
  public isConfigured(): boolean {
    const key = process.env.VERIPHONE_API_KEY;
    return !!(key && key.trim() !== '');
  }

  private get apiKey(): string | null {
    const key = process.env.VERIPHONE_API_KEY;
    if (!key || key.trim() === '') {
      return null;
    }
    return key.trim();
  }

  /**
   * Performs real HTTP GET request to Veriphone Phone Verification API (1,000 free requests/mo).
   * Endpoint: https://api.veriphone.io/v2/verify?phone=PHONE&key=KEY
   */
  async checkNumber(phoneNumber: string): Promise<VeriphoneResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[VERIPHONE] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const key = this.apiKey;
    if (!key) {
      console.log('[VERIPHONE] Missing API key. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9+]/g, '');
    const endpoint = `https://api.veriphone.io/v2/verify?phone=${encodeURIComponent(cleanPhone)}&key=${encodeURIComponent(key)}`;

    console.log(`[VERIPHONE] [REQUEST] URL: https://api.veriphone.io/v2/verify | Phone: ${cleanPhone}`);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      console.log(`[VERIPHONE] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[VERIPHONE] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[VERIPHONE] [RESPONSE PARSED]:', JSON.stringify(data));

      if (data.status !== 'success') {
        return {
          status: 'error',
          errorMessage: data.message || 'Veriphone verification failed'
        };
      }

      const phoneValid = data.phone_valid ?? true;
      const phoneType = (data.phone_type || 'unknown').toLowerCase();
      const carrier = data.carrier || 'Unknown Operator';
      const country = data.country || 'Unknown';
      const countryCode = data.country_code || '';

      // Risk Mapping Logic:
      // - Invalid phone format -> HIGH risk
      // - VOIP / Virtual phone number -> HIGH risk (frequently used in online scams)
      // - Landline / Fixed line -> MEDIUM risk (rare for personal communication, often telemarketing)
      // - Valid Mobile -> LOW risk
      let riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'LOW';

      if (!phoneValid || phoneType.includes('voip')) {
        riskSignal = 'HIGH';
      } else if (phoneType.includes('landline') || phoneType.includes('fixed')) {
        riskSignal = 'MEDIUM';
      } else if (phoneType.includes('mobile')) {
        riskSignal = 'LOW';
      } else {
        riskSignal = 'UNKNOWN';
      }

      console.log(`[VERIPHONE] [MAPPED RISK]: ${riskSignal} | Type: ${phoneType} | Carrier: ${carrier}`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'veriphone',
          phoneValid,
          phoneType,
          carrier,
          country,
          countryCode,
          riskSignal,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[VERIPHONE] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }
}

export const veriphoneProvider = new VeriphoneProvider();
