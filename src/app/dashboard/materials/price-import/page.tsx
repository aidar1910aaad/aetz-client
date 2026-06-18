'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeftRight, ChevronLeft, RefreshCw } from 'lucide-react';
import RoleGuard from '@/components/common/RoleGuard';
import PageLoader from '@/shared/loader/PageLoader';
import { UserRole } from '@/types/user';
import { formatAmount } from '@/utils/formatAmount';
import {
  getMaterialPriceImportPreview,
  PriceImportPreview,
  PriceImportPreviewRow,
} from '@/api/material/priceImport';

type Filter = 'all' | 'update' | 'create' | 'skip_unchanged' | 'skip_empty';

const actionLabels: Record<string, string> = {
  update: 'Обновить',
  create: 'Создать',
  skip_unchanged: 'Без изменений',
  skip_empty: 'Пропуск (пустая цена)',
};

const actionClasses: Record<string, string> = {
  update: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200',
  create: 'bg-green-100 text-green-800 ring-1 ring-green-200',
  skip_unchanged: 'bg-gray-100 text-gray-700 ring-1 ring-gray-200',
  skip_empty: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200',
};

function formatPrice(value?: number | null) {
  if (value == null) return '—';
  return `${formatAmount(value)} ₸`;
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function namesChanged(row: PriceImportPreviewRow) {
  const before = row.before?.name;
  const after = row.after?.name;
  if (!before || !after) return false;
  return normalizeText(before) !== normalizeText(after);
}

function formatDiff(value: number | null) {
  if (value == null) return '—';
  if (value === 0) return <span className="text-gray-400">0 ₸</span>;
  const className = value > 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium';
  return (
    <span className={className}>
      {value > 0 ? '+' : ''}
      {formatAmount(value)} ₸
    </span>
  );
}

export default function MaterialPriceImportPreviewPage() {
  const [preview, setPreview] = useState<PriceImportPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token') || '';
      const data = await getMaterialPriceImportPreview(token);
      setPreview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить предпросмотр');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPreview();
  }, [loadPreview]);

  const filteredRows = useMemo(() => {
    if (!preview) return [];
    return preview.rows.filter((row) => {
      if (filter !== 'all' && row.action !== filter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return (
        row.code.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q) ||
        (row.before?.name ?? '').toLowerCase().includes(q) ||
        (row.after?.name ?? '').toLowerCase().includes(q) ||
        String(row.before?.id ?? '').includes(q)
      );
    });
  }, [preview, filter, search]);

  if (loading) {
    return (
      <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PTO]} redirectTo="/dashboard/materials">
        <PageLoader />
      </RoleGuard>
    );
  }

  return (
    <RoleGuard allowedRoles={[UserRole.ADMIN, UserRole.PTO]} redirectTo="/dashboard/materials">
      <div className="h-[calc(100vh-64px)] min-h-0 bg-gray-50 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 p-6 bg-white border-b border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/dashboard/materials"
              className="p-3 bg-gray-100 hover:bg-[#8eba1e] rounded-xl transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-white" />
            </Link>
            <div className="p-3 bg-gray-100 rounded-xl">
              <ArrowLeftRight className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-gray-900">Импорт цен: было → станет</h1>
              <p className="text-sm text-gray-600">
                {preview?.baselineSource === 'snapshot'
                  ? `Сравнение Excel со снимком БД до импорта${
                      preview.baselineExportedAt
                        ? ` (${new Date(preview.baselineExportedAt).toLocaleString('ru-RU')})`
                        : ''
                    }. Запись в БД здесь не выполняется.`
                  : 'Сравнение Excel с текущей базой. Запись в БД здесь не выполняется.'}
              </p>
            </div>
            <button
              onClick={loadPreview}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 hover:bg-[#8eba1e] hover:text-white transition-colors shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
              Обновить
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          )}

          {preview && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {[
                ['В Excel', preview.summary.totalExcelRows],
                ['Обновить', preview.summary.toUpdate],
                ['Создать', preview.summary.toCreate],
                ['Без изменений', preview.summary.unchanged],
                ['Пустая цена', preview.summary.skippedEmpty],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-xl bg-gray-50 px-4 py-3 border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
                  <div className="text-xl font-semibold text-gray-900 mt-0.5">{value}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по коду, названию, id..."
              className="min-w-[240px] flex-1 rounded-xl border border-gray-200 px-4 py-2.5 bg-white"
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as Filter)}
              className="rounded-xl border border-gray-200 px-4 py-2.5 bg-white min-w-[180px]"
            >
              <option value="all">Все строки</option>
              <option value="update">Только обновления</option>
              <option value="create">Только новые</option>
              <option value="skip_unchanged">Без изменений</option>
              <option value="skip_empty">Пустая цена</option>
            </select>
            {preview && (
              <span className="text-sm text-gray-500">
                Показано {filteredRows.length} из {preview.rows.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 p-6">
          <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-auto">
            <table className="w-full text-sm table-fixed min-w-[1100px]">
              <colgroup>
                <col className="w-[130px]" />
                <col className="w-[120px]" />
                <col className="w-[56px]" />
                <col className="w-[22%]" />
                <col className="w-[22%]" />
                <col className="w-[100px]" />
                <col className="w-[100px]" />
                <col className="w-[90px]" />
              </colgroup>
              <thead className="sticky top-0 z-20">
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 shadow-sm">
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold">
                    Действие
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold">
                    Код
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold">ID</th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold">
                    Название (было)
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-left font-semibold">
                    Название (станет)
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-right font-semibold whitespace-nowrap">
                    Было
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-right font-semibold whitespace-nowrap">
                    Станет
                  </th>
                  <th className="sticky top-0 z-20 bg-gray-50 px-4 py-3 text-right font-semibold whitespace-nowrap">
                    Разница
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((row, index) => {
                    const nameChanged = namesChanged(row);
                    const priceChanged =
                      row.before?.price != null &&
                      row.after?.price != null &&
                      row.priceDiff !== 0;

                    return (
                      <tr
                        key={`${row.code}-${row.line}`}
                        className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60'}
                      >
                        <td className="px-4 py-3 align-top">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap ${actionClasses[row.action]}`}
                          >
                            {actionLabels[row.action]}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="text-xs text-gray-800 tabular-nums break-all leading-relaxed">
                            {row.code}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-gray-600 tabular-nums">
                          {row.before?.id ?? '—'}
                        </td>
                        <td className="px-4 py-3 align-top text-gray-600 leading-snug break-words">
                          {row.before?.name ?? '—'}
                        </td>
                        <td
                          className={`px-4 py-3 align-top leading-snug break-words ${
                            nameChanged ? 'text-gray-900 font-medium' : 'text-gray-600'
                          }`}
                        >
                          {row.after?.name ?? '—'}
                        </td>
                        <td className="px-4 py-3 align-top text-right text-gray-600 tabular-nums whitespace-nowrap">
                          {formatPrice(row.before?.price)}
                        </td>
                        <td
                          className={`px-4 py-3 align-top text-right tabular-nums whitespace-nowrap ${
                            priceChanged ? 'text-gray-900 font-semibold' : 'text-gray-600'
                          }`}
                        >
                          {formatPrice(row.after?.price)}
                        </td>
                        <td className="px-4 py-3 align-top text-right tabular-nums whitespace-nowrap">
                          {formatDiff(row.priceDiff)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
            </table>

            {!filteredRows.length && !error && (
              <div className="text-center text-gray-500 py-12">Нет строк по выбранному фильтру</div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
