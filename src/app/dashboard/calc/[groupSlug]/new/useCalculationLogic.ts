'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getAllMaterials, Material } from '@/api/material';
import { createCalculation, getAllCalculationGroups } from '@/api/calculations';
import { showToast } from '@/shared/modals/ToastProvider';
import { showConfirm } from '@/shared/modals/ConfirmModal';
import { CategoryBlockType, ManualItem } from './page';

export function useCalculationLogic() {
  const [title, setTitle] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categories, setCategories] = useState<CategoryBlockType[]>([]);
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { groupSlug } = useParams() as { groupSlug: string };

  useEffect(() => {
    const fetch = async () => {
      const token = localStorage.getItem('token') || '';
      const data = await getAllMaterials(token);
      console.log('Загруженные материалы:', data); // ← вот это добавь
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

    try {
      const token = localStorage.getItem('token') || '';

      const groups = await getAllCalculationGroups(token);
      const group = groups.find((g) => g.slug === groupSlug);
      if (!group) {
        showToast('Группа не найдена', 'error');
        return;
      }

      const payload = {
        name: title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        groupId: group.id,
        data: {
          categories: categories.map((cat) => ({
            name: cat.name,
            items: cat.items.map((item) => ({
              id: item.id ?? null,
              name: item.name,
              unit: item.unit,
              price: item.price,
              quantity: item.quantity,
            })),
          })),
        },
      };

      await createCalculation(payload, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      showToast('Калькуляция сохранена', 'success');
    } catch (err: any) {
      showToast(err.message || 'Ошибка при сохранении калькуляции', 'error');
    }
  };

  return {
    title,
    setTitle,
    materials,
    categories,
    setCategories,
    saved,
    showCategoryModal,
    setShowCategoryModal,
    handleCategorySubmit,
    toggleCategory,
    openManualModal,
    manualModalOpen,
    setManualModalOpen,
    activeCategoryId,
    handleManualSubmit,
    handleChangeQuantity,
    addMaterialToCategory,
    removeItem,
    updateSearchQuery,
    total,
    handleSave,
  };
}
