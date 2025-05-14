import { api } from '../baseUrl';

export interface Material {
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
export async function getAllMaterials(token: string): Promise<Material[]> {
  const response = await fetch(`${api}/materials`, {
    method: 'GET',
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
