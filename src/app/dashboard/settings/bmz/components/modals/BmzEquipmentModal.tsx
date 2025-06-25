'use client';

import { useState, useEffect } from 'react';
import { Equipment } from '@/api/bmz';
import { showToast } from '@/shared/modals/ToastProvider';

interface BmzEquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEquipment: Equipment | null;
  onSubmit: (data: Equipment) => Promise<void>;
}

export default function BmzEquipmentModal({
  isOpen,
  onClose,
  editingEquipment,
  onSubmit,
}: BmzEquipmentModalProps) {
  const [priceType, setPriceType] = useState<'perSquareMeter' | 'perHalfSquareMeter' | 'fixed'>(
    editingEquipment?.priceType || 'perSquareMeter'
  );

  useEffect(() => {
    if (editingEquipment) {
      setPriceType(editingEquipment.priceType);
    }
  }, [editingEquipment]);

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
              {editingEquipment ? 'Редактирование оборудования' : 'Новое оборудование'}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = {
                  name: formData.get('name') as string,
                  priceType,
                  pricePerSquareMeter:
                    priceType !== 'fixed' ? Number(formData.get('pricePerSquareMeter')) : undefined,
                  fixedPrice:
                    priceType === 'fixed' ? Number(formData.get('fixedPrice')) : undefined,
                  description: formData.get('description') as string,
                };

                if (!data.name) {
                  showToast('Пожалуйста, введите название оборудования', 'error');
                  return;
                }

                if (priceType === 'fixed' && (!data.fixedPrice || isNaN(data.fixedPrice))) {
                  showToast('Пожалуйста, введите корректную фиксированную цену', 'error');
                  return;
                }

                if (
                  priceType !== 'fixed' &&
                  (!data.pricePerSquareMeter || isNaN(data.pricePerSquareMeter))
                ) {
                  showToast('Пожалуйста, введите корректную цену за м²', 'error');
                  return;
                }

                try {
                  await onSubmit(data);
                } catch {
                  showToast('Ошибка при сохранении оборудования', 'error');
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">Название</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editingEquipment?.name}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Тип цены</label>
                <select
                  name="priceType"
                  value={priceType}
                  onChange={(e) =>
                    setPriceType(
                      e.target.value as 'perSquareMeter' | 'perHalfSquareMeter' | 'fixed'
                    )
                  }
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                >
                  <option value="perSquareMeter">За м²</option>
                  <option value="perHalfSquareMeter">За 0.5 м²</option>
                  <option value="fixed">Фиксированная</option>
                </select>
              </div>
              <div className="price-inputs">
                {priceType !== 'fixed' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Цена за м²</label>
                    <input
                      type="number"
                      name="pricePerSquareMeter"
                      defaultValue={editingEquipment?.pricePerSquareMeter}
                      min="0"
                      step="1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Фиксированная цена
                    </label>
                    <input
                      type="number"
                      name="fixedPrice"
                      defaultValue={editingEquipment?.fixedPrice}
                      min="0"
                      step="1"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                    />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Описание</label>
                <textarea
                  name="description"
                  defaultValue={editingEquipment?.description}
                  rows={3}
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
                  {editingEquipment ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
