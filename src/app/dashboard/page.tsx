'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { Settings, Zap, Cpu, Users, FileText, History, Calculator, DollarSign, Activity, BarChart3, Clock, Building2, Package, AlertCircle, Filter, Calendar, CheckCircle } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useMaterialHistory } from '@/hooks/useMaterialHistory';
import HeroSection from './components/HeroSection';

const cards = [
  { 
    title: 'БКТП', 
    description: 'Блочные комплектные трансформаторные подстанции',
    type: 'bktp', 
    href: '/dashboard/bktp', 
    settingsHref: '/dashboard/bktp/settings',
    icon: Cpu,
    gradient: 'from-[#8eba1e] to-[#7aa31a]',
    bgColor: 'bg-white',
    iconBg: 'bg-gray-100',
    iconColor: 'text-[#8eba1e]'
  },
];

const quickActions = [
  { title: 'История заявок', icon: History, href: '/dashboard/requests', color: 'text-[#8eba1e]' },
  { title: 'Расчёты', icon: Calculator, href: '/dashboard/calc', color: 'text-[#8eba1e]' },
  { title: 'Материалы', icon: FileText, href: '/dashboard/materials', color: 'text-[#8eba1e]' },
  { title: 'Пользователи', icon: Users, href: '/dashboard/users', color: 'text-[#8eba1e]' },
];

type SortMode = 'totalValue' | 'count' | 'name';

const sortModes: Array<{ mode: SortMode; label: string }> = [
  { mode: 'totalValue', label: 'По сумме заявок' },
  { mode: 'count', label: 'По количеству заявок' },
  { mode: 'name', label: 'По названию' },
];

type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'year';
type StatusFilter = 'all' | 'active' | 'completed';

const periodFilters: Array<{ value: PeriodFilter; label: string }> = [
  { value: 'all', label: 'Все время' },
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'quarter', label: 'Квартал' },
  { value: 'year', label: 'Год' },
];

const statusFilters: Array<{ value: StatusFilter; label: string; icon: any }> = [
  { value: 'all', label: 'Все', icon: null },
  { value: 'active', label: 'Активные', icon: Activity },
  { value: 'completed', label: 'Завершенные', icon: CheckCircle },
];

type MaterialChangeTypeFilter = 'all' | 'name' | 'price' | 'category';

export default function DashboardHome() {
  const router = useRouter();
  const stats = useDashboardStats();
  const materialHistory = useMaterialHistory();
  const [sortModeIndex, setSortModeIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [minAmount, setMinAmount] = useState<number>(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Фильтры для истории материалов
  const [materialPeriodFilter, setMaterialPeriodFilter] = useState<PeriodFilter>('all');
  const [materialChangeTypeFilter, setMaterialChangeTypeFilter] = useState<MaterialChangeTypeFilter>('all');
  const [materialUserFilter, setMaterialUserFilter] = useState<string>('all');
  const [showMaterialFilters, setShowMaterialFilters] = useState(false);

  // Функция для переключения режима сортировки
  const switchSortMode = (newIndex: number) => {
    if (newIndex === sortModeIndex) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setSortModeIndex(newIndex);
      setIsTransitioning(false);
    }, 300);
  };

  // Фильтрация заявок
  const filteredApplications = useMemo(() => {
    if (!stats.allApplications.length) return [];

    let filtered = [...stats.allApplications];

    // Фильтр по периоду
    if (periodFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((app: any) => {
        const appDate = new Date(app.date);
        const appDateOnly = new Date(appDate.getFullYear(), appDate.getMonth(), appDate.getDate());
        
        switch (periodFilter) {
          case 'today':
            return appDateOnly.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return appDateOnly >= weekAgo;
          case 'month':
            return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            return Math.floor(appDate.getMonth() / 3) === quarter && appDate.getFullYear() === now.getFullYear();
          case 'year':
            return appDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Фильтр по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((app: any) => {
        if (statusFilter === 'active') return !app.completed;
        if (statusFilter === 'completed') return app.completed;
        return true;
      });
    }

    // Фильтр по минимальной сумме
    if (minAmount > 0) {
      filtered = filtered.filter((app: any) => {
        const amount = parseFloat(app.totalAmount) || 0;
        return amount >= minAmount;
      });
    }

    return filtered;
  }, [stats.allApplications, periodFilter, statusFilter, minAmount]);

  // Группировка и сортировка отфильтрованных клиентов
  const sortedClients = useMemo(() => {
    if (!filteredApplications.length) return [];

    // Группируем по клиентам
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
      .slice(0, 8);

    // Сортировка по текущему режиму
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

  // Переключение режима сортировки каждые 5 секунд
  useEffect(() => {
    if (sortedClients.length === 0) return;

    const interval = setInterval(() => {
      setSortModeIndex((prev) => {
        const nextIndex = (prev + 1) % sortModes.length;
        setIsTransitioning(true);
        setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [sortedClients.length]);

  // Фильтрация истории материалов
  const filteredMaterialChanges = useMemo(() => {
    if (!materialHistory.allChanges.length) return [];

    let filtered = [...materialHistory.allChanges];

    // Фильтр по периоду
    if (materialPeriodFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((change: any) => {
        const changeDate = new Date(change.changedAt);
        const changeDateOnly = new Date(changeDate.getFullYear(), changeDate.getMonth(), changeDate.getDate());
        
        switch (materialPeriodFilter) {
          case 'today':
            return changeDateOnly.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return changeDateOnly >= weekAgo;
          case 'month':
            return changeDate.getMonth() === now.getMonth() && changeDate.getFullYear() === now.getFullYear();
          case 'quarter':
            const quarter = Math.floor(now.getMonth() / 3);
            return Math.floor(changeDate.getMonth() / 3) === quarter && changeDate.getFullYear() === now.getFullYear();
          case 'year':
            return changeDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    // Фильтр по типу изменения
    if (materialChangeTypeFilter !== 'all') {
      filtered = filtered.filter((change: any) => {
        return change.fieldChanged === materialChangeTypeFilter;
      });
    }

    // Фильтр по пользователю
    if (materialUserFilter !== 'all') {
      filtered = filtered.filter((change: any) => {
        return change.changedBy === materialUserFilter;
      });
    }

    // Сортируем по дате (новые сначала) и берем только 4 последних
    return filtered
      .sort((a: any, b: any) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime())
      .slice(0, 4);
  }, [materialHistory.allChanges, materialPeriodFilter, materialChangeTypeFilter, materialUserFilter]);

  // Получаем уникальных пользователей для фильтра
  const uniqueUsers = useMemo(() => {
    if (!materialHistory.allChanges.length) return [];
    const users = new Set(materialHistory.allChanges.map((change: any) => change.changedBy));
    return Array.from(users).sort();
  }, [materialHistory.allChanges]);

  const handleSettingsClick = (e: React.MouseEvent, settingsHref: string) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(settingsHref);
  };

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

  return (
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      <div className="px-6 py-8 -mt-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[100px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                  <p className="text-3xl font-bold text-gray-900 min-h-[42px] flex items-center">
                    {stats.loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      stats.totalApplications
                    )}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[100px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Активные заявки</p>
                  <p className="text-3xl font-bold text-gray-900 min-h-[42px] flex items-center">
                    {stats.loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      stats.activeApplications
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[100px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Заявки за месяц</p>
                  <p className="text-3xl font-bold text-gray-900 min-h-[42px] flex items-center">
                    {stats.loading ? (
                      <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      stats.monthlyApplications
                    )}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 min-h-[100px]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Средняя сумма</p>
                  <p className="text-xl font-bold text-gray-900 min-h-[42px] flex items-center">
                    {stats.loading ? (
                      <span className="inline-block w-20 h-8 bg-gray-200 rounded animate-pulse"></span>
                    ) : (
                      formatCurrency(stats.averageApplicationValue)
                    )}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Modules Section - Highlighted and moved up */}
          <div className="mb-12">
            <div className="grid grid-cols-1 gap-6">
              {cards.map((card, index) => (
                <Link key={index} href={card.href} className="group">
                  <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 bg-white group-hover:border-[#8eba1e]/30">
                    {/* Enhanced gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8eba1e] to-[#7aa31a]"></div>
                    
                    <div className="relative p-6 flex items-center justify-between">
                      {/* Header */}
                      <div className="flex items-center gap-4">
                        <div className={`p-4 ${card.iconBg} rounded-xl group-hover:scale-110 transition-all duration-300 group-hover:bg-[#8eba1e] group-hover:shadow-lg`}>
                          <card.icon className={`w-8 h-8 ${card.iconColor} group-hover:text-white transition-colors duration-300`} />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-[#8eba1e] transition-colors duration-300">{card.title}</h3>
                          <p className="text-gray-600 text-sm leading-relaxed">{card.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleSettingsClick(e, card.settingsHref)}
                          className="p-3 rounded-xl bg-gray-100 hover:bg-[#8eba1e] hover:text-white transition-all duration-200 hover:scale-110 shadow-lg"
                          title="Настройки"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                        <div className="text-gray-400 group-hover:text-[#8eba1e] transition-colors duration-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Zap className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Быстрые действия</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href} className="group">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                        <action.icon className={`w-6 h-6 ${action.color}`} />
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-[#8eba1e] transition-colors text-sm">
                        {action.title}
                      </h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Clients */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <Building2 className="w-6 h-6 text-[#8eba1e]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Топ клиентов</h3>
                </div>
                {!stats.loading && stats.allApplications.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {sortModes.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => switchSortMode(index)}
                          className={`rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
                            index === sortModeIndex
                              ? 'bg-[#8eba1e] w-6 h-2'
                              : 'bg-gray-300 w-2 h-2 hover:bg-gray-400'
                          }`}
                          aria-label={sortModes[index].label}
                          title={sortModes[index].label}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500 ml-2 min-w-[120px] text-right">
                      {sortModes[sortModeIndex].label}
                    </span>
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        showFilters || periodFilter !== 'all' || statusFilter !== 'all' || minAmount > 0
                          ? 'bg-[#8eba1e] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title="Фильтры"
                    >
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Панель фильтров */}
              {showFilters && !stats.loading && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex-shrink-0 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Фильтр по периоду */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <Calendar className="w-3 h-3" />
                        Период
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {periodFilters.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setPeriodFilter(filter.value)}
                            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                              periodFilter === filter.value
                                ? 'bg-[#8eba1e] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Фильтр по статусу */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <Activity className="w-3 h-3" />
                        Статус
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {statusFilters.map((filter) => {
                          const Icon = filter.icon;
                          return (
                            <button
                              key={filter.value}
                              onClick={() => setStatusFilter(filter.value)}
                              className={`px-2 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
                                statusFilter === filter.value
                                  ? 'bg-[#8eba1e] text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                              }`}
                            >
                              {Icon && <Icon className="w-3 h-3" />}
                              {filter.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Фильтр по минимальной сумме */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <DollarSign className="w-3 h-3" />
                        Мин. сумма
                      </label>
                      <input
                        type="number"
                        value={minAmount || ''}
                        onChange={(e) => setMinAmount(Number(e.target.value) || 0)}
                        placeholder="0"
                        className="w-full px-2 py-1 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Счетчик результатов и кнопка сброса */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Найдено клиентов: <span className="font-semibold text-gray-900">{sortedClients.length}</span>
                    </p>
                    <button
                      onClick={() => {
                        setPeriodFilter('all');
                        setStatusFilter('all');
                        setMinAmount(0);
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                      Сброс фильтров
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
                {stats.loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : sortedClients.length > 0 ? (
                  <div
                    className={`space-y-4 transition-opacity duration-500 ease-in-out ${
                      isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                  >
                    {sortedClients.map((client, index) => (
                      <div
                        key={`${client.client}-${sortModeIndex}-${index}`}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900">{client.client}</p>
                          <p className="text-sm text-gray-600">{client.count} заявок</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">{formatCurrency(client.totalValue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Нет данных о клиентах</p>
                  </div>
                )}
              </div>
            </div>

            {/* Material History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 min-h-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <History className="w-6 h-6 text-[#8eba1e]" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Последние изменения материалов</h3>
                </div>
                {!materialHistory.loading && materialHistory.allChanges.length > 0 && (
                  <button
                    onClick={() => setShowMaterialFilters(!showMaterialFilters)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      showMaterialFilters || materialPeriodFilter !== 'all' || materialChangeTypeFilter !== 'all' || materialUserFilter !== 'all'
                        ? 'bg-[#8eba1e] text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title="Фильтры"
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Панель фильтров для истории материалов */}
              {showMaterialFilters && !materialHistory.loading && (
                <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 flex-shrink-0 animate-fadeIn">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Фильтр по периоду */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <Calendar className="w-3 h-3" />
                        Период
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {periodFilters.map((filter) => (
                          <button
                            key={filter.value}
                            onClick={() => setMaterialPeriodFilter(filter.value)}
                            className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                              materialPeriodFilter === filter.value
                                ? 'bg-[#8eba1e] text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                          >
                            {filter.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Фильтр по типу изменения */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <FileText className="w-3 h-3" />
                        Тип изменения
                      </label>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => setMaterialChangeTypeFilter('all')}
                          className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                            materialChangeTypeFilter === 'all'
                              ? 'bg-[#8eba1e] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          Все
                        </button>
                        <button
                          onClick={() => setMaterialChangeTypeFilter('name')}
                          className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                            materialChangeTypeFilter === 'name'
                              ? 'bg-[#8eba1e] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          Название
                        </button>
                        <button
                          onClick={() => setMaterialChangeTypeFilter('price')}
                          className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                            materialChangeTypeFilter === 'price'
                              ? 'bg-[#8eba1e] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          Цена
                        </button>
                        <button
                          onClick={() => setMaterialChangeTypeFilter('category')}
                          className={`px-2 py-1 text-xs rounded-md transition-all duration-200 ${
                            materialChangeTypeFilter === 'category'
                              ? 'bg-[#8eba1e] text-white'
                              : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                          }`}
                        >
                          Категория
                        </button>
                      </div>
                    </div>

                    {/* Фильтр по пользователю */}
                    <div>
                      <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                        <Users className="w-3 h-3" />
                        Пользователь
                      </label>
                      <select
                        value={materialUserFilter}
                        onChange={(e) => setMaterialUserFilter(e.target.value)}
                        className="w-full px-2 py-1 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-transparent"
                      >
                        <option value="all">Все пользователи</option>
                        {uniqueUsers.map((user) => (
                          <option key={user} value={user}>
                            {user}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Счетчик результатов и кнопка сброса */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Найдено изменений: <span className="font-semibold text-gray-900">{filteredMaterialChanges.length}</span>
                    </p>
                    <button
                      onClick={() => {
                        setMaterialPeriodFilter('all');
                        setMaterialChangeTypeFilter('all');
                        setMaterialUserFilter('all');
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                    >
                      Сброс фильтров
                    </button>
                  </div>
                </div>
              )}
              
              <div className="flex-1 overflow-y-auto">
              {materialHistory.loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : materialHistory.error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                  <p className="text-red-500">Ошибка: {materialHistory.error}</p>
                </div>
              ) : filteredMaterialChanges.length > 0 ? (
                <div className="space-y-2">
                  {filteredMaterialChanges.map((change, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-[#8eba1e] hover:shadow-sm transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#8eba1e] rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">{index + 1}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {change.material.name}
                            </h4>
                            <span className="text-xs text-[#8eba1e] bg-[#8eba1e]/10 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                              {change.material.code}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500">
                              {change.fieldChanged === 'price' ? 'Цена' : 
                               change.fieldChanged === 'name' ? 'Название' : 
                               change.fieldChanged === 'category' ? 'Категория' : 
                               change.fieldChanged}
                            </span>
                            <div className="w-1.5 h-1.5 bg-[#8eba1e] rounded-full"></div>
                          </div>
                          
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded font-medium">
                              {change.oldValue}
                            </span>
                            <span className="text-[#8eba1e] font-medium">→</span>
                            <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded font-medium">
                              {change.newValue}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="text-xs text-gray-600 font-bold">
                                  {change.changedBy.charAt(0)}
                                </span>
                              </div>
                              <span className="text-xs text-gray-600">
                                {change.changedBy}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(change.changedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Нет изменений материалов</p>
                  <p className="text-xs text-gray-400">
                    Изменения появятся здесь после редактирования материалов
                  </p>
                </div>
              )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 min-h-[400px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Clock className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Последние заявки</h2>
            </div>

            {stats.loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse py-3 border-b border-gray-100 last:border-b-0">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : stats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {stats.recentApplications.map((app: any, index: number) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{app.client || 'Неизвестный клиент'}</p>
                      <p className="text-sm text-gray-600">{app.type} • {formatDate(app.date)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(app.totalAmount || 0)}</p>
                      <p className="text-xs text-gray-500">{app.bidNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Нет заявок</p>
              </div>
            )}
            
            <div className="mt-6">
              <Link href="/dashboard/requests" className="block w-full text-center py-3 bg-[#8eba1e] text-white rounded-xl font-medium hover:bg-[#7aa31a] transition-colors">
                Посмотреть все заявки
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
