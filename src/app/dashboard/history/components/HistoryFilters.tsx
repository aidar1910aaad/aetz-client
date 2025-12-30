'use client';

import { RefreshCw, Calendar, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

export interface HistoryFiltersState {
  search: string;
  materialId: string;
  fieldChanged: string;
  changedBy: string;
  dateFrom: string;
  dateTo: string;
}

interface HistoryFiltersProps {
  filters: HistoryFiltersState;
  onFiltersChange: (filters: HistoryFiltersState) => void;
  onRefresh: () => void;
  loading: boolean;
}

const fieldOptions = [
  { value: '', label: 'Все поля' },
  { value: 'price', label: 'Цена' },
  { value: 'name', label: 'Название' },
  { value: 'code', label: 'Код' },
  { value: 'unit', label: 'Единица измерения' },
  { value: 'categoryId', label: 'Категория' },
  { value: 'description', label: 'Описание' },
  { value: 'manufacturer', label: 'Производитель' },
  { value: 'supplier', label: 'Поставщик' },
];

export default function HistoryFilters({
  filters,
  onFiltersChange,
  onRefresh,
  loading,
}: HistoryFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);
  const debouncedSearch = useDebounce(localSearch, 500);

  // Синхронизируем локальное состояние с пропсами
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Обновляем фильтры при изменении debouncedSearch
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ ...filters, search: debouncedSearch });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleFilterChange = (key: keyof HistoryFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const clearedFilters: HistoryFiltersState = {
      search: '',
      materialId: '',
      fieldChanged: '',
      changedBy: '',
      dateFrom: '',
      dateTo: '',
    };
    setLocalSearch('');
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters =
    filters.search ||
    filters.materialId ||
    filters.fieldChanged ||
    filters.changedBy ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="mb-6 space-y-4">
      {/* Основные фильтры */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          {/* Поиск */}
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Поиск по названию материала..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
            />
          </div>

          {/* ID материала */}
          <div className="relative">
            <input
              type="number"
              value={filters.materialId}
              onChange={(e) => handleFilterChange('materialId', e.target.value)}
              placeholder="ID материала"
              className="w-32 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
            />
          </div>

          {/* Поле */}
          <div className="relative">
            <select
              value={filters.fieldChanged}
              onChange={(e) => handleFilterChange('fieldChanged', e.target.value)}
              className="appearance-none w-48 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
            >
              {fieldOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
              ▼
            </div>
          </div>

          {/* Автор изменения */}
          <div className="relative">
            <input
              type="text"
              value={filters.changedBy}
              onChange={(e) => handleFilterChange('changedBy', e.target.value)}
              placeholder="Изменил"
              className="w-40 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
            />
          </div>

          {/* Даты */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#8eba1e]" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
              placeholder="От даты"
            />
            <span className="text-gray-500">—</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
              placeholder="До даты"
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              Сбросить
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-gray-100 hover:bg-[#8eba1e] text-gray-700 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Обновление...' : 'Обновить'}
          </button>
        </div>
      </div>
    </div>
  );
}

