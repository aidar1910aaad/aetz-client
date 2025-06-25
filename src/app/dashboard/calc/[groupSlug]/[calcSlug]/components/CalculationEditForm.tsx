import { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Material as ApiMaterial, getAllMaterials } from '@/api/material';
import MaterialSearch from './MaterialSearch';
import CellConfig from '@/components/calculation/CellConfig';
import { CalculationSummary } from './CalculationSummary';
import { CellConfiguration, CellMaterial } from '@/types/calculation';

interface CalculationMaterial {
  id: number;
  name: string;
  unit: string;
  price: number;
  quantity: number;
}

interface CalculationCategory {
  name: string;
  items: CalculationMaterial[];
}

interface CalculationData {
  categories: CalculationCategory[];
  calculation: {
    manufacturingHours: number;
    hourlyRate: number;
    overheadPercentage: number;
    adminPercentage: number;
    plannedProfitPercentage: number;
    ndsPercentage: number;
  };
  cellConfig?: CellConfiguration;
}

interface Calculation {
  id: number;
  name: string;
  slug: string;
  data: CalculationData;
}

interface CalculationEditFormProps {
  calculation: Calculation;
  onSave: (updatedCalculation: Calculation) => void;
  onCancel: () => void;
}

export function CalculationEditForm({ calculation, onSave, onCancel }: CalculationEditFormProps) {
  const [name, setName] = useState(calculation.name);
  const [categories, setCategories] = useState<CalculationCategory[]>(calculation.data.categories);
  const [cellConfig, setCellConfig] = useState<CellConfiguration | undefined>(
    calculation.data.cellConfig
  );
  const [calculationValues, setCalculationValues] = useState(calculation.data.calculation);
  const [materials, setMaterials] = useState<ApiMaterial[]>([]);
  const [showMaterialSearch, setShowMaterialSearch] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const token = localStorage.getItem('token') || '';
        const data = await getAllMaterials(token);
        setMaterials(data);
      } catch (error) {
        console.error('Error loading materials:', error);
      }
    };

    loadMaterials();
  }, []);

  const calculateTotalMaterialsCost = () => {
    return categories.reduce((total, category) => {
      return (
        total +
        category.items.reduce((categoryTotal, item) => {
          return categoryTotal + item.price * item.quantity;
        }, 0)
      );
    }, 0);
  };

  const handleSave = () => {
    const updatedCalculation: Calculation = {
      ...calculation,
      name,
      data: {
        ...calculation.data,
        categories,
        cellConfig,
        calculation: calculationValues,
      },
    };

    onSave(updatedCalculation);
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', items: [] }]);
  };

  const removeCategory = (categoryIndex: number) => {
    setCategories(categories.filter((_, index) => index !== categoryIndex));
  };

  const updateCategoryName = (categoryIndex: number, newName: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      name: newName,
    };
    setCategories(updatedCategories);
  };

  const addItem = (categoryIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: [
        ...updatedCategories[categoryIndex].items,
        { id: Date.now(), name: '', unit: '', price: 0, quantity: 1 },
      ],
    };
    setCategories(updatedCategories);
  };

  const handleMaterialSelect = (material: { id: string; name: string; price: number }) => {
    if (selectedCategoryIndex === null || selectedItemIndex === null) return;

    const updatedCategories = [...categories];
    updatedCategories[selectedCategoryIndex] = {
      ...updatedCategories[selectedCategoryIndex],
      items: updatedCategories[selectedCategoryIndex].items.map((item, index) =>
        index === selectedItemIndex
          ? {
              ...item,
              name: material.name,
              price: material.price,
            }
          : item
      ),
    };
    setCategories(updatedCategories);
    setShowMaterialSearch(false);
  };

  const handleItemNameFocus = (categoryIndex: number, itemIndex: number) => {
    setSelectedCategoryIndex(categoryIndex);
    setSelectedItemIndex(itemIndex);
    setShowMaterialSearch(true);
  };

  const handleItemNameChange = (categoryIndex: number, itemIndex: number, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedCategories[categoryIndex].items.map((item, index) =>
        index === itemIndex ? { ...item, name: value } : item
      ),
    };
    setCategories(updatedCategories);
  };

  const handleCloseMaterialSearch = () => {
    setShowMaterialSearch(false);
    setSelectedCategoryIndex(null);
    setSelectedItemIndex(null);
  };

  const removeItem = (categoryIndex: number, itemIndex: number) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedCategories[categoryIndex].items.filter((_, index) => index !== itemIndex),
    };
    setCategories(updatedCategories);
  };

  const updateItem = (
    categoryIndex: number,
    itemIndex: number,
    field: keyof CalculationMaterial,
    value: string | number
  ) => {
    const updatedCategories = [...categories];
    updatedCategories[categoryIndex] = {
      ...updatedCategories[categoryIndex],
      items: updatedCategories[categoryIndex].items.map((item, index) =>
        index === itemIndex ? { ...item, [field]: value } : item
      ),
    };
    setCategories(updatedCategories);
  };

  const handleCellConfigChange = (newConfig: CellConfiguration) => {
    setCellConfig(newConfig);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Название калькуляции
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#3A55DF] focus:border-[#3A55DF]"
          />
        </div>
      </div>

      {/* Конфигурация ячейки */}
      <CellConfig
        cellType={cellConfig?.type || '10kv'}
        configuration={
          cellConfig || {
            type: '10kv',
            materials: {
              switch: [],
              rza: [],
              counter: [],
              sr: [],
              tsn: [],
              tn: [],
            },
          }
        }
        onConfigurationChange={handleCellConfigChange}
      />

      {/* Категории и материалы */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Категории</h2>
          <button
            onClick={addCategory}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Добавить категорию
          </button>
        </div>

        {categories.map((category: CalculationCategory, categoryIndex: number) => (
          <div
            key={categoryIndex}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  value={category.name}
                  onChange={(e) => updateCategoryName(categoryIndex, e.target.value)}
                  className="text-xl font-semibold bg-transparent border-b-2 border-transparent focus:border-blue-500 focus:outline-none px-2 py-1 w-1/2"
                />
                <button
                  onClick={() => removeCategory(categoryIndex)}
                  className="text-red-600 hover:text-red-700 focus:outline-none"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <button
                  onClick={() => addItem(categoryIndex)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Добавить материал
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Наименование
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ед.
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Цена
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Кол-во
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Сумма
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {category.items?.map((item: CalculationMaterial, itemIndex: number) => (
                      <tr key={itemIndex} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="relative">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) =>
                                handleItemNameChange(categoryIndex, itemIndex, e.target.value)
                              }
                              onFocus={() => handleItemNameFocus(categoryIndex, itemIndex)}
                              className="w-full min-w-[300px] px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                              placeholder="Введите название материала..."
                            />
                            {showMaterialSearch &&
                              selectedCategoryIndex === categoryIndex &&
                              selectedItemIndex === itemIndex && (
                                <MaterialSearch
                                  onSelect={handleMaterialSelect}
                                  onClose={handleCloseMaterialSearch}
                                />
                              )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) =>
                              updateItem(categoryIndex, itemIndex, 'unit', e.target.value)
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.price}
                            onChange={(e) =>
                              updateItem(categoryIndex, itemIndex, 'price', Number(e.target.value))
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                categoryIndex,
                                itemIndex,
                                'quantity',
                                Number(e.target.value)
                              )
                            }
                            className="w-full px-3 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          />
                        </td>
                        <td className="px-6 py-4 text-right text-gray-900">
                          {(item.price * item.quantity).toLocaleString()} ₸
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => removeItem(categoryIndex, itemIndex)}
                            className="text-red-600 hover:text-red-700 focus:outline-none"
                          >
                            <TrashIcon className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-4 text-sm font-medium text-gray-900 text-right"
                      >
                        Итого по категории:
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                        {category.items
                          ?.reduce(
                            (sum: number, item: CalculationMaterial) =>
                              sum + item.price * item.quantity,
                            0
                          )
                          .toLocaleString()}{' '}
                        ₸
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>

      <CalculationSummary
        totalMaterialsCost={calculateTotalMaterialsCost()}
        onValuesChange={(values) => {
          setCalculationValues(values);
        }}
        initialValues={calculationValues}
      />

      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
        >
          Отмена
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-[#3A55DF] text-white rounded-lg hover:bg-[#2A45CF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3A55DF] transition-colors"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
}
