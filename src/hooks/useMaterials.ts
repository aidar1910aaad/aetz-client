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
} from '../api/material/index';
import { searchMaterials } from '../api/material';
import { getAllCategories, Category } from '@/api/categories';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { useDebounce } from '@/hooks/useDebounce';

console.log('DEBUG updateMaterial:', updateMaterial);

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

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedCategory, sort, order]);

  // ✅ Загрузка категорий при первом рендере
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        console.log('Fetching categories...');
        const cats = await getAllCategories(token);
        console.log('Received categories:', cats);
        setAllCategories(cats);
      } catch (err) {
        console.error('Error fetching categories:', err);
        showToast('Ошибка при загрузке категорий', 'error');
      }
    };
    fetchCategories();
  }, []);

  const categories = ['Все', ...new Set(allCategories.map((c) => c.name))];
  console.log('Available categories:', categories);

  // ✅ Загрузка материалов
  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      console.log('Token:', token ? 'Present' : 'Missing');
      console.log('Current page:', page);

      // Get category ID if a category is selected
      const selectedCategoryId =
        selectedCategory !== 'Все'
          ? allCategories.find((cat) => cat.name === selectedCategory)?.id
          : undefined;

      console.log('Selected category:', selectedCategory);
      console.log('Selected category ID:', selectedCategoryId);
      console.log('All categories:', allCategories);

      // If there's a search term, use searchMaterials instead of getAllMaterials
      if (debouncedSearch?.trim()) {
        console.log('Using search with term:', debouncedSearch);
        const results = await searchMaterials(debouncedSearch.trim(), token);
        console.log('Search results:', results);

        if (results && Array.isArray(results)) {
          // Filter by category if selected
          let filteredResults = results;
          if (selectedCategoryId) {
            filteredResults = results.filter((item) => {
              const matches = item.category?.id === selectedCategoryId;
              console.log('Item category check:', {
                itemId: item.id,
                itemCategoryId: item.category?.id,
                selectedCategoryId,
                matches,
              });
              return matches;
            });
            console.log('Filtered results by category:', filteredResults.length);
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

          console.log('Pagination details:', {
            total: filteredResults.length,
            startIndex,
            endIndex,
            pageSize: limit,
            currentPage: page,
            resultsCount: paginatedResults.length,
          });

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
        console.log('Fetching materials with params:', params);
        const { data, total } = await getAllMaterials(token, params);
        console.log('Received materials:', {
          count: data.length,
          total,
          page,
          limit,
          firstItem: data[0],
          lastItem: data[data.length - 1],
        });

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

  // Fetch materials when dependencies change
  useEffect(() => {
    console.log('Fetching materials with dependencies:', {
      page,
      limit,
      debouncedSearch,
      sort,
      order,
      selectedCategory,
    });
    fetchMaterials();
  }, [fetchMaterials]);

  // Custom page setter that triggers fetch
  const handlePageChange = useCallback((newPage: number) => {
    console.log('Changing page to:', newPage);
    setPage(newPage);
  }, []);

  // Custom limit setter that triggers fetch
  const handleLimitChange = useCallback((newLimit: number) => {
    console.log('Changing limit to:', newLimit);
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
