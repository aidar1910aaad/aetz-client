'use client';

import { useState, useEffect } from 'react';
import { AreaPriceRange } from '@/api/bmz';
import { showToast } from '@/shared/modals/ToastProvider';
import {
  areaPriceRangesOverlap,
  isSameAreaPriceRange,
  normalizeAreaPriceRange,
} from '@/utils/bmzAreaPriceRange';
import { X, Ruler, Layers, Banknote, ArrowRight, ArrowUpDown } from 'lucide-react';
import {
  bmzInputClass,
  bmzLabelClass,
  bmzPillDefault,
  bmzPillSelected,
} from './bmzModalStyles';

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
  minHeight: string | number;
  maxHeight: string | number;
  minWallThickness: string | number;
  maxWallThickness: string | number;
  pricePerSquareMeter: string | number;
}

const WALL_THICKNESS_OPTIONS = [50, 80, 100] as const;
const HEIGHT_PRESETS = [
  { label: '2700', min: 2700, max: 2700 },
  { label: '3150', min: 3150, max: 3150 },
  { label: '2700–3150', min: 2700, max: 3150 },
] as const;

export default function BmzAreaPriceModal({
  isOpen,
  onClose,
  editingPrice,
  onSubmit,
  existingRanges,
}: BmzAreaPriceModalProps) {
  const [formData, setFormData] = useState<FormData>({
    minArea: '',
    maxArea: '',
    minHeight: '',
    maxHeight: '',
    minWallThickness: '',
    maxWallThickness: '',
    pricePerSquareMeter: '',
  });

  useEffect(() => {
    if (editingPrice) {
      const normalized = normalizeAreaPriceRange(editingPrice);
      setFormData({
        minArea: normalized.minArea,
        maxArea: normalized.maxArea,
        minHeight: normalized.minHeight,
        maxHeight: normalized.maxHeight === 999999 ? '' : normalized.maxHeight,
        minWallThickness: normalized.minWallThickness,
        maxWallThickness: normalized.maxWallThickness,
        pricePerSquareMeter: normalized.pricePerSquareMeter,
      });
    } else {
      setFormData({
        minArea: '',
        maxArea: '',
        minHeight: 2700,
        maxHeight: 2700,
        minWallThickness: '',
        maxWallThickness: '',
        pricePerSquareMeter: '',
      });
    }
  }, [editingPrice, isOpen]);

  const checkOverlap = (data: AreaPriceRange) => {
    if (data.minArea >= data.maxArea) {
      showToast('Минимальная площадь должна быть меньше максимальной', 'error');
      return true;
    }
    if (data.minHeight >= data.maxHeight) {
      showToast('Минимальная высота должна быть меньше максимальной', 'error');
      return true;
    }

    for (const range of existingRanges) {
      if (editingPrice && isSameAreaPriceRange(range, editingPrice)) continue;
      if (areaPriceRangesOverlap(data, range)) {
        const r = normalizeAreaPriceRange(range);
        showToast(
          `Пересечение с диапазоном: ${r.minArea}–${r.maxArea} м², ${r.minHeight}–${r.maxHeight} мм, стены ${r.minWallThickness} мм`,
          'error',
        );
        return true;
      }
    }
    return false;
  };

  const minAreaNum = Number(formData.minArea);
  const maxAreaNum = Number(formData.maxArea);
  const minHeightNum = Number(formData.minHeight);
  const maxHeightNum = Number(formData.maxHeight);
  const priceNum = Number(formData.pricePerSquareMeter);
  const hasPreview =
    !isNaN(minAreaNum) &&
    !isNaN(maxAreaNum) &&
    minAreaNum >= 0 &&
    maxAreaNum > minAreaNum &&
    !isNaN(minHeightNum) &&
    !isNaN(maxHeightNum) &&
    maxHeightNum > minHeightNum &&
    formData.minWallThickness !== '';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className="relative flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative border-b border-[#8eba1e]/15 bg-gradient-to-r from-[#8eba1e]/10 via-white to-[#7aa31a]/5 px-6 py-5">
            <div className="flex items-start gap-4 pr-8">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#8eba1e] shadow-md shadow-[#8eba1e]/25">
                <Ruler className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {editingPrice ? 'Редактирование диапазона' : 'Новый диапазон цен'}
                </h3>
                <p className="mt-0.5 text-sm text-gray-500">
                  Площадь, высота, толщина стен и цена за м²
                </p>
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
              const wallThickness = Number(formData.minWallThickness);
              const maxHeight =
                formData.maxHeight === '' ? 999999 : Number(formData.maxHeight);
              const data: AreaPriceRange = {
                minArea: Number(formData.minArea),
                maxArea: Number(formData.maxArea),
                minHeight: Number(formData.minHeight),
                maxHeight,
                minWallThickness: wallThickness,
                maxWallThickness: wallThickness,
                pricePerSquareMeter: Number(formData.pricePerSquareMeter),
              };

              if (
                [data.minArea, data.maxArea, data.minHeight, data.maxHeight, data.pricePerSquareMeter].some(
                  (v) => isNaN(v),
                ) ||
                !data.minWallThickness
              ) {
                showToast('Заполните все поля корректно', 'error');
                return;
              }

              if (data.minArea < 0 || data.maxArea < 0 || data.minHeight < 0 || data.maxHeight < 0 || data.pricePerSquareMeter < 0) {
                showToast('Значения не могут быть отрицательными', 'error');
                return;
              }

              if (checkOverlap(data)) return;

              try {
                await onSubmit(data);
              } catch {
                showToast('Ошибка при сохранении диапазона цен', 'error');
              }
            }}
          >
            <div className="space-y-6 px-6 py-5">
              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Ruler className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Диапазон площади</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minArea" className={bmzLabelClass}>От, м²</label>
                    <input
                      id="minArea"
                      type="number"
                      name="minArea"
                      value={formData.minArea}
                      onChange={(e) => setFormData({ ...formData, minArea: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="0"
                      required
                      className={bmzInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxArea" className={bmzLabelClass}>До, м²</label>
                    <input
                      id="maxArea"
                      type="number"
                      name="maxArea"
                      value={formData.maxArea}
                      onChange={(e) => setFormData({ ...formData, maxArea: e.target.value })}
                      min="0"
                      step="0.1"
                      placeholder="100"
                      required
                      className={bmzInputClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <ArrowUpDown className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Диапазон высоты</span>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {HEIGHT_PRESETS.map((preset) => {
                    const selected =
                      Number(formData.minHeight) === preset.min &&
                      Number(formData.maxHeight) === preset.max;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            minHeight: preset.min,
                            maxHeight: preset.max,
                          })
                        }
                        className={`rounded-xl border-2 px-2 py-2 text-center text-xs font-semibold transition-all ${
                          selected
                            ? bmzPillSelected
                            : bmzPillDefault
                        }`}
                      >
                        {preset.label} мм
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="minHeight" className={bmzLabelClass}>От, мм</label>
                    <input
                      id="minHeight"
                      type="number"
                      name="minHeight"
                      value={formData.minHeight}
                      onChange={(e) => setFormData({ ...formData, minHeight: e.target.value })}
                      min="0"
                      step="1"
                      placeholder="2700"
                      required
                      className={bmzInputClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="maxHeight" className={bmzLabelClass}>До, мм</label>
                    <input
                      id="maxHeight"
                      type="number"
                      name="maxHeight"
                      value={formData.maxHeight}
                      onChange={(e) => setFormData({ ...formData, maxHeight: e.target.value })}
                      min="0"
                      step="1"
                      placeholder="3150"
                      required
                      className={bmzInputClass}
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Layers className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Толщина стен</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {WALL_THICKNESS_OPTIONS.map((thickness) => {
                    const selected = Number(formData.minWallThickness) === thickness;
                    return (
                      <button
                        key={thickness}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            minWallThickness: thickness,
                            maxWallThickness: thickness,
                          })
                        }
                        className={`rounded-xl border-2 px-3 py-3 text-center transition-all ${
                          selected
                            ? bmzPillSelected
                            : bmzPillDefault
                        }`}
                      >
                        <span className="block text-lg font-bold">{thickness}</span>
                        <span className="block text-xs font-medium opacity-80">мм</span>
                      </button>
                    );
                  })}
                </div>
                {!formData.minWallThickness && (
                  <p className="mt-2 text-xs text-amber-600">Выберите одно значение</p>
                )}
              </section>

              <section>
                <div className="mb-3 flex items-center gap-2 text-[#8eba1e]">
                  <Banknote className="h-4 w-4" />
                  <span className="text-sm font-semibold text-gray-800">Цена за м²</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    name="pricePerSquareMeter"
                    value={formData.pricePerSquareMeter}
                    onChange={(e) =>
                      setFormData({ ...formData, pricePerSquareMeter: e.target.value })
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

              {hasPreview && (
                <div className="rounded-xl border border-[#8eba1e]/20 bg-gradient-to-r from-[#8eba1e]/5 to-[#7aa31a]/5 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#7aa31a]">Итого</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-800">
                    <span className="font-semibold">{minAreaNum}–{maxAreaNum} м²</span>
                    <span className="text-gray-300">·</span>
                    <span>{minHeightNum}–{maxHeightNum} мм</span>
                    <span className="text-gray-300">·</span>
                    <span>{formData.minWallThickness} мм стен</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#8eba1e]" />
                    <span className="font-bold text-[#8eba1e]">
                      {!isNaN(priceNum) ? `${priceNum.toLocaleString('ru-RU')} ₸/м²` : '—'}
                    </span>
                  </p>
                </div>
              )}
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
                {editingPrice ? 'Сохранить' : 'Добавить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
