'use client';

import { Dispatch, SetStateAction } from 'react';
import { Material } from '@/api/material/index';
import { Pencil, Trash2 } from 'lucide-react';
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

  return (
    <>
      {/* Фильтры */}
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm w-[200px] transition-all duration-200"
        />

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm transition-all duration-200"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'Все' ? 'Все категории' : `Категория ${cat}`}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'name' | 'price' | 'code')}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm transition-all duration-200"
        >
          <option value="name">Сортировка: Название</option>
          <option value="price">Сортировка: Цена</option>
          <option value="code">Сортировка: Код</option>
        </select>

        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as 'ASC' | 'DESC')}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm transition-all duration-200"
        >
          <option value="ASC">По возрастанию</option>
          <option value="DESC">По убыванию</option>
        </select>

        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border border-gray-300 focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20 px-4 py-2 rounded-lg text-sm transition-all duration-200"
        >
          <option value={20}>20 на страницу</option>
          <option value={50}>50 на страницу</option>
          <option value={100}>100 на страницу</option>
          <option value={200}>200 на страницу</option>
        </select>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
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
            {loading ? (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="py-10 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent" />
                  </div>
                </td>
              </tr>
            ) : materials.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 6 : 5} className="py-10 text-center text-gray-500">
                  Нет данных
                </td>
              </tr>
            ) : (
              materials.map((m) => (
                <tr key={m.id} className="border-b border-gray-200">
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

      {/* Пагинация */}
      <div className="flex justify-between items-center mt-6">
        <div className="text-sm text-gray-600">
          Страница <span className="font-semibold text-[#8eba1e]">{page}</span> из <span className="font-semibold text-[#8eba1e]">{totalPages || 1}</span>
        </div>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
          >
            Назад
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-[#8eba1e] transition-all duration-200"
          >
            Вперёд
          </button>
        </div>
      </div>
    </>
  );
}
