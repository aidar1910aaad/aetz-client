'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, X, Search, ArrowRight } from 'lucide-react';
import { Category } from '@/api/categories';
import { useMaterialCategoriesHandlers } from '@/hooks/useMaterialCategoriesHandlers';
import PageLoader from '@/shared/loader/PageLoader';
import Pagination from '@/shared/components/Pagination';
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

  if (loading) return <PageLoader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Категории материалов</h1>
        <div className="flex gap-4">
          {canEdit && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-[#8eba1e] text-white px-4 py-2 rounded hover:bg-[#7aa31a] transition text-sm"
            >
              Создать категорию
            </button>
          )}
          <Link
            href="/dashboard/materials"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition text-sm"
          >
            Перейти к материалам
          </Link>
        </div>
      </div>

      {/* Информационное сообщение для менеджера */}
      {isManagerUser && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Search className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Только просмотр
              </p>
              <p className="text-sm text-blue-700">
                У вас нет прав на создание и редактирование категорий. Обратитесь к администратору или пользователю ПТО для внесения изменений.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию категории..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {showForm && canEdit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Создание категории</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Название категории *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                  placeholder="Введите название"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID категории *
                </label>
                <input
                  type="number"
                  value={newCategory.id}
                  onChange={(e) => setNewCategory({ ...newCategory, id: parseInt(e.target.value) || 0 })}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                  placeholder="Введите ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Описание
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e]"
                  placeholder="Введите описание"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#8eba1e] text-white rounded hover:bg-[#7aa31a]"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ul className="space-y-2 max-h-[calc(100vh-335px)] overflow-y-auto pr-1">
        {paginatedCategories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between px-4 py-3 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50 hover:border-[#8eba1e]/30 hover:shadow-md transition-all duration-200 group"
          >
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900 group-hover:text-[#8eba1e] transition-colors duration-200">{cat.name}</p>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#8eba1e] transition-colors duration-200" />
              </div>
              {cat.description && (
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-3 items-start">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpdate(cat);
                  }}
                  className="text-[#8eba1e] hover:text-[#7aa31a] transition p-1 rounded hover:bg-[#8eba1e]/10"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                  className="text-red-600 hover:text-red-800 transition p-1 rounded hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredCategories.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </div>
  );
}
