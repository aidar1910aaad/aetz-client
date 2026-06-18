import { useMemo, useState, useEffect } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import TogglerWithInput from '../../../TogglerWithInput';
import { DGU_CABLE_SPECS, type DguCableSpec, CABLE_SECTION_TO_MATERIAL_ID } from '../constants';
import { getMaterialById } from '@/api/material';
import { useDguCableNodeCalculation } from '../hooks/useDguCableNodeCalculation';
import { calculateCost } from '@/utils/calculationUtils';
import { useDguSetCellSummary } from '../hooks/useDguSummaryHelpers';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface DguCableNodeSectionProps {
  dguCableNodeCell: RunnCell | undefined;
  onAddCell: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemoveCell: () => void;
}

// Функция для поиска подходящего кабеля на основе мощности
function findCableByPower(powerKva: number): DguCableSpec | null {
  if (!powerKva || powerKva <= 0) return null;
  
  // Ищем кабель, диапазон мощности которого включает заданную мощность
  const matchingCable = DGU_CABLE_SPECS.find(
    spec => powerKva >= spec.powerRangeKva.min && powerKva <= spec.powerRangeKva.max
  );
  
  return matchingCable || null;
}

// Функция для извлечения количества жил из спецификации кабеля
// Примеры: "ВВГнг 1х120" -> 1, "ВВГнг 2х(1х240)" -> 2, "ВВГнг 3х(1х400)" -> 3
function extractCableCount(cableSpec: string): number {
  // Ищем паттерн: число перед "х(" или "х" (без скобок)
  const match = cableSpec.match(/(\d+)х/);
  return match ? parseInt(match[1], 10) : 1;
}

// Функция для извлечения сечения кабеля из спецификации
// Примеры: "ВВГнг 1х120" -> 120, "ВВГнг 2х(1х240)" -> 240, "ВВГнг 3х(1х400)" -> 400
function extractCableSection(cableSpec: string): number | null {
  // Ищем число после последнего "х" (сечение)
  // Паттерны: "1х120" -> 120, "2х(1х240)" -> 240, "3х(1х400)" -> 400
  // Ищем паттерн: х(число) или х(число) в скобках
  const matchWithBrackets = cableSpec.match(/х\(1х(\d+)\)/); // Для "2х(1х240)"
  if (matchWithBrackets) {
    return parseInt(matchWithBrackets[1], 10);
  }
  
  // Для простого формата "1х120"
  const matchSimple = cableSpec.match(/х(\d+)(?!\()/); // число после х, но не в скобках
  if (matchSimple) {
    return parseInt(matchSimple[1], 10);
  }
  
  return null;
}

// Функция для расчета длины кабеля
// Всегда используется 4 шт, независимо от quantity
function calculateCableLength(cableSpec: string): number {
  const cableCount = extractCableCount(cableSpec);
  return cableCount * 11 * 4;
}

export default function DguCableNodeSection({
  dguCableNodeCell,
  onAddCell,
  onUpdateQuantity,
  onRemoveCell,
}: DguCableNodeSectionProps) {
  const dgu = useDguStore();
  const setCellSummary = useDguSetCellSummary();

  // Находим подходящий кабель на основе номинальной мощности
  const selectedCable = useMemo(() => {
    return findCableByPower(dgu.settings.nominalPowerKva);
  }, [dgu.settings.nominalPowerKva]);

  // Рассчитываем длину кабеля (всегда используется 4 шт)
  const cableLength = useMemo(() => {
    if (!selectedCable) return 0;
    return calculateCableLength(selectedCable.cableSpec);
  }, [selectedCable]);

  // Состояние для цены кабеля
  const [cablePrice, setCablePrice] = useState<number | null>(null);
  const [cablePriceLoading, setCablePriceLoading] = useState(false);

  // Получаем калькуляцию
  const { calculation: cableNodeCalculation, loading: calculationLoading, error: calculationError } = useDguCableNodeCalculation();

  // Получаем цену кабеля по ID материала
  useEffect(() => {
    const fetchCablePrice = async () => {
      if (!selectedCable) {
        setCablePrice(null);
        return;
      }

      const section = extractCableSection(selectedCable.cableSpec);
      if (!section) {
        setCablePrice(null);
        return;
      }

      const materialId = CABLE_SECTION_TO_MATERIAL_ID[section];
      if (!materialId) {
        setCablePrice(null);
        return;
      }

      setCablePriceLoading(true);
      try {
        const token = localStorage.getItem('token') || '';
        if (!token) {
          setCablePrice(null);
          return;
        }

        const material = await getMaterialById(materialId, token);
        const price = typeof material.price === 'string' 
          ? parseFloat(material.price) 
          : material.price;
        setCablePrice(price);
      } catch (error) {
        console.error('Ошибка при получении цены кабеля:', error);
        setCablePrice(null);
      } finally {
        setCablePriceLoading(false);
      }
    };

    fetchCablePrice();
  }, [selectedCable]);

  // Состояние для развернутости калькуляции
  const [isCalculationExpanded, setIsCalculationExpanded] = useState(false);

  // Рассчитываем итоговую стоимость
  const calculationResult = useMemo(() => {
    if (!cableNodeCalculation?.data || !selectedCable || !cablePrice || !cableLength) {
      return null;
    }

    // Стоимость материалов из калькуляции
    const materialsTotal = cableNodeCalculation.data.categories?.reduce(
      (sum: number, category: any) =>
        sum + (category.items?.reduce((itemSum: number, item: any) => itemSum + (item.price || 0) * (item.quantity || 0), 0) || 0),
      0
    ) || 0;

    // Стоимость кабеля (цена за метр × длина)
    const cableCost = cablePrice * cableLength;

    // Параметры калькуляции
    const calculationData = cableNodeCalculation.data.calculation;
    if (!calculationData) return null;

    // Рассчитываем стоимость с учетом кабеля
    const result = calculateCost(
      materialsTotal,
      calculationData,
      cableCost // кабель как дополнительный материал
    );

    return {
      ...result,
      materialsTotal,
      cableCost,
      quantity: dguCableNodeCell?.quantity || 1,
      totalPrice: result.finalPrice * (dguCableNodeCell?.quantity || 1),
    };
  }, [cableNodeCalculation, selectedCable, cablePrice, cableLength, dguCableNodeCell?.quantity]);

  useEffect(() => {
    if (!dguCableNodeCell || !calculationResult) {
      return;
    }
    const pricePerUnit = calculationResult.finalPrice || 0;
    const cableLabel = selectedCable
      ? `РУНН-ДГУ: Узел ДГУ кабель (${selectedCable.cableSpec})`
      : 'РУНН-ДГУ: Узел ДГУ кабель';
    setCellSummary(
      dguCableNodeCell.id,
      cableLabel,
      pricePerUnit,
      dguCableNodeCell.quantity || 1
    );
  }, [dguCableNodeCell?.id, dguCableNodeCell?.quantity, calculationResult, selectedCable]);

  return (
    <TogglerWithInput label="РУНН-ДГУ: Узел ДГУ кабель">
      {!dguCableNodeCell ? (
        <button
          onClick={onAddCell}
          className="px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
        >
          + Добавить узел ДГУ кабель
        </button>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-4 items-end p-4 rounded bg-white border border-gray-100">
            <div className="flex flex-col gap-1 min-w-[100px]">
              <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
              <input
                type="number"
                min={1}
                value={dguCableNodeCell.quantity || 1}
                onChange={(e) => onUpdateQuantity(Number(e.target.value) || 1)}
                className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              />
            </div>

            <button
              onClick={onRemoveCell}
              className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
              title="Удалить ячейку"
            >
              ✕
            </button>
          </div>

          {/* Отображение информации о кабеле */}
          {selectedCable ? (
            <div className="p-4 rounded bg-blue-50 border border-blue-200">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Рекомендуемый кабель</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Номинальная мощность:</span>
                  <span className="font-medium text-gray-900">
                    {selectedCable.powerRangeKva.min} - {selectedCable.powerRangeKva.max} кВА
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ток:</span>
                  <span className="font-medium text-gray-900">{selectedCable.currentAmps} А</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Кабель:</span>
                  <span className="font-bold text-blue-700 text-sm">{selectedCable.cableSpec}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Длина:</span>
                  <div className="flex flex-col items-end">
                    <span className="font-medium text-gray-900">{cableLength} м</span>
                    {selectedCable && (
                      <span className="text-[10px] text-gray-500 mt-0.5">
                        {extractCableCount(selectedCable.cableSpec)} × 11 м × 4 шт
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Цена за метр:</span>
                  <div className="flex flex-col items-end">
                    {cablePriceLoading ? (
                      <span className="text-xs text-gray-500">Загрузка...</span>
                    ) : cablePrice !== null ? (
                      <>
                        <span className="font-medium text-gray-900">{cablePrice.toLocaleString()} ₸</span>
                        <span className="text-[10px] text-gray-500 mt-0.5">за метр</span>
                      </>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Отображение калькуляции */}
          {calculationLoading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
            </div>
          )}

          {calculationError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-xs text-red-600">{calculationError}</p>
            </div>
          )}

          {calculationResult && !calculationLoading && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
              <div 
                className="flex items-center justify-between mb-2 cursor-pointer hover:bg-opacity-80 transition-colors"
                onClick={() => setIsCalculationExpanded(!isCalculationExpanded)}
              >
                <div className="flex items-center space-x-2">
                  {isCalculationExpanded ? (
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                  )}
                  <div>
                    <h4 className="text-xs font-medium text-green-900">Калькуляция узла ДГУ кабель</h4>
                    {cableNodeCalculation?.name && (
                      <p className="text-xs text-green-700 mt-1">
                        Название: {cableNodeCalculation.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-green-700 font-bold">
                  {calculationResult.finalPrice.toLocaleString('ru-RU', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} ₸
                </div>
              </div>
              
              {/* Детали калькуляции - показываем только если развернуто */}
              {isCalculationExpanded && (
                <>
                  {/* Информация о кабеле */}
                  {selectedCable && cablePrice && (
                    <div className="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-gray-700 font-medium">Кабель:</span>
                        <span className="text-gray-900 font-bold">{selectedCable.cableSpec}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Длина:</span>
                        <span className="text-gray-800 font-medium">{cableLength} м</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Цена за метр:</span>
                        <span className="text-gray-800 font-medium">
                          {cablePrice.toLocaleString('ru-RU', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} ₸
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                        <span className="text-gray-700 font-medium">Стоимость кабеля:</span>
                        <span className="text-gray-900 font-bold">
                          {calculationResult.cableCost.toLocaleString('ru-RU', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })} ₸
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Детализация стоимости */}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Базовая стоимость (из калькуляции):</span>
                      <span className="text-gray-700">{calculationResult.materialsTotal.toLocaleString('ru-RU')} ₸</span>
                    </div>
                    
                    {selectedCable && cablePrice && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Стоимость кабеля ({cableLength} м × {cablePrice.toLocaleString('ru-RU')} ₸):</span>
                        <span className="text-gray-700">{calculationResult.cableCost.toLocaleString('ru-RU')} ₸</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t border-green-100 pt-1">
                      <span className="text-gray-600 font-medium">Итого материалов:</span>
                      <span className="text-gray-700 font-medium">{(calculationResult.materialsTotal + calculationResult.cableCost).toLocaleString('ru-RU')} ₸</span>
                    </div>
                    
                    {cableNodeCalculation?.data?.calculation && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Изготовление ({cableNodeCalculation.data.calculation.manufacturingHours || 0}ч × {cableNodeCalculation.data.calculation.hourlyRate}₸):</span>
                          <span className="text-gray-700">{calculationResult.salary.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Накладные расходы ({cableNodeCalculation.data.calculation.overheadPercentage}% от материалов):</span>
                          <span className="text-gray-700">{calculationResult.overheadCost.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-green-100 pt-1">
                          <span className="text-gray-600 font-medium">Производственная себестоимость:</span>
                          <span className="text-gray-700 font-medium">{calculationResult.productionCost.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Административные расходы ({cableNodeCalculation.data.calculation.adminPercentage}% от материалов):</span>
                          <span className="text-gray-700">{calculationResult.adminCost.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-green-100 pt-1">
                          <span className="text-gray-600 font-medium">Полная себестоимость:</span>
                          <span className="text-gray-700 font-medium">{calculationResult.fullCost.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Планируемая прибыль ({cableNodeCalculation.data.calculation.plannedProfitPercentage}% от себестоимости):</span>
                          <span className="text-gray-700">{calculationResult.plannedProfit.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-green-100 pt-1">
                          <span className="text-gray-600 font-medium">Оптовая цена:</span>
                          <span className="text-gray-700 font-medium">{calculationResult.wholesalePrice.toLocaleString('ru-RU')} ₸</span>
                        </div>
                        
                        <div className="flex justify-between border-t border-green-200 pt-1">
                          <span className="text-gray-600 font-medium">НДС ({cableNodeCalculation.data.calculation.ndsPercentage}% от оптовой цены):</span>
                          <span className="text-gray-700 font-medium">{calculationResult.ndsAmount.toLocaleString('ru-RU')} ₸</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between border-t-2 border-green-400 pt-2 mt-2">
                      <span className="text-gray-700 font-bold">Цена за единицу:</span>
                      <span className="text-gray-900 font-bold">{calculationResult.finalPrice.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} ₸</span>
                    </div>
                    
                    <div className="flex justify-between border-t-2 border-green-500 pt-2 mt-2">
                      <span className="text-green-900 font-bold">Итого ({dguCableNodeCell?.quantity || 1} шт):</span>
                      <span className="text-green-900 font-bold text-lg">{calculationResult.totalPrice.toLocaleString('ru-RU', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} ₸</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {!selectedCable && dgu.settings.nominalPowerKva > 0 ? (
            <div className="p-4 rounded bg-yellow-50 border border-yellow-200">
              <p className="text-xs text-yellow-800">
                Для мощности {dgu.settings.nominalPowerKva} кВА не найдено подходящего кабеля в таблице.
                Пожалуйста, выберите кабель вручную.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded bg-gray-50 border border-gray-200">
              <p className="text-xs text-gray-600">
                Укажите номинальную мощность в общих настройках для автоматического выбора кабеля.
              </p>
            </div>
          )}
        </div>
      )}
    </TogglerWithInput>
  );
}

