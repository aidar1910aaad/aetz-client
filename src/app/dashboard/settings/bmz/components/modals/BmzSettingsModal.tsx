'use client';

import { BmzSettings } from '@/api/bmz';

interface BmzSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: BmzSettings;
  onSubmit: (data: Partial<BmzSettings>) => Promise<void>;
}

export default function BmzSettingsModal({
  isOpen,
  onClose,
  settings,
  onSubmit,
}: BmzSettingsModalProps) {
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
              Основные настройки
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const basePrice = formData.get('basePricePerSquareMeter');
                const isActive = formData.get('isActive') === 'true';

                if (!basePrice || isNaN(Number(basePrice))) {
                  return;
                }

                await onSubmit({
                  basePricePerSquareMeter: Number(basePrice),
                  isActive,
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Базовая цена за м²
                </label>
                <input
                  type="number"
                  name="basePricePerSquareMeter"
                  defaultValue={settings.basePricePerSquareMeter}
                  min="0"
                  step="1"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Статус</label>
                <select
                  name="isActive"
                  defaultValue={settings.isActive.toString()}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] sm:text-sm"
                >
                  <option value="true">Активно</option>
                  <option value="false">Неактивно</option>
                </select>
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
                  Сохранить
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
