import { api } from '../baseUrl';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  country: string;
  city: string;
  postalCode: string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  country: string;
  city: string;
  postalCode: string;
  role: string;
}

export interface UpdateUserRequest extends Partial<CreateUserRequest> {}

// ✅ Создание пользователя
export async function createUser(data: CreateUserRequest, token: string): Promise<User> {
  const response = await fetch(`${api}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при создании пользователя');
  }

  return response.json();
}

// ✅ Получить всех пользователей
export async function getAllUsers(token: string): Promise<User[]> {
  const response = await fetch(`${api}/users`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении пользователей');
  }

  return response.json();
}

// ✅ Получить пользователя по ID
export async function getUserById(id: number, token: string): Promise<User> {
  const response = await fetch(`${api}/users/${id}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при получении пользователя');
  }

  return response.json();
}

// ✅ Обновить пользователя
export async function updateUser(
  id: number,
  data: UpdateUserRequest,
  token: string
): Promise<void> {
  const response = await fetch(`${api}/users/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при обновлении пользователя');
  }
}

// ✅ Удалить пользователя
export async function deleteUser(id: number, token: string): Promise<void> {
  const response = await fetch(`${api}/users/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Ошибка при удалении пользователя');
  }
}
