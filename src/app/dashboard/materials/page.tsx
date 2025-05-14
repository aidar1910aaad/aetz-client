'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { useMaterials } from '@/hooks/useMaterials';
import { Material } from '@/api/material';
import PageLoader from '@/shared/loader/PageLoader';
import CreateMaterialModal from '@/shared/modals/materials/CreateMaterialModal';
import EditMaterialModal from '@/shared/modals/materials/EditMaterialModal';

export default function AllMaterialsPage() {
  const {
    filtered,
    categories,
    selectedCategory,
    handleCreate,
    setSelectedCategory,
    loading,
    handleDelete,
    allCategories,
    handleUpdate,
  } = useMaterials();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  if (loading) return <PageLoader />;

  return (
    <div className="p-6 h-[calc(100vh-124px)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Материалы</h1>

        <div className="flex items-center gap-3 ml-auto">
          <Link
            href="/dashboard/materials/categories"
            className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm"
          >
            Перейти к категориям
          </Link>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-[#3A55DF] text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            Создать материал
          </button>

          {modalOpen && (
            <CreateMaterialModal
              onClose={() => setModalOpen(false)}
              onCreate={handleCreate} // 👈 передаём handleCreate напрямую
            />
          )}
        </div>
      </div>

      {/* Фильтр по категории */}
      <div className="mb-4">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded text-sm focus:outline-[#3A55DF]"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'Все' ? 'Все категории' : `Категория ${cat}`}
            </option>
          ))}
        </select>
      </div>

      {/* Таблица */}
      <div className="flex-1 overflow-y-auto border border-gray-200 rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="text-left px-6 py-3">Название</th>
              <th className="text-left px-6 py-3">Категория</th>
              <th className="text-left px-6 py-3">Ед. изм.</th>
              <th className="text-left px-6 py-3">Цена</th>
              <th className="text-left px-6 py-3">Изменить / Удалить</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => (
              <tr key={m.id} className="border-b border-gray-200">
                <td className="px-6 py-3">
                  <Link
                    href={`/dashboard/materials/${m.id}/history`}
                    className="inline-block text-[#3A55DF] font-medium px-2 py-1 rounded-md transition-all duration-300 ease-in-out hover:bg-[#3A55DF]/10 hover:text-[#2e45bb]"
                  >
                    {m.name}
                  </Link>
                </td>

                <td className="px-6 py-3">{m.category?.name || '—'}</td>
                <td className="px-6 py-3">{m.unit}</td>
                <td className="px-6 py-3">
                  {typeof m.price === 'string'
                    ? parseFloat(m.price).toLocaleString()
                    : m.price.toLocaleString()}{' '}
                  ₸
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-4">
                    <button
                      onClick={() => setEditingMaterial(m)}
                      className="text-blue-600 hover:text-blue-800 transition"
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800 transition"
                      onClick={() => handleDelete(m.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {editingMaterial && (
          <EditMaterialModal
            material={editingMaterial}
            categories={allCategories}
            onClose={() => setEditingMaterial(null)}
            onUpdate={handleUpdate}
          />
        )}
      </div>
    </div>
  );
}
