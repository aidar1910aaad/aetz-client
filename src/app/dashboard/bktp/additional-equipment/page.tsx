'use client';

import { useState, useMemo, useEffect } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import AdditionalEquipmentTable from '@/components/FinalReview/AdditionalEquipmentTable';
import CabinetsSection from './components/CabinetsSection';
import { FaSearch, FaTools } from 'react-icons/fa';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import type { AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import { cabinetsData } from './data/cabinets';
import { accessoriesData } from './data/accessories';

// Категории и оборудование (без шкафов, так как они теперь в отдельном компоненте)
const categories = [
  {
    title: 'Доп. комплектующие',
    key: 'dop',
    icon: <FaTools className="w-6 h-6 text-purple-500" />,
    items: accessoriesData,
  },
];

export default function AdditionalEquipmentPage() {
  const selected = useAdditionalEquipmentStore((s) => s.selected);
  const setSelected = useAdditionalEquipmentStore((s) => s.setSelected);
  const setEquipmentList = useAdditionalEquipmentStore((s) => s.setEquipmentList);
  const [showProtectionDetails, setShowProtectionDetails] = useState(false);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    shkafy: true,
    ru04: true,
    dop: true,
  });
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Объединяем данные шкафов с остальными категориями
    const allEquipment = [
      ...cabinetsData,
      ...categories.flatMap((cat) => cat.items),
    ] as AdditionalEquipmentItem[];
    setEquipmentList(allEquipment);
  }, [setEquipmentList]);

  // Фильтрация по поиску
  const filteredCategories = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
      })),
    [search]
  );

  const handleCheck = (name: string, checked: boolean) => {
    setSelected({
      ...selected,
      [name]: {
        checked,
        count: selected[name]?.count || 1,
      },
    });
  };

  const handleCount = (name: string, count: number) => {
    setSelected({
      ...selected,
      [name]: {
        ...selected[name],
        count: count < 1 ? 1 : count,
      },
    });
  };

  const increment = (name: string) => {
    handleCount(name, (selected[name]?.count || 1) + 1);
  };
  const decrement = (name: string) => {
    handleCount(name, (selected[name]?.count || 1) - 1);
  };

  return (
    <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-100 pb-16">
      <div className="max-w-7xl mx-auto px-2 md:px-8 pt-6">
        <Breadcrumbs />
        <h1 className="text-3xl font-bold mb-8 text-gray-900">Дополнительное оборудование</h1>
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-400"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6">
          {/* Компонент шкафов */}
          <CabinetsSection
            open={open.shkafy}
            onToggle={() => setOpen({ ...open, shkafy: !open.shkafy })}
            search={search}
          />

          {/* Остальные категории */}
          {filteredCategories.map((cat) => (
            <div key={cat.key} className="bg-white border border-gray-200 rounded-2xl shadow-sm">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setOpen({ ...open, [cat.key]: !open[cat.key] })}
              >
                <div className="flex items-center gap-3">
                  {cat.icon}
                  <h3 className="text-lg font-semibold text-gray-900">{cat.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">{cat.items.length} позиций</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      open[cat.key] ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  open[cat.key] ? 'max-h-[2000px] py-4' : 'max-h-0 py-0'
                }`}
              >
                <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2">
                  {cat.items.length === 0 && (
                    <div className="text-gray-400 italic col-span-2">Нет позиций</div>
                  )}
                  {cat.items.map((item) => {
                    const isChecked = !!selected[item.name]?.checked;
                    const isProtection = item.name.startsWith('Средства защиты');
                    return (
                      <div
                        key={item.name}
                        className={`flex flex-col justify-between h-full border rounded-xl p-4 shadow-sm transition-all duration-200 bg-white hover:shadow-md cursor-pointer group
                          ${
                            isChecked
                              ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                        onClick={() => handleCheck(item.name, !isChecked)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleCheck(item.name, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:border-blue-500 transition mt-0.5"
                          />
                          <span className="font-semibold text-gray-900 text-base">
                            {isProtection ? (
                              <>
                                <span>
                                  Средства защиты
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600 underline text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowProtectionDetails((v) => !v);
                                    }}
                                  >
                                    {showProtectionDetails ? 'Скрыть' : 'Показать подробно'}
                                  </button>
                                </span>
                                {showProtectionDetails && (
                                  <div className="mt-2 text-xs text-gray-600 max-w-xl whitespace-pre-line">
                                    {item.name.replace('Средства защиты ', '')}
                                  </div>
                                )}
                              </>
                            ) : (
                              item.name
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Количество:</span>
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrement(item.name);
                                }}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-sm font-medium min-w-[40px] text-center">
                                {selected[item.name]?.count || 1}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  increment(item.name);
                                }}
                                className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end min-w-[90px]">
                            {item.price && (
                              <span className="text-gray-700 font-semibold text-base">
                                {item.price.toLocaleString()}₸
                              </span>
                            )}
                            {item.unit && (
                              <span className="text-gray-500 text-xs">{item.unit}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Итоговая таблица на всю ширину */}
        <div className="w-full mt-12">
          <div className="max-w-6xl mx-auto">
            <AdditionalEquipmentTable
              selected={selected}
              equipmentList={[...cabinetsData, ...categories.flatMap((cat) => cat.items)]}
            />
            <div className="flex justify-end mt-6">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl shadow transition text-lg">
                Добавить в спецификацию
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
