import { fetchWithCredentials } from './authApi';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://cek-riyin-id.vercel.app/api';

export interface CommentItem {
  id: string;
  user_id: string;
  author: string;
  target_type: 'number' | 'message' | 'link';
  target_reference: string;
  content: string;
  created_at: string;
}

export async function getCommentsApi(target_type: string, target_reference: string): Promise<CommentItem[]> {
  const query = new URLSearchParams({
    target_type,
    target_reference: target_reference.trim()
  });

  const data = await fetchWithCredentials(`${API_BASE_URL}/comments?${query.toString()}`, {
    method: 'GET',
  });

  return data.data || [];
}

export async function postCommentApi(
  target_type: 'number' | 'message' | 'link',
  target_reference: string,
  content: string
): Promise<CommentItem> {
  const data = await fetchWithCredentials(`${API_BASE_URL}/comments`, {
    method: 'POST',
    body: JSON.stringify({
      target_type,
      target_reference: target_reference.trim(),
      content: content.trim()
    }),
  });

  return data.data;
}
