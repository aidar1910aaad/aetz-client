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
  page?: number;
  limit?: number;
  materialId?: number;
  fieldChanged?: string;
  changedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface MaterialHistoryResponse {
  data: MaterialHistoryWithMaterial[];
  total: number;
  limit: number;
  offset?: number;
  page?: number;
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
  // Валидация ID
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Некорректный ID материала');
  }

  console.log('[getMaterialById] id:', id, 'token:', !!token);
  
  // Убеждаемся, что ID - это целое число
  const materialId = Math.floor(id);
  
  const response = await fetch(`${api}/materials/${materialId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.message || error.error || 'Ошибка при получении материала по ID';
    throw new Error(errorMessage);
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
  // Валидация ID
  if (!id || isNaN(id) || id <= 0) {
    throw new Error('Некорректный ID материала');
  }

  // Убеждаемся, что ID - это целое число
  const materialId = Math.floor(id);
  
  const response = await fetch(`${api}/materials/${materialId}/history`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const errorMessage = error.message || error.error || 'Ошибка при получении истории материала';
    throw new Error(errorMessage);
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
  token: string,
  params?: GetMaterialHistoryParams
): Promise<MaterialHistoryResponse> {
  try {
    const query = new URLSearchParams();

    // Обязательные параметры пагинации
    if (params?.page) {
      query.append('page', params.page.toString());
    }
    if (params?.limit) {
      query.append('limit', params.limit.toString());
    }

    // Опциональные параметры фильтрации
    if (params?.materialId) {
      query.append('materialId', params.materialId.toString());
    }
    if (params?.fieldChanged) {
      query.append('fieldChanged', params.fieldChanged);
    }
    if (params?.changedBy) {
      query.append('changedBy', params.changedBy);
    }
    if (params?.dateFrom) {
      query.append('dateFrom', params.dateFrom);
    }
    if (params?.dateTo) {
      query.append('dateTo', params.dateTo);
    }
    if (params?.search) {
      query.append('search', params.search.trim());
    }

    const url = `${api}/materials/history${query.toString() ? `?${query.toString()}` : ''}`;
    
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
    
    // Если ответ содержит data и total, используем их
    if (data.data && typeof data.total === 'number') {
      return {
        data: data.data,
        total: data.total,
        limit: params?.limit || 20,
        offset: ((params?.page || 1) - 1) * (params?.limit || 20)
      };
    }
    
    // Иначе, если это массив, обрабатываем как раньше
    const historyArray = Array.isArray(data) ? data : (data.data || []);
    return {
      data: historyArray,
      total: historyArray.length,
      limit: params?.limit || 20,
      offset: ((params?.page || 1) - 1) * (params?.limit || 20)
    };
  } catch (error) {
    throw error;
  }
}
