import { fetchWithCredentials } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cek-riyin-id.vercel.app/api';

export interface CheckHistoryItem {
  id: string;
  user_id: string;
  type: 'number' | 'message' | 'link';
  input: string;
  risk_level: string;
  result: any;
  created_at: string;
}

export interface UserCommentItem {
  id: string;
  user_id: string;
  author: string;
  target_type: 'number' | 'message' | 'link';
  target_reference: string;
  content: string;
  created_at: string;
}

export async function getCheckHistoryApi(): Promise<CheckHistoryItem[]> {
  const data = await fetchWithCredentials(`${API_BASE_URL}/check/history`, {
    method: 'GET',
  });
  return data.data || [];
}

export async function getUserCommentsApi(): Promise<UserCommentItem[]> {
  const data = await fetchWithCredentials(`${API_BASE_URL}/comments/user`, {
    method: 'GET',
  });
  return data.data || [];
}

export async function deleteUserCommentApi(id: string): Promise<boolean> {
  await fetchWithCredentials(`${API_BASE_URL}/comments/${id}`, {
    method: 'DELETE',
  });
  return true;
}
