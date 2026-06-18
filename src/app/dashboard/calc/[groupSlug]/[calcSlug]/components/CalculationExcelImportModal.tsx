'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FileSpreadsheet, X, AlertTriangle } from 'lucide-react';
import {
  ImportPreview,
  MissingMaterialItem,
} from '@/utils/calculationExcelImport';

interface CalculationMaterial {
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface Props {
  preview: ImportPreview | null;
  fileName: string;
  onClose: () => void;
  onApply: (categories: CalculationCategory[], laborHours: number) => void;
}

function fmt(n: number) {
  return n.toLocaleString('ru-RU');
}

export default function CalculationExcelImportModal({ preview, fileName, onClose, onApply }: Props) {
  const [phase, setPhase] = useState<'preview' | 'missing'>('preview');
  const [missingQueue, setMissingQueue] = useState<MissingMaterialItem[]>([]);
  const [currentMissingIndex, setCurrentMissingIndex] = useState(0);

  useEffect(() => {
    if (!preview) return;
    setPhase('preview');
    setMissingQueue(preview.missingMaterials);
    setCurrentMissingIndex(0);
  }, [preview]);

  if (!preview) return null;

  const currentMissing = missingQueue[currentMissingIndex];
  const remainingMissing = missingQueue.length - currentMissingIndex;

  const handleApplyClick = () => {
    if (preview.missingCount > 0) {
      setPhase('missing');
      return;
    }
    finishImport();
  };

  const finishImport = () => {
    const allCategories: CalculationCategory[] = preview.categories.map((cat) => ({
      name: cat.name,
      items: cat.items.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        price: item.price,
        quantity: item.quantity,
      })),
    }));

    onApply(allCategories, preview.laborHours);
    onClose();
  };

  const handleMissingStop = () => {
    onClose();
  };

  const handleMissingSkip = () => {
    if (currentMissingIndex + 1 >= missingQueue.length) {
      finishImport();
      return;
    }
    setCurrentMissingIndex((i) => i + 1);
  };

  const handleMissingSkipAll = () => {
    finishImport();
  };

  const totalSum = preview.categories.reduce(
    (sum, cat) => sum + cat.items.reduce((s, it) => s + it.price * it.quantity, 0),
    0
  );

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-[#8eba1e]/5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-[#8eba1e]/15">
              <FileSpreadsheet className="w-5 h-5 text-[#8eba1e]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">
                {phase === 'preview' ? 'Превью импорта' : 'Материал не найден'}
              </h2>
              <p className="text-xs text-gray-500 truncate">{fileName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {phase === 'preview' ? (
          <>
            {/* Summary */}
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-gray-100">
              <SummaryCard label="Категорий" value={String(preview.totalCategoryCount)} />
              <SummaryCard label="Материалов" value={String(preview.totalMaterialCount)} accent />
              {preview.foundCount > 0 && (
                <SummaryCard label="Найдено в БД" value={String(preview.foundCount)} />
              )}
              {preview.missingCount > 0 && (
                <SummaryCard label="Не найдено" value={String(preview.missingCount)} warning />
              )}
              {preview.laborHours > 0 && (
                <SummaryCard label="Часы монтажа" value={`+${preview.laborHours} ч`} />
              )}
            </div>

            {/* Preview list — как в редакторе категорий */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {preview.previewCategories.length === 0 && preview.laborHours === 0 && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                  Не удалось распознать данные. Проверьте, что в файле есть строка заголовков
                  (onec_code, Материалы, excel_qty) и строки CATEGORY / LABOR / коды материалов.
                </p>
              )}

              {preview.previewCategories.map((category, idx) => {
                const catTotal = category.items
                  .filter((it) => it.status === 'found')
                  .reduce((s, it) => s + it.price * it.quantity, 0);

                return (
                  <div key={idx} className="rounded-xl border border-[#8eba1e]/20 overflow-hidden">
                    <div className="flex items-center justify-between bg-[#8eba1e]/10 px-4 py-2.5 border-b border-[#8eba1e]/20">
                      <span className="text-base font-semibold text-gray-900 px-1">{category.name}</span>
                      <span className="text-xs text-gray-500">{category.items.length} поз.</span>
                    </div>

                    <div className="p-2 space-y-1">
                      <div className="grid grid-cols-[1fr_56px_72px_96px_96px] gap-1.5 px-2 pb-0.5 border-b border-gray-100">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Наименование
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Ед.
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                          Кол-во
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                          Цена
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">
                          Сумма
                        </span>
                      </div>

                      {category.items.map((item, itemIdx) => {
                        const isMissing = item.status === 'missing';
                        const rowSum = item.price * item.quantity;
                        const fieldClass = `w-full px-2 py-1 text-xs border rounded-md bg-white ${
                          isMissing
                            ? 'border-amber-300 bg-amber-50/80 text-amber-900'
                            : 'border-gray-200 text-gray-900'
                        }`;

                        return (
                          <div
                            key={itemIdx}
                            className={`grid grid-cols-[1fr_56px_72px_96px_96px] gap-1.5 items-start px-2 py-0.5 rounded-lg ${
                              isMissing ? 'bg-amber-50/40' : 'hover:bg-[#8eba1e]/5'
                            }`}
                          >
                            <div className="min-w-0">
                              <div
                                className={`${fieldClass} min-h-[2.5rem] flex flex-col justify-center`}
                                title={item.name}
                              >
                                <div className="truncate leading-snug">{item.name}</div>
                                <p
                                  className={`text-[9px] leading-tight mt-0.5 truncate ${
                                    isMissing ? 'text-amber-600' : 'invisible'
                                  }`}
                                >
                                  код {item.code} · не найден в БД
                                </p>
                              </div>
                            </div>
                            <div className={`${fieldClass} text-center min-h-[2.5rem] flex items-center justify-center`}>
                              {item.unit}
                            </div>
                            <div className={`${fieldClass} text-right tabular-nums min-h-[2.5rem] flex items-center justify-end`}>
                              {item.quantity}
                            </div>
                            <div className={`${fieldClass} text-right tabular-nums min-h-[2.5rem] flex items-center justify-end`}>
                              {isMissing ? '—' : fmt(item.price)}
                            </div>
                            <div
                              className={`min-h-[2.5rem] flex items-center justify-end text-right text-xs font-semibold tabular-nums pr-0.5 ${
                                isMissing ? 'text-amber-600' : 'text-gray-900'
                              }`}
                            >
                              {isMissing ? '—' : `${fmt(rowSum)} ₸`}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex justify-between items-center bg-[#8eba1e]/10 px-4 py-2.5 border-t border-[#8eba1e]/20">
                      <span className="text-xs font-semibold text-gray-600">Итого по категории:</span>
                      <span className="text-sm font-bold text-[#8eba1e] tabular-nums">
                        {catTotal > 0 ? `${fmt(catTotal)} ₸` : '—'}
                      </span>
                    </div>
                  </div>
                );
              })}

              {preview.laborHours > 0 && (
                <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
                  К полю «Изготовление» будет добавлено <strong>+{preview.laborHours} ч</strong> монтажа
                </div>
              )}

              {preview.missingCount > 0 && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    {preview.missingCount} материал(ов) не найдено в БД — при применении разберём каждый по очереди
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500">
                Общая сумма: <strong className="text-gray-900">{fmt(totalSum)} ₸</strong>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleApplyClick}
                  disabled={preview.totalMaterialCount === 0 && preview.laborHours === 0}
                  className="px-5 py-2 text-sm font-medium text-white bg-[#8eba1e] rounded-lg hover:bg-[#7aa31a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Применить
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Missing material dialog */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {currentMissing && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-amber-700">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                      В очереди: {remainingMissing} из {missingQueue.length}
                    </span>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 space-y-3">
                    <p className="text-sm text-gray-600">
                      Материал не найден в базе данных:
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900 text-base">{currentMissing.excelName}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Код: <span className="font-mono font-medium text-gray-700">{currentMissing.code}</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        Категория: {currentMissing.categoryName} · Кол-во: {currentMissing.quantity} · Строка: {currentMissing.line}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex flex-wrap justify-end gap-2">
              <button
                onClick={handleMissingStop}
                className="px-4 py-2 text-sm text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Остановить импорт
              </button>
              <button
                onClick={handleMissingSkip}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Пропустить
              </button>
              <button
                onClick={handleMissingSkipAll}
                className="px-4 py-2 text-sm font-medium text-white bg-[#8eba1e] rounded-lg hover:bg-[#7aa31a] transition-colors"
              >
                Пропустить все ({remainingMissing})
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

function SummaryCard({
  label,
  value,
  accent,
  warning,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-lg px-3 py-2.5 ${
        warning
          ? 'bg-amber-50 border border-amber-200'
          : accent
          ? 'bg-[#8eba1e]/10 border border-[#8eba1e]/20'
          : 'bg-gray-50 border border-gray-100'
      }`}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</p>
      <p
        className={`text-lg font-bold tabular-nums ${
          warning ? 'text-amber-700' : accent ? 'text-[#8eba1e]' : 'text-gray-900'
        }`}
      >
        {value}
      </p>
    </div>
  );
}
