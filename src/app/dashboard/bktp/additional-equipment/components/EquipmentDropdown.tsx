'use client';

import React, { useState, useEffect } from 'react';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import { EquipmentConfig } from '../config/equipmentConfig';
import { type Calculation } from '@/api/calculations';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

interface EquipmentDropdownProps {
  config: EquipmentConfig;
  equipmentData?: {
    calculations: Calculation[];
    loading: boolean;
    error: string | null;
  };
}

export default function EquipmentDropdown({ config, equipmentData }: EquipmentDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selected = useAdditionalEquipmentStore((s) => s.selected);
  const setSelected = useAdditionalEquipmentStore((s) => s.setSelected);
  
  // Используем переданные данные или значения по умолчанию
  const calculations = equipmentData?.calculations;
  const loading = equipmentData?.loading ?? false;
  const error = equipmentData?.error ?? null;

  // Находим выбранный элемент
  const selectedItem = calculations?.find(calc => selected[calc.name]?.checked);
  const defaultItem = config.defaultSelectionFn && calculations && calculations.length > 0
    ? config.defaultSelectionFn(calculations)
    : calculations?.[0];

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

  const handleSelect = (calculation: Calculation) => {
    if (!calculations) return;
    
    // Очищаем все элементы этой категории из стора
    const newSelected = { ...selected };
    calculations.forEach(calc => {
      delete newSelected[calc.name];
    });

    // Добавляем только выбранный элемент
    setSelected({
      ...newSelected,
      [calculation.name]: {
        checked: true,
        count: config.defaultCount,
        calculation: calculation,
      },
    });
  };

  const handleCount = (name: string, count: number) => {
    setSelected((prevSelected) => {
      const currentItem = prevSelected[name];
      const calculation = calculations.find(calc => calc.name === name);
      const calculatedPrice = calculation ? calculateCost(calculation) : (currentItem?.price || 0);
      
      return {
        ...prevSelected,
        [name]: {
          ...currentItem,
          count: count < 0 ? 0 : count,
          checked: count > 0, // Автоматически отмечаем как выбранный, если количество > 0
          price: calculatedPrice,
          calculation: calculation,
        },
      };
    });
  };

  const increment = (name: string) => {
    setSelected((prevSelected) => {
      const currentItem = prevSelected[name];
      const currentCount = currentItem?.count ?? 0;
      const calculation = calculations.find(calc => calc.name === name);
      const calculatedPrice = calculation ? calculateCost(calculation) : (currentItem?.price || 0);
      
      return {
        ...prevSelected,
        [name]: {
          ...currentItem,
          count: currentCount + 1,
          checked: true, // Автоматически отмечаем как выбранный
          price: calculatedPrice,
          calculation: calculation,
        },
      };
    });
  };

  const decrement = (name: string) => {
    setSelected((prevSelected) => {
      const currentItem = prevSelected[name];
      const currentCount = currentItem?.count ?? 0;
      const newCount = currentCount - 1;
      const calculation = calculations.find(calc => calc.name === name);
      const calculatedPrice = calculation ? calculateCost(calculation) : (currentItem?.price || 0);
      
      return {
        ...prevSelected,
        [name]: {
          ...currentItem,
          count: newCount < 0 ? 0 : newCount,
          checked: true, // Оставляем элемент выбранным даже при количестве 0
          price: calculatedPrice,
          calculation: calculation,
        },
      };
    });
  };

  // Инициализация по умолчанию - только если нет выбранных элементов
  useEffect(() => {
    if (defaultItem && !selectedItem && calculations && calculations.length > 0) {
      const hasAnySelected = Object.keys(selected).some(key => 
        calculations.some(calc => calc.name === key && selected[key]?.checked)
      );
      
      if (!hasAnySelected) {
        console.log('🔍 Инициализируем дефолтный элемент для', config.id, ':', defaultItem.name);
        // Очищаем все элементы этой категории и выбираем только дефолтный
        const newSelected = { ...selected };
        calculations.forEach(calc => {
          delete newSelected[calc.name];
        });
        
        // Рассчитываем цену для дефолтного элемента
        const calculatedPrice = calculateCost(defaultItem);
        
        setSelected({
          ...newSelected,
          [defaultItem.name]: {
            checked: true,
            count: config.defaultCount,
            price: calculatedPrice,
            calculation: defaultItem,
          },
        });
      } else {
        // Проверяем и обновляем цены для существующих элементов
        const updatedSelected = { ...selected };
        let hasUpdates = false;
        
        calculations.forEach(calc => {
          const existingItem = updatedSelected[calc.name];
          if (existingItem?.checked && (!existingItem.price || existingItem.price === 0 || existingItem.price === undefined)) {
            const calculatedPrice = calculateCost(calc);
            updatedSelected[calc.name] = {
              ...existingItem,
              price: calculatedPrice,
              calculation: calc,
            };
            hasUpdates = true;
            console.log('🔄 EquipmentDropdown обновляем цену для', calc.name, ':', calculatedPrice);
          }
        });
        
        if (hasUpdates) {
          setSelected(updatedSelected);
        } else {
          console.log('✅ Элементы уже выбраны с ценами для', config.id, ', не перезаписываем');
        }
      }
    }
  }, [calculations, defaultItem, selectedItem, selected, setSelected, config.defaultCount]);

  const currentOption = selectedItem || defaultItem;

  if (loading || !calculations || calculations.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-lg shadow-sm">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{config.title}</h3>
          <div className="flex items-center justify-center py-6">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Загрузка...</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-sm">Ошибка: {error}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">?</span>
                </div>
                <span className="text-sm">Нет данных для отображения</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentCount = selected[currentOption?.name]?.count ?? 0;
  const unitPrice = currentOption ? calculateCost(currentOption) : 0;
  const totalPrice = unitPrice * currentCount;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{config.title}</h3>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <span className="text-sm font-semibold">Выберите тип</span>
            {isOpen ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Выпадающий список */}
        {isOpen && calculations && calculations.length > 0 && (
          <div className="space-y-2 mb-4">
            {calculations.map((calculation) => {
              const isSelected = selected[calculation.name]?.checked;
              return (
                <div
                  key={calculation.id}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-[#8eba1e] bg-[#8eba1e]/10 shadow-md'
                      : 'border-gray-200 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
                  }`}
                  onClick={() => handleSelect(calculation)}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      checked={isSelected || false}
                      onChange={() => handleSelect(calculation)}
                      className="w-4 h-4 text-[#8eba1e] focus:ring-[#8eba1e]"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-sm">{calculation.name}</div>
                      <div className="text-sm font-medium text-[#8eba1e]">
                        {calculateCost(calculation).toLocaleString('ru-RU')}₸
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Выбранный вариант */}
        {currentOption && currentOption.name && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
            <div className="mb-3">
              <span className="font-semibold text-gray-900 text-sm">
                {currentOption.name}
              </span>
            </div>

            <div className="flex items-center justify-between gap-6">
              {/* Количество - компактно */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Количество:</span>
                <div className="flex items-center border-2 border-gray-300 rounded-lg bg-white">
                  <button
                    type="button"
                    onClick={() => decrement(currentOption.name)}
                    className="px-3 py-2 text-gray-600 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e] transition-all duration-200"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-sm font-semibold min-w-[40px] text-center bg-gray-50">
                    {currentCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => increment(currentOption.name)}
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
        )}
      </div>
    </div>
  );
}