'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { FileText, Plus, RefreshCw, Calendar, User, DollarSign } from 'lucide-react';
import { getAllApplications } from '@/api/requests';

interface Request {
  id: number;
  bidNumber: string;
  type: string;
  date: string;
  client: string;
  taskNumber: string;
  totalAmount: number;
  user: {
    id: number;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const statuses = ['Все', 'В обработке', 'Завершено'];

export default function RequestsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState('Все');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Функция загрузки заявок
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Токен авторизации не найден');
        return;
      }

      const data = await getAllApplications(token);
      console.log('📋 Загруженные заявки:', data);
      setRequests(data);
    } catch (err: any) {
      console.error('❌ Ошибка при загрузке заявок:', err);
      setError(err.message || 'Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  // Загружаем заявки с сервера при монтировании компонента
  useEffect(() => {
    fetchRequests();
  }, []);

  // Фильтрация заявок
  const filtered = requests.filter((r) => {
    const matchesStatus = selectedStatus === 'Все' || r.type === selectedStatus;
    const inDateRange = (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate);
    return matchesStatus && inDateRange;
  });

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Форматирование суммы
  const formatAmount = (amount: number) => {
    return amount.toLocaleString('ru-RU') + ' ₸';
  };

  // Получение имени автора
  const getAuthorName = (user: Request['user']) => {
    if (user.firstName && user.lastName) {
      return `${user.lastName} ${user.firstName}`;
    }
    return user.username;
  };

  // Обработка клика по заявке
  const handleRequestClick = (requestId: number) => {
    router.push(`/dashboard/requests/${requestId}`);
  };

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <FileText className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Заявки</h1>
              <p className="text-gray-600">Управление заявками и их статусами</p>
            </div>
          </div>
          
          {!loading && !error && (
            <div className="flex items-center gap-6 mb-6">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего заявок: </span>
                <span className="font-semibold text-[#8eba1e]">{requests.length}</span>
              </div>
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Показано: </span>
                <span className="font-semibold text-[#8eba1e]">{filtered.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Select статус */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none w-52 cursor-pointer rounded-lg border border-gray-300 bg-white px-4 py-2 pr-10 text-sm text-gray-800 shadow-sm 
                  focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs">
                ▼
              </div>
            </div>

            {/* Даты */}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8eba1e]" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
                placeholder="От даты"
              />
              <span className="text-gray-500">—</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200"
                placeholder="До даты"
              />
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button 
              onClick={fetchRequests}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-100 hover:bg-[#8eba1e] text-gray-700 hover:text-white px-4 py-2 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Обновление...' : 'Обновить'}
            </button>
            <button className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Plus size={18} />
              Создать заявку
            </button>
          </div>
        </div>

        {/* Table Section */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка заявок...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Ошибка загрузки</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-3 bg-[#8eba1e]/10 text-[#8eba1e] text-sm border-b border-gray-200">
              💡 Нажмите на строку заявки для просмотра деталей
            </div>
            <table className="min-w-full table-auto text-sm">
              <thead className="bg-gray-50 text-gray-600 text-left border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Номер заявки</th>
                  <th className="px-6 py-4 font-semibold">Дата</th>
                  <th className="px-6 py-4 font-semibold">Клиент</th>
                  <th className="px-6 py-4 font-semibold">Тип</th>
                  <th className="px-6 py-4 font-semibold">Сумма</th>
                  <th className="px-6 py-4 font-semibold">Автор</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium">Заявки не найдены</p>
                        <p className="text-sm">Попробуйте изменить фильтры поиска</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((req, idx) => (
                    <tr 
                      key={`${req.id}-${idx}`} 
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                      onClick={() => handleRequestClick(req.id)}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-[#8eba1e] hover:text-[#7aa31a] font-medium">
                        {req.bidNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{formatDate(req.date)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{req.client}</td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-xs bg-[#8eba1e]/10 text-[#8eba1e] font-medium">
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        {formatAmount(req.totalAmount)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{getAuthorName(req.user)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        <div className="mt-6 flex justify-center gap-2">
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200">
            1
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200">
            2
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200">
            3
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200">
            Вперёд
          </button>
        </div>
      </div>
    </div>
  );
}
