'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { Package, Plus, FolderOpen } from 'lucide-react';
import { useMaterials } from '@/hooks/useMaterials';
import { Material } from '@/api/material/index';
import CreateMaterialModal from '@/shared/modals/materials/CreateMaterialModal';
import EditMaterialModal from '@/shared/modals/materials/EditMaterialModal';
import MaterialsTableSection from './MaterialsTableSection';
import PageLoader from '@/shared/loader/PageLoader';
import { useRoleCheck } from '@/hooks/useRoleCheck';

function MaterialsPageContent() {
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

  const { isManagerUser } = useRoleCheck();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  // Менеджер может только просматривать, не может редактировать и создавать
  const canEdit = !isManagerUser;

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col overflow-hidden">
      <div className="flex-shrink-0 p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <Package className="w-6 h-6 text-[#8eba1e]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Материалы</h1>
              <p className="text-gray-600">Управление материалами и их категориями</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-gray-600">Всего материалов: </span>
                <span className="font-semibold text-[#8eba1e]">{total}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/materials/categories"
                className="flex items-center gap-2 bg-gray-100 hover:bg-[#8eba1e] text-gray-700 hover:text-white px-4 py-2 rounded-xl transition-all duration-200"
              >
                <FolderOpen size={18} />
                Категории
              </Link>
              {canEdit && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Plus size={18} />
                  Создать материал
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {modalOpen && canEdit && (
        <CreateMaterialModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
        />
      )}

      <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
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
          canEdit={canEdit}
        />
      </div>

      {editingMaterial && canEdit && (
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

export default function AllMaterialsPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <MaterialsPageContent />
    </Suspense>
  );
}
