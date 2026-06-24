import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  deleteMaterialsBatch,
  getMaterialHistory,
  getMaterialHistoryList,
  Material,
  CreateMaterialRequest,
  UpdateMaterialRequest,
  MaterialHistoryItem,
  MaterialHistoryWithMaterial,
  GetMaterialsParams,
  GetMaterialHistoryParams,
} from '../api/material/index';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';


export function useMaterials() {
  const searchParams = useSearchParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(500);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'price' | 'code' | 'createdAt'>('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedCurrency, setSelectedCurrency] = useState<
    'ALL' | 'FOREIGN' | 'KZT' | 'USD' | 'RUB' | 'EUR' | 'CNY'
  >('ALL');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, selectedCurrency, sort, order]);

  // ✅ Загрузка категорий при первом рендере
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const cats = await getAllCategories(token);
        setAllCategories(cats);
        
        // Читаем параметр категории из URL после загрузки категорий
        const categoryParam = searchParams.get('category');
        if (categoryParam && categoryParam !== selectedCategory) {
          // Проверяем, что категория существует в загруженных категориях
          const categoryExists = cats.some(cat => cat.name === categoryParam);
          if (categoryExists) {
            setSelectedCategory(categoryParam);
          }
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        showToast('Ошибка при загрузке категорий', 'error');
      }
    };
    fetchCategories();
  }, [searchParams]);

  const categories = useMemo(() => 
    ['Все', ...new Set(allCategories.map((c) => c.name))], 
    [allCategories]
  );

  // ✅ Загрузка материалов
  const fetchMaterials = useCallback(async () => {
    // Не загружаем материалы, если категории еще не загружены
    if (allCategories.length === 0) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';

      // Get category ID if a category is selected
      const selectedCategoryId =
        selectedCategory !== 'Все'
          ? allCategories.find((cat) => cat.name === selectedCategory)?.id
          : undefined;
      const matchesCurrency = (item: Material) => {
        const currency = (item.currency || 'KZT').toUpperCase();
        if (selectedCurrency === 'ALL') return true;
        if (selectedCurrency === 'FOREIGN') return currency !== 'KZT';
        return currency === selectedCurrency;
      };


      const effectiveLimit = limit === 0 ? 10000 : limit;
      const effectivePage = limit === 0 ? 1 : page;

      if (selectedCurrency === 'ALL') {
        const params: GetMaterialsParams = {
          page: effectivePage,
          limit: effectiveLimit,
          sort,
          order,
          categoryId: selectedCategoryId,
          search: debouncedSearch?.trim() || undefined,
        };
        const { data, total } = await getAllMaterials(token, params);
        setMaterials(data);
        setTotal(total);
      } else {
        // При фильтре по валюте берём расширенную выборку и пагинируем на клиенте,
        // чтобы корректно показывать только выбранные валюты.
        const params: GetMaterialsParams = {
          page: 1,
          limit: 10000,
          sort,
          order,
          categoryId: selectedCategoryId,
          search: debouncedSearch?.trim() || undefined,
        };
        const { data } = await getAllMaterials(token, params);
        const filteredByCurrency = data.filter(matchesCurrency);
        if (limit === 0) {
          setMaterials(filteredByCurrency);
          setTotal(filteredByCurrency.length);
        } else {
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          setMaterials(filteredByCurrency.slice(startIndex, endIndex));
          setTotal(filteredByCurrency.length);
        }
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      showToast('Ошибка при загрузке материалов', 'error');
      setMaterials([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, selectedCurrency, sort, order, allCategories]);

  // Загружаем материалы после загрузки категорий
  useEffect(() => {
    if (allCategories.length > 0) {
      fetchMaterials();
    }
  }, [allCategories.length]);

  // Fetch materials when other dependencies change
  useEffect(() => {
    if (allCategories.length > 0) {
      fetchMaterials();
    }
  }, [page, limit, debouncedSearch, selectedCategory, selectedCurrency, sort, order, fetchMaterials]);

  // Custom page setter that triggers fetch
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  // Custom limit setter that triggers fetch
  const handleLimitChange = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

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
      throw err;
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

  const handleDeleteMany = async (ids: number[]): Promise<boolean> => {
    if (ids.length === 0) {
      return false;
    }

    const confirmed = await showConfirm({
      title: `Удалить ${ids.length} материал(ов)?`,
      message: `Будут безвозвратно удалены ${ids.length} выбранных материалов. Это действие нельзя отменить.`,
      confirmText: `Удалить (${ids.length})`,
    });
    if (!confirmed) return false;

    try {
      const token = localStorage.getItem('token') || '';
      const result = await deleteMaterialsBatch(ids, token);
      await fetchMaterials();
      showToast(`Удалено материалов: ${result.deleted}`, 'success');
      return true;
    } catch (err: any) {
      showToast(err.message || 'Ошибка при массовом удалении материалов', 'error');
      return false;
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
      throw err;
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
    setPage: handlePageChange,
    limit,
    setLimit: handleLimitChange,
    search,
    setSearch,
    sort,
    setSort,
    order,
    setOrder,
    selectedCategory,
    setSelectedCategory,
    selectedCurrency,
    setSelectedCurrency,
    categories,
    loading,
    handleCreate,
    handleDelete,
    handleDeleteMany,
    handleUpdate,
    fetchHistory,
    allCategories,
    fetchMaterials,
  };
}
