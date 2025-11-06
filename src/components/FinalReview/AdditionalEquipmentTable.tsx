'use client';

import React from 'react';

interface EquipmentItem {
  name: string;
  price?: number;
  unit?: string;
}

interface Props {
  selected: Record<string, { checked: boolean; count: number; price?: number; calculation?: any }>;
  equipmentList: EquipmentItem[];
}

const formattedPrice = (num?: number) =>
  typeof num === 'number' ? num.toLocaleString('ru-RU') + ' ₸' : '—';

// Функция для расчета стоимости из калькуляции
const calculateCost = (calc: any) => {
  if (!calc || !calc.data) return 0;
  
  const { categories, calculation: calcData } = calc.data;

  let materialsTotal = 0;
  categories.forEach((category: any) => {
    category.items.forEach((item: any) => {
      materialsTotal += item.price * item.quantity;
    });
  });

  const manufacturingCost = (calcData?.manufacturingHours || 0) * (calcData?.hourlyRate || 0);
  const overheadCost = materialsTotal * ((calcData?.overheadPercentage || 0) / 100);
  const productionCost = materialsTotal + manufacturingCost + overheadCost;
  const adminCost = materialsTotal * ((calcData?.adminPercentage || 0) / 100);
  const fullCost = productionCost + adminCost;
  const profitCost = fullCost * ((calcData?.plannedProfitPercentage || 0) / 100);
  const wholesalePrice = fullCost + profitCost;
  const vatCost = wholesalePrice * ((calcData?.ndsPercentage || 0) / 100);
  const finalPrice = wholesalePrice + vatCost;

  return finalPrice;
};

export default function AdditionalEquipmentTable({ selected, equipmentList }: Props) {
  // Отладочная информация - показываем весь стор
  console.log('🔍 Весь стор selected:', selected);
  console.log('🔍 equipmentList:', equipmentList);
  
  // Данные из стора (API компоненты) с правильными ценами из калькуляций
  const selectedFromStore = Object.entries(selected)
    .filter(([name, val]) => val.checked && (val.count ?? 0) > 0)
    .map(([name, val]) => {
      // Используем цену из калькуляции, если есть, иначе из val.price
      const price = val.calculation ? calculateCost(val.calculation) : (val.price || 0);
      
      // Отладочная информация
      if (name.includes('ОПС')) {
        console.log('🔍 ОПС в таблице:', {
          name,
          hasCalculation: !!val.calculation,
          calculatedPrice: val.calculation ? calculateCost(val.calculation) : 'нет калькуляции',
          valPrice: val.price,
          finalPrice: price,
          count: val.count,
          fullVal: val
        });
      }
      
      return {
        name,
        price,
        unit: 'шт.',
      };
    });

  // Данные из equipmentList (статические данные) - только те, что выбраны и с количеством > 0
  const selectedFromList = equipmentList
    .filter((item) => selected[item.name]?.checked && (selected[item.name]?.count ?? 0) > 0)
    .map((item) => {
      const count = selected[item.name]?.count ?? 0;
      // Используем цену из стора, если есть, иначе из item.price
      const price = selected[item.name]?.price || item.price || 0;
      
      // Отладочная информация для статических данных
      console.log('🔍 Статический элемент в таблице:', {
        name: item.name,
        itemPrice: item.price,
        storePrice: selected[item.name]?.price,
        finalPrice: price,
        count: count,
        total: price * count,
        selectedData: selected[item.name],
        isChecked: selected[item.name]?.checked,
        hasCount: (selected[item.name]?.count ?? 0) > 0
      });
      
      return {
        name: item.name,
        price: price,
        unit: item.unit || 'шт.',
      };
    });

  // Объединяем данные, приоритет у данных из стора (API)
  const filteredFromList = selectedFromList.filter(item => !selectedFromStore.some(storeItem => storeItem.name === item.name));
  
  const allChosen = [
    ...selectedFromStore, // Элементы с расчетами (шкафы)
    ...filteredFromList // Статические элементы, которых нет в расчетах
  ];
  
  console.log('🔍 FinalReview AdditionalEquipmentTable:');
  console.log('  - selectedFromStore:', selectedFromStore.length, selectedFromStore.map(item => ({ name: item.name, price: item.price })));
  console.log('  - selectedFromList:', selectedFromList.length, selectedFromList.map(item => ({ name: item.name, price: item.price })));
  console.log('  - allChosen:', allChosen.length, allChosen.map(item => ({ name: item.name, price: item.price })));

  const total = allChosen.reduce(
        (sum, item) => sum + (item.price ? item.price * (selected[item.name]?.count ?? 0) : 0),
    0
  );

  if (allChosen.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Доп. оборудование</h3>
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
              <tr className="border-b border-gray-100">
                <td className="p-4 text-center font-semibold">—</td>
                <td className="p-4 text-left font-medium">Оборудование не выбрано</td>
                <td className="p-4 text-center text-gray-600">—</td>
                <td className="p-4 text-center font-semibold">—</td>
                <td className="p-4 text-center text-gray-900 font-semibold">—</td>
                <td className="p-4 text-center text-gray-900 font-bold">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">Доп. оборудование</h3>
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
            {allChosen.map((item, idx) => {
              const count = selected[item.name]?.count ?? 0;
              return (
                <tr key={item.name} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4 text-center font-semibold">{idx + 1}</td>
                  <td className="p-4 text-left font-medium">{item.name}</td>
                  <td className="p-4 text-center text-gray-600">{item.unit || 'шт.'}</td>
                  <td className="p-4 text-center font-semibold">{count}</td>
                  <td className="p-4 text-center text-gray-900 font-semibold">{formattedPrice(item.price)}</td>
                  <td className="p-4 text-center text-gray-900 font-bold">
                    {formattedPrice(item.price ? item.price * count : undefined)}
                  </td>
                </tr>
              );
            })}
            <tr className="bg-[#8eba1e]/10 font-bold border-t-2 border-[#8eba1e]">
              <td colSpan={5} className="text-right pr-4 p-4 text-lg">
                ВСЕГО:
              </td>
              <td className="text-right pr-4 p-4 text-lg text-gray-900">{formattedPrice(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
