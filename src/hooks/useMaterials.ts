'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialHistory,
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialHistoryItem,
} from '@/api/material';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token') || '';
      const cats = await getAllCategories(token);
      setAllCategories(cats);
    };

    fetchCategories();
  }, []);

  // ✅ Загрузка материалов
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getAllMaterials(token);
      console.log(data);
      setMaterials(data);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке материалов', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // ✅ Категории
  const categories = useMemo(
    () => ['Все', ...new Set(materials.map((m) => m.category?.name || 'Без категории'))],
    [materials]
  );

  const filtered = useMemo(
    () =>
      selectedCategory === 'Все'
        ? materials
        : materials.filter((m) => m.category?.name === selectedCategory),
    [selectedCategory, materials]
  );

  // ✅ Создание
  const handleCreate = async (data: CreateMaterialRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createMaterial(data, token);

      // ⏳ Подождем перед перезагрузкой — на случай async-commit БД
      await new Promise((res) => setTimeout(res, 300));

      await fetchMaterials();

      setSelectedCategory('Все'); // чтобы фильтр не скрывал его
      showToast('Материал создан!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при создании', 'error');
    }
  };

  // ✅ Удаление
  const handleDelete = async (id: number) => {
    const confirmed = await showConfirm({
      title: 'Удалить материал?',
      message: 'Это действие нельзя отменить.',
    });
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('token') || '';
      await deleteMaterial(id, token);
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      showToast('Материал удалён!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при удалении материала', 'error');
    }
  };

  // ✅ Обновление
  const handleUpdate = async (id: number, data: UpdateMaterialRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await updateMaterial(id, data, token);
      setMaterials((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
      showToast('Материал обновлён!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при обновлении материала', 'error');
    }
  };

  // ✅ История изменений
  const fetchHistory = async (id: number): Promise<MaterialHistoryItem[]> => {
    try {
      const token = localStorage.getItem('token') || '';
      return await getMaterialHistory(id, token);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке истории', 'error');
      return [];
    }
  };

  return {
    materials,
    setMaterials,
    selectedCategory,
    setSelectedCategory,
    filtered,
    categories,
    loading,
    fetchMaterials,
    handleCreate,
    handleDelete,
    handleUpdate,
    fetchHistory,
    allCategories,
  };
}
