export interface KredibelRiskResult {
  providerName: string;
  reportCount: number;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  summary?: string;
  categories?: string[];
  rawResponse?: any;
}

export interface KredibelResponseWrapper {
  status: 'success' | 'unconfigured' | 'error';
  statusCode?: number;
  errorMessage?: string;
  result?: KredibelRiskResult;
}

export class KredibelProvider {
  public isConfigured(): boolean {
    const key = process.env.KREDIBEL_API_KEY;
    return !!(key && key.trim() !== '');
  }

  private get apiKey(): string | null {
    const key = process.env.KREDIBEL_API_KEY;
    if (!key || key.trim() === '') {
      return null;
    }
    return key.trim();
  }

  private get baseUrl(): string {
    return process.env.KREDIBEL_API_BASE_URL || 'https://api.kredibel.co.id/v1';
  }

  /**
   * Performs real HTTP request to Kredibel Phone Fraud Check API.
   */
  async checkNumber(phoneNumber: string): Promise<KredibelResponseWrapper> {
    const isConfig = this.isConfigured();
    console.log(`[KREDIBEL] CONFIG_STATUS: ${isConfig ? 'CONFIGURED' : 'NOT_CONFIGURED'}`);

    const key = this.apiKey;
    if (!key) {
      console.log('[KREDIBEL] Missing API key. Returning unconfigured status.');
      return { status: 'unconfigured' };
    }

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    const endpoint = `${this.baseUrl}/phone/${encodeURIComponent(cleanPhone)}`;

    console.log(`[KREDIBEL] [REQUEST] URL: ${endpoint} | Phone: ${cleanPhone}`);

    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json'
        }
      });

      console.log(`[KREDIBEL] [RESPONSE] HTTP Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[KREDIBEL] [RESPONSE ERROR] Status ${response.status}: ${errorText}`);
        return {
          status: 'error',
          statusCode: response.status,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      const data = await response.json();
      console.log('[KREDIBEL] [RESPONSE PARSED]:', JSON.stringify(data));

      const reportCount = data.reports_count ?? data.total_reports ?? (data.data?.reports_count) ?? 0;
      const categories = data.categories || data.data?.categories || [];

      let riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN' = 'LOW';

      if (reportCount >= 3 || data.status === 'fraud' || data.is_scam === true) {
        riskSignal = 'HIGH';
      } else if (reportCount >= 1 || data.status === 'suspicious') {
        riskSignal = 'MEDIUM';
      } else {
        riskSignal = 'LOW';
      }

      console.log(`[KREDIBEL] [MAPPED RISK]: ${riskSignal} | Reports: ${reportCount}`);

      return {
        status: 'success',
        statusCode: response.status,
        result: {
          providerName: 'kredibel',
          reportCount,
          riskSignal,
          summary: `Ditemukan ${reportCount} laporan penipuan pada database Kredibel.co.id`,
          categories,
          rawResponse: data
        }
      };
    } catch (error: any) {
      console.warn('[KREDIBEL] [FETCH ERROR]:', error.message || error);
      return {
        status: 'error',
        errorMessage: error.message || 'Network fetch error'
      };
    }
  }
}

export const kredibelProvider = new KredibelProvider();
