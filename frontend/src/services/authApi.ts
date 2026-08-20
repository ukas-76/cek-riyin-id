export interface UserProfile {
  id: string;
  email: string;
  created_at?: string;
}

export interface AuthApiResponse {
  message?: string;
  user: UserProfile;
  token?: string;
}

export interface MeApiResponse {
  authenticated: boolean;
  user: UserProfile | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cek-riyin-id.vercel.app/api';

/**
 * Common fetch wrapper supporting cookies and Bearer token fallback.
 */
export async function fetchWithCredentials(url: string, options: RequestInit = {}): Promise<any> {
  const token = localStorage.getItem('cekriyin_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers,
  });

  let data: any;
  const text = await response.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text || 'Terjadi kesalahan. Silakan coba lagi.' };
  }

  if (!response.ok) {
    throw new Error(data.error || 'Terjadi kesalahan. Silakan coba lagi.');
  }

  return data;
}

export async function registerApi(payload: { email?: string; password?: string }): Promise<AuthApiResponse> {
  return fetchWithCredentials(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function loginApi(payload: { email?: string; password?: string }): Promise<AuthApiResponse> {
  return fetchWithCredentials(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutApi(): Promise<{ message: string }> {
  return fetchWithCredentials(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
  });
}

export async function getMeApi(): Promise<MeApiResponse> {
  try {
    return await fetchWithCredentials(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
    });
  } catch (error) {
    return { authenticated: false, user: null };
  }
}
