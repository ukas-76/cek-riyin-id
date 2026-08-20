export interface ExternalNumberRiskResult {
  providerName: string;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'NO_REPORT';
  score?: number;
  reportCount?: number;
  categories?: string[];
  details?: string;
}

export interface NumberRiskProvider {
  name: string;
  checkNumber(phoneNumber: string): Promise<ExternalNumberRiskResult | null>;
}

/**
 * Default Number Risk Provider implementation using environment variables.
 */
export class DefaultNumberRiskProvider implements NumberRiskProvider {
  name: string;

  constructor() {
    this.name = process.env.NUMBER_RISK_PROVIDER || 'none';
  }

  async checkNumber(phoneNumber: string): Promise<ExternalNumberRiskResult | null> {
    const providerName = process.env.NUMBER_RISK_PROVIDER;
    const apiKey = process.env.NUMBER_RISK_API_KEY;
    const apiUrl = process.env.NUMBER_RISK_API_URL;

    // If external provider is unconfigured or disabled, return null cleanly
    if (!providerName || providerName === 'none' || !apiUrl) {
      return null;
    }

    try {
      // Clean fallback template for integration when credentials are provided
      const response = await fetch(`${apiUrl}?number=${encodeURIComponent(phoneNumber)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey || ''}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`[NumberRiskProvider] External API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      return {
        providerName,
        riskSignal: data.riskSignal || 'NO_REPORT',
        score: data.score,
        reportCount: data.reportCount,
        categories: data.categories || [],
        details: data.details
      };
    } catch (error) {
      console.warn('[NumberRiskProvider] Failed to contact external provider:', error);
      return null; // Return null safely so fallback to local DB works cleanly
    }
  }
}

export const numberRiskProvider = new DefaultNumberRiskProvider();
