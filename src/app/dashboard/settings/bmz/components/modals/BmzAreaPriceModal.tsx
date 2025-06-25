'use client';

import { useState, useEffect } from 'react';
import { AreaPriceRange } from '@/api/bmz';
import { showToast } from '@/shared/modals/ToastProvider';

interface BmzAreaPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingPrice: AreaPriceRange | null;
  onSubmit: (data: AreaPriceRange) => Promise<void>;
  existingRanges: AreaPriceRange[];
}

interface FormData {
  minArea: string | number;
  maxArea: string | number;
  minWallThickness: string | number;
  maxWallThickness: string | number;
  pricePerSquareMeter: string | number;
}

export default function BmzAreaPriceModal({
  isOpen,
  onClose,
  editingPrice,
  onSubmit,
  existingRanges,
}: BmzAreaPriceModalProps) {
  const [formData, setFormData] = useState<FormData>({
    minArea: editingPrice?.minArea || '',
    maxArea: editingPrice?.maxArea || '',
    minWallThickness: editingPrice?.minWallThickness || '',
    maxWallThickness: editingPrice?.maxWallThickness || '',
    pricePerSquareMeter: editingPrice?.pricePerSquareMeter || '',
  });

  const WALL_THICKNESS_OPTIONS = [50, 80, 100] as const;

  useEffect(() => {
    if (editingPrice) {
      setFormData(editingPrice);
    } else {
      setFormData({
        minArea: '',
        maxArea: '',
        minWallThickness: '',
        maxWallThickness: '',
        pricePerSquareMeter: '',
      });
    }
  }, [editingPrice]);

  const checkOverlap = (data: AreaPriceRange) => {
    if (!existingRanges) return false;

    console.log('Checking overlap for:', data);
    console.log('Existing ranges:', existingRanges);

    // Проверяем корректность введенных значений
    if (data.minArea >= data.maxArea) {
      showToast('Минимальная площадь должна быть меньше максимальной', 'error');
      return true;
    }

    // Находим все диапазоны с такой же толщиной стен
    const rangesWithSameThickness = existingRanges.filter(
      (range) => range.minWallThickness === data.minWallThickness
    );

    console.log('Ranges with same thickness:', rangesWithSameThickness);

    // Если это первый диапазон с такой толщиной стен
    if (rangesWithSameThickness.length === 0) {
      return false;
    }

    // Проверяем пересечение с каждым существующим диапазоном
    for (const range of rangesWithSameThickness) {
      // Пропускаем текущий диапазон при редактировании
      if (
        editingPrice &&
        range.minArea === editingPrice.minArea &&
        range.maxArea === editingPrice.maxArea &&
        range.minWallThickness === editingPrice.minWallThickness
      ) {
        console.log('Skipping editing range:', range);
        continue;
      }

      // Проверяем пересечение по площади
      const hasOverlap = data.minArea < range.maxArea && data.maxArea > range.minArea;

      console.log('Checking overlap with range:', range, 'hasOverlap:', hasOverlap);

      if (hasOverlap) {
        showToast(
          `Диапазон пересекается с существующим диапазоном: ${range.minArea}-${range.maxArea} м². Пожалуйста, сначала удалите существующий диапазон.`,
          'error'
        );
        return true;
      }
    }

    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Закрыть</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
              {editingPrice ? 'Редактирование диапазона цен' : 'Новый диапазон цен'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const wallThickness = Number(formData.get('wallThickness'));
                const data = {
                  minArea: Number(formData.get('minArea')),
                  maxArea: Number(formData.get('maxArea')),
                  minWallThickness: wallThickness,
                  maxWallThickness: wallThickness,
                  pricePerSquareMeter: Number(formData.get('pricePerSquareMeter')),
                };

                console.log('Form data before validation:', data);

                // Валидация на стороне клиента
                if (
                  isNaN(data.minArea) ||
                  isNaN(data.maxArea) ||
                  isNaN(data.minWallThickness) ||
                  isNaN(data.pricePerSquareMeter)
                ) {
                  showToast('Пожалуйста, заполните все поля корректно', 'error');
                  return;
                }

                if (data.minArea < 0 || data.maxArea < 0 || data.pricePerSquareMeter < 0) {
                  showToast('Значения не могут быть отрицательными', 'error');
                  return;
                }

                const hasOverlap = checkOverlap(data);
                if (hasOverlap) {
                  return;
                }

                try {
                  await onSubmit(data);
                } catch {
                  showToast('Ошибка при сохранении диапазона цен', 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Минимальная площадь (м²)
                </label>
                <input
                  type="number"
                  name="minArea"
                  value={formData.minArea}
                  onChange={(e) => setFormData({ ...formData, minArea: e.target.value })}
                  min="0"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Максимальная площадь (м²)
                </label>
                <input
                  type="number"
                  name="maxArea"
                  value={formData.maxArea}
                  onChange={(e) => setFormData({ ...formData, maxArea: e.target.value })}
                  min="0"
                  step="0.1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Толщина стен (мм)</label>
                <select
                  name="wallThickness"
                  value={formData.minWallThickness}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setFormData({
                      ...formData,
                      minWallThickness: value,
                      maxWallThickness: value,
                    });
                  }}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                >
                  <option value="">Выберите толщину стен</option>
                  {WALL_THICKNESS_OPTIONS.map((thickness) => (
                    <option key={thickness} value={thickness}>
                      {thickness} мм
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Цена за м²</label>
                <input
                  type="number"
                  name="pricePerSquareMeter"
                  value={formData.pricePerSquareMeter}
                  onChange={(e) =>
                    setFormData({ ...formData, pricePerSquareMeter: e.target.value })
                  }
                  min="0"
                  step="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                />
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-lg">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF]"
                  onClick={onClose}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-[#3A55DF] border border-transparent rounded-md hover:bg-[#2e46c5] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF]"
                >
                  {editingPrice ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
