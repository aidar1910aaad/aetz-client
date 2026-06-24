'use client';

import { Dispatch, SetStateAction, useState, useRef, useEffect, useMemo } from 'react';
import { Material } from '@/api/material/index';
import PageLoader from '@/shared/loader/PageLoader';
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';

interface Props {
  materials: Material[];
  loading: boolean;
  total: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  limit: number;
  setLimit: Dispatch<SetStateAction<number>>;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  sort: string;
  setSort: Dispatch<SetStateAction<'name' | 'price' | 'code' | 'createdAt'>>;
  order: string;
  setOrder: Dispatch<SetStateAction<'ASC' | 'DESC'>>;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  selectedCurrency: 'ALL' | 'FOREIGN' | 'KZT' | 'USD' | 'RUB' | 'EUR' | 'CNY';
  setSelectedCurrency: Dispatch<
    SetStateAction<'ALL' | 'FOREIGN' | 'KZT' | 'USD' | 'RUB' | 'EUR' | 'CNY'>
  >;
  setEditingMaterial: Dispatch<SetStateAction<Material | null>>;
  handleDelete: (id: number) => void;
  handleDeleteMany: (ids: number[]) => Promise<boolean>;
  canEdit?: boolean;
  importBadgeById?: Record<string, 'create' | 'update'>;
}

export default function MaterialsTableSection({
  materials,
  loading,
  total,
  page,
  setPage,
  limit,
  setLimit,
  search,
  setSearch,
  sort,
  setSort,
  order,
  setOrder,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedCurrency,
  setSelectedCurrency,
  setEditingMaterial,
  handleDelete,
  handleDeleteMany,
  canEdit = true,
  importBadgeById = {},
}: Props) {
  const isShowAll = limit === 0;
  const totalPages = isShowAll ? 1 : Math.ceil(total / limit);
  const [inputPage, setInputPage] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const currencyDropdownRef = useRef<HTMLDivElement>(null);
  
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const orderDropdownRef = useRef<HTMLDivElement>(null);
  
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const currentPageIds = useMemo(() => materials.map((material) => material.id), [materials]);
  const allCurrentPageSelected =
    currentPageIds.length > 0 && currentPageIds.every((id) => selectedIds.has(id));
  const someCurrentPageSelected =
    currentPageIds.some((id) => selectedIds.has(id)) && !allCurrentPageSelected;

  const toggleSelectAllCurrentPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCurrentPageSelected) {
        currentPageIds.forEach((id) => next.delete(id));
      } else {
        currentPageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectMaterial = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0 || bulkDeleting) {
      return;
    }

    setBulkDeleting(true);
    try {
      const deleted = await handleDeleteMany(Array.from(selectedIds));
      if (deleted) {
        setSelectedIds(new Set());
      }
    } finally {
      setBulkDeleting(false);
    }
  };

  // Фильтрация категорий по поисковому запросу
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) {
      return categories;
    }
    const searchLower = categorySearch.toLowerCase();
    return categories.filter((cat) =>
      (cat === 'Все' ? 'Все категории' : cat).toLowerCase().includes(searchLower)
    );
  }, [categories, categorySearch]);

  // Закрытие выпадающих списков при клике вне
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
      if (
        currencyDropdownRef.current &&
        !currencyDropdownRef.current.contains(event.target as Node)
      ) {
        setCurrencyDropdownOpen(false);
      }
      if (
        orderDropdownRef.current &&
        !orderDropdownRef.current.contains(event.target as Node)
      ) {
        setOrderDropdownOpen(false);
      }
      if (
        limitDropdownRef.current &&
        !limitDropdownRef.current.contains(event.target as Node)
      ) {
        setLimitDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [categoryDropdownOpen, sortDropdownOpen, currencyDropdownOpen, orderDropdownOpen, limitDropdownOpen]);

  // Вычисляем диапазон страниц для отображения
  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 7) {
      // Если страниц мало, показываем все
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2; // Количество страниц по бокам от текущей
    const range = [];
    const rangeWithDots = [];

    // Вычисляем диапазон страниц вокруг текущей
    const start = Math.max(2, page - delta);
    const end = Math.min(totalPages - 1, page + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    // Всегда показываем первую страницу
    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Добавляем средний диапазон
    rangeWithDots.push(...range);

    // Показываем последнюю страницу
    if (end < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputPage);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setPage(pageNum);
        setInputPage('');
      }
    }
  };

  const startItem = isShowAll ? (total > 0 ? 1 : 0) : (page - 1) * limit + 1;
  const endItem = isShowAll ? total : Math.min(page * limit, total);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {canEdit && selectedIds.size > 0 && (
        <div className="flex-shrink-0 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50/70 px-4 py-3">
          <p className="text-sm text-gray-700">
            Выбрано: <span className="font-semibold text-gray-900">{selectedIds.size}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              disabled={bulkDeleting}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Снять выделение
            </button>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Trash2 size={16} />
              {bulkDeleting ? 'Удаление...' : `Удалить выбранные (${selectedIds.size})`}
            </button>
          </div>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex-shrink-0 flex flex-wrap gap-4 mb-6 items-center w-full">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm w-[200px] transition-all duration-200"
        />

        <div className="relative" ref={currencyDropdownRef} style={{ width: '220px', minWidth: '220px' }}>
          <button
            type="button"
            onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">
              {selectedCurrency === 'ALL' && 'Все валюты'}
              {selectedCurrency === 'FOREIGN' && 'Только иностранная'}
              {selectedCurrency === 'USD' && 'Только USD'}
              {selectedCurrency === 'RUB' && 'Только RUB'}
              {selectedCurrency === 'EUR' && 'Только EUR'}
              {selectedCurrency === 'CNY' && 'Только CNY'}
              {selectedCurrency === 'KZT' && 'Только KZT'}
            </span>
            <ChevronDown
              size={16}
              className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${
                currencyDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {currencyDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {(
                [
                  ['ALL', 'Все валюты'],
                  ['FOREIGN', 'Только иностранная'],
                  ['USD', 'Только USD'],
                  ['RUB', 'Только RUB'],
                  ['EUR', 'Только EUR'],
                  ['CNY', 'Только CNY'],
                  ['KZT', 'Только KZT'],
                ] as const
              ).map(([value, label]) => {
                const isSelected = selectedCurrency === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setSelectedCurrency(value);
                      setCurrencyDropdownOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="relative" ref={categoryDropdownRef} style={{ width: '400px', minWidth: '400px' }}>
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Все категории"
              value={
                categorySearch ||
                (selectedCategory === 'Все' ? '' : selectedCategory) ||
                ''
              }
              onChange={(e) => {
                const value = e.target.value;
                setCategorySearch(value);
                setCategoryDropdownOpen(true);
              }}
              onFocus={() => {
                setCategoryDropdownOpen(true);
                // При фокусе очищаем поле для удобного поиска
                if (!categorySearch && selectedCategory && selectedCategory !== 'Все') {
                  setCategorySearch(selectedCategory);
                }
              }}
              onBlur={(e) => {
                // Проверяем, не кликнули ли на кнопку
                const target = e.relatedTarget as HTMLElement;
                if (target && categoryDropdownRef.current?.contains(target)) {
                  return;
                }
                // При потере фокуса очищаем поиск через небольшую задержку
                setTimeout(() => {
                  setCategorySearch('');
                }, 200);
              }}
              className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-28 rounded-lg text-sm transition-all duration-200 w-full truncate"
              style={{ width: '100%' }}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              {categorySearch && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCategorySearch('');
                    setCategoryDropdownOpen(true);
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
              {selectedCategory !== 'Все' && !categorySearch && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setCategorySearch('');
                    setSelectedCategory('Все');
                    setCategoryDropdownOpen(false);
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
                  setCategoryDropdownOpen(!categoryDropdownOpen);
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown size={16} className={categoryDropdownOpen ? 'rotate-180 transition-transform' : ''} />
              </button>
            </div>
          </div>

          {categoryDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full max-h-96 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg">
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-2 text-gray-500 text-sm">Ничего не найдено</div>
              ) : (
                filteredCategories.map((cat) => {
                  const displayName = cat === 'Все' ? 'Все категории' : cat;
                  const isSelected = cat === selectedCategory;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setCategorySearch('');
                        setCategoryDropdownOpen(false);
                      }}
                      onMouseDown={(e) => {
                        // Предотвращаем onBlur инпута при клике на элемент списка
                        e.preventDefault();
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                        isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                      }`}
                    >
                      {displayName}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Сортировка */}
        <div className="relative" ref={sortDropdownRef} style={{ width: '240px', minWidth: '240px' }}>
          <button
            type="button"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">
              {sort === 'name' && 'Сортировка: Название'}
              {sort === 'price' && 'Сортировка: Цена'}
              {sort === 'code' && 'Сортировка: Код'}
              {sort === 'createdAt' && 'Сортировка: Дата создания'}
            </span>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${sortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {(['name', 'price', 'code', 'createdAt'] as const).map((sortOption) => {
                const labels = {
                  name: 'Сортировка: Название',
                  price: 'Сортировка: Цена',
                  code: 'Сортировка: Код',
                  createdAt: 'Сортировка: Дата создания',
                };
                const isSelected = sort === sortOption;
                return (
                  <button
                    key={sortOption}
                    type="button"
                    onClick={() => {
                      setSort(sortOption);
                      setSortDropdownOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {labels[sortOption]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Порядок сортировки */}
        <div className="relative" ref={orderDropdownRef} style={{ width: '180px', minWidth: '180px' }}>
          <button
            type="button"
            onClick={() => setOrderDropdownOpen(!orderDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">
              {order === 'ASC' ? 'По возрастанию' : 'По убыванию'}
            </span>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${orderDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {orderDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {(['ASC', 'DESC'] as const).map((orderOption) => {
                const labels = {
                  ASC: 'По возрастанию',
                  DESC: 'По убыванию',
                };
                const isSelected = order === orderOption;
                return (
                  <button
                    key={orderOption}
                    type="button"
                    onClick={() => {
                      setOrder(orderOption);
                      setOrderDropdownOpen(false);
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

        {/* Количество на странице */}
        <div className="relative" ref={limitDropdownRef} style={{ width: '190px', minWidth: '190px' }}>
          <button
            type="button"
            onClick={() => setLimitDropdownOpen(!limitDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">
              {isShowAll ? 'Все' : `${limit} на страницу`}
            </span>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${limitDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {limitDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {[
                { value: 200, label: '200 на страницу' },
                { value: 500, label: '500 на страницу' },
                { value: 1000, label: '1000 на страницу' },
                { value: 0, label: 'Все' },
              ].map((limitOption) => {
                const isSelected = limit === limitOption.value;
                return (
                  <button
                    key={limitOption.value}
                    type="button"
                    onClick={() => {
                      setLimit(limitOption.value);
                      setLimitDropdownOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {limitOption.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-sm min-h-0 relative">
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none rounded-lg overflow-hidden"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <PageLoader size="compact" className="pointer-events-auto" message="Обновление..." />
          </div>
        )}
        <div className="relative">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {canEdit && (
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={allCurrentPageSelected}
                      ref={(input) => {
                        if (input) {
                          input.indeterminate = someCurrentPageSelected;
                        }
                      }}
                      onChange={toggleSelectAllCurrentPage}
                      className="h-4 w-4 rounded border-gray-300 text-[#8eba1e] focus:ring-[#8eba1e]"
                      aria-label="Выбрать все на странице"
                    />
                  </th>
                )}
                <th className="text-left px-6 py-3">Название</th>
                <th className="text-left px-6 py-3">Категория</th>
                <th className="text-left px-6 py-3">Код</th>
                <th className="text-left px-6 py-3">Ед. изм.</th>
                <th className="text-left px-6 py-3">Исходная цена</th>
                <th className="text-left px-6 py-3">Текущая цена (₸)</th>
                {canEdit && (
                  <th className="text-left px-6 py-3">Изменить / Удалить</th>
                )}
              </tr>
            </thead>
            <tbody>
              {!loading && materials.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 6} className="px-6 py-10 text-center text-gray-500">
                    Нет данных
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b border-gray-200 transition-colors hover:bg-gray-50 ${
                      selectedIds.has(m.id) ? 'bg-[#8eba1e]/5' : ''
                    }`}
                  >
                    {canEdit && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(m.id)}
                          onChange={() => toggleSelectMaterial(m.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#8eba1e] focus:ring-[#8eba1e]"
                          aria-label={`Выбрать ${m.name}`}
                        />
                      </td>
                    )}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/dashboard/materials/${m.id}/history`}
                          className="text-gray-900 font-medium hover:text-[#8eba1e] hover:underline transition-colors duration-200"
                        >
                          {m.name}
                        </Link>
                        {importBadgeById[String(m.id)] === 'update' && (
                          <span className="inline-flex rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-amber-200">
                            Обновлён
                          </span>
                        )}
                        {importBadgeById[String(m.id)] === 'create' && (
                          <span className="inline-flex rounded-full bg-green-100 text-green-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-green-200">
                            Новый
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-3">{m.category?.name || '—'}</td>
                    <td className="px-6 py-3">{m.code || '—'}</td>
                    <td className="px-6 py-3">{m.unit}</td>
                    <td className="px-6 py-3">
                      {Number(m.priceInCurrency ?? 0).toLocaleString('ru-RU')} {m.currency || 'KZT'}
                    </td>
                    <td className="px-6 py-3">
                      {Number(m.currentPriceKzt ?? m.price ?? 0).toLocaleString('ru-RU')} ₸
                    </td>
                    {canEdit && (
                      <td className="px-6 py-3">
                        <div className="flex gap-4">
                          <button
                            onClick={() => setEditingMaterial(m)}
                            className="text-[#8eba1e] hover:text-[#7aa31a] transition-colors duration-200 hover:bg-gray-100 p-2 rounded-lg"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 hover:bg-red-100 p-2 rounded-lg"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
        {/* Информация о записях */}
        <div className="text-sm text-gray-600">
          Показано <span className="font-semibold text-[#8eba1e]">{startItem}</span> - <span className="font-semibold text-[#8eba1e]">{endItem}</span> из <span className="font-semibold text-[#8eba1e]">{total}</span> материалов
        </div>

        {/* Навигация по страницам */}
        {!isShowAll && (
        <>
        <div className="flex items-center gap-2">
          {/* Кнопка "Первая страница" */}
          <button
            disabled={page === 1}
            onClick={() => setPage(1)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
            title="Первая страница"
          >
            <ChevronsLeft size={18} />
          </button>

          {/* Кнопка "Предыдущая" */}
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
            title="Предыдущая страница"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Номера страниц */}
          <div className="flex gap-1">
            {getPageNumbers().map((pageNum, idx) => {
              if (pageNum === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-3 py-2 text-gray-400">
                    ...
                  </span>
                );
              }

              const pageNumber = pageNum as number;
              const isActive = pageNumber === page;

              return (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`min-w-[40px] px-3 py-2 border rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#8eba1e] text-white border-[#8eba1e] font-semibold'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#8eba1e]'
                  }`}
                >
                  {pageNumber}
                </button>
              );
            })}
          </div>

          {/* Кнопка "Следующая" */}
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(page + 1)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
            title="Следующая страница"
          >
            <ChevronRight size={18} />
          </button>

          {/* Кнопка "Последняя страница" */}
          <button
            disabled={page === totalPages || totalPages === 0}
            onClick={() => setPage(totalPages)}
            className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
            title="Последняя страница"
          >
            <ChevronsRight size={18} />
          </button>
        </div>

        {/* Поле ввода для прямого перехода */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Перейти на:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            onKeyDown={handlePageInput}
            placeholder={page.toString()}
            className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 transition-all duration-200"
          />
          <span className="text-sm text-gray-500">из {totalPages}</span>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
