'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMaterials } from '@/hooks/useMaterials';
import { Material } from '@/api/material';
import CreateMaterialModal from '@/shared/modals/materials/CreateMaterialModal';
import EditMaterialModal from '@/shared/modals/materials/EditMaterialModal';
import MaterialsTableSection from './MaterialsTableSection';

export default function AllMaterialsPage() {
  const {
    materials,
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
    loading,
    handleCreate,
    handleDelete,
    handleUpdate,
    allCategories,
  } = useMaterials();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

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
        </div>
      </div>

      {modalOpen && (
        <CreateMaterialModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      <MaterialsTableSection
        materials={materials}
        loading={loading}
        total={total}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        search={search}
        setSearch={setSearch}
        sort={sort}
        setSort={setSort}
        order={order}
        setOrder={setOrder}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        setEditingMaterial={setEditingMaterial}
        handleDelete={handleDelete}
      />

      {editingMaterial && (
        <EditMaterialModal
          material={editingMaterial}
          categories={allCategories}
          onClose={() => setEditingMaterial(null)}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
