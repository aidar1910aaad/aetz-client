import { api } from '../baseUrl';

console.log('LOADED MATERIAL API MODULE');

export interface Material {
  code: string;
  id: number;
  name: string;
  unit: string;
  price: number | string;
  category: {
    id: number;
    name: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface GetMaterialsParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: 'name' | 'price' | 'code';
  order?: 'ASC' | 'DESC';
  categoryId?: number;
}

export interface CreateMaterialRequest {
  name: string;
  unit: string;
  price: number;
  categoryId: number;
}

export interface UpdateMaterialRequest extends CreateMaterialRequest {
  changedBy: string;
}

export interface MaterialHistoryItem {
  id: number;
  materialId: number;
  fieldChanged: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
}

// ✅ Создание материала
export async function createMaterial(
  data: CreateMaterialRequest,
  token: string
): Promise<Material> {
  console.log('[createMaterial] data:', data, 'token:', !!token);
  const response = await fetch(`${api}/materials`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('[createMaterial] error:', error);
    throw new Error(error.message || 'Ошибка при создании материала');
  }

  return response.json();
}

// ✅ Получить все материалы
export const getAllMaterials = async (
  token: string,
  params: GetMaterialsParams
): Promise<{ data: Material[]; total: number }> => {
  try {
    console.log('[getAllMaterials] token:', !!token, 'params:', params);
    const query = new URLSearchParams();

    // Required parameters
    query.append('page', (params.page || 1).toString());
    query.append('limit', (params.limit || 10).toString());

    // Optional parameters
    if (params.search) {
      query.append('search', params.search.trim());
    }
    if (params.sort) {
      query.append('sort', params.sort);
    }
    if (params.order) {
      query.append('order', params.order);
    }
    if (params.categoryId) {
      query.append('categoryId', params.categoryId.toString());
    }

    const url = `${api}/materials?${query.toString()}`;
    console.log('API Request URL:', url);
    console.log('API Request Headers:', {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('API Response Status:', response.status);
    console.log('API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData);
      throw new Error(errorData?.message || 'Failed to fetch materials');
    }

    const data = await response.json();
    console.log('API Response Data:', {
      total: data.total,
      count: data.data?.length,
      page: params.page,
      limit: params.limit,
      firstItem: data.data?.[0],
      lastItem: data.data?.[data.data.length - 1],
    });

    return {
      data: data.data || [],
      total: data.total || 0,
    };
  } catch (error) {
    console.error('[getAllMaterials] API Error:', error);
    throw error;
  }
};

// ✅ Получить материал по ID
export async function getMaterialById(id: number, token: string): Promise<Material> {
  console.log('[getMaterialById] id:', id, 'token:', !!token);
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

  return response.json();
}

// ✅ Обновить материал
export async function updateMaterial(
  id: number,
  data: UpdateMaterialRequest,
  token: string
): Promise<void> {
  console.log('[updateMaterial] id:', id, 'data:', data, 'token:', !!token);
  const response = await fetch(`${api}/materials/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const text = await response.text();
    let error;
    try {
      error = JSON.parse(text);
    } catch {
      error = { message: text || '[empty response]' };
    }
    console.error(
      '[updateMaterial] error:',
      error,
      'status:',
      response.status,
      'statusText:',
      response.statusText,
      'rawText:',
      text
    );
    throw new Error(error.message || 'Ошибка при обновлении материала');
  }
}

// ✅ Удалить материал
export async function deleteMaterial(id: number, token: string): Promise<void> {
  console.log('[deleteMaterial] id:', id, 'token:', !!token);
  const response = await fetch(`${api}/materials/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при удалении материала');
  }
}

// ✅ История изменений
export async function getMaterialHistory(
  id: number,
  token: string
): Promise<MaterialHistoryItem[]> {
  console.log('[getMaterialHistory] id:', id, 'token:', !!token);
  const response = await fetch(`${api}/materials/${id}/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении истории материала');
  }

  return response.json();
}

// ✅ Получить все материалы по категории
export const getMaterialsByCategoryId = async (
  categoryId: number,
  token: string
): Promise<Material[]> => {
  try {
    console.log('Fetching materials for category:', categoryId);
    const url = `${api}/categories/${categoryId}/materials`;
    console.log('API URL:', url);
    console.log('Request headers:', {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch materials');
    }

    const data = await response.json();
    console.log('Materials data:', data);
    console.log('Materials data type:', typeof data);
    console.log('Is array:', Array.isArray(data));

    if (!Array.isArray(data)) {
      console.error('Invalid response format:', data);
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    console.error('Error in getMaterialsByCategoryId:', error);
    throw error;
  }
};
