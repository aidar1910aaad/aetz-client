'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useMaterialHistory } from '@/hooks/useMaterialHistory';
import HeroSection from '../components/HeroSection';
import { Select } from '@/components/ui/select';
import { useBktpStore } from '@/store/useBktpStore';
import { resetBktpWizard } from '@/utils/resetBktpWizard';

const quickActions = [
  { title: 'Формирование БКТП', desc: 'Новая заявка и расчёт', href: '/dashboard/bktp' },
  { title: 'История заявок', desc: 'Все сохранённые заявки', href: '/dashboard/requests' },
  { title: 'Расчёты стоимости', desc: 'Справочники и группы', href: '/dashboard/calc' },
  { title: 'Материалы', desc: 'Каталог номенклатуры', href: '/dashboard/materials' },
  { title: 'Пользователи', desc: 'Учётные записи', href: '/dashboard/users' },
  { title: 'Настройки БКТП', desc: 'Параметры модулей', href: '/dashboard/bktp/settings' },
];

type SortMode = 'totalValue' | 'count' | 'name';

const sortModes: Array<{ mode: SortMode; label: string }> = [
  { mode: 'totalValue', label: 'По сумме' },
  { mode: 'count', label: 'По кол-ву' },
  { mode: 'name', label: 'По имени' },
];

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';
type StatusFilter = 'all' | 'active' | 'completed';

const periodFilters: Array<{ value: PeriodFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
];

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'completed', label: 'Завершённые' },
];

type MaterialChangeTypeFilter = 'all' | 'name' | 'price' | 'category';

function getFieldLabel(field: string) {
  if (field === 'price' || field === 'priceInCurrency') return 'Цена';
  if (field === 'name') return 'Название';
  if (field === 'category') return 'Категория';
  return field;
}

function getUserLabel(user: any) {
  if (!user) return null;
  if (user.firstName || user.lastName) {
    return [user.lastName, user.firstName].filter(Boolean).join(' ');
  }
  return user.username;
}

export default function DashboardHome() {
  const router = useRouter();
  const stats = useDashboardStats();
  const materialHistory = useMaterialHistory();
  const { taskNumber, client, furthestStepIndex } = useBktpStore();
  const [sortModeIndex, setSortModeIndex] = useState(0);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [showClientFilters, setShowClientFilters] = useState(false);
  const [showMaterialFilters, setShowMaterialFilters] = useState(false);
  const [showBktpModal, setShowBktpModal] = useState(false);

  const [materialPeriodFilter, setMaterialPeriodFilter] = useState<PeriodFilter>('all');
  const [materialChangeTypeFilter, setMaterialChangeTypeFilter] = useState<MaterialChangeTypeFilter>('all');
  const [materialUserFilter, setMaterialUserFilter] = useState<string>('all');

  const totalPortfolioValue = useMemo(() => {
    return stats.allApplications.reduce((sum: number, app: any) => {
      return sum + (parseFloat(app.totalAmount) || 0);
    }, 0);
  }, [stats.allApplications]);

  const filteredApplications = useMemo(() => {
    if (!stats.allApplications.length) return [];

    let filtered = [...stats.allApplications];

    if (periodFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((app: any) => {
        const appDate = new Date(app.date);
        const appDateOnly = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());

        switch (periodFilter) {
          case 'today':
            return appDateOnly.getTime() === today.getTime();
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDateOnly >= weekAgo;
          }
          case 'month':
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3);
            return Math.floor(appDate.getMonth() / 3) === quarter && appDate.getFullYear() === now.getFullYear();
          }
          case 'year':
            return appDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((app: any) => {
        if (statusFilter === 'active') return !app.completed;
        if (statusFilter === 'completed') return app.completed;
        return true;
      });
    }

    if (minAmount > 0) {
      filtered = filtered.filter((app: any) => {
        const amount = parseFloat(app.totalAmount) || 0;
        return amount >= minAmount;
      });
    }

    return filtered;
  }, [stats.allApplications, periodFilter, statusFilter, minAmount]);

  const sortedClients = useMemo(() => {
    if (!filteredApplications.length) return [];

    const clientStats = filteredApplications.reduce((acc: any, app: any) => {
      const client = app.client || 'Неизвестный клиент';
      if (!acc[client]) {
        acc[client] = { count: 0, totalValue: 0 };
      }
      acc[client].count += 1;
      acc[client].totalValue += parseFloat(app.totalAmount) || 0;
      return acc;
    }, {});

    const clients = Object.entries(clientStats)
      .map(([client, data]: [string, any]) => ({
        client,
        count: data.count,
        totalValue: data.totalValue,
      }))
      .slice(0, 6);

    const currentMode = sortModes[sortModeIndex].mode;
    switch (currentMode) {
      case 'totalValue':
        return clients.sort((a, b) => b.totalValue - a.totalValue);
      case 'count':
        return clients.sort((a, b) => b.count - a.count);
      case 'name':
        return clients.sort((a, b) => a.client.localeCompare(b.client, 'ru'));
      default:
        return clients;
    }
  }, [filteredApplications, sortModeIndex]);

  const filteredMaterialChanges = useMemo(() => {
    if (!materialHistory.allChanges.length) return [];

    let filtered = [...materialHistory.allChanges];

    if (materialPeriodFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter((change: any) => {
        const changeDate = new Date(change.changedAt);
        const changeDateOnly = new Date(changeDate.getFullYear(), changeDate.getMonth(), changeDate.getDate());

        switch (materialPeriodFilter) {
          case 'today':
            return changeDateOnly.getTime() === today.getTime();
          case 'week': {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return changeDateOnly >= weekAgo;
          }
          case 'month':
            return changeDate.getMonth() === now.getMonth() && changeDate.getFullYear() === now.getFullYear();
          case 'quarter': {
            const quarter = Math.floor(now.getMonth() / 3);
            return Math.floor(changeDate.getMonth() / 3) === quarter && changeDate.getFullYear() === now.getFullYear();
          }
          case 'year':
            return changeDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    if (materialChangeTypeFilter !== 'all') {
      filtered = filtered.filter((change: any) => change.fieldChanged === materialChangeTypeFilter);
    }

    if (materialUserFilter !== 'all') {
      filtered = filtered.filter((change: any) => change.changedBy === materialUserFilter);
    }

    return filtered
      .sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 4);
  }, [materialHistory.allChanges, materialPeriodFilter, materialChangeTypeFilter, materialUserFilter]);

  const uniqueUsers = useMemo(() => {
    if (!materialHistory.allChanges.length) return [];
    const users = new Set(materialHistory.allChanges.map((change: any) => change.changedBy));
    return Array.from(users).sort();
  }, [materialHistory.allChanges]);

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0 ₸';
    }
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const hasActiveClientFilters = periodFilter !== 'all' || statusFilter !== 'all' || minAmount > 0;
  const hasActiveMaterialFilters =
    materialPeriodFilter !== 'all' || materialChangeTypeFilter !== 'all' || materialUserFilter !== 'all';

  const getRequestHref = (app: any) => (app.id ? `/dashboard/requests/${app.id}` : '/dashboard/requests');
  const hasCurrentBktp =
    taskNumber.trim() !== '' || client.trim() !== '' || Number(furthestStepIndex || 0) > 0;

  const handleOpenBktp = () => {
    if (hasCurrentBktp) {
      setShowBktpModal(true);
      return;
    }
    router.push('/dashboard/bktp');
  };

  const handleStartFreshBktp = () => {
    resetBktpWizard();
    setShowBktpModal(false);
    router.push('/dashboard/bktp');
  };

  const handleGoToCurrentBktp = () => {
    setShowBktpModal(false);
    router.push('/dashboard/final');
  };

  const metrics = [
    { label: 'Всего заявок', hint: 'в системе', value: stats.totalApplications },
    { label: 'Активные', hint: 'не завершены', value: stats.activeApplications },
    { label: 'За месяц', hint: 'новые заявки', value: stats.monthlyApplications },
    { label: 'Общая сумма', hint: 'портфель', value: formatCurrency(totalPortfolioValue) },
    { label: 'Средняя сумма', hint: 'на заявку', value: formatCurrency(stats.averageApplicationValue) },
    { label: 'Завершённые', hint: 'расчёты', value: stats.completedCalculations },
  ];

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      <HeroSection onNewBktpClick={handleOpenBktp} />

      {showBktpModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
          onClick={() => setShowBktpModal(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-gray-200 bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-100 px-6 py-5">
              <p className="text-sm font-semibold text-gray-900">Есть незавершённая заявка</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                Обнаружена текущая заявка БКТП. Можно вернуться к ней или начать новую с полным
                сбросом данных.
              </p>
            </div>
            <div className="flex flex-col gap-3 px-6 py-5">
              <button
                type="button"
                onClick={handleGoToCurrentBktp}
                className="rounded-xl bg-[#8eba1e] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#7aa31a]"
              >
                Перейти к текущей
              </button>
              <button
                type="button"
                onClick={handleStartFreshBktp}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                Создать новую
              </button>
              <button
                type="button"
                onClick={() => setShowBktpModal(false)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
          <div className="space-y-6">
            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {metrics.map((item) => (
                <Link
                  key={item.label}
                  href="/dashboard/requests"
                  className="rounded-lg border border-[#8eba1e]/20 bg-white px-4 py-3.5 transition-colors hover:border-[#8eba1e]/45 hover:bg-[#8eba1e]/5"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-[#8eba1e]">{item.label}</p>
                  <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">
                    {stats.loading ? (
                      <span className="inline-block h-7 w-16 animate-pulse rounded bg-[#8eba1e]/10" />
                    ) : (
                      item.value
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">{item.hint}</p>
                </Link>
              ))}
            </div>

            {/* Type breakdown */}
            {!stats.loading && stats.applicationsByType.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm font-medium text-gray-700">По типам:</span>
                {stats.applicationsByType.slice(0, 4).map((item) => (
                  <span
                    key={item.type}
                    className="rounded-full bg-[#8eba1e]/10 px-3 py-1 text-sm text-[#6b8f16]"
                  >
                    {item.type} — {item.count}
                    <span className="ml-1 text-[#8eba1e]/70">({Math.round(item.percentage)}%)</span>
                  </span>
                ))}
              </div>
            )}

            {/* Recent applications */}
            <section className="overflow-hidden rounded-lg border border-[#8eba1e]/20 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#8eba1e]/10 bg-[#8eba1e]/5 px-5 py-3.5">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">Последние заявки</h2>
                  <p className="text-sm text-gray-500">5 последних — нажмите, чтобы открыть</p>
                </div>
                <Link
                  href="/dashboard/requests"
                  className="text-sm font-medium text-[#8eba1e] hover:text-[#7aa31a]"
                >
                  Все заявки →
                </Link>
              </div>

              {stats.loading ? (
                <div className="space-y-2 p-5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse rounded bg-gray-50 p-4">
                      <div className="mb-2 h-4 w-2/3 rounded bg-gray-100" />
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : stats.recentApplications.length > 0 ? (
                <>
                  <div className="hidden border-b border-gray-100 bg-gray-50/80 px-5 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 sm:grid sm:grid-cols-[1fr_140px_100px_120px] sm:gap-3">
                    <span>Клиент</span>
                    <span>Номер</span>
                    <span>Дата</span>
                    <span className="text-right">Сумма</span>
                  </div>
                  <ul className="divide-y divide-gray-100">
                    {stats.recentApplications.map((app: any, index: number) => {
                      const author = getUserLabel(app.user);
                      return (
                        <li key={app.id ?? index}>
                          <Link
                            href={getRequestHref(app)}
                            className="block px-5 py-3.5 transition-colors hover:bg-[#8eba1e]/5 sm:grid sm:grid-cols-[1fr_140px_100px_120px] sm:items-center sm:gap-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-[15px] font-medium text-gray-900">
                                {app.client || 'Неизвестный клиент'}
                              </p>
                              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                <span className="rounded bg-[#8eba1e]/10 px-2 py-0.5 text-xs font-medium text-[#8eba1e]">
                                  {app.type}
                                </span>
                                {app.completed ? (
                                  <span className="text-xs text-gray-400">Завершена</span>
                                ) : (
                                  <span className="text-xs text-amber-600">Активна</span>
                                )}
                                {author && <span className="text-xs text-gray-400">· {author}</span>}
                              </p>
                            </div>
                            <p className="mt-2 truncate text-sm text-gray-600 sm:mt-0">
                              {app.bidNumber || '—'}
                            </p>
                            <p className="text-sm text-gray-500 sm:mt-0">{formatDate(app.date)}</p>
                            <p className="mt-1 text-right text-[15px] font-semibold tabular-nums text-[#8eba1e] sm:mt-0">
                              {formatCurrency(app.totalAmount || 0)}
                            </p>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : (
                <div className="px-5 py-12 text-center">
                  <p className="text-[15px] text-gray-500">Заявок пока нет</p>
                  <Link
                    href="/dashboard/bktp"
                    className="mt-4 inline-block rounded-lg bg-[#8eba1e] px-5 py-2.5 text-[15px] font-medium text-white hover:bg-[#7aa31a]"
                  >
                    Создать первую заявку
                  </Link>
                </div>
              )}
            </section>

            {/* Analytics — always visible */}
            <section className="rounded-lg border border-gray-200 bg-white">
              <div className="border-b border-gray-100 px-5 py-3.5">
                <h2 className="text-base font-semibold text-gray-900">Аналитика</h2>
                <p className="text-sm text-gray-500">Топ клиентов и последние изменения в каталоге</p>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-2">
                {/* Top clients */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">Топ клиентов</h3>
                    <div className="flex flex-wrap gap-1">
                      {sortModes.map((mode, index) => (
                        <button
                          key={mode.mode}
                          type="button"
                          onClick={() => setSortModeIndex(index)}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            index === sortModeIndex
                              ? 'bg-[#8eba1e] text-white'
                              : 'bg-gray-100 text-gray-600 hover:text-[#8eba1e]'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                    {!stats.loading && stats.allApplications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setShowClientFilters(!showClientFilters)}
                        className={`ml-auto text-xs font-medium ${
                          showClientFilters || hasActiveClientFilters
                            ? 'text-[#8eba1e]'
                            : 'text-gray-500 hover:text-[#8eba1e]'
                        }`}
                      >
                        {showClientFilters ? 'Скрыть фильтры' : 'Фильтры'}
                      </button>
                    )}
                  </div>

                  {showClientFilters && !stats.loading && (
                    <div className="mb-3 space-y-2 rounded-lg bg-gray-50 p-3">
                      <div className="flex flex-wrap gap-1">
                        {periodFilters.map((filter) => (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() => setPeriodFilter(filter.value)}
                            className={`rounded-md px-2.5 py-1 text-xs ${
                              periodFilter === filter.value
                                ? 'bg-[#8eba1e] text-white'
                                : 'bg-white text-gray-600 ring-1 ring-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {statusFilters.map((filter) => (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() => setStatusFilter(filter.value)}
                            className={`rounded-md px-2.5 py-1 text-xs ${
                              statusFilter === filter.value
                                ? 'bg-[#8eba1e] text-white'
                                : 'bg-white text-gray-600 ring-1 ring-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        value={minAmount || ''}
                        onChange={(e) => setMinAmount(Number(e.target.value) || 0)}
                        placeholder="Минимальная сумма, ₸"
                        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm focus:border-[#8eba1e] focus:outline-none"
                      />
                    </div>
                  )}

                  {stats.loading ? (
                    <div className="space-y-2">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-11 animate-pulse rounded bg-gray-50" />
                      ))}
                    </div>
                  ) : sortedClients.length > 0 ? (
                    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-100">
                      {sortedClients.map((client, index) => (
                        <li
                          key={`${client.client}-${index}`}
                          className="flex items-center justify-between gap-3 px-3 py-2.5"
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8eba1e]/10 text-xs font-semibold text-[#8eba1e]">
                              {index + 1}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-gray-900">{client.client}</p>
                              <p className="text-xs text-gray-500">{client.count} заявок</p>
                            </div>
                          </div>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-[#8eba1e]">
                            {formatCurrency(client.totalValue)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Нет данных по клиентам</p>
                  )}
                </div>

                {/* Material changes */}
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-800">Изменения материалов</h3>
                    {!materialHistory.loading && materialHistory.allChanges.length > 0 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setShowMaterialFilters(!showMaterialFilters)}
                          className={`text-xs font-medium ${
                            showMaterialFilters || hasActiveMaterialFilters
                              ? 'text-[#8eba1e]'
                              : 'text-gray-500 hover:text-[#8eba1e]'
                          }`}
                        >
                          {showMaterialFilters ? 'Скрыть' : 'Фильтры'}
                        </button>
                        <Link
                          href="/dashboard/materials"
                          className="ml-auto text-xs font-medium text-[#8eba1e] hover:text-[#7aa31a]"
                        >
                          Каталог →
                        </Link>
                      </>
                    )}
                  </div>

                  {showMaterialFilters && !materialHistory.loading && (
                    <div className="mb-3 space-y-2 rounded-lg bg-gray-50 p-3">
                      <div className="flex flex-wrap gap-1">
                        {periodFilters.map((filter) => (
                          <button
                            key={filter.value}
                            type="button"
                            onClick={() => setMaterialPeriodFilter(filter.value)}
                            className={`rounded-md px-2.5 py-1 text-xs ${
                              materialPeriodFilter === filter.value
                                ? 'bg-[#8eba1e] text-white'
                                : 'bg-white text-gray-600 ring-1 ring-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                      <Select
                        value={materialUserFilter}
                        onChange={(e) => setMaterialUserFilter(e.target.value)}
                        className="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm"
                      >
                        <option value="all">Все пользователи</option>
                        {uniqueUsers.map((userKey) => {
                          const author = materialHistory.resolveAuthor(userKey);
                          return (
                            <option key={userKey} value={userKey}>
                              {author.name}
                              {author.login && author.login !== author.name ? ` (${author.login})` : ''}
                            </option>
                          );
                        })}
                      </Select>
                    </div>
                  )}

                  {materialHistory.loading ? (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded bg-gray-50" />
                      ))}
                    </div>
                  ) : materialHistory.error ? (
                    <p className="text-sm text-red-500">{materialHistory.error}</p>
                  ) : filteredMaterialChanges.length > 0 ? (
                    <ul className="space-y-2">
                      {filteredMaterialChanges.map((change, index) => {
                        const author = materialHistory.resolveAuthor(change.changedBy);
                        return (
                        <li
                          key={index}
                          className="rounded-lg border border-gray-100 px-3 py-2.5 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium leading-snug text-gray-900">{change.material.name}</p>
                            <span className="shrink-0 text-xs text-gray-400">
                              {formatDate(change.changedAt)}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-[#8eba1e]/80">{change.material.code}</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-gray-600">
                            <span className="font-medium text-[#8eba1e]">
                              {getFieldLabel(change.fieldChanged)}
                            </span>
                            : {change.oldValue} → {change.newValue}
                          </p>
                          <p className="mt-1 text-xs text-gray-600">{author.name}</p>
                          {author.login && author.login !== author.name && (
                            <p className="text-xs text-gray-400">{author.login}</p>
                          )}
                        </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">Изменений пока нет</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-4">
            <div className="overflow-hidden rounded-lg border border-[#8eba1e]/30 bg-white">
              <div className="bg-[#8eba1e] px-5 py-4">
                <p className="text-xs font-medium uppercase tracking-wide text-white/80">Основной модуль</p>
                <p className="mt-0.5 text-base font-semibold text-white">БКТП</p>
                <p className="mt-1 text-sm text-white/85">Формирование заявки</p>
              </div>
              <div className="space-y-3 px-5 py-4">
                <p className="text-sm leading-relaxed text-gray-600">
                  Подбор трансформатора, РУСН, РУНН, расчёт стоимости и выгрузка спецификации.
                </p>
                <ul className="space-y-1.5 text-sm text-gray-500">
                  <li>1. Данные заказчика</li>
                  <li>2. БМЗ и трансформатор</li>
                  <li>3. РУ и доп. оборудование</li>
                  <li>4. Итоговая спецификация</li>
                </ul>
                <Link
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleOpenBktp();
                  }}
                  className="flex w-full items-center justify-center rounded-lg bg-[#8eba1e] py-2.5 text-[15px] font-medium text-white transition-colors hover:bg-[#7aa31a]"
                >
                  Открыть БКТП
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg border border-gray-200 bg-white p-4">
              <div>
                <p className="text-xs text-gray-500">Материалов</p>
                {stats.loading ? (
                  <span className="mt-1 inline-block h-7 w-16 animate-pulse rounded bg-gray-100" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{stats.totalMaterials}</p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-500">Пользователей</p>
                {stats.loading ? (
                  <span className="mt-1 inline-block h-7 w-10 animate-pulse rounded bg-gray-100" />
                ) : (
                  <p className="text-lg font-semibold text-gray-900">{stats.totalUsers}</p>
                )}
              </div>
            </div>

            <nav className="overflow-hidden rounded-lg border border-[#8eba1e]/20 bg-white">
              <div className="border-b border-[#8eba1e]/10 px-5 py-3">
                <h2 className="text-sm font-semibold text-gray-800">Быстрый доступ</h2>
              </div>
              <ul className="divide-y divide-gray-100">
                {quickActions.map((action) => (
                  <li key={action.href}>
                    <Link
                      href={action.href}
                      className="block px-5 py-3 transition-colors hover:bg-[#8eba1e]/5"
                    >
                      <span className="text-[15px] font-medium text-gray-800 group-hover:text-[#8eba1e]">
                        {action.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-gray-500">{action.desc}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      </div>
    </div>
  );
}
