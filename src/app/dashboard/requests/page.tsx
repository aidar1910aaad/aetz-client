'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Calendar, User, ChevronDown, X, DollarSign, Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getAllApplications } from '@/api/requests';
import { getAllUsers, User as UserType } from '@/api/users';
import Pagination from '@/shared/components/Pagination';
import { showToast } from '@/shared/modals/ToastProvider';

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

function RequestsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedUserId, setSelectedUserId] = useState<string>('Все');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<Request[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);

  // Сортировка
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'none'>('none');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dropdown states
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [itemsPerPageDropdownOpen, setItemsPerPageDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const itemsPerPageDropdownRef = useRef<HTMLDivElement>(null);
  
  // Search states
  const [userSearch, setUserSearch] = useState('');

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

  // Загружаем пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const usersData = await getAllUsers(token);
        setUsers(usersData);
      } catch (err: any) {
        console.error('Ошибка при загрузке пользователей:', err);
      }
    };
    fetchUsers();
  }, []);

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = useMemo(() => {
    if (!userSearch.trim()) {
      return users;
    }
    const searchLower = userSearch.toLowerCase();
    return users.filter((user) =>
      `${user.lastName} ${user.firstName} ${user.username}`.toLowerCase().includes(searchLower)
    );
  }, [users, userSearch]);

  // Закрытие выпадающих списков при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
      if (
        itemsPerPageDropdownRef.current &&
        !itemsPerPageDropdownRef.current.contains(event.target as Node)
      ) {
        setItemsPerPageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen, sortDropdownOpen, itemsPerPageDropdownOpen]);

  // Загружаем заявки с сервера при монтировании компонента
  useEffect(() => {
    fetchRequests();
  }, []);

  // Обработка параметра userId из URL (после загрузки пользователей)
  useEffect(() => {
    if (users.length > 0) {
      const userIdParam = searchParams.get('userId');
      if (userIdParam) {
        // Проверяем, что пользователь существует в списке
        const userExists = users.some(u => u.id.toString() === userIdParam);
        if (userExists) {
          setSelectedUserId(userIdParam);
        }
      }
    }
  }, [searchParams, users]);

  // Проверка sessionStorage для показа toast о создании заявки
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const createdApplication = sessionStorage.getItem('createdApplication');
      if (createdApplication) {
        try {
          const appData = JSON.parse(createdApplication);
          // Показываем toast только если заявка была создана недавно (в течение последних 5 секунд)
          const timeDiff = Date.now() - appData.timestamp;
          if (timeDiff < 5000) {
            showToast(`Заявка успешно создана!\nНомер заявки: ${appData.bidNumber}`, 'success');
          }
          // Удаляем данные из sessionStorage после показа toast
          sessionStorage.removeItem('createdApplication');
        } catch (error) {
          console.error('Ошибка при парсинге данных созданной заявки:', error);
          sessionStorage.removeItem('createdApplication');
        }
      }
    }
  }, []);

  // Фильтрация и сортировка заявок
  const filtered = useMemo(() => {
    let result = requests.filter((r) => {
      // Фильтр по пользователю
      let matchesUser = true;
      if (selectedUserId !== 'Все' && selectedUserId) {
        const selectedId = parseInt(selectedUserId, 10);
        if (isNaN(selectedId)) {
          matchesUser = false;
        } else {
          const requestUserId = r.user?.id;
          // Строгое сравнение: пользователь должен существовать и ID должны совпадать
          matchesUser = requestUserId !== undefined && requestUserId !== null && requestUserId === selectedId;
        }
      }
      
      // Фильтр по дате
      const inDateRange = (!fromDate || r.date >= fromDate) && (!toDate || r.date <= toDate);
      
      // Фильтр по цене
      const minAmountNum = minAmount ? parseFloat(minAmount) : null;
      const maxAmountNum = maxAmount ? parseFloat(maxAmount) : null;
      const matchesAmount = 
        (minAmountNum === null || (r.totalAmount >= minAmountNum)) &&
        (maxAmountNum === null || (r.totalAmount <= maxAmountNum));
      
      // Фильтр по поисковому запросу (номер заявки, клиент, задача)
      const searchLower = searchQuery.toLowerCase().trim();
      const matchesSearch = !searchLower || 
        r.bidNumber?.toLowerCase().includes(searchLower) ||
        r.client?.toLowerCase().includes(searchLower) ||
        r.taskNumber?.toLowerCase().includes(searchLower);
      
      return matchesUser && inDateRange && matchesAmount && matchesSearch;
    });

    // Применяем сортировку
    if (sortBy !== 'none') {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        
        if (sortBy === 'date') {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          comparison = dateA - dateB;
        } else if (sortBy === 'amount') {
          comparison = a.totalAmount - b.totalAmount;
        }
        
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [requests, selectedUserId, fromDate, toDate, minAmount, maxAmount, searchQuery, sortBy, sortOrder]);

  // Пагинация
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filtered.slice(startIndex, endIndex);
  }, [filtered, currentPage, itemsPerPage]);

  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedUserId, fromDate, toDate, minAmount, maxAmount, searchQuery, sortBy, sortOrder, itemsPerPage]);

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  // Форматирование суммы (только целые числа с пробелами)
  const formatAmount = (amount: number) => {
    const rounded = Math.round(amount);
    return rounded.toLocaleString('ru-RU', { useGrouping: true, maximumFractionDigits: 0 }).replace(/,/g, ' ') + ' ₸';
  };

  // Получение имени автора
  const getAuthorName = (user: Request['user']) => {
    if (!user) return 'Неизвестно';
    if (user.firstName && user.lastName) {
      return `${user.lastName} ${user.firstName}`;
    }
    return user.username;
  };

  // Получение отображаемого имени пользователя
  const getUserDisplayName = (userId: string) => {
    if (userId === 'Все') return 'Все пользователи';
    const user = users.find((u) => u.id.toString() === userId);
    if (!user) return 'Неизвестно';
    return `${user.lastName} ${user.firstName} (${user.username})`;
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
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-xl">
                <FileText className="w-6 h-6 text-[#8eba1e]" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Заявки</h1>
                <p className="text-gray-600">Управление заявками и их статусами</p>
              </div>
            </div>
            
            {!loading && !error && (
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего заявок: </span>
                <span className="font-semibold text-[#8eba1e]">{requests.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Поиск по номеру заявки, клиенту, задаче */}
            <div className="relative" style={{ width: '250px', minWidth: '250px' }}>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск по номеру, клиенту, задаче..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 pl-10 pr-4 py-2 rounded-lg text-sm transition-all duration-200 w-full"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Select пользователь - выпадающий список */}
            <div className="relative" ref={userDropdownRef} style={{ width: '300px', minWidth: '300px' }}>
              <div className="relative w-full">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                  <User className="w-4 h-4 text-[#8eba1e]" />
                </div>
                <input
                  type="text"
                  placeholder="Все пользователи"
                  value={
                    userSearch ||
                    (selectedUserId === 'Все' ? '' : getUserDisplayName(selectedUserId)) ||
                    ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setUserSearch(value);
                    setUserDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setUserDropdownOpen(true);
                    if (!userSearch && selectedUserId && selectedUserId !== 'Все') {
                      setUserSearch(getUserDisplayName(selectedUserId));
                    }
                  }}
                  onBlur={(e) => {
                    const target = e.relatedTarget as HTMLElement;
                    if (target && userDropdownRef.current?.contains(target)) {
                      return;
                    }
                    setTimeout(() => {
                      setUserSearch('');
                    }, 200);
                  }}
                  className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 pl-10 pr-28 py-2 rounded-lg text-sm transition-all duration-200 w-full truncate"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                  {userSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserSearch('');
                        setUserDropdownOpen(true);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {selectedUserId !== 'Все' && !userSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setUserSearch('');
                        setSelectedUserId('Все');
                        setUserDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setUserDropdownOpen(!userDropdownOpen);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown size={16} className={userDropdownOpen ? 'rotate-180 transition-transform' : ''} />
                  </button>
                </div>
              </div>

              {userDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setSelectedUserId('Все');
                        setUserSearch('');
                        setUserDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        selectedUserId === 'Все' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      Все пользователи
                    </button>
                    {filteredUsers.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">Ничего не найдено</div>
                    ) : (
                      filteredUsers.map((user) => (
                        <button
                          key={user.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setSelectedUserId(user.id.toString());
                            setUserSearch('');
                            setUserDropdownOpen(false);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            selectedUserId === user.id.toString() ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {user.lastName} {user.firstName} ({user.username})
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
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

            {/* Фильтр по цене */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#8eba1e]" />
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="От суммы"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 w-32"
              />
              <span className="text-gray-500">—</span>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="До суммы"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] transition-all duration-200 w-32"
              />
            </div>

            {/* Сортировка */}
            <div className="relative" ref={sortDropdownRef} style={{ width: '200px', minWidth: '200px' }}>
              <div className="relative w-full">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative flex items-center gap-2"
                >
                  <ArrowUpDown className="w-4 h-4 text-[#8eba1e]" />
                  <span className="truncate pr-6 block">
                    {sortBy === 'none' ? 'Сортировка' : 
                     sortBy === 'date' ? 'По дате' : 
                     'По сумме'}
                  </span>
                  <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('none');
                        setSortDropdownOpen(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === 'none' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      Без сортировки
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('date');
                        setSortDropdownOpen(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === 'date' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      По дате
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSortBy('amount');
                        setSortDropdownOpen(false);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        sortBy === 'amount' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      По сумме
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Направление сортировки */}
            {sortBy !== 'none' && (
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm transition-all duration-200 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                title={sortOrder === 'asc' ? 'По возрастанию' : 'По убыванию'}
              >
                {sortOrder === 'asc' ? (
                  <>
                    <ArrowUp className="w-4 h-4 text-[#8eba1e]" />
                    <span className="text-gray-700">Вверх</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-4 h-4 text-[#8eba1e]" />
                    <span className="text-gray-700">Вниз</span>
                  </>
                )}
              </button>
            )}
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
          <>
            <div className="rounded-xl border border-gray-200 shadow-sm">
              <table className="min-w-full table-auto text-sm">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-right">Номер заявки</th>
                    <th className="px-6 py-4 font-semibold text-right">Дата</th>
                    <th className="px-6 py-4 font-semibold text-right">Клиент</th>
                    <th className="px-6 py-4 font-semibold text-right">Тип</th>
                    <th className="px-6 py-4 font-semibold text-right">Сумма</th>
                    <th className="px-6 py-4 font-semibold text-right">Автор</th>
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
                    paginatedRequests.map((req, idx) => (
                      <tr 
                        key={`${req.id}-${idx}`} 
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:shadow-sm"
                        onClick={() => handleRequestClick(req.id)}
                      >
                        <td className="px-6 py-4 font-mono text-sm text-[#8eba1e] hover:text-[#7aa31a] font-medium text-right">
                          {req.bidNumber}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-right">{formatDate(req.date)}</td>
                        <td className="px-6 py-4 font-medium text-gray-900 text-right">{req.client}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="px-3 py-1 rounded-full text-xs bg-[#8eba1e]/10 text-[#8eba1e] font-medium">
                            {req.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-[#8eba1e] text-right">
                          {formatAmount(req.totalAmount)}
                        </td>
                        <td className="px-6 py-4 text-gray-700 text-right">{getAuthorName(req.user)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Пагинация и выбор количества элементов */}
            {filtered.length > 0 && (
              <div className="mt-6 flex items-center justify-between gap-4">
                {/* Выбор количества элементов на странице */}
                <div className="relative" ref={itemsPerPageDropdownRef} style={{ width: '150px', minWidth: '150px' }}>
                  <button
                    type="button"
                    onClick={() => setItemsPerPageDropdownOpen(!itemsPerPageDropdownOpen)}
                    className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative flex items-center gap-2"
                  >
                    <span className="truncate pr-6 block">
                      Показать: {itemsPerPage}
                    </span>
                    <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${itemsPerPageDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {itemsPerPageDropdownOpen && (
                    <div className="absolute z-50 bottom-full mb-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                      {[10, 15, 20, 50].map((count) => {
                        const isSelected = itemsPerPage === count;
                        return (
                          <button
                            key={count}
                            type="button"
                            onClick={() => {
                              setItemsPerPage(count);
                              setItemsPerPageDropdownOpen(false);
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                              isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                            }`}
                          >
                            {count}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Пагинация */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filtered.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    itemName="заявок"
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function RequestsPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-110px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8eba1e] mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    }>
      <RequestsPageContent />
    </Suspense>
  );
}
