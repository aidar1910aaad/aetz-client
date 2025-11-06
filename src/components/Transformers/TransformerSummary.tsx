import React from 'react';
import { Calculation } from '@/api/calculations';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';

interface TransformerSummaryProps {
  model: string;
  price: number;
  quantity: number;
  busbars?: string; // Сборные шины для РУНН
  ustCalculation?: Calculation | null; // Выбранная калькуляция УСТ
  ustCalculations?: Calculation[]; // Массив УСТ калькуляций
  busbarUstData?: {
    mainUstWeight: number;
    zeroUstWeight: number;
    material: string;
  } | null; // Данные о УСТ из конфигурации шин
}

const formattedPrice = (num?: number) => (num ? num.toLocaleString('ru-RU') + ' тг' : '—');

export function TransformerSummary({ model, price, quantity, busbars, ustCalculation, ustCalculations, busbarUstData }: TransformerSummaryProps) {
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  
  // Вычисляем цену УСТ из калькуляции
  const calculateUstPrice = (calc: Calculation, additionalUstCost: number = 0) => {
    if (!calc.data?.categories) return 0;
    
    let materialsTotal = 0;
    calc.data.categories.forEach((category) => {
      category.items.forEach((item) => {
        materialsTotal += item.price * item.quantity;
      });
    });

    // Добавляем стоимость УСТ из конфигурации шин
    const totalMaterialsWithUst = materialsTotal + additionalUstCost;
    

    const calculation = calc.data.calculation;
    if (!calculation) return totalMaterialsWithUst;

    const manufacturingCost = (calculation.manufacturingHours || 0) * (calculation.hourlyRate || 0);
    const overheadCost = totalMaterialsWithUst * ((calculation.overheadPercentage || 0) / 100);
    const productionCost = totalMaterialsWithUst + manufacturingCost + overheadCost;
    const adminCost = totalMaterialsWithUst * ((calculation.adminPercentage || 0) / 100);
    const fullCost = productionCost + adminCost;
    const profitCost = fullCost * ((calculation.plannedProfitPercentage || 0) / 100);
    const wholesalePrice = fullCost + profitCost;
    const vatCost = wholesalePrice * ((calculation.ndsPercentage || 0) / 100);
    const finalPrice = wholesalePrice + vatCost;

    return finalPrice;
  };

  // Используем ustCalculations если есть, иначе ustCalculation
  const calculationsToShow = ustCalculations && ustCalculations.length > 0 ? ustCalculations : (ustCalculation ? [ustCalculation] : []);
  
  
  // Функция для расчета стоимости УСТ из конфигурации шин
  const calculateUstCostFromBusbars = (ustWeightKg: number, material: string) => {
    // Стоимость за кг материала (динамически из API)
    const pricePerKg = material === 'Алюминий' ? aluminumPrice : copperPrice;
    
    const totalCost = ustWeightKg * pricePerKg;
    
    return totalCost;
  };
  
  // Используем реальные данные о шинах, если они переданы
  const busbarData = busbarUstData || {
    mainUstWeight: 0,
    zeroUstWeight: 0,
    material: busbars === 'Алюминий' ? 'Алюминий' : 'Медь'
  };
  
  const totalUstWeight = busbarData.mainUstWeight + busbarData.zeroUstWeight;
  const busbarUstCost = calculateUstCostFromBusbars(totalUstWeight, busbarData.material);
  
  
  const totalUstPrice = calculationsToShow.reduce((total, calc) => {
    // Добавляем стоимость шин только для УСТ-0.4кВ
    const shouldAddBusbarCost = calc.name.includes('0.4кВ') || calc.name.includes('УСТ-0.4кВ');
    const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
    
    
    return total + calculateUstPrice(calc, additionalCost);
  }, 0);
  const totalPrice = (price * quantity) + (totalUstPrice * quantity);
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Трансформатор</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-[#8eba1e] text-white">
            <tr>
              <th className="p-4 text-left font-semibold">№</th>
              <th className="p-4 text-left font-semibold">Наименование</th>
              <th className="p-4 text-center font-semibold">Ед. изм.</th>
              <th className="p-4 text-center font-semibold">Кол-во</th>
              <th className="p-4 text-center font-semibold">Цена</th>
              <th className="p-4 text-center font-semibold">Сумма</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            <tr className="border-b border-gray-100 hover:bg-gray-50">
              <td className="p-4 text-center font-semibold">1</td>
              <td className="p-4 text-left font-medium">{model}</td>
              <td className="p-4 text-center text-gray-600">шт</td>
              <td className="p-4 text-center font-semibold">{quantity}</td>
              <td className="p-4 text-center text-gray-900 font-semibold">{formattedPrice(price)}</td>
              <td className="p-4 text-center text-gray-900 font-bold">{formattedPrice(price * quantity)}</td>
            </tr>
            {calculationsToShow.map((calc, index) => {
              const shouldAddBusbarCost = calc.name.includes('0.4кВ') || calc.name.includes('УСТ-0.4кВ');
              const additionalCost = shouldAddBusbarCost ? busbarUstCost : 0;
              const calcPrice = calculateUstPrice(calc, additionalCost);
              
              return (
                <tr key={calc.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-center font-semibold">{index + 2}</td>
                  <td className="p-4 text-left font-medium">{calc.name}</td>
                  <td className="p-4 text-center text-gray-600">шт</td>
                  <td className="p-4 text-center font-semibold">{quantity}</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">{formattedPrice(calcPrice)}</td>
                  <td className="p-4 text-center text-gray-900 font-bold">{formattedPrice(calcPrice * quantity)}</td>
                </tr>
              );
            })}
            <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
              <td colSpan={5} className="text-right pr-4 p-4 text-lg">
                ВСЕГО:
              </td>
              <td className="text-right pr-4 p-4 text-lg text-gray-900">{formattedPrice(totalPrice)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
