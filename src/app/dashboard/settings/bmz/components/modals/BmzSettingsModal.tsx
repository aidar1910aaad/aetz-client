'use client';

import { useState, useEffect } from 'react';
import { BmzSettings } from '@/api/bmz';
import { X, Settings, Banknote, Power } from 'lucide-react';
import { bmzInputClass, bmzLabelClass, bmzPillDefault, bmzPillSelected } from './bmzModalStyles';

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
  const [isActive, setIsActive] = useState(settings.isActive);
  const [basePrice, setBasePrice] = useState(String(settings.basePricePerSquareMeter ?? ''));

  useEffect(() => {
    if (isOpen) {
      setIsActive(settings.isActive);
      setBasePrice(String(settings.basePricePerSquareMeter ?? ''));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b border-[#8eba1e]/15 bg-gradient-to-r from-[#8eba1e]/10 via-white to-[#7aa31a]/5 px-6 py-5">
            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8eba1e] shadow-md shadow-[#8eba1e]/25">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Основные настройки</h3>
                <p className="mt-0.5 text-sm text-gray-500">Базовая цена и статус калькуляции БМЗ</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-white/80 hover:text-gray-600"
              aria-label="Закрыть"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const price = Number(basePrice);
              if (!basePrice || isNaN(price) || price < 0) return;
              await onSubmit({
                basePricePerSquareMeter: price,
                isActive,
              });
            }}
          >
            <div className="space-y-6 px-6 py-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Banknote className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Базовая цена</span>
                </div>
                <label htmlFor="basePrice" className={bmzLabelClass}>
                  Цена за м²
                </label>
                <div className="relative">
                  <input
                    id="basePrice"
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    min="0"
                    step="1"
                    placeholder="0"
                    required
                    className={`${bmzInputClass} pr-12`}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    ₸
                  </span>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Power className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Статус</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: true, label: 'Активно' },
                    { value: false, label: 'Неактивно' },
                  ].map((option) => (
                    <button
                      key={String(option.value)}
                      type="button"
                      onClick={() => setIsActive(option.value)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        isActive === option.value ? bmzPillSelected : bmzPillDefault
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>

            <div className="flex gap-3 border-t border-gray-100 bg-gray-50/50 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl bg-[#8eba1e] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-[#8eba1e]/25 transition-all hover:bg-[#7aa31a] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#8eba1e]/40 focus:ring-offset-2"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
