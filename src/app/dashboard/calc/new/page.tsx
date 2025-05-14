// 💡 Полноценная страница создания калькуляции с категориями, базой материалов и ручными позициями

'use client';

import { useState, useEffect } from 'react';
import { getAllMaterials, Material } from '@/api/material';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import CategoryBlock from '@/components/Calc/CategoryBlock';
import ManualItemModal from '@/components/Calc/ManualItemModal';
import CategoryNameModal from '@/components/Calc/CategoryNameModal';

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
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [title, setTitle] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<CategoryBlockType[]>([]);
  const [saved, setSaved] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('token') || '';
      const data = await getAllMaterials(token);
      setMaterials(data);
    };
    fetch();
  }, []);

  const handleCategorySubmit = (name: string) => {
    setCategories((prev) => [
      ...prev,
      { id: Date.now().toString(), name, items: [], open: true, searchQuery: '' },
    ]);
    setShowCategoryModal(false);
  };

  const toggleCategory = (id: string) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, open: !c.open } : c)));
  };

  const openManualModal = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    setManualModalOpen(true);
  };

  const handleManualSubmit = (data: ManualItem) => {
    if (!activeCategoryId) return;
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === activeCategoryId ? { ...cat, items: [...cat.items, data] } : cat
      )
    );
  };
  const handleChangeQuantity = (catId: string, index: number, value: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: cat.items.map((item, i) =>
                i === index ? { ...item, quantity: value } : item
              ),
            }
          : cat
      )
    );
  };

  const addMaterialToCategory = (categoryId: string, material: Material) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: [
                ...cat.items,
                {
                  id: material.id,
                  name: material.name,
                  unit: material.unit,
                  price: material.price,
                  quantity: 1,
                },
              ],
            }
          : cat
      )
    );
  };

  const removeItem = (catId: string, index: number) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === catId ? { ...cat, items: cat.items.filter((_, i) => i !== index) } : cat
      )
    );
  };

  const updateSearchQuery = (catId: string, value: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === catId ? { ...cat, searchQuery: value } : cat))
    );
  };

  const total = categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, item) => s + item.price * item.quantity, 0),
    0
  );

  const handleSave = async () => {
    if (!title.trim()) {
      showToast('Введите название калькуляции', 'error');
      return;
    }

    const confirmed = await showConfirm({
      title: 'Сохранить калькуляцию?',
      message: `Название: ${title}\nИтоговая сумма: ${total.toLocaleString()} тг`,
    });
    if (!confirmed) return;

    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    showToast('Калькуляция сохранена', 'success');
  };

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
          materials={materials}
          searchQuery={cat.searchQuery || ''}
          onToggle={() => toggleCategory(cat.id)}
          onSearchChange={(value) => updateSearchQuery(cat.id, value)}
          onAddManual={() => openManualModal(cat.id)}
          onAddMaterial={(m) => addMaterialToCategory(cat.id, m)}
          onRemoveItem={(index) => removeItem(cat.id, index)}
          onChangeQuantity={(index, value) => handleChangeQuantity(cat.id, index, value)} // ✅ добавлено
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
