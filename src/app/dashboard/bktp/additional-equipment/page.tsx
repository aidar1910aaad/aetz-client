'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import AdditionalEquipmentTable from '@/components/FinalReview/AdditionalEquipmentTable';
import EquipmentSection from './components/EquipmentSection';
import { EQUIPMENT_CONFIGS } from './config/equipmentConfig';
import { FaSearch, FaTools } from 'react-icons/fa';
import { useAdditionalEquipmentStore } from '@/store/useAdditionalEquipmentStore';
import type { AdditionalEquipmentItem } from '@/store/useAdditionalEquipmentStore';
import { getMaterialsByCategoryId } from '@/api/material';
import { useAuth } from '@/hooks/useAuth';
import { useAllEquipmentLoading } from './hooks/useAllEquipmentLoading';

export default function AdditionalEquipmentPage() {
  const { token } = useAuth();
  const selected = useAdditionalEquipmentStore((s) => s.selected);
  const setSelected = useAdditionalEquipmentStore((s) => s.setSelected);
  const setEquipmentList = useAdditionalEquipmentStore((s) => s.setEquipmentList);
  const isInitialized = useAdditionalEquipmentStore((s) => s.isInitialized);
  const setInitialized = useAdditionalEquipmentStore((s) => s.setInitialized);
  const [showProtectionDetails, setShowProtectionDetails] = useState(false);
  const [open, setOpen] = useState<{ [key: string]: boolean }>({
    ru04: true,
    dop: true,
  });
  const [search, setSearch] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Централизованная загрузка всех данных оборудования
  const { equipmentData, isLoading: equipmentLoading, error: equipmentError } = useAllEquipmentLoading();

  // Категории и оборудование (без шкафов, так как они теперь в отдельном компоненте)
  const categories = useMemo(() => [
    {
      title: 'Доп. комплектующие',
      key: 'dop',
      icon: <FaTools className="w-6 h-6 text-purple-500" />,
      items: materials,
    },
  ], [materials]);
  
  // Fetch materials from API
  useEffect(() => {
    const fetchMaterials = async () => {
      if (!token) return;
      
      try {
        setLoading(true);
        setError(null);
        const materialsData = await getMaterialsByCategoryId(6653, token);
        
        // Transform API data to match the expected format
        const transformedMaterials = materialsData.map((material: any) => ({
          name: material.name,
          price: parseFloat(material.price),
          unit: material.unit,
          id: material.id,
          code: material.code,
        }));
        
        setMaterials(transformedMaterials);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки материалов');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, [token]);

  useEffect(() => {
    // Устанавливаем equipmentList
    const allEquipment = [
      ...categories.flatMap((cat) => cat.items),
    ] as AdditionalEquipmentItem[];
    setEquipmentList(allEquipment);
    
    // Если это первая загрузка, инициализируем статические элементы
    if (!isInitialized && materials.length > 0) {
      const staticItems = categories.flatMap((cat) => cat.items);
      const initialSelected = { ...selected };
      
      staticItems.forEach(item => {
        if (!initialSelected[item.name]) {
          initialSelected[item.name] = {
            checked: false,
            count: 1,
            price: item.price,
          };
        }
      });
      
      setSelected(initialSelected);
      setInitialized(true);
    }
  }, [setEquipmentList, setSelected, setInitialized, isInitialized, selected, materials]);

  // Принудительное обновление цен для всех выбранных элементов после загрузки данных
  useEffect(() => {
    if (isInitialized && categories.length > 0) {
      const updatedSelected = { ...selected };
      let hasUpdates = false;
      
      // Обновляем цены для всех выбранных элементов без цены
      Object.keys(updatedSelected).forEach(key => {
        const item = updatedSelected[key];
        if (item.checked && (!item.price || item.price === 0 || item.price === undefined)) {
          // Ищем элемент в categories для получения цены
          const categoryItem = categories.flatMap((cat) => cat.items).find(catItem => catItem.name === key);
          if (categoryItem?.price) {
            updatedSelected[key] = {
              ...item,
              price: categoryItem.price
            };
            hasUpdates = true;
            console.log(`🔄 Принудительно обновляем цену для ${key}: ${categoryItem.price}`);
          }
        }
      });
      
      if (hasUpdates) {
        setSelected(updatedSelected);
      }
    }
  }, [isInitialized, categories, selected, setSelected]);

  // Принудительное обновление цен для шкафов с расчетами
  useEffect(() => {
    if (isInitialized) {
      const updatedSelected = { ...selected };
      let hasUpdates = false;
      
      // Функция для расчета стоимости шкафа
      const calculateCabinetCost = (calculation: any) => {
        if (!calculation.data) return 0;
        
        const { categories, calculation: calcData } = calculation.data;
        
        // Сумма по материалам
        let materialsTotal = 0;
        categories.forEach((category: any) => {
          category.items.forEach((item: any) => {
            materialsTotal += item.price * item.quantity;
          });
        });
        
        // Изготовление
        const manufacturingCost = (calcData?.manufacturingHours || 0) * (calcData?.hourlyRate || 0);
        
        // Общепроизводственные расходы
        const overheadCost = materialsTotal * ((calcData?.overheadPercentage || 0) / 100);
        
        // Производственная себестоимость
        const productionCost = materialsTotal + manufacturingCost + overheadCost;
        
        // Административные расходы
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
      
      // Обновляем цены для шкафов с расчетами
      Object.keys(updatedSelected).forEach(key => {
        const item = updatedSelected[key];
        if (item.checked && item.calculation && (!item.price || item.price === 0 || item.price === undefined)) {
          const calculatedPrice = calculateCabinetCost(item.calculation);
          if (calculatedPrice > 0) {
            updatedSelected[key] = {
              ...item,
              price: calculatedPrice
            };
            hasUpdates = true;
            console.log(`🔄 Принудительно обновляем цену шкафа ${key}: ${calculatedPrice}`);
          }
        }
      });
      
      if (hasUpdates) {
        setSelected(updatedSelected);
      }
    }
  }, [isInitialized, selected, setSelected]);

  // Фильтрация по поиску
  const filteredCategories = useMemo(
    () =>
      categories.map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())),
      })),
    [search, categories]
  );

  const handleCheck = (name: string, checked: boolean) => {
    // Находим элемент в equipmentList для получения цены
    const equipmentItem = categories.flatMap((cat) => cat.items).find(item => item.name === name);
    
    setSelected({
      ...selected,
      [name]: {
        checked,
        count: selected[name]?.count || 1,
        price: equipmentItem?.price, // Добавляем цену из equipmentList
      },
    });
  };

  const handleCount = (name: string, count: number) => {
    // Находим элемент в equipmentList для получения цены
    const equipmentItem = categories.flatMap((cat) => cat.items).find(item => item.name === name);
    
    setSelected((prevSelected) => ({
      ...prevSelected,
      [name]: {
        ...prevSelected[name],
        count: count < 0 ? 0 : count,
        checked: true, // Оставляем элемент выбранным даже при количестве 0
        // Сохраняем цену из equipmentList
        price: equipmentItem?.price || prevSelected[name]?.price,
      },
    }));
  };

  const increment = (name: string) => {
    // Находим элемент в equipmentList для получения цены
    const equipmentItem = categories.flatMap((cat) => cat.items).find(item => item.name === name);
    
    setSelected((prevSelected) => {
      const currentCount = prevSelected[name]?.count ?? 0;
      return {
        ...prevSelected,
        [name]: {
          ...prevSelected[name],
          count: currentCount + 1,
          checked: true, // Автоматически отмечаем как выбранный
          price: equipmentItem?.price || prevSelected[name]?.price,
        },
      };
    });
  };
  
  const decrement = (name: string) => {
    // Находим элемент в equipmentList для получения цены
    const equipmentItem = categories.flatMap((cat) => cat.items).find(item => item.name === name);
    
    setSelected((prevSelected) => {
      const currentCount = prevSelected[name]?.count ?? 0;
      const newCount = currentCount - 1;
      return {
        ...prevSelected,
        [name]: {
          ...prevSelected[name],
          count: newCount < 0 ? 0 : newCount,
          checked: true, // Оставляем элемент выбранным даже при количестве 0
          price: equipmentItem?.price || prevSelected[name]?.price,
        },
      };
    });
  };

  if (loading || equipmentLoading) {
    return (
      <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-100 pb-16">
        <div className="max-w-7xl mx-auto px-2 md:px-8 pt-6">
          <Breadcrumbs />
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Дополнительное оборудование</h1>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Загрузка данных...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-110px)] overflow-y-auto bg-gray-100 pb-16">
        <div className="max-w-7xl mx-auto px-2 md:px-8 pt-6">
          <Breadcrumbs />
          <h1 className="text-3xl font-bold mb-8 text-gray-900">Дополнительное оборудование</h1>
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <p className="text-red-600 text-lg mb-2">Ошибка загрузки материалов</p>
              <p className="text-gray-600">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow transition"
              >
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] bg-white overflow-y-auto">
      <div className="p-6">
        <Breadcrumbs />
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-xl">
              <svg className="w-6 h-6 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Дополнительное оборудование</h1>
              <p className="text-gray-600">Выберите дополнительное оборудование для заявки</p>
            </div>
          </div>
        </div>
        <div className=" mb-8">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-[#8eba1e] focus:border-[#8eba1e] bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">

          {/* Автоматически генерируемые компоненты оборудования */}
          <div className="space-y-6 animate-fadeIn">
            {EQUIPMENT_CONFIGS.map((config) => (
              <EquipmentSection 
                key={config.id} 
                config={config}
                equipmentData={equipmentData[config.id]}
              />
            ))}
          </div>

          {/* Остальные категории */}
          {materials.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет материалов</h3>
              <p className="text-gray-600">Материалы для данной категории не найдены</p>
            </div>
          ) : (
            filteredCategories.map((cat) => (
            <div key={cat.key} className="bg-white border border-gray-200 rounded-2xl shadow-lg">
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setOpen({ ...open, [cat.key]: !open[cat.key] })}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5 text-[#8eba1e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{cat.title}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{cat.items.length} позиций</span>
                  <svg
                    className={`w-5 h-5 text-[#8eba1e] transition-transform ${
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
                <div className="space-y-4 px-4">
                  {cat.items.length === 0 && (
                    <div className="text-gray-400 italic">Нет позиций</div>
                  )}
                  {cat.items.map((item) => {
                    const isChecked = !!selected[item.name]?.checked;
                    const isProtection = item.name.startsWith('Средства защиты');
                    return (
                      <div
                        key={item.name}
                        className={`flex flex-col justify-between h-full border-2 rounded-xl p-4 shadow-sm transition-all duration-200 bg-white hover:shadow-md cursor-pointer group w-full
                          ${
                            isChecked
                              ? 'border-[#8eba1e] ring-2 ring-[#8eba1e]/20 bg-[#8eba1e]/5'
                              : 'border-gray-200 hover:border-[#8eba1e]'
                          }`}
                        onClick={() => handleCheck(item.name, !isChecked)}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <input
                            type="checkbox"
                            checked={isChecked || false}
                            onChange={(e) => handleCheck(item.name, e.target.checked)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 rounded border-gray-300 text-[#8eba1e] focus:ring-[#8eba1e] focus:border-[#8eba1e] transition mt-0.5"
                          />
                          <span className="font-semibold text-gray-900 text-base">
                            {isProtection ? (
                              <>
                                <span>
                                  Средства защиты
                                  <button
                                    type="button"
                                    className="ml-2 text-[#8eba1e] underline text-xs hover:text-[#7aa31a] transition-colors"
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
                            <span className="text-sm font-medium text-gray-700">Количество:</span>
                            <div className="flex items-center border-2 border-gray-300 rounded-lg">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  decrement(item.name);
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e] transition-all duration-200"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min={0}
                                value={selected[item.name]?.count ?? 1}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleCount(item.name, Number(e.target.value));
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="px-3 py-2 text-sm font-semibold min-w-[40px] text-center bg-gray-50 border-0 focus:outline-none focus:ring-2 focus:ring-[#8eba1e]"
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  increment(item.name);
                                }}
                                className="px-3 py-2 text-gray-600 hover:bg-[#8eba1e]/10 hover:border-[#8eba1e] transition-all duration-200"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end min-w-[90px]">
                            {item.price && (
                              <span className="text-[#8eba1e] font-bold text-base">
                                {item.price.toLocaleString('ru-RU')}₸
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
            ))
          )}
        </div>
        {/* Итоговая таблица на всю ширину */}
        <div className="w-full mt-12">
          <div className=" mx-auto">
            <AdditionalEquipmentTable
              selected={selected}
              equipmentList={categories.flatMap((cat) => cat.items)}
            />
            <div className="flex justify-start mt-6">
              <button 
                onClick={() => {
                  // Обновляем store перед переходом на следующую страницу
                  console.log('🔄 Обновляем store дополнительного оборудования перед переходом');
                  
                  // Принудительно обновляем store с текущими данными
                  const updatedSelected = { ...selected };
                  
                  // Проверяем и обновляем цены для элементов без цены
                  Object.keys(updatedSelected).forEach(key => {
                    const item = updatedSelected[key];
                    if (item.checked && (!item.price || item.price === 0 || item.price === undefined)) {
                      // Ищем элемент в categories для получения цены
                      const categoryItem = categories.flatMap((cat) => cat.items).find(catItem => catItem.name === key);
                      if (categoryItem?.price) {
                        updatedSelected[key] = {
                          ...item,
                          price: categoryItem.price
                        };
                        console.log(`🔄 Обновлена цена для ${key}: ${categoryItem.price}`);
                      }
                    }
                  });
                  
                  setSelected(updatedSelected);
                  
                  // Небольшая задержка для сохранения в localStorage
                  setTimeout(() => {
                    window.location.href = '/dashboard/bktp/work';
                  }, 100);
                }}
                className="flex items-center gap-2 bg-[#8eba1e] hover:bg-[#7aa31a] text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 text-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Добавить в спецификацию
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
