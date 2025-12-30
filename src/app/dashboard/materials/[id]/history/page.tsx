'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { getMaterialById, getMaterialHistory, MaterialHistoryItem, Material } from '@/api/material/exports';
import PageLoader from '@/shared/loader/PageLoader';
import PriceHistoryChart from '@/shared/charts/PriceHistoryChart';
import { ChevronDown, X } from 'lucide-react';

export default function MaterialHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [material, setMaterial] = useState<Material | null>(null);
  const [history, setHistory] = useState<MaterialHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Фильтры и сортировка
  const [filterField, setFilterField] = useState<string>('all');
  const [filterAuthor, setFilterAuthor] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // Dropdown states
  const [fieldDropdownOpen, setFieldDropdownOpen] = useState(false);
  const [authorDropdownOpen, setAuthorDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const fieldDropdownRef = useRef<HTMLDivElement>(null);
  const authorDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Search states
  const [fieldSearch, setFieldSearch] = useState('');
  const [authorSearch, setAuthorSearch] = useState('');

  // Функция для получения названия поля
  const getFieldLabel = (field: string) => {
    const fieldLabels: Record<string, string> = {
      price: 'Цена',
      name: 'Название',
      code: 'Код',
      unit: 'Ед. изм.',
      categoryId: 'Категория',
      description: 'Описание',
      manufacturer: 'Производитель',
      supplier: 'Поставщик',
    };
    return fieldLabels[field] || field;
  };

  // Получаем уникальные типы полей для фильтра
  const uniqueFields = useMemo(() => 
    Array.from(new Set(history.map((item) => item.fieldChanged))),
    [history]
  );
  
  // Получаем уникальных авторов для фильтра
  const uniqueAuthors = useMemo(() => 
    Array.from(new Set(history.map((item) => item.changedBy))),
    [history]
  );

  // Фильтрация полей по поисковому запросу
  const filteredFields = useMemo(() => {
    if (!fieldSearch.trim()) {
      return uniqueFields;
    }
    const searchLower = fieldSearch.toLowerCase();
    return uniqueFields.filter((field) =>
      getFieldLabel(field).toLowerCase().includes(searchLower)
    );
  }, [uniqueFields, fieldSearch]);

  // Фильтрация авторов по поисковому запросу
  const filteredAuthors = useMemo(() => {
    if (!authorSearch.trim()) {
      return uniqueAuthors;
    }
    const searchLower = authorSearch.toLowerCase();
    return uniqueAuthors.filter((author) =>
      author.toLowerCase().includes(searchLower)
    );
  }, [uniqueAuthors, authorSearch]);

  // Закрытие выпадающих списков при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fieldDropdownRef.current &&
        !fieldDropdownRef.current.contains(event.target as Node)
      ) {
        setFieldDropdownOpen(false);
      }
      if (
        authorDropdownRef.current &&
        !authorDropdownRef.current.contains(event.target as Node)
      ) {
        setAuthorDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      // Валидация ID
      if (!id) {
        setError('ID материала не указан');
        setLoading(false);
        return;
      }

      const materialId = Number(id);
      if (isNaN(materialId) || materialId <= 0) {
        setError('Некорректный ID материала');
        setLoading(false);
        return;
      }

      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem('token') || '';
        
        if (!token) {
          setError('Токен авторизации не найден');
          setLoading(false);
          return;
        }

        const [materialData, historyData] = await Promise.all([
          getMaterialById(materialId, token),
          getMaterialHistory(materialId, token),
        ]);
        setMaterial(materialData);
        setHistory(historyData);
      } catch (err: any) {
        console.error('Ошибка при загрузке истории материала:', err);
        setError(err.message || 'Ошибка при загрузке данных');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <PageLoader />;

  if (error) {
    return (
      <div className="p-6 h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
        <div className="flex flex-col items-center justify-center h-full">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <p className="text-red-600 text-lg mb-2">Ошибка загрузки</p>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Получаем историю изменений цены
  const priceChanges = history
    .filter((h) => h.fieldChanged === 'price')
    .map((h) => ({
      date: new Date(h.changedAt),
      oldPrice: Number(h.oldValue),
      newPrice: Number(h.newValue),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Строим полный график с начальной ценой
  const priceHistory: Array<{ date: Date; price: number }> = [];
  
  if (priceChanges.length > 0) {
    // Добавляем начальную точку с самой первой старой ценой
    const firstChange = priceChanges[0];
    if (!isNaN(firstChange.oldPrice) && firstChange.oldPrice > 0) {
      // Создаем дату за минуту до первого изменения для визуализации перехода
      const startDate = new Date(firstChange.date);
      startDate.setMinutes(startDate.getMinutes() - 1);
      priceHistory.push({
        date: startDate,
        price: firstChange.oldPrice,
      });
    }
    
    // Добавляем все точки изменений с новыми ценами
    priceChanges.forEach((change) => {
      if (!isNaN(change.newPrice) && change.newPrice > 0) {
        priceHistory.push({
          date: change.date,
          price: change.newPrice,
        });
      }
    });
    
    // Добавляем текущую цену материала, если она есть и отличается от последней
    if (material?.price && !isNaN(Number(material.price))) {
      const lastPrice = priceHistory[priceHistory.length - 1]?.price;
      const currentPrice = Number(material.price);
      if (lastPrice !== currentPrice) {
        priceHistory.push({
          date: new Date(), // Текущая дата
          price: currentPrice,
        });
      }
    }
  } else if (material?.price && !isNaN(Number(material.price))) {
    // Если нет истории изменений, но есть текущая цена - показываем только её
    priceHistory.push({
      date: new Date(),
      price: Number(material.price),
    });
  }
  
  // Сортируем по дате на всякий случай
  priceHistory.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Фильтрация и сортировка истории
  const filteredAndSortedHistory = [...history]
    .filter((item) => {
      // Фильтр по типу поля
      if (filterField !== 'all' && item.fieldChanged !== filterField) {
        return false;
      }
      // Фильтр по автору
      if (filterAuthor !== 'all' && item.changedBy !== filterAuthor) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.changedAt).getTime();
      const dateB = new Date(b.changedAt).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="p-6 h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-[#8eba1e] rounded-2xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#8eba1e]">
            История изменений
          </h1>
          <p className="text-lg text-[#8eba1e] font-medium">
            {material?.name || '—'}
          </p>
        </div>
      </div>

      {/* 📊 График цены */}
      {priceHistory.length > 0 && <PriceHistoryChart data={priceHistory} />}

      {/* 🔍 Фильтры и сортировка */}
      {history.length > 0 && (
        <div className="mb-6 bg-white p-4 rounded-xl border border-[#8eba1e]/20 shadow-sm">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Фильтр по типу поля - выпадающий список */}
            <div className="relative" ref={fieldDropdownRef} style={{ width: '200px', minWidth: '200px' }}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Тип изменения
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Все типы"
                  value={
                    fieldSearch ||
                    (filterField === 'all' ? '' : getFieldLabel(filterField)) ||
                    ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setFieldSearch(value);
                    setFieldDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setFieldDropdownOpen(true);
                    if (!fieldSearch && filterField && filterField !== 'all') {
                      setFieldSearch(getFieldLabel(filterField));
                    }
                  }}
                  onBlur={(e) => {
                    const target = e.relatedTarget as HTMLElement;
                    if (target && fieldDropdownRef.current?.contains(target)) {
                      return;
                    }
                    setTimeout(() => {
                      setFieldSearch('');
                    }, 200);
                  }}
                  className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-28 rounded-lg text-sm transition-all duration-200 w-full truncate"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                  {fieldSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFieldSearch('');
                        setFieldDropdownOpen(true);
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
                  {filterField !== 'all' && !fieldSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFieldSearch('');
                        setFilterField('all');
                        setFieldDropdownOpen(false);
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
                      setFieldDropdownOpen(!fieldDropdownOpen);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown size={16} className={fieldDropdownOpen ? 'rotate-180 transition-transform' : ''} />
                  </button>
                </div>
              </div>

              {fieldDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFilterField('all');
                        setFieldSearch('');
                        setFieldDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        filterField === 'all' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      Все типы
                    </button>
                    {filteredFields.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">Ничего не найдено</div>
                    ) : (
                      filteredFields.map((field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFilterField(field);
                            setFieldSearch('');
                            setFieldDropdownOpen(false);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            filterField === field ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {getFieldLabel(field)}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Фильтр по автору - выпадающий список */}
            <div className="relative" ref={authorDropdownRef} style={{ width: '200px', minWidth: '200px' }}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Автор
              </label>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Все авторы"
                  value={
                    authorSearch ||
                    (filterAuthor === 'all' ? '' : filterAuthor) ||
                    ''
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setAuthorSearch(value);
                    setAuthorDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setAuthorDropdownOpen(true);
                    if (!authorSearch && filterAuthor && filterAuthor !== 'all') {
                      setAuthorSearch(filterAuthor);
                    }
                  }}
                  onBlur={(e) => {
                    const target = e.relatedTarget as HTMLElement;
                    if (target && authorDropdownRef.current?.contains(target)) {
                      return;
                    }
                    setTimeout(() => {
                      setAuthorSearch('');
                    }, 200);
                  }}
                  className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-28 rounded-lg text-sm transition-all duration-200 w-full truncate"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
                  {authorSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setAuthorSearch('');
                        setAuthorDropdownOpen(true);
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
                  {filterAuthor !== 'all' && !authorSearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setAuthorSearch('');
                        setFilterAuthor('all');
                        setAuthorDropdownOpen(false);
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
                      setAuthorDropdownOpen(!authorDropdownOpen);
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
                  >
                    <ChevronDown size={16} className={authorDropdownOpen ? 'rotate-180 transition-transform' : ''} />
                  </button>
                </div>
              </div>

              {authorDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setFilterAuthor('all');
                        setAuthorSearch('');
                        setAuthorDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        filterAuthor === 'all' ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      Все авторы
                    </button>
                    {filteredAuthors.length === 0 ? (
                      <div className="px-4 py-2 text-gray-500 text-sm">Ничего не найдено</div>
                    ) : (
                      filteredAuthors.map((author) => (
                        <button
                          key={author}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setFilterAuthor(author);
                            setAuthorSearch('');
                            setAuthorDropdownOpen(false);
                          }}
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                            filterAuthor === author ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                          }`}
                        >
                          {author}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Сортировка - выпадающий список */}
            <div className="relative" ref={sortDropdownRef} style={{ width: '200px', minWidth: '200px' }}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Сортировка
              </label>
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
              >
                <span className="truncate pr-6 block">
                  {sortOrder === 'newest' ? 'Сначала новые' : 'Сначала старые'}
                </span>
                <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${sortDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {sortDropdownOpen && (
                <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
                  {(['newest', 'oldest'] as const).map((orderOption) => {
                    const labels = {
                      newest: 'Сначала новые',
                      oldest: 'Сначала старые',
                    };
                    const isSelected = sortOrder === orderOption;
                    return (
                      <button
                        key={orderOption}
                        type="button"
                        onClick={() => {
                          setSortOrder(orderOption);
                          setSortDropdownOpen(false);
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                          isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                        }`}
                      >
                        {labels[orderOption]}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Счетчик результатов */}
            <div className="ml-auto">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">
                  Показано: <span className="font-semibold text-[#8eba1e]">{filteredAndSortedHistory.length}</span> из{' '}
                  <span className="font-semibold text-gray-800">{history.length}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🧾 Карточки истории */}
      <div className="w-full">
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#8eba1e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Изменений пока нет</p>
            <p className="text-gray-400 text-sm">История изменений появится здесь</p>
          </div>
        ) : filteredAndSortedHistory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#8eba1e]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg">Ничего не найдено</p>
            <p className="text-gray-400 text-sm">Попробуйте изменить фильтры</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAndSortedHistory.map((item, idx) => (
              <div
                key={idx}
                className="group relative border border-[#8eba1e]/20 bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] overflow-hidden w-full hover:border-[#8eba1e]/40"
              >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#8eba1e] rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <span className="text-lg font-bold text-gray-800 capitalize">
                    {getFieldLabel(item.fieldChanged)}
                  </span>
                </div>
                <div className="text-right bg-gray-50 rounded-lg px-3 py-2">
                  <div className="text-sm font-medium text-gray-600">
                    {new Date(item.changedAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(item.changedAt).toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">Было</div>
                  <div className="text-sm font-semibold text-gray-800 break-words">
                    {item.fieldChanged === 'price'
                      ? `${Number(item.oldValue).toLocaleString('ru-RU')} ₸`
                      : item.oldValue}
                  </div>
                </div>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-600 mb-1">Стало</div>
                  <div className="text-sm font-semibold text-gray-800 break-words">
                    {item.fieldChanged === 'price'
                      ? `${Number(item.newValue).toLocaleString('ru-RU')} ₸`
                      : item.newValue}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Изменил: <span className="font-semibold text-gray-800">{item.changedBy}</span></span>
              </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
