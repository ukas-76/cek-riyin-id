import { fetchWithCredentials } from './authApi';

export interface CheckApiRequest {
  type: 'number' | 'message' | 'link';
  input: string;
}

export interface CheckApiData {
  reportCount?: number;
  categories?: string[];
  score?: number;
  parsedUrl?: {
    protocol?: string;
    hostname?: string;
    pathname?: string;
  };
  [key: string]: any;
}

export type CheckRiskLevel = 'NO_REPORT' | 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';

export interface CheckApiResponse {
  type: 'number' | 'message' | 'link';
  input: string;
  normalizedInput: string;
  riskLevel: CheckRiskLevel;
  title: string;
  description: string;
  source: 'veriphone' | 'abstract_api' | 'telesign' | 'scamverify' | 'local_report' | 'local_rules' | 'combined' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
  providerScore?: number | null;
  providerLevel?: string | null;
  providerRecommendation?: string | null;
  data: CheckApiData;
  indicators: string[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cek-riyin-id.vercel.app/api';

export async function checkInput(params: CheckApiRequest): Promise<CheckApiResponse> {
  return fetchWithCredentials(`${API_BASE_URL}/check`, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
