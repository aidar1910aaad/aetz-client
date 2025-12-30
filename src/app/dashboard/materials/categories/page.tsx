'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Search, ArrowRight, FolderOpen, Plus, Layers, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Category } from '@/api/categories';
import { useMaterialCategoriesHandlers } from '@/hooks/useMaterialCategoriesHandlers';
import PageLoader from '@/shared/loader/PageLoader';
import { useRoleCheck } from '@/hooks/useRoleCheck';

interface NewCategory {
  name: string;
  description: string;
  id: number;
}

export default function MaterialCategoriesPage() {
  const router = useRouter();
  const { isManagerUser } = useRoleCheck();
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    id: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [inputPage, setInputPage] = useState('');
  
  const itemsPerPage = 20;
  
  // Менеджер может только просматривать, не может редактировать и создавать
  const canEdit = !isManagerUser;

  const { fetchCategories, handleAddCategory, handleDelete, handleUpdate } =
    useMaterialCategoriesHandlers(categories, setCategories, setNewCategory);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCategories();
      console.log('Categories:', categories);
      setLoading(false);
    })();
  }, [fetchCategories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', newCategory);
    
    if (newCategory.name.trim() && newCategory.id) {
      console.log('Validation passed, calling handleAddCategory');
      handleAddCategory(newCategory);
      setNewCategory({ name: '', description: '', id: 0 });
      setShowForm(false);
    } else {
      console.log('Validation failed:', { 
        name: newCategory.name.trim(), 
        id: newCategory.id 
      });
    }
  };

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryClick = (categoryName: string) => {
    // Navigate to materials page with selected category
    router.push(`/dashboard/materials?category=${encodeURIComponent(categoryName)}`);
  };

  // Улучшенная пагинация (как в MaterialsTableSection)
  const handlePageInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(inputPage);
      if (pageNum >= 1 && pageNum <= totalPages) {
        setCurrentPage(pageNum);
        setInputPage('');
      }
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    if (start > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (end < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, filteredCategories.length);

  if (loading) return <PageLoader />;

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Layers className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Категории материалов</h1>
              <p className="text-gray-600">Управление категориями для организации материалов</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего категорий: </span>
                <span className="font-semibold text-[#8eba1e]">{filteredCategories.length}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/materials"
                className="flex items-center gap-2 bg-gray-100 hover:bg-[#8eba1e] text-gray-700 hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                <FolderOpen size={18} />
                Материалы
              </Link>
              {canEdit && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={18} />
                  Создать категорию
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
        {/* Search */}
        <div className="flex-shrink-0 mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Поиск по названию категории..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 pl-10 rounded-lg text-sm transition-all duration-200"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-sm min-h-0">
          {paginatedCategories.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[400px]">
              <div className="text-center">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {searchQuery ? 'Категории не найдены' : 'Нет категорий'}
                </p>
                {!searchQuery && canEdit && (
                  <button
                    onClick={() => setShowForm(true)}
                    className="mt-4 text-[#8eba1e] hover:text-[#7aa31a] font-medium"
                  >
                    Создать первую категорию
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleCategoryClick(cat.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#8eba1e]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Layers className="w-5 h-5 text-[#8eba1e]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-base font-semibold text-gray-900 group-hover:text-[#8eba1e] transition-colors duration-200">
                            {cat.name}
                          </p>
                          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8eba1e] transition-colors duration-200" />
                        </div>
                        {cat.description && (
                          <p className="text-sm text-gray-600">{cat.description}</p>
                        )}
                        {!cat.description && (
                          <p className="text-sm text-gray-400 italic">Нет описания</p>
                        )}
                      </div>
                    </div>
                  </div>
                  {canEdit && (
                    <div className="flex gap-2 items-center ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(cat);
                        }}
                        className="p-2 text-[#8eba1e] hover:text-white hover:bg-[#8eba1e] rounded-lg transition-all duration-200"
                        title="Редактировать"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Вы уверены, что хотите удалить категорию "${cat.name}"?`)) {
                            handleDelete(cat.id);
                          }
                        }}
                        className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all duration-200"
                        title="Удалить"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex-shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Показано <span className="font-semibold text-[#8eba1e]">{startItem}</span> - <span className="font-semibold text-[#8eba1e]">{endItem}</span> из <span className="font-semibold text-[#8eba1e]">{filteredCategories.length}</span> категорий
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
                title="Первая страница"
              >
                <ChevronsLeft size={18} />
              </button>

              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
                title="Предыдущая страница"
              >
                <ChevronLeft size={18} />
              </button>

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
                  const isActive = pageNumber === currentPage;

                  return (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
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

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
                title="Следующая страница"
              >
                <ChevronRight size={18} />
              </button>

              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
                title="Последняя страница"
              >
                <ChevronsRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Перейти на:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={inputPage}
                onChange={(e) => setInputPage(e.target.value)}
                onKeyDown={handlePageInput}
                placeholder={currentPage.toString()}
                className="w-16 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-center focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 transition-all duration-200"
              />
              <span className="text-sm text-gray-500">из {totalPages}</span>
            </div>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      {showForm && canEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Создание категории</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Название категории <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2.5 rounded-lg transition-all duration-200"
                  placeholder="Введите название"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ID категории <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newCategory.id || ''}
                  onChange={(e) => setNewCategory({ ...newCategory, id: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2.5 rounded-lg transition-all duration-200"
                  placeholder="Введите ID"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Описание
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2.5 rounded-lg transition-all duration-200 resize-none"
                  placeholder="Введите описание (необязательно)"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
