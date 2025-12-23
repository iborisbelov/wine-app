/**
 * Wine API Service
 * 
 * Этот файл содержит все функции для взаимодействия с REST API.
 * Раскомментируйте и настройте, когда будет готов backend.
 */

import { Wine } from '../types/wine';

// Настройте URL вашего API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-api.com/api';

// Настройте токен аутентификации (если требуется)
const getAuthToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

// Базовая функция для выполнения запросов
async function fetchAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Получить все вина
 */
export async function fetchWines(): Promise<Wine[]> {
  return fetchAPI<Wine[]>('/wines');
}

/**
 * Получить вино по ID
 */
export async function fetchWineById(id: string): Promise<Wine> {
  return fetchAPI<Wine>(`/wines/${id}`);
}

/**
 * Создать новое вино (только для админов)
 */
export async function createWine(wine: Omit<Wine, 'id'>): Promise<Wine> {
  return fetchAPI<Wine>('/wines', {
    method: 'POST',
    body: JSON.stringify(wine),
  });
}

/**
 * Обновить существующее вино (только для админов)
 */
export async function updateWine(id: string, data: Partial<Wine>): Promise<Wine> {
  return fetchAPI<Wine>(`/wines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Удалить вино (только для админов)
 */
export async function deleteWine(id: string): Promise<void> {
  return fetchAPI<void>(`/wines/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Поиск вин по параметрам
 */
export async function searchWines(params: {
  query?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
}): Promise<Wine[]> {
  const searchParams = new URLSearchParams();
  
  if (params.query) searchParams.append('q', params.query);
  if (params.type) searchParams.append('type', params.type);
  if (params.priceMin) searchParams.append('price_min', params.priceMin.toString());
  if (params.priceMax) searchParams.append('price_max', params.priceMax.toString());
  if (params.rating) searchParams.append('rating', params.rating.toString());
  
  return fetchAPI<Wine[]>(`/wines/search?${searchParams.toString()}`);
}

/**
 * Загрузить изображение вина
 */
export async function uploadWineImage(wineId: string, file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  
  const token = getAuthToken();
  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}/wines/${wineId}/image`, {
    method: 'POST',
    headers,
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload image');
  }
  
  return response.json();
}

/**
 * Получить статистику по вину (просмотры, покупки и т.д.)
 */
export async function getWineStats(wineId: string): Promise<{
  views: number;
  orders: number;
  favorites: number;
}> {
  return fetchAPI(`/wines/${wineId}/stats`);
}

// Пример использования с обработкой ошибок и кэшированием:
/*
export async function fetchWinesWithCache(): Promise<Wine[]> {
  const CACHE_KEY = 'wines_cache';
  const CACHE_DURATION = 5 * 60 * 1000; // 5 минут
  
  try {
    // Попытка загрузить из API
    const wines = await fetchWines();
    
    // Сохранить в кэш
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      data: wines,
      timestamp: Date.now(),
    }));
    
    return wines;
  } catch (error) {
    console.error('API error, loading from cache:', error);
    
    // Попытка загрузить из кэша
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
    
    throw error;
  }
}
*/
