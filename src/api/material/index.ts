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

export interface MaterialHistoryWithMaterial extends MaterialHistoryItem {
  material: {
    id: number;
    name: string;
    code: string;
    unit: string;
    price: number;
    category: {
      id: number;
      name: string;
    };
  };
}

export interface GetMaterialHistoryParams {
  materialName?: string;
  materialCode?: string;
  categoryId?: number;
  fieldChanged?: string;
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface MaterialHistoryResponse {
  data: MaterialHistoryWithMaterial[];
  total: number;
  limit: number;
  offset: number;
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

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Failed to fetch materials');
    }

    const data = await response.json();

    return {
      data: data.data || [],
      total: data.total || 0,
    };
  } catch (error) {
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
    // Проверяем валидность ID
    if (isNaN(categoryId) || categoryId <= 0 || categoryId > 2147483647) {
      throw new Error(`Неправильный ID категории: ${categoryId}. ID должен быть числом от 1 до 2147483647.`);
    }

    const url = `${api}/categories/${categoryId}/materials`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[getMaterialsByCategoryId] Ошибка сервера:`, {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.message || 'Failed to fetch materials');
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error(`[getMaterialsByCategoryId] Неправильный формат ответа:`, data);
      throw new Error('Invalid response format');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// ✅ Получить историю изменений материалов
export async function getMaterialHistoryList(
  token: string
): Promise<MaterialHistoryResponse> {
  try {
    const url = `${api}/materials/history`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Ошибка при получении истории материалов');
    }

    const data = await response.json();
    
    return {
      data: data,
      total: data.length,
      limit: 10,
      offset: 0
    };
  } catch (error) {
    throw error;
  }
}
