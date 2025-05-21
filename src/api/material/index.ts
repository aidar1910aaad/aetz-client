import { api } from '../baseUrl';

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
    throw new Error(error.message || 'Ошибка при создании материала');
  }

  return response.json(); // ← должно вернуть материал с category
}

// ✅ Получить все материалы
export async function getAllMaterials(
  token: string,
  params: GetMaterialsParams = {}
): Promise<{ data: Material[]; total: number }> {
  const query = new URLSearchParams();

  if (params.page) query.append('page', String(params.page));
  if (params.limit) query.append('limit', String(params.limit));
  if (params.search) query.append('search', params.search);
  if (params.sort) query.append('sort', params.sort);
  if (params.order) query.append('order', params.order);
  if (params.categoryId) query.append('categoryId', String(params.categoryId));

  const response = await fetch(`${api}/materials?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении материалов');
  }

  return response.json();
}

// ✅ Получить материал по ID
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

  return response.json();
}

// ✅ Обновить материал
export async function updateMaterial(
  id: number,
  data: UpdateMaterialRequest,
  token: string
): Promise<void> {
  const response = await fetch(`${api}/materials/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при обновлении материала');
  }
}

// ✅ Удалить материал
export async function deleteMaterial(id: number, token: string): Promise<void> {
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
export const getMaterialsByCategoryId = async (categoryId: number, token: string): Promise<Material[]> => {
  try {
    console.log('Fetching materials for category:', categoryId);
    const url = `${api}/categories/${categoryId}/materials`;
    console.log('API URL:', url);
    console.log('Request headers:', {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
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
