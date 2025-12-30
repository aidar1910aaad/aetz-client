'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getMaterialHistoryList, MaterialHistoryWithMaterial, GetMaterialHistoryParams } from '@/api/material/exports';
import HistoryHeader from './components/HistoryHeader';
import HistoryFilters, { HistoryFiltersState } from './components/HistoryFilters';
import HistoryTable from './components/HistoryTable';
import HistoryPagination from './components/HistoryPagination';

export default function HistoryPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);
  
  const [filters, setFilters] = useState<HistoryFiltersState>({
    search: '',
    materialId: '',
    fieldChanged: '',
    changedBy: '',
    dateFrom: '',
    dateTo: '',
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [history, setHistory] = useState<MaterialHistoryWithMaterial[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Сохраняем предыдущие значения, чтобы они не пропадали во время загрузки
  const previousTotalRef = useRef<number>(0);
  const previousHistoryRef = useRef<MaterialHistoryWithMaterial[]>([]);

  // Функция загрузки истории изменений
  const fetchHistory = useCallback(async () => {
    try {
      // Сохраняем текущую позицию скролла перед загрузкой (только если это не первая загрузка)
      if (!isInitialLoad.current && scrollContainerRef.current) {
        scrollPositionRef.current = scrollContainerRef.current.scrollTop;
      }
      
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      // Формируем параметры запроса
      const params: GetMaterialHistoryParams = {
        page,
        limit,
      };

      if (filters.search) {
        params.search = filters.search;
      }
      if (filters.materialId) {
        params.materialId = parseInt(filters.materialId, 10);
        if (isNaN(params.materialId)) {
          params.materialId = undefined;
        }
      }
      if (filters.fieldChanged) {
        params.fieldChanged = filters.fieldChanged;
      }
      if (filters.changedBy) {
        params.changedBy = filters.changedBy;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const data = await getMaterialHistoryList(token, params);
      console.log('📋 Загруженная история изменений:', data);
      const newHistory = data.data || [];
      const newTotal = data.total || 0;
      
      // Проверяем данные на наличие materialId
      if (newHistory.length > 0) {
        console.log('🔍 Проверка данных истории:', {
          firstItem: newHistory[0],
          hasMaterialId: newHistory[0].materialId !== undefined,
          materialId: newHistory[0].materialId,
          hasMaterial: !!newHistory[0].material,
          materialObject: newHistory[0].material,
        });
      }
      
      // Всегда обновляем данные, если они получены
      setHistory(newHistory);
      setTotal(newTotal);
      
      // Сохраняем в ref для будущего использования
      if (newTotal > 0) {
        previousTotalRef.current = newTotal;
      }
      if (newHistory.length > 0) {
        previousHistoryRef.current = newHistory;
      }
    } catch (err: any) {
      console.error('❌ Ошибка при загрузке истории изменений:', err);
      setError(err.message || 'Ошибка при загрузке истории изменений');
    } finally {
      setLoading(false);
      
      // Восстанавливаем позицию скролла после загрузки (только если это не первая загрузка)
      if (!isInitialLoad.current) {
        requestAnimationFrame(() => {
          if (scrollContainerRef.current && scrollPositionRef.current > 0) {
            scrollContainerRef.current.scrollTop = scrollPositionRef.current;
          }
        });
      } else {
        isInitialLoad.current = false;
      }
    }
  }, [filters, page, limit]);

  // Загружаем историю при изменении фильтров, страницы или лимита
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Сбрасываем страницу на 1 при изменении фильтров
  useEffect(() => {
    setPage(1);
  }, [filters.search, filters.materialId, filters.fieldChanged, filters.changedBy, filters.dateFrom, filters.dateTo]);

  // Синхронизируем значения с ref для сохранения во время загрузки
  useEffect(() => {
    if (total > 0) {
      previousTotalRef.current = total;
    }
  }, [total]);

  useEffect(() => {
    if (history.length > 0) {
      previousHistoryRef.current = history;
    }
  }, [history]);

  // Вычисляем общее количество страниц
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      // Прокручиваем вверх при смене страницы
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div 
      ref={scrollContainerRef}
      className="h-[calc(100vh-64px)] bg-white overflow-y-auto"
    >
      <div className="p-6">
        <HistoryHeader 
          total={total || previousTotalRef.current} 
          showing={history.length || previousHistoryRef.current.length} 
          loading={loading} 
        />

        <HistoryFilters
          filters={filters}
          onFiltersChange={setFilters}
          onRefresh={fetchHistory}
          loading={loading}
        />

        <HistoryTable history={history} loading={loading} error={error} />

        {!loading && !error && history.length > 0 && (
          <HistoryPagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  );
}
