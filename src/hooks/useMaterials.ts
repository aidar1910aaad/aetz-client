import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getAllMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
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
import { searchMaterials } from '../api/material';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';


export function useMaterials() {
  const searchParams = useSearchParams();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'name' | 'price' | 'code'>('name');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  const [allCategories, setAllCategories] = useState<Category[]>([]);

  const debouncedSearch = useDebounce(search, 500);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, sort, order]);

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


      // If there's a search term, use searchMaterials instead of getAllMaterials
      if (debouncedSearch?.trim()) {
        const results = await searchMaterials(debouncedSearch.trim(), token);

        if (results && Array.isArray(results)) {
          // Filter by category if selected
          let filteredResults = results;
          if (selectedCategoryId) {
            filteredResults = results.filter((item) => {
              const matches = item.category?.id === selectedCategoryId;
              return matches;
            });
          }

          // Apply sorting
          filteredResults.sort((a, b) => {
            let valueA, valueB;
            switch (sort) {
              case 'price':
                valueA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
                valueB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
                break;
              case 'code':
                valueA = a.code || '';
                valueB = b.code || '';
                break;
              default: // name
                valueA = a.name.toLowerCase();
                valueB = b.name.toLowerCase();
            }

            if (order === 'ASC') {
              return valueA > valueB ? 1 : -1;
            } else {
              return valueA < valueB ? 1 : -1;
            }
          });

          // Apply pagination
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedResults = filteredResults.slice(startIndex, endIndex);


          setMaterials(paginatedResults);
          setTotal(filteredResults.length);
        } else {
          setMaterials([]);
          setTotal(0);
        }
      } else {
        // If no search term, use getAllMaterials with pagination
        const params: GetMaterialsParams = {
          page,
          limit,
          sort,
          order,
          categoryId: selectedCategoryId,
        };
        const { data, total } = await getAllMaterials(token, params);

        setMaterials(data);
        setTotal(total);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      showToast('Ошибка при загрузке материалов', 'error');
      setMaterials([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, selectedCategory, sort, order, allCategories]);

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
  }, [page, limit, debouncedSearch, selectedCategory, sort, order, fetchMaterials]);

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
