'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Category } from '@/api/categories';
import { useMaterialCategoriesHandlers } from '@/hooks/useMaterialCategoriesHandlers';
import PageLoader from '@/shared/loader/PageLoader';

export default function MaterialCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true); // состояние загрузки

  const { fetchCategories, handleAddCategory, handleDelete, handleUpdate } =
    useMaterialCategoriesHandlers(categories, setCategories, setNewCategory);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchCategories();
      setLoading(false);
    })();
  }, [fetchCategories]);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Категории материалов</h1>
        <Link
          href="/dashboard/materials"
          className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
        >
          Перейти к материалам
        </Link>
      </div>

      <div className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Новая категория"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded w-64 text-sm focus:outline-[#3A55DF]"
        />
        <button
          onClick={() => handleAddCategory(newCategory)}
          className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Создать
        </button>
      </div>

      <ul className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
        {categories.map((cat) => (
          <li
            key={cat.id}
            className="flex justify-between px-4 py-3 bg-white border border-gray-200 rounded shadow-sm hover:bg-gray-50"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">{cat.name}</p>
              {cat.description && <p className="text-xs text-gray-500 mt-1">{cat.description}</p>}
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
