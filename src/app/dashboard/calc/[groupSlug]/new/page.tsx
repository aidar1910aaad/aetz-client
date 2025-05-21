'use client';

import CategoryBlock from '@/components/Calc/CategoryBlock';
import ManualItemModal from '@/components/Calc/ManualItemModal';
import CategoryNameModal from '@/components/Calc/CategoryNameModal';
import { useCalculationLogic } from './useCalculationLogic';

export type ManualItem = {
  name: string;
  unit: string;
  price: number;
  quantity: number;
};

export type CalcItem = ManualItem & { id?: number };

export type CategoryBlockType = {
  id: string;
  name: string;
  items: CalcItem[];
  open: boolean;
  searchQuery?: string;
};

export default function CreateCalculationPage() {
  const {
    title,
    setTitle,
    materials,
    categories,
    saved,
    showCategoryModal,
    setShowCategoryModal,
    handleCategorySubmit,
    toggleCategory,
    openManualModal,
    manualModalOpen,
    setManualModalOpen,
    handleManualSubmit,
    handleChangeQuantity,
    addMaterialToCategory,
    removeItem,
    updateSearchQuery,
    total,
    handleSave,
  } = useCalculationLogic();

  return (
    <div className="px-8 py-8 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Создание калькуляции</h2>
        <button
          onClick={handleSave}
          className="bg-[#3A55DF] text-white px-5 py-2.5 rounded-lg hover:bg-[#2e46c5] transition"
        >
          {saved ? 'Сохранено' : 'Сохранить'}
        </button>
      </div>

      <input
        type="text"
        placeholder="Название калькуляции"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full max-w-xl mb-6 px-4 py-2 border rounded"
      />

      <button
        onClick={() => setShowCategoryModal(true)}
        className="mb-6 bg-white border border-gray-300 px-4 py-2 rounded hover:bg-gray-100"
      >
        + Добавить категорию
      </button>

      <CategoryNameModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSubmit={handleCategorySubmit}
      />

      {categories.map((cat) => (
        <CategoryBlock
          key={cat.id}
          categoryId={cat.id}
          name={cat.name}
          open={cat.open}
          items={cat.items}
          searchQuery={cat.searchQuery || ''}
          onToggle={() => toggleCategory(cat.id)}
          onSearchChange={(value) => updateSearchQuery(cat.id, value)}
          onAddManual={() => openManualModal(cat.id)}
          onAddMaterial={(m) => addMaterialToCategory(cat.id, m)}
          onRemoveItem={(index) => removeItem(cat.id, index)}
          onChangeQuantity={(index, value) => handleChangeQuantity(cat.id, index, value)}
        />
      ))}

      <ManualItemModal
        isOpen={manualModalOpen}
        onClose={() => setManualModalOpen(false)}
        onSubmit={handleManualSubmit}
      />

      <div className="text-right text-lg font-semibold mt-10">
        Общая сумма: {total.toLocaleString()} тг
      </div>
    </div>
  );
}
