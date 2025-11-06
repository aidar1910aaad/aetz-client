import { api } from './baseUrl';

export interface Material {
  id: number;
  name: string;
  price: number;
  unit: string;
  code: string;
  category: number;
}

interface ApiMaterialResponse {
  id: number;
  name: string;
  price: number | string;
  unit?: string;
  code?: string;
  category?: number;
}

export async function getAllMaterials(token: string): Promise<Material[]> {
  const response = await fetch(`${api}/materials`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch materials');
  }

  return response.json();
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

    return responseData.data.map((item: ApiMaterialResponse) => ({
      id: item.id,
      name: item.name,
      price: Number(item.price) || 0,
      unit: item.unit || 'шт',
      code: item.code || '',
      category: item.category || 0,
    }));
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
    unit: data.unit || 'шт',
    code: data.code || '',
    category: data.category?.id || data.category || 0,
  };
}