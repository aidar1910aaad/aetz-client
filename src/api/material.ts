import { api } from './baseUrl';

export interface Material {
  id: number;
  name: string;
  price: number;
  priceInCurrency?: number;
  currentPriceKzt?: number;
  currency?: 'KZT' | 'RUB' | 'USD' | 'EUR' | 'CNY';
  unit: string;
  code: string;
  category: { id: number; name?: string } | number;
}

interface ApiMaterialResponse {
  id: number;
  name: string;
  price: number | string;
  priceInCurrency?: number | string;
  currentPriceKzt?: number | string;
  currency?: 'KZT' | 'RUB' | 'USD' | 'EUR' | 'CNY';
  unit?: string;
  code?: string;
  category?: { id: number; name?: string } | number;
}

function mapApiMaterial(item: ApiMaterialResponse): Material {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price) || 0,
    priceInCurrency: Number(item.priceInCurrency) || 0,
    currentPriceKzt: Number(item.currentPriceKzt ?? item.price) || 0,
    currency: item.currency || 'KZT',
    unit: item.unit || 'шт',
    code: item.code || '',
    category: item.category || 0,
  };
}

export async function getMaterialsByCodes(
  codes: string[],
  token: string,
  onProgress?: (processed: number, total: number) => void
): Promise<Material[]> {
  const unique = [...new Set(codes.map((c) => c.trim()).filter(Boolean))];
  if (unique.length === 0) return [];

  const batchSize = 100;
  const all: Material[] = [];

  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);
    const response = await fetch(`${api}/materials/by-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ codes: batch }),
    });

    if (!response.ok) {
      throw new Error('Не удалось найти материалы по кодам');
    }

    const data = await response.json();
    const batchMaterials: ApiMaterialResponse[] = Array.isArray(data) ? data : data.data ?? [];
    all.push(...batchMaterials.map(mapApiMaterial));
    onProgress?.(Math.min(i + batch.length, unique.length), unique.length);
  }

  return all;
}

export async function getAllMaterials(token: string): Promise<Material[]> {
  const all: Material[] = [];
  let page = 1;
  const limit = 500;

  while (true) {
    const response = await fetch(`${api}/materials?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch materials');
    }

    const json = await response.json();
    const batch: ApiMaterialResponse[] = Array.isArray(json) ? json : json.data || [];
    if (batch.length === 0) break;

    all.push(...batch.map(mapApiMaterial));
    if (batch.length < limit) break;
    page += 1;
  }

  return all;
}

export async function searchMaterials(searchTerm: string, token: string): Promise<Material[]> {
  try {
    const query = new URLSearchParams();
    query.append('search', searchTerm);

    const response = await fetch(`${api}/materials?${query.toString()}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Search failed:', {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      throw new Error(`Search failed with status: ${response.status}, message: ${errorText}`);
    }

    const responseData = await response.json();

    if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
      console.warn('Invalid response format:', responseData);
      return [];
    }

    return responseData.data.map((item: ApiMaterialResponse) => mapApiMaterial(item));
  } catch (error) {
    console.error('Error in searchMaterials:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}

export async function getMaterialsByCategoryId(
  categoryId: number,
  token: string
): Promise<Material[]> {
  const url = `${api}/categories/${categoryId}/materials`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return [];
    }

    return await response.json();
  } catch {
    return [];
  }
}

export async function getMaterialById(id: number, token: string): Promise<Material> {
  const response = await fetch(`${api}/materials/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении материала по ID');
  }

  const data = await response.json();
  
  return {
    id: data.id,
    name: data.name,
    price: typeof data.price === 'string' ? parseFloat(data.price) : data.price,
    priceInCurrency:
      typeof data.priceInCurrency === 'string' ? parseFloat(data.priceInCurrency) : data.priceInCurrency,
    currentPriceKzt:
      typeof data.currentPriceKzt === 'string' ? parseFloat(data.currentPriceKzt) : data.currentPriceKzt,
    currency: data.currency || 'KZT',
    unit: data.unit || 'шт',
    code: data.code || '',
    category: data.category?.id || data.category || 0,
  };
}