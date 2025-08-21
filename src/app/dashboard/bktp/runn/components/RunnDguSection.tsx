'use client';

import { useState, useEffect } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import TogglerWithInput from '../TogglerWithInput';
import { Material } from '@/api/material';
import {
  calculateNominalCurrentForDgu,
  findBestMaterialByNominalCurrent,
} from '../utils/runnDguMaterialFinder';

interface RunnDguSectionProps {
  categoryMaterials?: Material[];
  meterMaterials?: Material[];
}

export default function RunnDguSection({
  categoryMaterials = [],
  meterMaterials = [],
}: RunnDguSectionProps) {
  const [showRunnDgu, setShowRunnDgu] = useState(false);
  const [runnDguCells, setRunnDguCells] = useState<RunnCell[]>([]);
  const [runnDguInputCell, setRunnDguInputCell] = useState<RunnCell>({
    id: 'runn-dgu-input',
    purpose: 'РУНН-ДГУ-Ввод',
    breaker: '',
    meterType: '',
    quantity: 1,
    nominalPower: 0,
    price: 0,
  });

  // Состояние для общих настроек РУНН-ДГУ
  const [runnDguSettings, setRunnDguSettings] = useState({
    nominalPowerKva: 0, // Номинальная мощность в кВА
    price: 0, // Цена
  });

  // Состояние для автоматически выбранного материала
  const [autoSelectedMaterial, setAutoSelectedMaterial] = useState<Material | null>(null);
  const [nominalCurrent, setNominalCurrent] = useState<number>(0);

  // Автоматический выбор материала при изменении мощности
  useEffect(() => {
    if (runnDguSettings.nominalPowerKva > 0 && categoryMaterials.length > 0) {
      const calculatedCurrent = calculateNominalCurrentForDgu(runnDguSettings.nominalPowerKva);
      setNominalCurrent(calculatedCurrent);
      
      const bestMaterial = findBestMaterialByNominalCurrent(categoryMaterials, calculatedCurrent);
      setAutoSelectedMaterial(bestMaterial);
      
      // Автоматически устанавливаем выбранный материал для ввода
      // Всегда обновляем для ячейки Ввод, так как это автоматический выбор
      if (bestMaterial) {
        setRunnDguInputCell(prev => ({
          ...prev,
          breaker: bestMaterial.name
        }));
      }
    } else {
      setNominalCurrent(0);
      setAutoSelectedMaterial(null);
    }
  }, [runnDguSettings.nominalPowerKva, categoryMaterials]);

  // Отдельный useEffect для обновления поля автомата в ячейке Ввод
  useEffect(() => {
    if (autoSelectedMaterial && runnDguInputCell.breaker !== autoSelectedMaterial.name) {
      setRunnDguInputCell(prev => ({
        ...prev,
        breaker: autoSelectedMaterial.name
      }));
    }
  }, [autoSelectedMaterial, runnDguInputCell.breaker]);

  // Создаем опции автоматов из реальных материалов
  const breakerOptions = categoryMaterials.map((material) => material.name);
  // Создаем опции для ПУ из материалов счетчика
  const meterOptions = meterMaterials.map((material) => material.name);

  // Компонент для отображения сводки материалов
  const MaterialSummaryTable = ({ cell }: { cell: RunnCell }) => {
    const selectedMaterials = [];



    // Добавляем автомат выкатной
    if (cell.breaker) {
      const breakerMaterial = categoryMaterials.find((m) => m.name === cell.breaker);
      
      if (breakerMaterial) {
        const parsedPrice = typeof breakerMaterial.price === 'string'
          ? parseFloat(breakerMaterial.price)
          : breakerMaterial.price;
        
        selectedMaterials.push({
          name: cell.breaker,
          price: parsedPrice,
          quantity: cell.quantity || 1,
          unit: breakerMaterial.unit || 'шт',
          type: 'Автомат выкатной',
        });
      } else {
        // Добавляем материал без цены, если не найден
        selectedMaterials.push({
          name: cell.breaker,
          price: 0,
          quantity: cell.quantity || 1,
          unit: 'шт',
          type: 'Автомат выкатной',
        });
      }
    }

    // Добавляем ПУ
    if (cell.meterType) {
      const meterMaterial = meterMaterials.find((m) => m.name === cell.meterType);
      if (meterMaterial) {
        selectedMaterials.push({
          name: cell.meterType,
          price:
            typeof meterMaterial.price === 'string'
              ? parseFloat(meterMaterial.price)
              : meterMaterial.price,
          quantity: cell.quantity || 1,
          unit: meterMaterial.unit,
          type: 'ПУ',
        });
      }
    }

    if (selectedMaterials.length === 0) {
      return null;
    }

    const totalSum = selectedMaterials.reduce(
      (sum, material) => sum + material.price * material.quantity,
      0
    );

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded border">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Выбранные материалы:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-1 px-2">Тип</th>
                <th className="text-left py-1 px-2">Наименование</th>
                <th className="text-right py-1 px-2">Цена (₸)</th>
                <th className="text-center py-1 px-2">Кол-во</th>
                <th className="text-right py-1 px-2">Сумма (₸)</th>
              </tr>
            </thead>
            <tbody>
              {selectedMaterials.map((material, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-1 px-2 text-gray-600">{material.type}</td>
                  <td className="py-1 px-2 font-medium">{material.name}</td>
                  <td className="py-1 px-2 text-right">{material.price.toLocaleString()}</td>
                  <td className="py-1 px-2 text-center">{material.quantity}</td>
                  <td className="py-1 px-2 text-right font-medium">
                    {(material.price * material.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-medium">
                <td colSpan={4} className="py-1 px-2 text-right">
                  Итого:
                </td>
                <td className="py-1 px-2 text-right">{totalSum.toLocaleString()} ₸</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Компонент для общей сводки всех материалов РУНН-ДГУ
  const RunnDguTotalSummary = () => {
    const allMaterials = [];

    // Добавляем материалы из ячейки ввода
    if (runnDguInputCell.breaker) {
      const breakerMaterial = categoryMaterials.find((m) => m.name === runnDguInputCell.breaker);
      if (breakerMaterial) {
        allMaterials.push({
          name: runnDguInputCell.breaker,
          price:
            typeof breakerMaterial.price === 'string'
              ? parseFloat(breakerMaterial.price)
              : breakerMaterial.price,
          quantity: runnDguInputCell.quantity || 1,
          unit: breakerMaterial.unit,
          type: 'Автомат выкатной (Ввод)',
        });
      }
    }

    if (runnDguInputCell.meterType) {
      const meterMaterial = meterMaterials.find((m) => m.name === runnDguInputCell.meterType);
      if (meterMaterial) {
        allMaterials.push({
          name: runnDguInputCell.meterType,
          price:
            typeof meterMaterial.price === 'string'
              ? parseFloat(meterMaterial.price)
              : meterMaterial.price,
          quantity: runnDguInputCell.quantity || 1,
          unit: meterMaterial.unit,
          type: 'ПУ (Ввод)',
        });
      }
    }

    // Добавляем материалы из отходящих ячеек
    runnDguCells.forEach((cell, idx) => {
      if (cell.breaker) {
        const breakerMaterial = categoryMaterials.find((m) => m.name === cell.breaker);
        if (breakerMaterial) {
          allMaterials.push({
            name: cell.breaker,
            price:
              typeof breakerMaterial.price === 'string'
                ? parseFloat(breakerMaterial.price)
                : breakerMaterial.price,
            quantity: cell.quantity || 1,
            unit: breakerMaterial.unit,
            type: `Автомат выкатной (Отходящая ${idx + 1})`,
          });
        }
      }

      if (cell.meterType) {
        const meterMaterial = meterMaterials.find((m) => m.name === cell.meterType);
        if (meterMaterial) {
          allMaterials.push({
            name: cell.meterType,
            price:
              typeof meterMaterial.price === 'string'
                ? parseFloat(meterMaterial.price)
                : meterMaterial.price,
            quantity: cell.quantity || 1,
            unit: meterMaterial.unit,
            type: `ПУ (Отходящая ${idx + 1})`,
          });
        }
      }
    });

    if (allMaterials.length === 0) {
      return null;
    }

    const totalSum = allMaterials.reduce(
      (sum, material) => sum + material.price * material.quantity,
      0
    );

    return (
      <div className="mt-6 p-4 bg-blue-50 rounded border">
        <h4 className="text-sm font-medium text-blue-800 mb-3">
          Общая сводка материалов РУНН-ДГУ:
        </h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-blue-200">
                <th className="text-left py-1 px-2">Тип</th>
                <th className="text-left py-1 px-2">Наименование</th>
                <th className="text-right py-1 px-2">Цена (₸)</th>
                <th className="text-center py-1 px-2">Кол-во</th>
                <th className="text-right py-1 px-2">Сумма (₸)</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map((material, index) => (
                <tr key={index} className="border-b border-blue-100">
                  <td className="py-1 px-2 text-blue-600">{material.type}</td>
                  <td className="py-1 px-2 font-medium">{material.name}</td>
                  <td className="py-1 px-2 text-right">{material.price.toLocaleString()}</td>
                  <td className="py-1 px-2 text-center">{material.quantity}</td>
                  <td className="py-1 px-2 text-right font-medium">
                    {(material.price * material.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
              <tr className="bg-blue-100 font-medium">
                <td colSpan={4} className="py-1 px-2 text-right">
                  Общий итог:
                </td>
                <td className="py-1 px-2 text-right">{totalSum.toLocaleString()} ₸</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Специальная функция для рендеринга ячеек РУНН-ДГУ с ограниченными полями
  const renderRunnDguCellConfig = (
    cell: RunnCell & {
      update: (field: keyof RunnCell, val: string | number) => void;
      remove: () => void;
    }
  ) => {
    const renderSelectBlock = (
      label: string,
      value: string,
      onChange: (v: string) => void,
      options: string[],
      isAutoSelected?: boolean,
      isReadOnly?: boolean
    ) => (
      <div className="flex flex-col gap-1 min-w-[120px]">
        <span className="text-xs font-medium text-[#3A55DF]">
          {label}
          {isAutoSelected && (
            <span className="ml-1 text-green-600 text-[10px]">(авто)</span>
          )}
        </span>
        {isReadOnly ? (
          <div className="border border-green-300 bg-green-50 rounded px-2 py-1 text-sm text-gray-700 cursor-not-allowed">
            {value || "—"}
          </div>
        ) : (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF] ${
              isAutoSelected 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300'
            }`}
          >
            <option value="">—</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )}
      </div>
    );

    return (
      <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
        {renderSelectBlock(
          'Автомат выкатной',
          cell.breaker,
          (val) => cell.update('breaker', val),
          breakerOptions,
          cell.purpose === 'РУНН-ДГУ-Ввод' && autoSelectedMaterial && cell.breaker === autoSelectedMaterial.name,
          cell.purpose === 'РУНН-ДГУ-Ввод' // Только для чтения в ячейке Ввод
        )}

        {renderSelectBlock(
          'ПУ',
          cell.meterType ?? '',
          (val) => cell.update('meterType', val),
          meterOptions
        )}

        <div className="flex flex-col gap-1 min-w-[100px]">
          <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
          <input
            type="number"
            min={1}
            value={cell.quantity || 1}
            onChange={(e) => cell.update('quantity', Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          />
        </div>

        <button
          onClick={cell.remove}
          className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
          title="Удалить ячейку"
        >
          ✕
        </button>
      </div>
    );
  };

  return (
    <div className="mt-6">
      {!showRunnDgu ? (
        <button
          onClick={() => setShowRunnDgu(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
        >
          + Добавить РУНН-ДГУ
        </button>
      ) : (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">РУНН-ДГУ</h3>

          {/* Блок общих настроек */}
          <TogglerWithInput label="Общие настройки" defaultEnabled>
            <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
              <div className="flex flex-col gap-1 min-w-[150px]">
                <span className="text-xs font-medium text-[#3A55DF]">
                  Номинальная мощность (кВА)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={runnDguSettings.nominalPowerKva || ''}
                  onChange={(e) =>
                    setRunnDguSettings((prev) => ({
                      ...prev,
                      nominalPowerKva: Number(e.target.value) || 0,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-xs font-medium text-[#3A55DF]">Цена (₸)</span>
                <input
                  type="number"
                  min={0}
                  value={runnDguSettings.price || ''}
                  onChange={(e) =>
                    setRunnDguSettings((prev) => ({
                      ...prev,
                      price: Number(e.target.value) || 0,
                    }))
                  }
                  className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
                  placeholder="0"
                />
              </div>

              <div className="flex flex-col gap-1 min-w-[150px]">
                <span className="text-xs font-medium text-[#3A55DF]">Номинальный ток (А)</span>
                <div className="border border-gray-300 rounded px-2 py-1 text-sm bg-gray-50 text-gray-700">
                  {nominalCurrent.toFixed(2)} А
                </div>
              </div>
            </div>

            {/* Блок автоматического выбора материала */}
            {autoSelectedMaterial && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                <h4 className="text-sm font-medium text-green-800 mb-2">
                  Автоматический выбор материала для ячейки Ввод:
                </h4>
                <div className="space-y-1">
                  <div className="text-xs text-green-700">
                    Номинальная мощность: <span className="font-medium">{runnDguSettings.nominalPowerKva} кВА</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Рекомендуемый ток для ввода: <span className="font-medium">{nominalCurrent.toFixed(2)} А</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Автоматически выбран: <span className="font-medium">{autoSelectedMaterial.name}</span>
                  </div>
                  <div className="text-xs text-green-700">
                    Цена: <span className="font-medium">
                      {typeof autoSelectedMaterial.price === 'string' 
                        ? parseFloat(autoSelectedMaterial.price).toLocaleString() 
                        : autoSelectedMaterial.price.toLocaleString()
                      } ₸
                    </span>
                  </div>
                </div>
              </div>
            )}
          </TogglerWithInput>

          <TogglerWithInput label="РУНН-ДГУ: Ввод" defaultEnabled>
            {renderRunnDguCellConfig({
              ...runnDguInputCell,
              update: (field: keyof RunnCell, val: string | number) => {
                // Обновляем состояние для ячейки ввода
                setRunnDguInputCell((prev) => ({
                  ...prev,
                  [field]: val,
                }));
              },
              remove: () => {},
            })}
            <MaterialSummaryTable cell={runnDguInputCell} />
          </TogglerWithInput>

          <TogglerWithInput label="РУНН-ДГУ: Отходящие">
            {runnDguCells.map((cell, idx) => (
              <div key={cell.id} className="mb-2">
                <span className="block text-sm text-gray-500 font-medium mb-1">
                  РУНН-ДГУ Отходящая {idx + 1}
                </span>
                {renderRunnDguCellConfig({
                  ...cell,
                  update: (field: keyof RunnCell, val: string | number) => {
                    const updated = [...runnDguCells];
                    const cell = updated[idx];
                    if (cell) {
                      switch (field) {
                        case 'breaker':
                          cell.breaker = val as string;
                          break;
                        case 'meterType':
                          cell.meterType = val as string;
                          break;
                        case 'quantity':
                          cell.quantity = val as number;
                          break;
                        case 'nominalPower':
                          cell.nominalPower = val as number;
                          break;
                        case 'price':
                          cell.price = val as number;
                          break;
                        case 'rza':
                          cell.rza = val as string;
                          break;
                        case 'ctRatio':
                          cell.ctRatio = val as string;
                          break;
                      }
                    }
                    setRunnDguCells(updated);
                  },
                  remove: () => {
                    const updated = runnDguCells.filter((_, i) => i !== idx);
                    setRunnDguCells(updated);
                  },
                })}
                <MaterialSummaryTable cell={cell} />
              </div>
            ))}

            <button
              onClick={() =>
                setRunnDguCells((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    purpose: 'РУНН-ДГУ-Отходящая',
                    breaker: '',
                    rza: '',
                    ctRatio: '',
                    meterType: '',
                    quantity: 1,
                  },
                ])
              }
              className="mt-2 px-3 py-1 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm"
            >
              + Добавить ещё отходящую
            </button>
          </TogglerWithInput>
          <RunnDguTotalSummary />
        </div>
      )}
    </div>
  );
}
