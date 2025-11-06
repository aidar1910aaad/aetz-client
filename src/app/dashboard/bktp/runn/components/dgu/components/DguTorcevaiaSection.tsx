import { useMemo } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import TogglerWithInput from '../../TogglerWithInput';
import { useRunnTorcevaiaCalculation } from '@/hooks/useRunnInputCalculation';
import { calculateCost } from '@/utils/calculationUtils';

interface DguTorcevaiaSectionProps {
  torcevaiaCell: RunnCell | undefined;
  runnDguCells: RunnCell[];
  onAddCell: () => void;
  onUpdateQuantity: (quantity: number) => void;
  onRemoveCell: () => void;
}

export default function DguTorcevaiaSection({
  torcevaiaCell,
  runnDguCells,
  onAddCell,
  onUpdateQuantity,
  onRemoveCell,
}: DguTorcevaiaSectionProps) {
  // Мемоизируем объект ячейки, чтобы избежать постоянных перезагрузок
  const tempTorcevaiaCell = useMemo(() => {
    if (!torcevaiaCell) return null;
    return {
      ...torcevaiaCell,
      purpose: 'Торцевая панель' as const
    };
  }, [torcevaiaCell?.id, torcevaiaCell?.quantity]);
  
  // Вызываем хук на верхнем уровне компонента (всегда в одном порядке)
  const { calculation: torcevaiaCalculation, loading: torcevaiaCalculationLoading } = useRunnTorcevaiaCalculation(tempTorcevaiaCell);

  return (
    <TogglerWithInput label="РУНН-ДГУ: Торцевая панель">
      {!torcevaiaCell ? (
        <button
          onClick={onAddCell}
          className="px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
        >
          + Добавить торцевую панель
        </button>
      ) : (
        <>
          {/* Рассчитываем цену из калькуляции */}
          {(() => {
            let finalPrice = 0;
            let totalPrice = 0;
            
            if (torcevaiaCalculation?.data) {
              const materialsTotal = torcevaiaCalculation.data.categories?.reduce(
                (sum: number, category: any) =>
                  sum + (category.items?.reduce((itemSum: number, item: any) => itemSum + (item.price || 0) * (item.quantity || 0), 0) || 0),
                0
              ) || 0;

              const calculationData = torcevaiaCalculation.data.calculation;
              if (calculationData) {
                const calculationResult = calculateCost(
                  materialsTotal,
                  calculationData,
                  0
                );
                finalPrice = calculationResult.finalPrice || 0;
              } else {
                finalPrice = torcevaiaCalculation.data.finalPrice || torcevaiaCalculation.data.totalPrice || 0;
              }
              
              totalPrice = finalPrice * (torcevaiaCell.quantity || 1);
            }

            return (
              <>
                <div className="flex gap-4 items-end p-4 rounded bg-white border border-gray-100">
                  <div className="flex flex-col gap-1 min-w-[100px]">
                    <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
                    <input
                      type="number"
                      min={1}
                      value={torcevaiaCell.quantity || 1}
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
                
                {/* Отображение калькуляции */}
                {torcevaiaCalculationLoading && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-3">
                    <p className="text-xs text-gray-600">Загрузка калькуляции...</p>
                  </div>
                )}
                
                {torcevaiaCalculation && !torcevaiaCalculationLoading && finalPrice > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-medium text-blue-900">Калькуляция торцевой панели</h4>
                      <div className="text-sm text-blue-700 font-bold">
                        {finalPrice.toLocaleString('ru-RU', { 
                          minimumFractionDigits: 2, 
                          maximumFractionDigits: 2 
                        })} ₸
                      </div>
                    </div>
                    {torcevaiaCalculation.name && (
                      <p className="text-xs text-blue-600 mt-1">
                        Название: {torcevaiaCalculation.name}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-blue-700">
                      <div>Цена за единицу: {finalPrice.toLocaleString('ru-RU')} ₸</div>
                      <div className="font-medium">Итого: {totalPrice.toLocaleString('ru-RU')} ₸</div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </TogglerWithInput>
  );
}

