// src/hooks/useUsers.ts
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  User,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/api/users';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Загрузка пользователей
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getAllUsers(token);
      setUsers(data);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке пользователей', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // ✅ Фильтрация по ролям
  const roles = useMemo(() => ['Все', ...new Set(users.map((u) => u.role))], [users]);

  const [selectedRole, setSelectedRole] = useState('Все');
  const filtered = useMemo(
    () => (selectedRole === 'Все' ? users : users.filter((u) => u.role === selectedRole)),
    [selectedRole, users]
  );

  // ✅ Создание
  const handleCreate = async (data: CreateUserRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createUser(data, token);
      await fetchUsers();
      showToast('Пользователь создан!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при создании пользователя', 'error');
    }
  };

  // ✅ Обновление
  const handleUpdate = async (id: number, data: UpdateUserRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateUser(id, data, token);
      await fetchUsers();
      showToast('Пользователь обновлён!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при обновлении пользователя', 'error');
    }
  };

  // ✅ Удаление
  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Удалить пользователя?',
      message: 'Это действие нельзя отменить.',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token') || '';
      await deleteUser(id, token);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      showToast('Пользователь удалён!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при удалении пользователя', 'error');
    }
  };

  return {
    users,
    setUsers,
    loading,
    roles,
    selectedRole,
    setSelectedRole,
    filtered,
    fetchUsers,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}
