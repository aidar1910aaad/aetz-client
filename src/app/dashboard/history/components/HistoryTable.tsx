'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageLoader from '@/shared/loader/PageLoader';
import { AuditLogItem } from '@/api/auditLogs';
import { getMaterialById } from '@/api/material/exports';
import { useUserAuthorResolver } from '@/hooks/useUserAuthorResolver';
import { formatAlmatyDateTime } from '@/utils/formatAlmatyDateTime';

interface HistoryTableProps {
  history: AuditLogItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const ENTITY_LABELS: Record<string, string> = {
  material: 'Материал',
  calculation: 'Калькуляция',
  currency_settings: 'Курсы валют',
};

const ACTION_LABELS: Record<string, string> = {
  CREATE: 'Создание',
  UPDATE: 'Изменение',
  DELETE: 'Удаление',
};

const PREVIEW_LENGTH = 160;
const PREVIEW_LINES = 4;
const FIELD_LABELS_RU: Record<string, string> = {
  name: 'Название',
  slug: 'Слаг',
  data: 'Данные',
  categories: 'Категории',
  calculation: 'Расчет',
  cellConfig: 'Конфигурация ячейки',
  materials: 'Материалы',
  currency: 'Валюта',
  price: 'Цена',
  priceInCurrency: 'Цена в валюте',
  unit: 'Ед. изм.',
  code: 'Код',
  quantity: 'Кол-во',
  hourlyRate: 'Ставка в час',
  manufacturingHours: 'Трудозатраты',
  overheadPercentage: 'Накладные расходы (%)',
  adminPercentage: 'Административные расходы (%)',
  plannedProfitPercentage: 'Плановая прибыль (%)',
  ndsPercentage: 'НДС (%)',
  type: 'Тип',
};

const getRuFieldLabel = (key: string): string => FIELD_LABELS_RU[key] || key;

const getEntityBadgeClass = (entityType: string) => {
  switch (entityType) {
    case 'material':
      return 'bg-[#8eba1e]/10 text-[#6b8f16] ring-[#8eba1e]/25';
    case 'calculation':
      return 'bg-blue-50 text-blue-800 ring-blue-200/60';
    case 'currency_settings':
      return 'bg-violet-50 text-violet-800 ring-violet-200/60';
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200';
  }
};

const getActionBadgeClass = (action: string) => {
  switch (action) {
    case 'CREATE':
      return 'bg-emerald-50 text-emerald-800 ring-emerald-200/60';
    case 'UPDATE':
      return 'bg-amber-50 text-amber-800 ring-amber-200/60';
    case 'DELETE':
      return 'bg-red-50 text-red-700 ring-red-200/60';
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-200';
  }
};

const formatCellTypeRu = (type: string): string => {
  const mapping: Record<string, string> = {
    '0.4kv': '0.4 кВ',
    '10kv': '10 кВ',
    '20kv': '20 кВ',
    rza: 'РЗА',
    input: 'Ввод',
    outgoing: 'Отходящая',
    section_switch: 'Секционный выключатель',
  };
  return mapping[type] || type;
};

const summarizeCalculationData = (value: unknown): string | null => {
  if (!value || typeof value !== 'object') return null;
  const data = value as Record<string, unknown>;
  const categories = Array.isArray(data.categories) ? data.categories : [];
  const categoryCount = categories.length;
  const materialCount = categories.reduce((sum, category) => {
    const items: unknown[] =
      category && typeof category === 'object' && Array.isArray((category as Record<string, unknown>).items)
        ? ((category as Record<string, unknown>).items as unknown[])
        : [];
    return sum + items.length;
  }, 0);

  const cellConfig =
    data.cellConfig && typeof data.cellConfig === 'object'
      ? (data.cellConfig as Record<string, unknown>)
      : null;
  const cellType =
    cellConfig && typeof cellConfig.type === 'string' ? formatCellTypeRu(cellConfig.type) : '—';

  if (!categoryCount && !materialCount && cellType === '—') return null;
  return `Категорий: ${categoryCount}, Материалов: ${materialCount}, Тип ячейки: ${cellType}`;
};

const formatObjectValue = (value: unknown): string => {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const preview = value
      .slice(0, 2)
      .map((item) => {
        if (item && typeof item === 'object') {
          return '{...}';
        }
        return String(item);
      })
      .join(', ');
    return `[${preview}${value.length > 2 ? ', ...' : ''}]`;
  }

  if (typeof value === 'object') {
    const dataSummary = summarizeCalculationData(value);
    if (dataSummary) return dataSummary;

    const keys = Object.keys(value as Record<string, unknown>);
    return `{ ${keys
      .slice(0, 4)
      .map((key) => getRuFieldLabel(key))
      .join(', ')}${keys.length > 4 ? ', ...' : ''} }`;
  }

  return String(value);
};

export default function HistoryTable({ history, loading, error, onRetry }: HistoryTableProps) {
  const { resolveAuthor } = useUserAuthorResolver();
  const [valueModal, setValueModal] = useState<{ title: string; value: string } | null>(null);
  const [materialNames, setMaterialNames] = useState<Record<number, string>>({});
  const parsedModalValue = useMemo(() => {
    if (!valueModal) return null;
    try {
      return JSON.parse(valueModal.value) as unknown;
    } catch {
      return null;
    }
  }, [valueModal]);

  useEffect(() => {
    const loadMaterialNames = async () => {
      const ids = Array.from(
        new Set(
          history.filter((item) => item.entityType === 'material').map((item) => item.entityId)
        )
      ).filter((id) => !materialNames[id]);

      if (ids.length === 0) return;

      const token = localStorage.getItem('token') || '';
      if (!token) return;

      const results = await Promise.all(
        ids.map(async (id) => {
          try {
            const material = await getMaterialById(id, token);
            return { id, name: material.name };
          } catch {
            return { id, name: `Материал #${id}` };
          }
        })
      );

      setMaterialNames((prev) => {
        const next = { ...prev };
        results.forEach(({ id, name }) => {
          next[id] = name;
        });
        return next;
      });
    };

    loadMaterialNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const formatDate = (dateString: string) => formatAlmatyDateTime(dateString);

  const formatValue = (value: string | null) => {
    if (!value || value === 'null') return '-';
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  const renderValuePreview = (title: string, value: string | null) => {
    const formatted = formatValue(value);
    if (formatted === '-') return '-';

    const isObject = typeof formatted === 'object' && formatted !== null;
    if (isObject && !Array.isArray(formatted)) {
      const record = formatted as Record<string, unknown>;
      const calcData =
        record.data && typeof record.data === 'object' ? (record.data as Record<string, unknown>) : null;
      const categories = calcData && Array.isArray(calcData.categories) ? calcData.categories : null;
      const looksLikeCalculationPayload = 'name' in record && 'slug' in record && !!calcData && !!categories;

      if (looksLikeCalculationPayload) {
        const calculationName =
          typeof record.name === 'string' && record.name.trim().length > 0 ? record.name : 'Калькуляция';

        return (
          <div className="space-y-2 rounded-lg bg-gray-50 border border-gray-200 p-2.5 w-full">
            <Link
              href="/dashboard/calc"
              className="block text-xs text-[#8eba1e] hover:text-[#7aa31a] hover:underline font-medium"
            >
              {calculationName}
            </Link>
            <button
              type="button"
              onClick={() => setValueModal({ title, value: JSON.stringify(formatted, null, 2) })}
              className="block mt-1 text-xs text-[#8eba1e] hover:underline"
            >
              Подробнее
            </button>
          </div>
        );
      }
    }

    const fullText = isObject ? JSON.stringify(formatted, null, 2) : String(formatted);
    const lines = fullText.split('\n');
    const hasLongText = fullText.length > PREVIEW_LENGTH || lines.length > PREVIEW_LINES;
    const shortText = hasLongText ? `${fullText.slice(0, PREVIEW_LENGTH)}...` : fullText;

    let previewContent: React.ReactNode;
    if (isObject && !Array.isArray(formatted)) {
      const entries = Object.entries(formatted as Record<string, unknown>);
      previewContent = (
        <div className="space-y-1 text-xs">
          {entries.slice(0, PREVIEW_LINES).map(([key, val]) => (
            <div key={key} className="grid grid-cols-[90px_1fr] gap-2">
              <span className="text-gray-500 truncate">{getRuFieldLabel(key)}</span>
              <span className="text-gray-800 break-all">{formatObjectValue(val)}</span>
            </div>
          ))}
          {entries.length > PREVIEW_LINES && <div className="text-gray-400">...</div>}
        </div>
      );
    } else {
      previewContent = (
        <pre className="text-xs text-gray-700 whitespace-pre-wrap break-all leading-5">
          {shortText}
        </pre>
      );
    }

    return (
      <div className="space-y-2 rounded-lg bg-gray-50 border border-gray-200 p-2.5 w-full">
        {previewContent}
        {hasLongText && (
          <button
            type="button"
            onClick={() => setValueModal({ title, value: fullText })}
            className="text-xs text-[#8eba1e] hover:underline"
          >
            Подробнее
          </button>
        )}
      </div>
    );
  };

  const renderNewValueCell = (item: AuditLogItem) => {
    if (item.action === 'CREATE' && item.entityType === 'material' && item.newValue) {
      try {
        const parsed = JSON.parse(item.newValue) as { name?: string };
        if (parsed?.name) {
          return (
            <Link
              href={`/dashboard/materials/${item.entityId}/history`}
              className="text-[#8eba1e] hover:text-[#7aa31a] hover:underline font-medium"
            >
              {parsed.name}
            </Link>
          );
        }
      } catch {
        // ignore parse errors and fallback to generic renderer
      }
    }

    return renderValuePreview('Новое значение', item.newValue);
  };

  const renderDetailedValue = (value: unknown, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }

    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return <span className="text-gray-800 break-all">{String(value)}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-gray-400">[]</span>;
      }
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={`${depth}-${index}`} className="rounded-md border border-gray-200 bg-gray-50 p-2.5">
              <div className="text-[11px] text-gray-500 mb-2 font-medium">Элемент {index + 1}</div>
              {renderDetailedValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) {
        return <span className="text-gray-400">{'{}'}</span>;
      }
      return (
        <div className="space-y-2">
          {entries.map(([key, nestedValue]) => (
            <div
              key={`${depth}-${key}`}
              className="rounded-md border border-gray-100 bg-white p-2.5"
              style={{ marginLeft: `${depth * 8}px` }}
            >
              <div className="text-xs text-gray-500 mb-1.5 font-medium">{getRuFieldLabel(key)}</div>
              <div className="text-xs">{renderDetailedValue(nestedValue, depth + 1)}</div>
            </div>
          ))}
        </div>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  const isCalculationPayload = (value: unknown): value is {
    name?: string;
    slug?: string;
    data?: {
      categories?: Array<{
        name?: string;
        items?: Array<{ name?: string; unit?: string; price?: number; quantity?: number }>;
      }>;
      calculation?: Record<string, unknown>;
      cellConfig?: { type?: string; materials?: Record<string, unknown> };
    };
  } => {
    if (!value || typeof value !== 'object') return false;
    const record = value as Record<string, unknown>;
    return 'name' in record && 'data' in record;
  };

  const renderCalculationDetailedValue = (payload: {
    name?: string;
    slug?: string;
    data?: {
      categories?: Array<{
        name?: string;
        items?: Array<{ name?: string; unit?: string; price?: number; quantity?: number }>;
      }>;
      calculation?: Record<string, unknown>;
      cellConfig?: { type?: string; materials?: Record<string, unknown> };
    };
  }) => {
    const categories = payload.data?.categories || [];
    const calc = payload.data?.calculation || {};
    const cellConfig = payload.data?.cellConfig || {};

    return (
      <div className="space-y-4 text-sm">
        <div className="rounded-lg border border-gray-200 p-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Название</div>
              <div className="font-medium text-gray-900">{payload.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Слаг</div>
              <div className="font-medium text-gray-900">{payload.slug || '—'}</div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-2">Категории и материалы</div>
          <div className="space-y-3">
            {categories.length === 0 && <div className="text-gray-400">Категории не указаны</div>}
            {categories.map((category, idx) => (
              <div key={idx} className="rounded-md border border-gray-100">
                <div className="px-3 py-2 bg-gray-50 font-medium text-gray-800">
                  {category.name || `Категория ${idx + 1}`}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-gray-500 border-b border-gray-100">
                      <tr>
                        <th className="text-left px-3 py-2">Материал</th>
                        <th className="text-left px-3 py-2">Ед.</th>
                        <th className="text-right px-3 py-2">Цена</th>
                        <th className="text-right px-3 py-2">Кол-во</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(category.items || []).map((item, itemIdx) => (
                        <tr key={itemIdx} className="border-b border-gray-50 last:border-b-0">
                          <td className="px-3 py-2 text-gray-800">{item.name || '—'}</td>
                          <td className="px-3 py-2 text-gray-700">{item.unit || '—'}</td>
                          <td className="px-3 py-2 text-right text-gray-700">
                            {typeof item.price === 'number' ? item.price.toLocaleString('ru-RU') : '—'}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-700">{item.quantity ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-2">Параметры расчета</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(calc).map(([key, val]) => (
              <div key={key} className="flex justify-between gap-2 border-b border-gray-100 pb-1">
                <span className="text-gray-500">{getRuFieldLabel(key)}</span>
                <span className="text-gray-800 font-medium">{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-2">Конфигурация ячейки</div>
          <div className="text-xs text-gray-800">
            Тип: <span className="font-medium">{cellConfig.type ? formatCellTypeRu(cellConfig.type) : '—'}</span>
          </div>
        </div>
      </div>
    );
  };

  // Показываем overlay с лоадером поверх таблицы, если есть данные
  // Это предотвращает изменение высоты контента
  if (loading && history.length === 0) {
    return (
      <div className="relative min-h-[400px]">
        <PageLoader size="compact" className="min-h-[280px]" message="Загрузка истории..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white px-6 py-12 text-center">
        <p className="text-base font-semibold text-red-600">Ошибка загрузки</p>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 rounded-lg bg-[#8eba1e] px-4 py-2 text-sm font-medium text-white hover:bg-[#7aa31a]"
        >
          Повторить
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center">
        <p className="text-base font-semibold text-gray-900">Изменения не найдены</p>
        <p className="mt-1 text-sm text-gray-500">Попробуйте изменить фильтры</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#8eba1e]/20 bg-white">
      {loading && history.length > 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <PageLoader size="compact" message="Обновление..." />
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
              <th className="px-4 py-3 whitespace-nowrap">Дата / время</th>
              <th className="px-4 py-3">Сущность</th>
              <th className="px-4 py-3">Действие</th>
              <th className="px-4 py-3">Поле</th>
              <th className="min-w-[200px] px-4 py-3">Было</th>
              <th className="min-w-[200px] px-4 py-3">Стало</th>
              <th className="px-4 py-3 whitespace-nowrap">Пользователь</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {history.map((item, idx) => {
              const author = resolveAuthor(item.changedBy);
              return (
              <tr key={`${item.id}-${idx}`} className="transition-colors hover:bg-[#8eba1e]/5">
                <td className="px-4 py-3.5 whitespace-nowrap text-sm text-gray-600">
                  {item.changedAtAlmaty || formatDate(item.changedAt)}
                </td>
                <td className="px-4 py-3.5">
                  <div className="space-y-1">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getEntityBadgeClass(item.entityType)}`}
                    >
                      {item.entityTypeRu || ENTITY_LABELS[item.entityType] || item.entityType}
                    </span>
                    {item.entityType === 'material' && (
                      <Link
                        href={`/dashboard/materials/${item.entityId}/history`}
                        className="block text-xs font-medium text-[#8eba1e] hover:text-[#7aa31a]"
                      >
                        {materialNames[item.entityId] || `Материал #${item.entityId}`}
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${getActionBadgeClass(item.action)}`}
                  >
                    {item.actionRu || ACTION_LABELS[item.action] || item.action}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-600">
                  {item.fieldChangedRu || item.fieldChanged || '—'}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-700">
                  {renderValuePreview('Старое значение', item.oldValue)}
                </td>
                <td className="px-4 py-3.5 text-sm text-gray-900">
                  {renderNewValueCell(item)}
                </td>
                <td className="px-4 py-3.5">
                  <p className="text-sm font-medium text-gray-900">{author.name}</p>
                  {author.login && author.login !== author.name && (
                    <p className="text-xs text-gray-400">{author.login}</p>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {valueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h3 className="text-base font-semibold text-gray-900">{valueModal.title}</h3>
              <button
                type="button"
                onClick={() => setValueModal(null)}
                className="text-xl leading-none text-gray-400 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto p-5">
              {parsedModalValue !== null ? (
                <div className="text-xs">
                  {isCalculationPayload(parsedModalValue)
                    ? renderCalculationDetailedValue(parsedModalValue)
                    : renderDetailedValue(parsedModalValue)}
                </div>
              ) : (
                <pre className="whitespace-pre-wrap break-all text-xs text-gray-700">{valueModal.value}</pre>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

