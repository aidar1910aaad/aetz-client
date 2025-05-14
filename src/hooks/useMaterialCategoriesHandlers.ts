'use client';

import { useCallback } from 'react';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  getMaterialsByCategory,
} from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { showEditModal } from '@/shared/modals/EditModalContainer'; // <-- новый импорт

export function useMaterialCategoriesHandlers(
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setNewCategory: React.Dispatch<React.SetStateAction<string>>
) {
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getAllCategories(token);
      setCategories(data);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке категорий', 'error');
    }
  }, [setCategories]);

  const handleAddCategory = useCallback(
    async (newCategory: string) => {
      const trimmed = newCategory.trim();
      if (!trimmed) return;

      const exists = categories.some((cat) => cat.name.toLowerCase() === trimmed.toLowerCase());
      if (exists) return showToast('Такая категория уже существует', 'error');

      try {
        const token = localStorage.getItem('token') || '';
        const created = await createCategory({ name: trimmed }, token);
        setCategories((prev) => [...prev, created]);
        setNewCategory('');
        showToast('Категория создана!', 'success');
      } catch (error: any) {
        showToast(error.message || 'Ошибка при создании категории', 'error');
      }
    },
    [categories, setCategories, setNewCategory]
  );

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        const token = localStorage.getItem('token') || '';
        const relatedMaterials = await getMaterialsByCategory(id, token);

        if (relatedMaterials.length > 0) {
          showToast('Нельзя удалить: к этой категории привязаны материалы', 'error');
          return;
        }

        const confirmed = await showConfirm({
          title: 'Удалить категорию?',
          message: 'Вы уверены, что хотите удалить эту категорию?',
        });

        if (!confirmed) return;

        await deleteCategory(id, token);
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
        showToast('Категория успешно удалена', 'success');
      } catch (err: any) {
        showToast(err.message || 'Ошибка при удалении категории', 'error');
      }
    },
    [setCategories]
  );

  const handleUpdate = useCallback(
    async (cat: Category) => {
      const newName = await showEditModal({
        title: 'Редактировать категорию',
        initialValue: cat.name,
        placeholder: 'Название категории',
      });

      if (!newName || newName.trim() === cat.name.trim()) return;

      const exists = categories.some(
        (c) => c.name.toLowerCase() === newName.trim().toLowerCase() && c.id !== cat.id
      );
      if (exists) {
        showToast('Категория с таким названием уже существует', 'error');
        return;
      }

      try {
        const token = localStorage.getItem('token') || '';
        await updateCategory(cat.id, { name: newName.trim() }, token);
        setCategories((prev) =>
          prev.map((item) => (item.id === cat.id ? { ...item, name: newName.trim() } : item))
        );
        showToast('Категория обновлена!', 'success');
      } catch (err: any) {
        showToast('Ошибка при обновлении категории', 'error');
      }
    },
    [categories, setCategories]
  );

  return {
    fetchCategories,
    handleAddCategory,
    handleDelete,
    handleUpdate,
  };
}
