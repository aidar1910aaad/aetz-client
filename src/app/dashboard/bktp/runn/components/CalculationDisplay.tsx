import { RunnCell } from '@/store/useRunnStore';
import { calculateCost } from '@/utils/calculationUtils';
import { getCaseInfo } from '@/utils/caseSizeUtils';
import { extractCurrentFromBreakerName } from '@/utils/panelNameUtils';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface CalculationDisplayProps {
  cell: RunnCell;
  calculation: any;
  materialType: 'withdrawable_breaker' | 'counter';
  currentTransformer?: {
    name: string;
    price: number;
    quantity: number;
  } | null;
}

const MATERIAL_CONFIG = {
  withdrawable_breaker: {
    title: 'Калькуляция автомата выкатного',
    label: 'Автомат выкатной',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    textColor: 'text-green-900',
    accentColor: 'text-green-700',
    dividerColor: 'border-green-100',
    dividerAccentColor: 'border-green-200'
  },
  counter: {
    title: 'Калькуляция ПУ (счетчика)',
    label: 'ПУ',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-900',
    accentColor: 'text-purple-700',
    dividerColor: 'border-purple-100',
    dividerAccentColor: 'border-purple-200'
  }
};

export default function CalculationDisplay({
  cell,
  calculation,
  materialType,
  currentTransformer = null
}: CalculationDisplayProps) {
  const config = MATERIAL_CONFIG[materialType];
  const [isExpanded, setIsExpanded] = useState(false);
  
  
  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  const materialsTotal = calculation.data.categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0
  );

  // Определяем, есть ли выбранный материал
  const materials = calculation.data.cellConfig?.materials?.[materialType];
  const hasMaterial = materials?.length > 0;
  
  // Получаем стоимость выбранного материала
  let selectedMaterialsTotal = 0;
  let materialTotal = 0;
  let selectedMaterial = null;
  
  if (hasMaterial) {
    // Ищем материал по имени, выбранному в ячейке
    const cellValue = materialType === 'withdrawable_breaker' ? cell.breaker : cell.meterType;
    
    // Сначала пробуем точное совпадение
    selectedMaterial = materials.find((material: any) => material.name === cellValue);
    
    // Если не найдено точное совпадение, используем гибкое сравнение для автоматов
    if (!selectedMaterial && materialType === 'withdrawable_breaker') {
      // Извлекаем ток из названия выбранного автомата
      const cellCurrent = extractCurrentFromBreakerName(cellValue);
      if (cellCurrent) {
        selectedMaterial = materials.find((material: any) => {
          const materialCurrent = extractCurrentFromBreakerName(material.name);
          return materialCurrent === cellCurrent;
        });
      }
    }
    
    // Если все еще не найдено, берем первый элемент
    if (!selectedMaterial) {
      selectedMaterial = materials[0];
    }
    
    materialTotal = selectedMaterial.price;
    selectedMaterialsTotal = materialTotal;
  }

  // Добавляем стоимость трансформатора тока для автомата выкатного
  let currentTransformerTotal = 0;
  if (materialType === 'withdrawable_breaker' && currentTransformer) {
    currentTransformerTotal = currentTransformer.price * currentTransformer.quantity;
    selectedMaterialsTotal += currentTransformerTotal;
  }

  // Для автомата выкатного определяем размер корпуса
  let caseInfo = null;
  if (materialType === 'withdrawable_breaker' && selectedMaterial) {
    caseInfo = getCaseInfo(selectedMaterial.name);
  }

  // Используем утилиту для расчета
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal
  );

  // Для калькуляции показываем цену за единицу (без учета количества ячейки)
  const finalPrice = calculationResult.finalPrice || 0;

  // Проверяем, что результат расчета существует
  if (!calculationResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-red-600">Ошибка расчета калькуляции</p>
      </div>
    );
  }

  return (
    <div className={`${config.bgColor} border ${config.borderColor} rounded-lg p-3 mt-3`}>
      <div 
        className="flex items-center justify-between mb-2 cursor-pointer hover:bg-opacity-80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-2">
          {isExpanded ? (
            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="w-4 h-4 text-gray-500" />
          )}
          <div>
            <h4 className={`text-xs font-medium ${config.textColor}`}>{config.title}</h4>
            {calculation.name && (
              <p className={`text-xs ${config.accentColor} mt-1`}>
                Название: {calculation.name}
              </p>
            )}
          </div>
        </div>
        <div className={`text-sm ${config.accentColor} font-bold`}>
          {finalPrice.toLocaleString('ru-RU', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })} ₸
        </div>
      </div>
      
      {/* Детали калькуляции - показываем только если развернуто */}
      {isExpanded && (
        <>
          {/* Информация о выбранном материале */}
          {selectedMaterial && (
        <div className="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-700 font-medium">Выбранный материал:</span>
            <span className="text-gray-900 font-bold">{selectedMaterial.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Цена:</span>
            <span className="text-gray-800 font-medium">
              {materialTotal.toLocaleString('ru-RU', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} ₸
            </span>
          </div>
        </div>
      )}

      {/* Информация о трансформаторе тока */}
      {currentTransformer && materialType === 'withdrawable_breaker' && (
        <div className="mb-3 p-2 bg-white border border-gray-200 rounded text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-700 font-medium">Трансформатор тока:</span>
            <span className="text-gray-900 font-bold">{currentTransformer.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Количество:</span>
            <span className="text-gray-800 font-medium">{currentTransformer.quantity} шт</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Цена за шт:</span>
            <span className="text-gray-800 font-medium">
              {currentTransformer.price.toLocaleString('ru-RU', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })} ₸
            </span>
          </div>
        </div>
      )}

      
      {/* Отладочная информация */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
          <div className="text-yellow-700">
            <div><strong>Отладка:</strong></div>
            <div>Тип материала: {materialType}</div>
            <div>Значение ячейки: {materialType === 'withdrawable_breaker' ? cell.breaker : cell.meterType}</div>
            <div>Найден материал: {selectedMaterial ? 'Да' : 'Нет'}</div>
            {selectedMaterial && <div>Название материала: {selectedMaterial.name}</div>}
            <div>Цена материала: {materialTotal.toLocaleString()} ₸</div>
            <div>Трансформатор: {currentTransformer ? `${currentTransformer.name} (${currentTransformer.quantity}шт)` : 'Нет'}</div>
            <div>Итоговая цена: {finalPrice.toLocaleString()} ₸</div>
          </div>
        </div>
      )}

      {/* Детализация стоимости */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Базовая стоимость:</span>
          <span className="text-gray-700">{materialsTotal.toLocaleString()} ₸</span>
        </div>
        
        {hasMaterial && (
          <div className="flex justify-between">
            <span className="text-gray-600">{config.label}:</span>
            <span className="text-gray-700">{materialTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        {currentTransformer && materialType === 'withdrawable_breaker' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Трансформатор тока ({currentTransformer.quantity}шт):</span>
            <span className="text-gray-700">{currentTransformerTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        <div className={`flex justify-between border-t ${config.dividerColor} pt-1`}>
          <span className="text-gray-600 font-medium">Итого материалов:</span>
          <span className="text-gray-700 font-medium">{(materialsTotal + selectedMaterialsTotal).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Изготовление ({calculation.data.calculation.manufacturingHours || 0}ч × {calculation.data.calculation.hourlyRate}₸):</span>
          <span className="text-gray-700">{(calculationResult.salary || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Накладные расходы ({calculation.data.calculation.overheadPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.overheadCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className={`flex justify-between border-t ${config.dividerColor} pt-1`}>
          <span className="text-gray-600 font-medium">Производственная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.productionCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Административные расходы ({calculation.data.calculation.adminPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.adminCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className={`flex justify-between border-t ${config.dividerColor} pt-1`}>
          <span className="text-gray-600 font-medium">Полная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.fullCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Планируемая прибыль ({calculation.data.calculation.plannedProfitPercentage}% от себестоимости):</span>
          <span className="text-gray-700">{(calculationResult.plannedProfit || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className={`flex justify-between border-t ${config.dividerColor} pt-1`}>
          <span className="text-gray-600 font-medium">Оптовая цена:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.wholesalePrice || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className={`flex justify-between border-t ${config.dividerAccentColor} pt-1`}>
          <span className="text-gray-600 font-medium">НДС ({calculation.data.calculation.ndsPercentage}% от оптовой цены):</span>
          <span className="text-gray-700 font-medium">{(calculationResult.ndsAmount || 0).toLocaleString()} ₸</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
} 