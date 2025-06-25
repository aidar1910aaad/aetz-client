'use client';

import { useState, useEffect } from 'react';
import { BmzSettings, AreaPriceRange, Equipment } from '@/api/bmz';
import { showToast } from '@/shared/modals/ToastProvider';
import { bmzApi } from '@/api/bmz';
import BmzSettingsHeader from './components/BmzSettingsHeader';
import BmzMainSettings from './components/BmzMainSettings';
import BmzAreaPriceTable from './components/BmzAreaPriceTable';
import BmzEquipmentTable from './components/BmzEquipmentTable';
import BmzSettingsModal from './components/modals/BmzSettingsModal';
import BmzAreaPriceModal from './components/modals/BmzAreaPriceModal';
import BmzEquipmentModal from './components/modals/BmzEquipmentModal';

export default function BmzSettingsPage() {
  const [settings, setSettings] = useState<BmzSettings | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAreaPriceModalOpen, setIsAreaPriceModalOpen] = useState(false);
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<AreaPriceRange | null>(null);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await bmzApi.getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error loading BMZ settings:', error);
      showToast('Ошибка при загрузке настроек', 'error');
    }
  };

  const updateBmzSettings = async (newSettings: Partial<BmzSettings>) => {
    if (!settings) return;
    const { id, createdAt, updatedAt, ...settingsToUpdate } = {
      ...settings,
      ...newSettings,
      basePricePerSquareMeter: Number(
        newSettings.basePricePerSquareMeter || settings.basePricePerSquareMeter
      ),
    };
    const updated = await bmzApi.updateSettings(settingsToUpdate);
    setSettings(updated);
  };

  const handleAddAreaPrice = async (data: AreaPriceRange) => {
    try {
      // Проверяем корректность введенных значений
      if (data.minArea >= data.maxArea) {
        showToast('Минимальная площадь должна быть меньше максимальной', 'error');
        return;
      }

      // Проверяем пересечение с существующими диапазонами
      const hasOverlap = settings.areaPriceRanges.some((range) => {
        // Пропускаем текущий диапазон при редактировании
        if (
          editingPrice &&
          range.minArea === editingPrice.minArea &&
          range.maxArea === editingPrice.maxArea &&
          range.minWallThickness === editingPrice.minWallThickness
        ) {
          return false;
        }

        // Проверяем пересечение по площади и толщине стен
        return (
          range.minWallThickness === data.minWallThickness &&
          ((data.minArea < range.maxArea && data.maxArea > range.minArea) ||
            (range.minArea < data.maxArea && range.maxArea > data.minArea))
        );
      });

      if (hasOverlap) {
        showToast(
          'Диапазон пересекается с существующим диапазоном. Пожалуйста, сначала удалите существующий диапазон.',
          'error'
        );
        return;
      }

      const updatedRanges = editingPrice
        ? settings.areaPriceRanges.map((range) =>
            range.minArea === editingPrice.minArea &&
            range.maxArea === editingPrice.maxArea &&
            range.minWallThickness === editingPrice.minWallThickness
              ? data
              : range
          )
        : [...settings.areaPriceRanges, data];

      await updateBmzSettings({
        ...settings,
        areaPriceRanges: updatedRanges,
      });

      setEditingPrice(null);
      setIsAreaPriceModalOpen(false);
      showToast('Диапазон цен успешно сохранен', 'success');
    } catch (error) {
      console.error('Error saving area price range:', error);
      showToast('Ошибка при сохранении диапазона цен', 'error');
    }
  };

  const handleDeleteAreaPrice = async (index: number) => {
    if (!settings) return;

    try {
      const updatedRanges = settings.areaPriceRanges.filter((_, i) => i !== index);
      await updateBmzSettings({
        ...settings,
        areaPriceRanges: updatedRanges,
      });
      showToast('Диапазон цен успешно удален', 'success');
    } catch (error) {
      console.error('Error deleting area price range:', error);
      showToast('Ошибка при удалении диапазона цен', 'error');
    }
  };

  const handleAddEquipment = async (data: Equipment) => {
    if (!settings) return;

    try {
      const updatedEquipment = editingEquipment
        ? settings.equipment.map((item) => (item.name === editingEquipment.name ? data : item))
        : [...settings.equipment, data];

      await updateBmzSettings({
        ...settings,
        equipment: updatedEquipment,
      });

      setEditingEquipment(null);
      setIsEquipmentModalOpen(false);
      showToast('Оборудование успешно сохранено', 'success');
    } catch (error) {
      console.error('Error saving equipment:', error);
      showToast('Ошибка при сохранении оборудования', 'error');
    }
  };

  const handleDeleteEquipment = async (name: string) => {
    if (!settings) return;

    try {
      const updatedEquipment = settings.equipment.filter((item) => item.name !== name);
      await updateBmzSettings({
        ...settings,
        equipment: updatedEquipment,
      });
      showToast('Оборудование успешно удалено', 'success');
    } catch (error) {
      console.error('Error deleting equipment:', error);
      showToast('Ошибка при удалении оборудования', 'error');
    }
  };

  if (!settings) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <BmzSettingsHeader
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onAreaPriceClick={() => {
          setEditingPrice(null);
          setIsAreaPriceModalOpen(true);
        }}
        onEquipmentClick={() => {
          setEditingEquipment(null);
          setIsEquipmentModalOpen(true);
        }}
      />

      <BmzMainSettings settings={settings} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Диапазоны цен по площади</h2>
        <BmzAreaPriceTable
          areaPriceRanges={settings.areaPriceRanges}
          onEdit={(price) => {
            setEditingPrice(price);
            setIsAreaPriceModalOpen(true);
          }}
          onDelete={(index) => handleDeleteAreaPrice(index)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Оборудование</h2>
        <BmzEquipmentTable
          equipment={settings.equipment}
          onEdit={(equipment) => {
            setEditingEquipment(equipment);
            setIsEquipmentModalOpen(true);
          }}
          onDelete={(index) => handleDeleteEquipment(settings.equipment[index].name)}
        />
      </div>

      <BmzSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSubmit={async (data) => {
          await updateBmzSettings(data);
          setIsSettingsModalOpen(false);
          showToast('Настройки успешно сохранены', 'success');
        }}
      />

      <BmzAreaPriceModal
        isOpen={isAreaPriceModalOpen}
        onClose={() => {
          setIsAreaPriceModalOpen(false);
          setEditingPrice(null);
        }}
        editingPrice={editingPrice}
        existingRanges={settings.areaPriceRanges}
        onSubmit={handleAddAreaPrice}
      />

      <BmzEquipmentModal
        isOpen={isEquipmentModalOpen}
        onClose={() => {
          setIsEquipmentModalOpen(false);
          setEditingEquipment(null);
        }}
        editingEquipment={editingEquipment}
        onSubmit={handleAddEquipment}
      />
    </div>
  );
}
