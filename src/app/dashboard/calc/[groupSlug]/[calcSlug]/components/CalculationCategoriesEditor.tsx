'use client';

import { useState, useRef } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import MaterialSearch from './MaterialSearch';
import CalculationExcelImportZone from './CalculationExcelImportZone';

interface CalculationMaterial {
  id?: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface Props {
  categories: CalculationCategory[];
  setCategories: (categories: CalculationCategory[]) => void;
  onImport?: (categories: CalculationCategory[], laborHours: number) => void;
}

export default function CalculationCategoriesEditor({ categories, setCategories, onImport }: Props) {
  const [showMaterialSearch, setShowMaterialSearch] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const addCategory = () => {
    setCategories([...categories, { name: '', items: [] }]);
  };

  const removeCategory = (categoryIndex: number) => {
    setCategories(categories.filter((_, i) => i !== categoryIndex));
  };

  const updateCategoryName = (categoryIndex: number, newName: string) => {
    const next = [...categories];
    next[categoryIndex] = { ...next[categoryIndex], name: newName };
    setCategories(next);
  };

  const addItem = (categoryIndex: number) => {
    const next = [...categories];
    next[categoryIndex] = {
      ...next[categoryIndex],
      items: [...next[categoryIndex].items, { id: undefined, name: '', unit: '', price: 0, quantity: 1 }],
    };
    setCategories(next);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const next = [...categories];
    next[categoryIndex] = {
      ...next[categoryIndex],
      items: next[categoryIndex].items.filter((_, i) => i !== itemIndex),
    };
    setCategories(next);
  };

  const updateItem = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof CalculationMaterial,
    value: string | number
  ) => {
    const next = [...categories];
    next[categoryIndex] = {
      ...next[categoryIndex],
      items: next[categoryIndex].items.map((item, i) =>
        i === itemIndex ? { ...item, [field]: value } : item
      ),
    };
    setCategories(next);
  };

  const handleMaterialSelect = (material: { id: string; name: string; price: number; unit: string }) => {
    if (selectedCategoryIndex === null || selectedItemIndex === null) return;
    const next = [...categories];
    next[selectedCategoryIndex] = {
      ...next[selectedCategoryIndex],
      items: next[selectedCategoryIndex].items.map((item, i) =>
        i === selectedItemIndex
          ? { ...item, id: Number(material.id), name: material.name, price: material.price, unit: material.unit }
          : item
      ),
    };
    setCategories(next);
    setShowMaterialSearch(false);
  };

  const handleItemNameFocus = (categoryIndex: number, itemIndex: number) => {
    setSelectedCategoryIndex(categoryIndex);
    setSelectedItemIndex(itemIndex);
    setShowMaterialSearch(true);
  };

  const handleItemNameChange = (categoryIndex: number, itemIndex: number, value: string) => {
    updateItem(categoryIndex, itemIndex, 'name', value);
  };

  const handleCloseMaterialSearch = () => {
    setShowMaterialSearch(false);
    setSelectedCategoryIndex(null);
    setSelectedItemIndex(null);
  };

  return (
    <div className="space-y-4">
      {onImport && <CalculationExcelImportZone onImport={onImport} />}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-[#8eba1e] pl-3">Категории</h2>
        <button
          onClick={addCategory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors text-sm"
        >
          <PlusIcon className="w-4 h-4" />
          Добавить категорию
        </button>
      </div>

      {categories.map((category, categoryIndex) => {
        const categoryTotal = category.items.reduce((s, it) => s + it.price * it.quantity, 0);

        return (
          <div
            key={categoryIndex}
            className="rounded-xl border border-[#8eba1e]/20 overflow-hidden"
          >
            {/* Заголовок категории */}
            <div className="flex items-center justify-between bg-[#8eba1e]/10 px-4 py-2.5 border-b border-[#8eba1e]/20">
              <input
                type="text"
                value={category.name}
                onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                placeholder="Название категории"
                className="text-base font-semibold bg-transparent border-b-2 border-transparent focus:border-[#8eba1e] focus:outline-none px-1 py-0.5 flex-1 mr-4"
              />
              <button
                onClick={() => removeCategory(categoryIndex)}
                className="text-red-400 hover:text-red-600 transition-colors"
                title="Удалить категорию"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              {/* Шапка колонок */}
              {category.items.length > 0 && (
                <div className="grid grid-cols-[1fr_64px_80px_110px_110px_36px] gap-2 px-2 pb-1 border-b border-gray-100">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Наименование</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ед.</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Кол-во</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Цена</span>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider text-right">Сумма</span>
                  <span />
                </div>
              )}

              {/* Строки материалов */}
              {category.items.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className="grid grid-cols-[1fr_64px_80px_110px_110px_36px] gap-2 items-center px-2 py-1 rounded-lg hover:bg-[#8eba1e]/5 transition-colors group"
                >
                  {/* Наименование */}
                  <div className="relative min-w-0">
                    <input
                      ref={
                        selectedCategoryIndex === categoryIndex && selectedItemIndex === itemIndex
                          ? inputRef
                          : undefined
                      }
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemNameChange(categoryIndex, itemIndex, e.target.value)}
                      onFocus={() => handleItemNameFocus(categoryIndex, itemIndex)}
                      placeholder="Выберите материал..."
                      className="w-full px-2.5 py-1.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-colors bg-white"
                    />
                    {showMaterialSearch &&
                      selectedCategoryIndex === categoryIndex &&
                      selectedItemIndex === itemIndex && (
                        <MaterialSearch
                          anchorRef={inputRef}
                          onSelect={(mat: unknown) => {
                            const safeMat = { ...(mat as any), unit: (mat as any).unit ?? '' };
                            handleMaterialSelect(safeMat);
                          }}
                          onClose={handleCloseMaterialSearch}
                        />
                      )}
                  </div>

                  {/* Ед. */}
                  <input
                    type="text"
                    value={item.unit ?? ''}
                    onChange={(e) => updateItem(categoryIndex, itemIndex, 'unit', e.target.value)}
                    className="w-full px-2 py-1.5 text-sm text-center border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-colors bg-white"
                  />

                  {/* Кол-во */}
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(categoryIndex, itemIndex, 'quantity', Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-colors bg-white"
                  />

                  {/* Цена */}
                  <input
                    type="number"
                    value={item.price}
                    onChange={(e) => updateItem(categoryIndex, itemIndex, 'price', Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-sm text-right border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#8eba1e]/30 focus:border-[#8eba1e] transition-colors bg-white"
                  />

                  {/* Сумма */}
                  <div className="text-right text-sm font-semibold text-gray-900 tabular-nums pr-1">
                    {(item.price * item.quantity).toLocaleString('ru-RU')} ₸
                  </div>

                  {/* Удалить */}
                  <button
                    onClick={() => removeItem(categoryIndex, itemIndex)}
                    className="flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors group-hover:text-red-400"
                    title="Удалить"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Кнопка добавить */}
              <button
                onClick={() => addItem(categoryIndex)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[#8eba1e] border border-dashed border-[#8eba1e]/40 rounded-lg hover:bg-[#8eba1e]/10 transition-colors text-sm w-full justify-center mt-1"
              >
                <PlusIcon className="w-4 h-4" />
                Добавить материал
              </button>
            </div>

            {/* Итого */}
            <div className="flex justify-between items-center bg-[#8eba1e]/10 px-4 py-2.5 border-t border-[#8eba1e]/20">
              <span className="text-xs font-semibold text-gray-600">Итого по категории:</span>
              <span className="text-sm font-bold text-[#8eba1e] tabular-nums">
                {categoryTotal.toLocaleString('ru-RU')} ₸
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
