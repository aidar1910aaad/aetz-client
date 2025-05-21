'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2, X, Search } from 'lucide-react';
import { Category } from '@/api/categories';
import { useMaterialCategoriesHandlers } from '@/hooks/useMaterialCategoriesHandlers';
import PageLoader from '@/shared/loader/PageLoader';

interface NewCategory {
  name: string;
  description: string;
  id: number;
}

export default function MaterialCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState<NewCategory>({
    name: '',
    description: '',
    id: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <PageLoader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Категории материалов</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            Создать категорию
          </button>
          <Link
            href="/dashboard/materials"
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition text-sm"
          >
            Перейти к материалам
          </Link>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Поиск по названию категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {showForm && (
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
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
                  className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
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
                  className="px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-blue-700"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
        {filteredCategories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between px-4 py-3 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{cat.name}</p>
              </div>
              {cat.description && (
                <p className="text-xs text-gray-500 mt-1">{cat.description}</p>
              )}
            </div>
            <div className="flex gap-3 items-start">
              <button
                onClick={() => handleUpdate(cat)}
                className="text-blue-600 hover:text-blue-800 transition"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-600 hover:text-red-800 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
