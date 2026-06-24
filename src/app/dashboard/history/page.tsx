'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAuditLogs, AuditLogItem } from '@/api/auditLogs';
import HistoryHeader from './components/HistoryHeader';
import HistoryFilters, { HistoryFiltersState } from './components/HistoryFilters';
import HistoryTable from './components/HistoryTable';
import HistoryPagination from './components/HistoryPagination';
import PageLoader from '@/shared/loader/PageLoader';

function HistoryPageContent() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isInitialLoad = useRef<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [filters, setFilters] = useState<HistoryFiltersState>({
    entityType: '',
    action: '',
    changedBy: searchParams.get('changedBy') || '',
    materialSearch: searchParams.get('materialSearch') || '',
  });
  const [page, setPage] = useState(Number(searchParams.get('page') || 1));
  const [limit, setLimit] = useState(Number(searchParams.get('limit') || 50));
  const [history, setHistory] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const previousTotalRef = useRef<number>(0);
  const previousHistoryRef = useRef<AuditLogItem[]>([]);

  useEffect(() => {
    setFilters({
      entityType: (searchParams.get('entityType') as HistoryFiltersState['entityType']) || '',
      action: (searchParams.get('action') as HistoryFiltersState['action']) || '',
      changedBy: searchParams.get('changedBy') || '',
      materialSearch: searchParams.get('materialSearch') || '',
    });
    setPage(Number(searchParams.get('page') || 1));
    setLimit(Number(searchParams.get('limit') || 50));
  }, [searchParams]);

  const syncQueryParams = useCallback(
    (nextFilters: HistoryFiltersState, nextPage: number, nextLimit: number) => {
      const params = new URLSearchParams();
      if (nextFilters.entityType) params.set('entityType', nextFilters.entityType);
      if (nextFilters.action) params.set('action', nextFilters.action);
      if (nextFilters.changedBy) params.set('changedBy', nextFilters.changedBy);
      if (nextFilters.materialSearch) params.set('materialSearch', nextFilters.materialSearch);
      if (nextPage > 1) params.set('page', String(nextPage));
      if (nextLimit !== 50) params.set('limit', String(nextLimit));
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname]
  );

  const fetchHistory = useCallback(async () => {
    try {
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

      const data = await getAuditLogs(token, {
        page,
        limit,
        entityType: filters.entityType || undefined,
        action: filters.action || undefined,
        changedBy: filters.changedBy || undefined,
        materialSearch: filters.materialSearch || undefined,
      });
      const newHistory = data.data || [];
      const newTotal = data.total || 0;

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

  useEffect(() => {
    syncQueryParams(filters, page, limit);
  }, [filters, page, limit, syncQueryParams]);

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

  const handleFiltersChange = (nextFilters: HistoryFiltersState) => {
    setFilters(nextFilters);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div
      ref={scrollContainerRef}
      className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50"
    >
      <HistoryHeader
        total={total || previousTotalRef.current}
        showing={history.length || previousHistoryRef.current.length}
        loading={loading}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <HistoryFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onRefresh={fetchHistory}
          loading={loading}
        />

        <HistoryTable history={history} loading={loading} error={error} onRetry={fetchHistory} />

        {!loading && !error && history.length > 0 && (
          <HistoryPagination
            currentPage={page}
            totalPages={totalPages}
            total={total}
            limit={limit}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        )}
      </div>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <HistoryPageContent />
    </Suspense>
  );
}
