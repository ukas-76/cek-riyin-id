export interface ExternalLinkRiskResult {
  providerName: string;
  riskSignal: 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
  threatCategories?: string[];
  details?: string;
}

export interface LinkRiskProvider {
  name: string;
  checkLink(url: string): Promise<ExternalLinkRiskResult | null>;
}

export class DefaultLinkRiskProvider implements LinkRiskProvider {
  name: string;

  constructor() {
    this.name = process.env.LINK_RISK_PROVIDER || 'none';
  }

  async checkLink(url: string): Promise<ExternalLinkRiskResult | null> {
    const providerName = process.env.LINK_RISK_PROVIDER;
    const apiKey = process.env.LINK_RISK_API_KEY;
    const apiUrl = process.env.LINK_RISK_API_URL;

    // If external provider is unconfigured or disabled, return null cleanly
    if (!providerName || providerName === 'none' || !apiUrl) {
      return null;
    }

    try {
      const response = await fetch(`${apiUrl}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey || ''}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`[LinkRiskProvider] External API returned status ${response.status}`);
        return null;
      }

      const data = await response.json();
      return {
        providerName,
        riskSignal: data.riskSignal || 'UNKNOWN',
        threatCategories: data.threatCategories || [],
        details: data.details
      };
    } catch (error) {
      console.warn('[LinkRiskProvider] Failed to contact external provider:', error);
      return null;
    }
  }
}

export const linkRiskProvider = new DefaultLinkRiskProvider();
