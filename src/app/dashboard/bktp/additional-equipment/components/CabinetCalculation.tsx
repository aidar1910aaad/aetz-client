'use client';

import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import type { Calculation } from '@/api/calculations';

interface CabinetCalculationProps {
  calculation: Calculation;
}

export default function CabinetCalculation({ calculation }: CabinetCalculationProps) {
  const selected = useAdditionalEquipmentStore((s) => s.selected);
  const setSelected = useAdditionalEquipmentStore((s) => s.setSelected);

  // Расчет стоимости
  const calculateCost = () => {
    const { categories, calculation: calcData } = calculation.data;

    // Сумма по материалам
    let materialsTotal = 0;
    categories.forEach((category) => {
      category.items.forEach((item) => {
        materialsTotal += item.price * item.quantity;
      });
    });

    // Изготовление
    const manufacturingCost = (calcData?.manufacturingHours || 0) * (calcData?.hourlyRate || 0);

    // Общепроизводственные расходы
    const overheadCost = materialsTotal * ((calcData?.overheadPercentage || 0) / 100);

    // Производственная себестоимость
    const productionCost = materialsTotal + manufacturingCost + overheadCost;

    // Административные расходы (считаются только от материалов)
    const adminCost = materialsTotal * ((calcData?.adminPercentage || 0) / 100);

    // Полная себестоимость
    const fullCost = productionCost + adminCost;

    // Плановые накопления
    const profitCost = fullCost * ((calcData?.plannedProfitPercentage || 0) / 100);

    // Оптовая цена
    const wholesalePrice = fullCost + profitCost;

    // НДС
    const vatCost = wholesalePrice * ((calcData?.ndsPercentage || 0) / 100);

    // Отпускная цена
    const finalPrice = wholesalePrice + vatCost;

    return finalPrice;
  };

  const finalPrice = calculateCost();
  const isChecked = !!selected[calculation.name]?.checked;

  const handleCheck = (checked: boolean) => {
    setSelected({
      ...selected,
      [calculation.name]: {
        checked,
        count: selected[calculation.name]?.count || 1,
        price: finalPrice,
        calculation: calculation,
      },
    });
  };

  const handleCount = (count: number) => {
    setSelected({
      ...selected,
      [calculation.name]: {
        ...selected[calculation.name],
        count: count < 1 ? 1 : count,
      },
    });
  };

  const increment = () => {
    handleCount((selected[calculation.name]?.count || 1) + 1);
  };

  const decrement = () => {
    handleCount((selected[calculation.name]?.count || 1) - 1);
  };

  return (
    <div
      className={`flex flex-col justify-between h-full border rounded-xl p-4 shadow-sm transition-all duration-200 bg-white hover:shadow-md cursor-pointer group
        ${isChecked ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50' : 'border-gray-200'}`}
      onClick={() => handleCheck(!isChecked)}
    >
      <div className="flex items-start gap-3 mb-3">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => handleCheck(e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:border-blue-500 transition mt-0.5"
        />
        <span className="font-semibold text-gray-900 text-base">{calculation.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Количество:</span>
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                decrement();
              }}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
              {selected[calculation.name]?.count || 1}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                increment();
              }}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
            >
              +
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end min-w-[90px]">
          <span className="text-gray-700 font-semibold text-base">
            {finalPrice.toLocaleString()}₸
          </span>
          <span className="text-gray-500 text-xs">шт</span>
        </div>
      </div>
    </div>
  );
}
