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
import RoleGuard from '@/components/common/RoleGuard';
import { UserRole } from '@/types/user';

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
    <RoleGuard
      allowedRoles={[UserRole.ADMIN, UserRole.PTO]}
      redirectTo="/dashboard"
      pagePath="/dashboard/settings/bmz"
    >
      <div className="h-[calc(100vh-65px)] overflow-y-auto bg-gradient-to-br from-white via-gray-50/30 to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#8eba1e] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#8eba1e]">Диапазоны цен по площади</h2>
            </div>
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
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-[#8eba1e] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-[#8eba1e]">Оборудование</h2>
            </div>
            <BmzEquipmentTable
              equipment={settings.equipment}
              onEdit={(equipment) => {
                setEditingEquipment(equipment);
                setIsEquipmentModalOpen(true);
              }}
              onDelete={(index) => handleDeleteEquipment(settings.equipment[index].name)}
            />
          </div>
        </div>
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
    </RoleGuard>
  );
}
