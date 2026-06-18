'use client';

import { RefreshCw, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { AuditActionType, AuditEntityType } from '@/api/auditLogs';
import { Select } from '@/components/ui/select';

export interface HistoryFiltersState {
  entityType: '' | AuditEntityType;
  action: '' | AuditActionType;
  changedBy: string;
}

interface HistoryFiltersProps {
  filters: HistoryFiltersState;
  onFiltersChange: (filters: HistoryFiltersState) => void;
  onRefresh: () => void;
  loading: boolean;
}

const entityOptions: Array<{ value: '' | AuditEntityType; label: string }> = [
  { value: '', label: 'Все сущности' },
  { value: 'material', label: 'Материал' },
  { value: 'calculation', label: 'Калькуляция' },
  { value: 'currency_settings', label: 'Курсы валют' },
];

const actionOptions: Array<{ value: '' | AuditActionType; label: string }> = [
  { value: '', label: 'Все действия' },
  { value: 'CREATE', label: 'Создание' },
  { value: 'UPDATE', label: 'Изменение' },
  { value: 'DELETE', label: 'Удаление' },
];

export default function HistoryFilters({
  filters,
  onFiltersChange,
  onRefresh,
  loading,
}: HistoryFiltersProps) {
  const [localChangedBy, setLocalChangedBy] = useState(filters.changedBy);
  const debouncedChangedBy = useDebounce(localChangedBy, 500);

  useEffect(() => {
    setLocalChangedBy(filters.changedBy);
  }, [filters.changedBy]);

  useEffect(() => {
    if (debouncedChangedBy !== filters.changedBy) {
      onFiltersChange({ ...filters, changedBy: debouncedChangedBy });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedChangedBy]);

  const handleFilterChange = (key: keyof HistoryFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setLocalChangedBy('');
    onFiltersChange({ entityType: '', action: '', changedBy: '' });
  };

  const hasActiveFilters = filters.entityType || filters.action || filters.changedBy;

  return (
    <div className="mb-5 rounded-lg border border-[#8eba1e]/20 bg-white p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={filters.entityType}
            onChange={(e) =>
              handleFilterChange('entityType', e.target.value as HistoryFiltersState['entityType'])
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
          >
            {entityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Select
            value={filters.action}
            onChange={(e) =>
              handleFilterChange('action', e.target.value as HistoryFiltersState['action'])
            }
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={localChangedBy}
              onChange={(e) => setLocalChangedBy(e.target.value)}
              placeholder="Поиск по ФИО или email..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-10 pr-3 text-sm focus:border-[#8eba1e] focus:outline-none focus:ring-1 focus:ring-[#8eba1e]"
            />
          </div>
        </div>

        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:border-[#8eba1e] hover:text-[#8eba1e]"
            >
              Сбросить
            </button>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#7aa31a] disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Обновить
          </button>
        </div>
      </div>
    </div>
  );
}
