'use client';

import { useState, useEffect } from 'react';
import { Equipment } from '@/api/bmz';
import { showToast } from '@/shared/modals/ToastProvider';
import { X, Wrench, Tag, Banknote, FileText } from 'lucide-react';
import { bmzInputClass, bmzLabelClass, bmzPillDefault, bmzPillSelected } from './bmzModalStyles';

type PriceType = 'perSquareMeter' | 'perHalfSquareMeter' | 'fixed';

const PRICE_TYPE_OPTIONS: { value: PriceType; label: string; hint: string }[] = [
  { value: 'perSquareMeter', label: 'За м²', hint: 'на всю площадь' },
  { value: 'perHalfSquareMeter', label: 'За 0.5 м²', hint: 'на полплощади' },
  { value: 'fixed', label: 'Фикс.', hint: 'разовая сумма' },
];

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
  const [priceType, setPriceType] = useState<PriceType>('perSquareMeter');
  const [name, setName] = useState('');
  const [pricePerSquareMeter, setPricePerSquareMeter] = useState('');
  const [fixedPrice, setFixedPrice] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    if (editingEquipment) {
      setPriceType(editingEquipment.priceType);
      setName(editingEquipment.name);
      setPricePerSquareMeter(
        editingEquipment.pricePerSquareMeter != null
          ? String(editingEquipment.pricePerSquareMeter)
          : '',
      );
      setFixedPrice(
        editingEquipment.fixedPrice != null ? String(editingEquipment.fixedPrice) : '',
      );
      setDescription(editingEquipment.description ?? '');
    } else {
      setPriceType('perSquareMeter');
      setName('');
      setPricePerSquareMeter('');
      setFixedPrice('');
      setDescription('');
    }
  }, [editingEquipment, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b border-[#8eba1e]/15 bg-gradient-to-r from-[#8eba1e]/10 via-white to-[#7aa31a]/5 px-6 py-5">
            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8eba1e] shadow-md shadow-[#8eba1e]/25">
                <Wrench className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingEquipment ? 'Редактирование оборудования' : 'Новое оборудование'}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">Название, тип цены и описание</p>
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
              const data: Equipment = {
                name: name.trim(),
                priceType,
                pricePerSquareMeter:
                  priceType !== 'fixed' ? Number(pricePerSquareMeter) : undefined,
                fixedPrice: priceType === 'fixed' ? Number(fixedPrice) : undefined,
                description: description.trim(),
              };

              if (!data.name) {
                showToast('Введите название оборудования', 'error');
                return;
              }

              if (priceType === 'fixed' && (!data.fixedPrice || isNaN(data.fixedPrice))) {
                showToast('Введите корректную фиксированную цену', 'error');
                return;
              }

              if (
                priceType !== 'fixed' &&
                (!data.pricePerSquareMeter || isNaN(data.pricePerSquareMeter))
              ) {
                showToast('Введите корректную цену за м²', 'error');
                return;
              }

              try {
                await onSubmit(data);
              } catch {
                showToast('Ошибка при сохранении оборудования', 'error');
              }
            }}
          >
            <div className="space-y-6 px-6 py-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Tag className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Основное</span>
                </div>
                <label htmlFor="equipmentName" className={bmzLabelClass}>
                  Название
                </label>
                <input
                  id="equipmentName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Утепление стен"
                  required
                  className={bmzInputClass}
                />
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Banknote className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Тип цены</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {PRICE_TYPE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPriceType(option.value)}
                      className={`rounded-xl border-2 px-2 py-2.5 text-center transition-all ${
                        priceType === option.value ? bmzPillSelected : bmzPillDefault
                      }`}
                    >
                      <span className="block text-sm font-bold">{option.label}</span>
                      <span className="block text-[10px] font-medium opacity-70">{option.hint}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Banknote className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">
                    {priceType === 'fixed' ? 'Фиксированная цена' : 'Цена за м²'}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={priceType === 'fixed' ? fixedPrice : pricePerSquareMeter}
                    onChange={(e) =>
                      priceType === 'fixed'
                        ? setFixedPrice(e.target.value)
                        : setPricePerSquareMeter(e.target.value)
                    }
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
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Описание</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Краткое описание для калькуляции"
                  className={`${bmzInputClass} resize-none`}
                />
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
                {editingEquipment ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
