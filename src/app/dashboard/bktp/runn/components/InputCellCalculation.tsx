import { RunnCell } from '@/store/useRunnStore';
import { calculateCost } from '@/utils/calculationUtils';
import MaterialsTable from '../../rusn/calculations/MaterialsTable';
import CalculationDisplay from '../../rusn/calculations/CalculationDisplay';

interface InputCellCalculationProps {
  cell: RunnCell;
  calculation: {
    data: {
      categories: Array<{
        name: string;
        items: Array<{
          name: string;
          unit: string;
          price: number;
          quantity: number;
        }>;
      }>;
      calculation: {
        manufacturingHours?: number;
        hourlyRate: number;
        overheadPercentage: number;
        adminPercentage: number;
        plannedProfitPercentage: number;
        ndsPercentage: number;
      };
      cellConfig?: {
        type?: string;
        materials?: {
          withdrawable_breaker?: Array<{
            id: number;
            name: string;
            price: number;
            type: string;
          }>;
          counter?: Array<{
            id: number;
            name: string;
            price: number;
            type: string;
          }>;
        };
      };
    };
  };
}

export default function InputCellCalculation({
  cell,
  calculation,
}: InputCellCalculationProps) {
  // Рассчитываем общую стоимость материалов (без добавления выбранных материалов)
  const materialsTotal = calculation.data.categories.reduce(
    (sum, category) =>
      sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
    0
  );

  // Определяем, есть ли выбранный автомат выкатной
  const hasWithdrawableBreaker = calculation.data.cellConfig?.materials?.withdrawable_breaker?.length > 0;
  
  // Определяем, есть ли выбранный счетчик (ПУ)
  const hasCounter = calculation.data.cellConfig?.materials?.counter?.length > 0;
  
  // Получаем стоимость выбранных материалов
  let selectedMaterialsTotal = 0;
  let withdrawableBreakerTotal = 0;
  let counterTotal = 0;
  
  if (hasWithdrawableBreaker) {
    const withdrawableBreaker = calculation.data.cellConfig.materials.withdrawable_breaker[0];
    withdrawableBreakerTotal = withdrawableBreaker.price;
    selectedMaterialsTotal += withdrawableBreakerTotal;
  }
  
  if (hasCounter) {
    const counter = calculation.data.cellConfig.materials.counter[0];
    counterTotal = counter.price;
    selectedMaterialsTotal += counterTotal;
  }

  // Используем утилиту для расчета
  const calculationResult = calculateCost(
    materialsTotal,
    calculation.data.calculation,
    selectedMaterialsTotal
  );

  // Не умножаем на количество здесь, так как это делается в RunnCellTable
  const finalPrice = calculationResult.finalPrice || 0;

  // Проверяем, что результат расчета существует
  if (!calculationResult) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
        <p className="text-xs text-red-600">Ошибка расчета калькуляции</p>
      </div>
    );
  }

  // Создаем компонент таблицы материалов
  const materialsTableComponent = (
    <>
      {calculation.data.categories.map((category, index) => (
        <MaterialsTable key={index} category={category} />
      ))}
      
      {/* Таблица выбранных материалов */}
      {(hasWithdrawableBreaker || hasCounter) && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Выбранные материалы:</h4>
          <div className="bg-gray-50 rounded-lg p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2">Тип</th>
                  <th className="text-left py-2">Наименование</th>
                  <th className="text-right py-2">Цена (₸)</th>
                  <th className="text-center py-2">Кол-во</th>
                  <th className="text-right py-2">Сумма (₸)</th>
                </tr>
              </thead>
              <tbody>
                {hasWithdrawableBreaker && calculation.data.cellConfig.materials.withdrawable_breaker.map((material, index) => (
                  <tr key={`breaker-${index}`} className="border-b border-gray-100">
                    <td className="py-2">Автомат выкатной</td>
                    <td className="py-2">{material.name}</td>
                    <td className="text-right py-2">{material.price.toLocaleString()}</td>
                    <td className="text-center py-2">1</td>
                    <td className="text-right py-2">{material.price.toLocaleString()}</td>
                  </tr>
                ))}
                {hasCounter && calculation.data.cellConfig.materials.counter.map((material, index) => (
                  <tr key={`counter-${index}`} className="border-b border-gray-100">
                    <td className="py-2">ПУ</td>
                    <td className="py-2">{material.name}</td>
                    <td className="text-right py-2">{material.price.toLocaleString()}</td>
                    <td className="text-center py-2">1</td>
                    <td className="text-right py-2">{material.price.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="border-t border-gray-200 font-medium">
                  <td colSpan={4} className="py-2 text-right">Итого:</td>
                  <td className="text-right py-2">{selectedMaterialsTotal.toLocaleString()} ₸</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-medium text-blue-900">Калькуляция</h4>
        <div className="text-xs text-blue-700 font-medium">
          {finalPrice.toLocaleString()} ₸
        </div>
      </div>
      
      {/* Детализация стоимости */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Базовая стоимость:</span>
          <span className="text-gray-700">{materialsTotal.toLocaleString()} ₸</span>
        </div>
        
        {hasWithdrawableBreaker && (
          <div className="flex justify-between">
            <span className="text-gray-600">Автомат выкатной:</span>
            <span className="text-gray-700">{withdrawableBreakerTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        {hasCounter && (
          <div className="flex justify-between">
            <span className="text-gray-600">ПУ:</span>
            <span className="text-gray-700">{counterTotal.toLocaleString()} ₸</span>
          </div>
        )}
        
        <div className="flex justify-between border-t border-blue-100 pt-1">
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
        
        <div className="flex justify-between border-t border-blue-100 pt-1">
          <span className="text-gray-600 font-medium">Производственная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.productionCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Административные расходы ({calculation.data.calculation.adminPercentage}% от материалов):</span>
          <span className="text-gray-700">{(calculationResult.adminCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-blue-100 pt-1">
          <span className="text-gray-600 font-medium">Полная себестоимость:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.fullCost || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Планируемая прибыль ({calculation.data.calculation.plannedProfitPercentage}% от себестоимости):</span>
          <span className="text-gray-700">{(calculationResult.plannedProfit || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-blue-100 pt-1">
          <span className="text-gray-600 font-medium">Оптовая цена:</span>
          <span className="text-gray-700 font-medium">{(calculationResult.wholesalePrice || 0).toLocaleString()} ₸</span>
        </div>
        
        <div className="flex justify-between border-t border-blue-200 pt-1">
          <span className="text-gray-600 font-medium">НДС ({calculation.data.calculation.ndsPercentage}% от оптовой цены):</span>
          <span className="text-gray-700 font-medium">{(calculationResult.ndsAmount || 0).toLocaleString()} ₸</span>
        </div>
      </div>
    </div>
  );
} 