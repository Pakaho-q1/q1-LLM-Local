// src/services/api.service.ts
import { ModelItem } from '../types/chat.types';

export const API_BASE = 'http://127.0.0.1:8000';
export const WS_URL = 'ws://127.0.0.1:8000/ws';

const LLM_API_KEY = 'MySecretKey12345';

export const fetchModels = async (): Promise<ModelItem[]> => {
  const response = await fetch(`${API_BASE}/models`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': LLM_API_KEY,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized: Invalid API Key');
    }
    throw new Error('Failed to fetch models');
  }

  return response.json();
};
