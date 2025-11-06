'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Settings, Zap, Cpu, TrendingUp, Users, FileText, History, Calculator, DollarSign, Activity, BarChart3, Clock, Building2, Package, AlertCircle, Gauge, BarChart, Settings2 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useMaterialHistory } from '@/hooks/useMaterialHistory';

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

export default function DashboardHome() {
  const router = useRouter();
  const stats = useDashboardStats();
  const materialHistory = useMaterialHistory();

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
    <div className="h-[calc(100vh-64px)] overflow-y-auto bg-gray-50 ">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#8eba1e] via-[#7aa31a] to-[#6b8f16]">
        {/* Decorative background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent"></div>
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative px-6 py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center text-white">
              {/* Main heading with enhanced typography */}
              <div className="mb-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
                  Добро пожаловать в систему
                </h1>
                <div className="w-24 h-1 bg-gradient-to-r from-white to-white/50 mx-auto rounded-full"></div>
              </div>
              
              {/* Subtitle with better spacing */}
              <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Профессиональные инструменты для проектирования и расчёта электротехнического оборудования
              </p>
              
              {/* Enhanced feature badges */}
              <div className="flex flex-wrap justify-center gap-8 mb-8">
                <div className="group bg-white/15 backdrop-blur-md rounded-3xl px-10 py-6 border border-white/20 hover:bg-white/25 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:rotate-1">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                      <Gauge className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="text-white font-bold text-xl block">Быстрые расчёты</span>
                      <span className="text-white/70 text-sm">Мгновенные результаты</span>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 backdrop-blur-md rounded-3xl px-10 py-6 border border-white/20 hover:bg-white/25 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:-rotate-1">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 via-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                      <BarChart className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="text-white font-bold text-xl block">Аналитика</span>
                      <span className="text-white/70 text-sm">Детальная статистика</span>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-white/15 backdrop-blur-md rounded-3xl px-10 py-6 border border-white/20 hover:bg-white/25 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:rotate-1">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500">
                      <Settings2 className="w-8 h-8" />
                    </div>
                    <div className="text-center">
                      <span className="text-white font-bold text-xl block">Настройки</span>
                      <span className="text-white/70 text-sm">Персонализация</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Additional decorative element */}
              <div className="flex justify-center">
                <div className="w-16 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего заявок</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Активные заявки</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.activeApplications}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Заявки за месяц</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.loading ? '...' : stats.monthlyApplications}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Средняя сумма</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.loading ? '...' : formatCurrency(stats.averageApplicationValue)}
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
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <Building2 className="w-6 h-6 text-[#8eba1e]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Топ клиентов</h3>
              </div>
              
              {stats.loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : stats.topClients.length > 0 ? (
                <div className="space-y-4">
                  {stats.topClients.map((client, index) => (
                    <div key={index} className="flex items-center justify-between">
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

            {/* Material History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <History className="w-6 h-6 text-[#8eba1e]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Последние изменения материалов</h3>
              </div>
              
              {materialHistory.loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : materialHistory.error ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                  <p className="text-red-500">Ошибка: {materialHistory.error}</p>
                </div>
              ) : materialHistory.recentChanges.length > 0 ? (
                <div className="space-y-2">
                  {materialHistory.recentChanges.map((change, index) => (
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

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gray-100 rounded-xl">
                <Clock className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Последние заявки</h2>
            </div>

            {stats.loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
