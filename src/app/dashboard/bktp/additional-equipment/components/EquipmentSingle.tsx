'use client';

import React, { useEffect } from 'react';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { EquipmentConfig } from '../config/equipmentConfig';
import { type Calculation } from '@/api/calculations';

interface EquipmentSingleProps {
  config: EquipmentConfig;
  equipmentData?: {
    calculations: Calculation[];
    loading: boolean;
    error: string | null;
  };
}

export default function EquipmentSingle({ config, equipmentData }: EquipmentSingleProps) {
  const selected = useAdditionalEquipmentStore((s) => s.selected);
  const setSelected = useAdditionalEquipmentStore((s) => s.setSelected);
  
  // Используем переданные данные или значения по умолчанию
  const calculations = equipmentData?.calculations;
  const loading = equipmentData?.loading ?? false;
  const error = equipmentData?.error ?? null;

  const calculation = calculations?.[0]; // Берем первый (и единственный) элемент

  // Расчет стоимости
  const calculateCost = (calc: Calculation) => {
    const { categories, calculation: calcData } = calc.data;

    let materialsTotal = 0;
    categories.forEach((category) => {
      category.items.forEach((item) => {
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

  // Инициализация в сторе - только если элемента еще нет
  useEffect(() => {
    if (calculation) {
      const calculatedPrice = calculateCost(calculation);
      
      // Отладочная информация для ОПС
      if (config.id === 'ops') {
        console.log('🔍 ОПС инициализация:', {
          name: calculation.name,
          calculatedPrice,
          defaultCount: config.defaultCount,
          hasCalculation: !!calculation
        });
      }
      
      // Проверяем, существует ли элемент, используя функциональное обновление
      setSelected((prevSelected) => {
        if (!prevSelected[calculation.name]) {
          console.log('➕ Инициализируем новый элемент:', calculation.name, 'с количеством:', config.defaultCount);
          return {
            ...prevSelected,
            [calculation.name]: {
              checked: config.defaultCount > 0, // Выбран только если количество > 0
              count: config.defaultCount,
              calculation: calculation,
            },
          };
        } else {
          const existingItem = prevSelected[calculation.name];
          // Если элемент существует, но у него нет цены, обновляем его
          if (!existingItem.price || existingItem.price === 0 || existingItem.price === undefined) {
            console.log('🔄 Элемент существует, но без цены. Обновляем:', calculation.name, 'цена:', calculatedPrice);
            return {
              ...prevSelected,
              [calculation.name]: {
                ...existingItem,
                price: calculatedPrice,
                calculation: calculation,
              },
            };
          } else {
            console.log('✅ Элемент уже существует в store с ценой, не перезаписываем:', calculation.name, prevSelected[calculation.name]);
            return prevSelected;
          }
        }
      });
    }
  }, [calculation, setSelected, config.defaultCount]);

  const handleCount = (name: string, count: number) => {
    setSelected((prevSelected) => ({
      ...prevSelected,
      [name]: {
        ...prevSelected[name],
        count: count < 0 ? 0 : count,
        checked: count > 0, // Автоматически отмечаем как выбранный, если количество > 0
      },
    }));
  };

  const increment = (name: string) => {
    setSelected((prevSelected) => {
      const currentCount = prevSelected[name]?.count ?? 0;
      return {
        ...prevSelected,
        [name]: {
          ...prevSelected[name],
          count: currentCount + 1,
          checked: true, // Автоматически отмечаем как выбранный
        },
      };
    });
  };

  const decrement = (name: string) => {
    setSelected((prevSelected) => {
      const currentCount = prevSelected[name]?.count ?? 0;
      const newCount = currentCount - 1;
      return {
        ...prevSelected,
        [name]: {
          ...prevSelected[name],
          count: newCount < 0 ? 0 : newCount,
          checked: true, // Оставляем элемент выбранным даже при количестве 0
        },
      };
    });
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{config.title}</h3>
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Загрузка...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{config.title}</h3>
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2 text-red-600">
              <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <span className="text-sm">Ошибка: {error}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!calculation) {
    return null;
  }

  const currentCount = selected[calculation.name]?.count ?? 0;
  const unitPrice = calculateCost(calculation);
  const totalPrice = unitPrice * currentCount;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{calculation.name}</h3>
        </div>
        
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between gap-6">
            {/* Количество - компактно */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Количество:</span>
              <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                <button
                  type="button"
                  onClick={() => decrement(calculation.name)}
                  className="px-3 py-2 text-gray-600 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e] transition-all duration-200"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold min-w-[40px] text-center bg-gray-50">
                  {currentCount}
                </span>
                <button
                  type="button"
                  onClick={() => increment(calculation.name)}
                  className="px-3 py-2 text-gray-600 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e] transition-all duration-200"
                >
                  +
                </button>
              </div>
            </div>

            {/* Цена за штуку */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Цена за шт:</span>
              <span className="text-sm font-semibold text-gray-900">
                {unitPrice.toLocaleString('ru-RU')}₸
              </span>
            </div>

            {/* Сумма */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Сумма:</span>
              <span className="text-sm font-bold text-[#8eba1e]">
                {totalPrice.toLocaleString('ru-RU')}₸
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}