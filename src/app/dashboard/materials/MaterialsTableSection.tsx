'use client';

import { Dispatch, SetStateAction, useState, useRef, useEffect, useMemo } from 'react';
import { Material } from '@/api/material/index';
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
  setSort: Dispatch<SetStateAction<'name' | 'price' | 'code'>>;
  order: string;
  setOrder: Dispatch<SetStateAction<'ASC' | 'DESC'>>;
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: Dispatch<SetStateAction<string>>;
  setEditingMaterial: Dispatch<SetStateAction<Material | null>>;
  handleDelete: (id: number) => void;
  canEdit?: boolean;
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
  setEditingMaterial,
  handleDelete,
  canEdit = true,
}: Props) {
  const totalPages = Math.ceil(total / limit);
  const [inputPage, setInputPage] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
  const [orderDropdownOpen, setOrderDropdownOpen] = useState(false);
  const orderDropdownRef = useRef<HTMLDivElement>(null);
  
  const [limitDropdownOpen, setLimitDropdownOpen] = useState(false);
  const limitDropdownRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

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
  }, [categoryDropdownOpen, sortDropdownOpen, orderDropdownOpen, limitDropdownOpen]);

  // Обновление позиции overlay при скролле - overlay должен покрывать видимую область
  useEffect(() => {
    if (!loading || !tableContainerRef.current) return;

    const container = tableContainerRef.current;
    const overlay = container.querySelector('.loading-overlay') as HTMLElement;
    
    if (!overlay) return;

    const updateOverlayPosition = () => {
      const rect = container.getBoundingClientRect();
      // Overlay должен покрывать видимую область контейнера
      overlay.style.position = 'fixed';
      overlay.style.top = `${rect.top}px`;
      overlay.style.left = `${rect.left}px`;
      overlay.style.width = `${rect.width}px`;
      overlay.style.height = `${rect.height}px`;
    };

    updateOverlayPosition();
    const handleScroll = () => updateOverlayPosition();
    const handleResize = () => updateOverlayPosition();

    container.addEventListener('scroll', handleScroll, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [loading]);

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

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Фильтры */}
      <div className="flex-shrink-0 flex flex-wrap gap-4 mb-6 items-center w-full">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm w-[200px] transition-all duration-200"
        />

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
        <div className="relative" ref={sortDropdownRef} style={{ width: '200px', minWidth: '200px' }}>
          <button
            type="button"
            onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">
              {sort === 'name' && 'Сортировка: Название'}
              {sort === 'price' && 'Сортировка: Цена'}
              {sort === 'code' && 'Сортировка: Код'}
            </span>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${sortDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {sortDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {(['name', 'price', 'code'] as const).map((sortOption) => {
                const labels = {
                  name: 'Сортировка: Название',
                  price: 'Сортировка: Цена',
                  code: 'Сортировка: Код',
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
        <div className="relative" ref={limitDropdownRef} style={{ width: '170px', minWidth: '170px' }}>
          <button
            type="button"
            onClick={() => setLimitDropdownOpen(!limitDropdownOpen)}
            className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pr-8 rounded-lg text-sm transition-all duration-200 text-left bg-white hover:bg-gray-50 relative"
          >
            <span className="truncate pr-6 block">{limit} на страницу</span>
            <ChevronDown size={16} className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-transform pointer-events-none ${limitDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {limitDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
              {[20, 50, 100, 200].map((limitOption) => {
                const isSelected = limit === limitOption;
                return (
                  <button
                    key={limitOption}
                    type="button"
                    onClick={() => {
                      setLimit(limitOption);
                      setLimitDropdownOpen(false);
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                      isSelected ? 'bg-[#8eba1e]/10 text-[#8eba1e] font-medium' : 'text-gray-700'
                    }`}
                  >
                    {limitOption} на страницу
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Таблица */}
      <div 
        ref={tableContainerRef}
        className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-sm min-h-0 relative"
      >
        {loading && (
          <div 
            className="loading-overlay fixed flex items-center justify-center z-30 pointer-events-none rounded-lg"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }}
          >
            <div className="animate-spin h-10 w-10 rounded-full border-4 border-[#8eba1e] border-t-transparent pointer-events-auto" />
          </div>
        )}
        <div className="relative">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="text-left px-6 py-3">Название</th>
                <th className="text-left px-6 py-3">Категория</th>
                <th className="text-left px-6 py-3">Код</th>
                <th className="text-left px-6 py-3">Ед. изм.</th>
                <th className="text-left px-6 py-3">Цена</th>
                {canEdit && (
                  <th className="text-left px-6 py-3">Изменить / Удалить</th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading && materials.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-10 text-center text-gray-500">
                    Загрузка...
                  </td>
                </tr>
              ) : !loading && materials.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="px-6 py-10 text-center text-gray-500">
                    Нет данных
                  </td>
                </tr>
              ) : (
                materials.map((m) => (
                  <tr key={m.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <Link
                        href={`/dashboard/materials/${m.id}/history`}
                        className="text-gray-900 font-medium hover:text-[#8eba1e] hover:underline transition-colors duration-200"
                      >
                        {m.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{m.category?.name || '—'}</td>
                    <td className="px-6 py-3">{m.code || '—'}</td>
                    <td className="px-6 py-3">{m.unit}</td>
                    <td className="px-6 py-3">
                      {typeof m.price === 'string'
                        ? parseFloat(m.price).toLocaleString()
                        : m.price.toLocaleString()}{' '}
                      ₸
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
      </div>
    </div>
  );
}
