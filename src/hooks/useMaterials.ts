import { useEffect, useState, useCallback } from 'react';
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
  GetMaterialsParams,
} from '@/api/material';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';

export function useMaterials() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'price' | 'code'>('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  // ✅ Загрузка материалов
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const params: GetMaterialsParams = {
        page,
        limit,
        search: debouncedSearch?.trim() || undefined,
        sort,
        order,
        categoryId:
          selectedCategory !== 'Все'
            ? allCategories.find((cat) => cat.name === selectedCategory)?.id
            : undefined,
      };
      const { data, total } = await getAllMaterials(token, params);
      setMaterials(data);
      setTotal(total);
    } catch (err: any) {
      showToast(err.message || 'Ошибка при загрузке материалов', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, sort, order, selectedCategory, allCategories]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  // ✅ Загрузка категорий при первом рендере
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem('token') || '';
      const cats = await getAllCategories(token);
      setAllCategories(cats);
    };
    fetchCategories();
  }, []);

  const categories = ['Все', ...new Set(allCategories.map((c) => c.name))];

  // ✅ Создание материала
  const handleCreate = async (data: CreateMaterialRequest) => {
    try {
      const token = localStorage.getItem('token') || '';
      await createMaterial(data, token);
      await fetchMaterials();
      setSelectedCategory('Все');
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
      await fetchMaterials();
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
      await fetchMaterials();
      showToast('Материал обновлён!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при обновлении материала', 'error');
    }
  };

  // ✅ История
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
    total,
    page,
    setPage,
    limit,
    setLimit,
    search,
    setSearch,
    sort,
    setSort,
    order,
    setOrder,
    selectedCategory,
    setSelectedCategory,
    categories,
    loading,
    handleCreate,
    handleDelete,
    handleUpdate,
    fetchHistory,
    allCategories,
    fetchMaterials,
  };
}
