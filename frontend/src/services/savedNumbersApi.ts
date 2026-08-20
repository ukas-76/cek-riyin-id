import { fetchWithCredentials } from './authApi';

const API_BASE_URL = '/api';

export interface SavedNumberItem {
  id: string;
  user_id: string;
  phone_number: string;
  created_at: string;
}

export async function saveNumberApi(phone_number: string): Promise<{ success: boolean; isSaved: boolean }> {
  return fetchWithCredentials(`${API_BASE_URL}/saved-numbers`, {
    method: 'POST',
    body: JSON.stringify({ phone_number }),
  });
}

export async function unsaveNumberApi(phone_number: string): Promise<{ success: boolean; isSaved: boolean }> {
  return fetchWithCredentials(`${API_BASE_URL}/saved-numbers/${encodeURIComponent(phone_number)}`, {
    method: 'DELETE',
  });
}

export async function checkIsSavedApi(phone_number: string): Promise<boolean> {
  try {
    const data = await fetchWithCredentials(`${API_BASE_URL}/saved-numbers/check/${encodeURIComponent(phone_number)}`, {
      method: 'GET',
    });
    return !!data.isSaved;
  } catch (err) {
    return false;
  }
}

export async function getSavedNumbersApi(): Promise<SavedNumberItem[]> {
  const data = await fetchWithCredentials(`${API_BASE_URL}/saved-numbers`, {
    method: 'GET',
  });
  return data.data || [];
}
