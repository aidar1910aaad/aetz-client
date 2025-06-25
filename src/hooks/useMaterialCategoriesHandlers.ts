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
import { showEditModal } from '@/shared/modals/EditModalContainer';

interface NewCategory {
  name: string;
  description: string;
  id: number;
}

export function useMaterialCategoriesHandlers(
  categories: Category[],
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>,
  setNewCategory: React.Dispatch<React.SetStateAction<NewCategory>>
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
    async (newCategory: NewCategory) => {
      const trimmedName = newCategory.name.trim();

      if (!trimmedName || !newCategory.id) {
        showToast('Название и ID категории обязательны', 'error');
        return;
      }

      const existsByName = categories.some(
        (cat) => cat.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (existsByName) {
        showToast('Категория с таким названием уже существует', 'error');
        return;
      }

      const existsById = categories.some((cat) => cat.id === newCategory.id);
      if (existsById) {
        showToast('Категория с таким ID уже существует', 'error');
        return;
      }

      try {
        const token = localStorage.getItem('token') || '';
        const created = await createCategory(
          {
            name: trimmedName,
            id: newCategory.id,
            description: newCategory.description.trim(),
          },
          token
        );
        console.log('Created category:', created);
        setCategories((prev) => [...prev, created]);
        setNewCategory({ name: '', description: '', id: 0 });
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
      console.log('Starting category update for:', cat);

      const result = await showEditModal({
        title: 'Редактировать категорию',
        initialValues: {
          name: cat.name,
          description: cat.description,
        },
        fields: [
          {
            name: 'name',
            label: 'Название',
            type: 'text',
            required: true,
          },
          {
            name: 'description',
            label: 'Описание',
            type: 'textarea',
            required: false,
          },
        ],
      });

      if (!result) {
        console.log('Edit modal cancelled');
        return;
      }

      console.log('Edit modal result:', result);

      const { name, description } = result;
      const trimmedName = name.trim();

      if (!trimmedName) {
        showToast('Название категории обязательно', 'error');
        return;
      }

      const existsByName = categories.some(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase() && c.id !== cat.id
      );
      if (existsByName) {
        showToast('Категория с таким названием уже существует', 'error');
        return;
      }

      try {
        const token = localStorage.getItem('token') || '';
        const updateData = {
          name: trimmedName,
        };

        console.log('Sending update request with data:', updateData);

        await updateCategory(cat.id, updateData, token);

        console.log('Update successful, updating local state');

        setCategories((prev) =>
          prev.map((item) =>
            item.id === cat.id
              ? {
                  ...item,
                  name: trimmedName,
                  description: description?.trim() || '',
                }
              : item
          )
        );
        showToast('Категория обновлена!', 'success');
      } catch (err: any) {
        console.error('Error updating category:', err);
        showToast(err.message || 'Ошибка при обновлении категории', 'error');
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
