import { api } from '../baseUrl/index';

interface CreateCategoryRequest {
  name: string;
  description: string;
  code: string;
}

interface CreateCategoryResponse {
  id: number;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export interface Material {
  id: number;
  name: string;
}

export async function createCategory(
  category: CreateCategoryRequest,
  token: string
): Promise<CreateCategoryResponse> {
  const response = await fetch(`${api}/categories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(category),
  });

  console.log('Response status:', response.status);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    console.error('Error response:', errorBody);
    throw new Error(errorBody.message || 'Ошибка при создании категории');
  }

  const data = await response.json();
  console.log('Category created:', data);
  return data;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllCategories(token: string): Promise<Category[]> {
  const response = await fetch(`${api}/categories`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Ошибка при получении категорий');
  }

  return response.json();
}

interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  code?: string;
}

export async function updateCategory(
  id: number,
  data: UpdateCategoryRequest,
  token: string
): Promise<void> {
  console.log('Updating category:', { id, data });

  const response = await fetch(`${api}/categories/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  console.log('Update response status:', response.status);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    console.error('Update error:', error);
    throw new Error(error.message || 'Ошибка при обновлении категории');
  }

  console.log('Category updated successfully');
}

export async function deleteCategory(id: number, token: string): Promise<void> {
  const response = await fetch(`${api}/categories/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при удалении категории');
  }
}

export async function getMaterialsByCategory(
  categoryId: number,
  token: string
): Promise<Material[]> {
  const response = await fetch(`${api}/categories/${categoryId}/materials`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || 'Ошибка при получении связанных материалов');
  }

  return response.json();
}
