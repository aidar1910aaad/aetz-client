import { RunnCell } from '@/store/useRunnStore';
import { calculateCost } from '@/utils/calculationUtils';
import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import MaterialsTable from '../../rusn/calculations/MaterialsTable';

interface SectionSwitchCalculationProps {
  cell: RunnCell;
  calculation: any;
  inputCell?: RunnCell | null;
}

export default function SectionSwitchCalculation({
  cell,
  calculation,
  inputCell
}: SectionSwitchCalculationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  const materialsTotal = calculation.data.categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0
  );

  // Получаем все материалы из калькуляции
  const materials = calculation.data.cellConfig?.materials || {};
  const materialTypes = Object.keys(materials);
  
  // Рассчитываем общую стоимость выбранных материалов
  let selectedMaterialsTotal = 0;
  const selectedMaterials = [];
  

  materialTypes.forEach(type => {
    if (materials[type]?.length > 0) {
      // Ищем материал по имени, выбранному в ячейке
      let selectedMaterial = null;
      
      if (type === 'withdrawable_breaker' && cell.breaker) {
        // Сначала ищем точное совпадение по названию
        selectedMaterial = materials[type].find((material: any) => material.name === cell.breaker);
        
        // Если не найден по точному названию, ищем по току
        if (!selectedMaterial) {
          const { extractCurrentFromBreakerName } = require('@/utils/panelNameUtils');
          const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
          if (cellCurrent) {
            selectedMaterial = materials[type].find((material: any) => {
              const materialCurrent = extractCurrentFromBreakerName(material.name);
              return materialCurrent === cellCurrent;
            });
          }
        }
        
        // Если не найден по току, ищем по типу автомата (Metasol, CHINT, etc.)
        if (!selectedMaterial) {
          const breakerType = cell.breaker.includes('Metasol') ? 'Metasol' : 
                             cell.breaker.includes('CHINT') ? 'CHINT' : 
                             cell.breaker.includes('ABB') ? 'ABB' : null;
          
          if (breakerType) {
            selectedMaterial = materials[type].find((material: any) => 
              material.name.includes(breakerType)
            );
          }
        }
        
        // Если все еще не найден, ищем по диапазону тока (универсальный поиск)
        if (!selectedMaterial) {
          const { extractCurrentFromBreakerName } = require('@/utils/panelNameUtils');
          const cellCurrent = extractCurrentFromBreakerName(cell.breaker);
          console.log('🔍 Универсальный поиск по току:', { cellCurrent });
          
          if (cellCurrent) {
            // Ищем материал с ближайшим током (в пределах 20% от требуемого)
            const tolerance = cellCurrent * 0.2; // 20% допуск
            console.log('🔍 Поиск в пределах допуска:', { tolerance });
            
            selectedMaterial = materials[type].find((material: any) => {
              const materialCurrent = extractCurrentFromBreakerName(material.name);
              const isInRange = materialCurrent && Math.abs(materialCurrent - cellCurrent) <= tolerance;
              console.log('🔍 Проверка диапазона:', { 
                materialName: material.name, 
                materialCurrent, 
                cellCurrent, 
                difference: Math.abs(materialCurrent - cellCurrent),
                tolerance,
                isInRange 
              });
              return isInRange;
            });
            
            if (selectedMaterial) {
              console.log('✅ Найден материал в диапазоне:', selectedMaterial.name);
            } else {
              console.log('❌ Материал в диапазоне не найден, ищем ближайший');
              
              // Если не найден в пределах допуска, берем ближайший
              selectedMaterial = materials[type].reduce((closest: any, material: any) => {
                const materialCurrent = extractCurrentFromBreakerName(material.name);
                if (materialCurrent && Math.abs(materialCurrent - cellCurrent) < Math.abs((closest?.current || Infinity) - cellCurrent)) {
                  return { ...material, current: materialCurrent };
                }
                return closest;
              }, null);
              
              if (selectedMaterial) {
                console.log('✅ Найден ближайший материал:', selectedMaterial.name);
              }
            }
          }
        }
        
      }
      
      // Если не найден по имени, берем первый
      if (!selectedMaterial) {
        selectedMaterial = materials[type][0];
        console.log('⚠️ Материал не найден, используется первый:', {
          cellBreaker: cell.breaker,
          selectedMaterial: selectedMaterial.name,
          price: selectedMaterial.price,
          availableMaterials: materials[type].slice(0, 5).map((m: any) => ({ name: m.name, price: m.price })), // Показываем только первые 5
          totalAvailable: materials[type].length
        });
      } else {
      }
      
      selectedMaterialsTotal += selectedMaterial.price;
      selectedMaterials.push({
        type,
        name: selectedMaterial.name,
        price: selectedMaterial.price
      });
    }
  });

  // Используем утилиту для расчета
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal
  );

  // Учитываем количество ячейки
  const cellQuantity = cell.quantity || 1;
  const finalPrice = (calculationResult.finalPrice || 0) * cellQuantity;

  // Проверяем, что результат расчета существует
  if (!calculationResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-red-600">Ошибка расчета калькуляции</p>
      </div>
    );
  }

  // Получаем информацию о корпусе из ячейки Ввод
  let caseInfo = null;
  if (inputCell?.breaker) {
    const { getCaseInfo } = require('@/utils/caseSizeUtils');
    caseInfo = getCaseInfo(inputCell.breaker);
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
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
          <h4 className="text-xs font-medium text-orange-900">Калькуляция секционного выключателя</h4>
        </div>
        <div className="text-xs text-orange-700 font-medium">
          {finalPrice.toLocaleString()} ₸
        </div>
      </div>
      
      {/* Детали калькуляции - показываем только если развернуто */}
      {isExpanded && (
        <>
          {/* Информация о корпусе */}
          {caseInfo && caseInfo.isValid && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
          <div className="flex justify-between items-center">
            <span className="text-blue-700 font-medium">Корпус на основе ячейки Ввод:</span>
            <span className="text-blue-900 font-bold">Корпус {caseInfo.caseSize}</span>
          </div>
          <div className="text-blue-600 mt-1">
            Ток ввода: {caseInfo.current} A
          </div>
        </div>
      )}
      
      {/* Детализация стоимости */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Базовая стоимость:</span>
          <span className="text-gray-700">{materialsTotal.toLocaleString()} ₸</span>
        </div>
        
        {/* Показываем каждый выбранный материал */}
        {selectedMaterials.map((material, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600">
              {material.type === 'molded_case_breaker' ? 'Автомат выкатной' : 
               material.type === 'withdrawable_breaker' ? 'Автомат выкатной' : 
               material.type === 'counter' ? 'ПУ' : 
               material.type === 'molded_case' ? 'Автомат литой корпус' :
               material.type === 'disconnector' ? 'Разъединитель' :
               material.type === 'fuse' ? 'Предохранитель' :
               material.type}:
            </span>
            <span className="text-gray-700">{material.price.toLocaleString()} ₸</span>
          </div>
        ))}
        
        {/* Показываем название и цену выбранного автомата для диагностики */}
        {cell.breaker && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <div className="text-yellow-700">
              <strong>Выбранный автомат:</strong> {cell.breaker}
            </div>
            {selectedMaterials.length > 0 && (
              <div className="text-yellow-600 mt-1">
                <strong>Цена автомата:</strong> {selectedMaterials[0].price.toLocaleString()} ₸
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-between border-t border-orange-100 pt-1">
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
        
        <div className="flex justify-between border-t border-orange-100 pt-1">
          <span className="text-gray-600 font-medium">Производственная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.productionCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Административные расходы ({calculation.data.calculation.adminPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.adminCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-orange-100 pt-1">
          <span className="text-gray-600 font-medium">Полная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.fullCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Планируемая прибыль ({calculation.data.calculation.plannedProfitPercentage}% от себестоимости):</span>
          <span className="text-gray-700">{(calculationResult.plannedProfit || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-orange-100 pt-1">
          <span className="text-gray-600 font-medium">Оптовая цена:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.wholesalePrice || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-orange-200 pt-1">
          <span className="text-gray-600 font-medium">НДС ({calculation.data.calculation.ndsPercentage}% от оптовой цены):</span>
          <span className="text-gray-700 font-medium">{(calculationResult.ndsAmount || 0).toLocaleString()} ₸</span>
        </div>
      </div>
        </>
      )}
    </div>
  );
} 