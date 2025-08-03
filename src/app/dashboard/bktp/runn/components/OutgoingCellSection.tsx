'use client';

import { useState } from 'react';
import { useRunnStore } from '@/store/useRunnStore';
import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../TogglerWithInput';

interface OutgoingCellSectionProps {
  categoryMaterials?: Material[];
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
}

export default function OutgoingCellSection({
  categoryMaterials = [],
  meterMaterials = [],
  meterMaterialsLoading = false,
}: OutgoingCellSectionProps) {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();

  // Создаем опции автоматов из реальных материалов
  const breakerOptions = categoryMaterials.map((material) => material.name);
  // Создаем опции для ПУ из материалов счетчика
  const meterOptions = meterMaterials.map((material) => material.name);

  // Опции коммутационных аппаратов
  const switchingDeviceOptions = ['Воздушный', 'Литой корпус', 'Литой корпус + Рубильник', 'РПС'];

  // Получаем все отходящие ячейки
  const outgoingCells = cellConfigs.filter((c) => c.purpose === 'Отходящая');
  const isOpen = outgoingCells.length > 0;

  // Компонент для отображения сводки материалов
  const MaterialSummaryTable = ({ cell }: { cell: RunnCell }) => {
    const selectedMaterials = [];

    // Добавляем коммутационный аппарат
    if (cell.switchingDevice) {
      selectedMaterials.push({
        name: cell.switchingDevice,
        price: 0, // Пока без цены, можно добавить позже
        quantity: cell.quantity || 1,
        unit: 'шт',
        type: 'Коммутационный аппарат',
      });
    }

    // Добавляем автомат выкатной
    if (cell.breaker) {
      const breakerMaterial = categoryMaterials.find((m) => m.name === cell.breaker);
      if (breakerMaterial) {
        selectedMaterials.push({
          name: cell.breaker,
          price:
            typeof breakerMaterial.price === 'string'
              ? parseFloat(breakerMaterial.price)
              : breakerMaterial.price,
          quantity: cell.quantity || 1,
          unit: breakerMaterial.unit,
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
                  <td className="py-1 px-2 text-right">
                    {material.price > 0 ? material.price.toLocaleString() : '—'}
                  </td>
                  <td className="py-1 px-2 text-center">{material.quantity}</td>
                  <td className="py-1 px-2 text-right font-medium">
                    {material.price > 0
                      ? (material.price * material.quantity).toLocaleString()
                      : '—'}
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

  // Компонент для общей сводки всех отходящих ячеек
  const OutgoingCellsTotalSummary = () => {
    const allMaterials = [];

    // Собираем материалы из всех отходящих ячеек
    outgoingCells.forEach((cell, idx) => {
      // Добавляем коммутационный аппарат
      if (cell.switchingDevice) {
        allMaterials.push({
          name: cell.switchingDevice,
          price: 0, // Пока без цены
          quantity: cell.quantity || 1,
          unit: 'шт',
          type: `Отходящая ${idx + 1} - Коммутационный аппарат`,
        });
      }

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
            type: `Отходящая ${idx + 1} - Автомат выкатной`,
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
            type: `Отходящая ${idx + 1} - ПУ`,
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
      <div className="mt-4 p-4 bg-orange-50 rounded border">
        <h4 className="text-sm font-medium text-orange-800 mb-3">Сводка всех отходящих ячеек:</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-orange-200">
                <th className="text-left py-1 px-2">Тип</th>
                <th className="text-left py-1 px-2">Наименование</th>
                <th className="text-right py-1 px-2">Цена (₸)</th>
                <th className="text-center py-1 px-2">Кол-во</th>
                <th className="text-right py-1 px-2">Сумма (₸)</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map((material, index) => (
                <tr key={index} className="border-b border-orange-100">
                  <td className="py-1 px-2 text-orange-600">{material.type}</td>
                  <td className="py-1 px-2 font-medium">{material.name}</td>
                  <td className="py-1 px-2 text-right">
                    {material.price > 0 ? material.price.toLocaleString() : '—'}
                  </td>
                  <td className="py-1 px-2 text-center">{material.quantity}</td>
                  <td className="py-1 px-2 text-right font-medium">
                    {material.price > 0
                      ? (material.price * material.quantity).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
              <tr className="bg-orange-100 font-medium">
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

  // Функция для рендеринга логики в зависимости от выбранного коммутационного аппарата
  const renderSwitchingDeviceLogic = (
    cell: RunnCell & {
      update: (field: keyof RunnCell, val: string | number) => void;
      remove: () => void;
    }
  ) => {
    const switchingDevice = cell.switchingDevice;

    switch (switchingDevice) {
      case 'Воздушный':
        return (
          <div className="p-3 bg-blue-50 rounded border">
            <h5 className="text-sm font-medium text-blue-800 mb-2">
              Логика для Воздушного аппарата:
            </h5>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• Используется для воздушных линий</p>
              <p>• Номинальный ток: до 630А</p>
              <p>• Напряжение: 0.4кВ</p>
              <p>• Требуется дополнительная защита</p>
            </div>
          </div>
        );

      case 'Литой корпус':
        return (
          <div className="p-3 bg-green-50 rounded border">
            <h5 className="text-sm font-medium text-green-800 mb-2">Логика для Литого корпуса:</h5>
            <div className="text-xs text-green-700 space-y-1">
              <p>• Компактная конструкция</p>
              <p>• Номинальный ток: до 1600А</p>
              <p>• Встроенная защита</p>
              <p>• Подходит для большинства применений</p>
            </div>
          </div>
        );

      case 'Литой корпус + Рубильник':
        return (
          <div className="p-3 bg-purple-50 rounded border">
            <h5 className="text-sm font-medium text-purple-800 mb-2">
              Логика для Литого корпуса + Рубильник:
            </h5>
            <div className="text-xs text-purple-700 space-y-1">
              <p>• Дополнительная изоляция</p>
              <p>• Ручное отключение</p>
              <p>• Повышенная безопасность</p>
              <p>• Для критически важных нагрузок</p>
            </div>
          </div>
        );

      case 'РПС':
        return (
          <div className="p-3 bg-orange-50 rounded border">
            <h5 className="text-sm font-medium text-orange-800 mb-2">Логика для РПС:</h5>
            <div className="text-xs text-orange-700 space-y-1">
              <p>• Рубильник с предохранителями</p>
              <p>• Экономичное решение</p>
              <p>• Простота обслуживания</p>
              <p>• Для некритичных нагрузок</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 bg-gray-50 rounded border">
            <h5 className="text-sm font-medium text-gray-800 mb-2">
              Выберите коммутационный аппарат:
            </h5>
            <div className="text-xs text-gray-700">
              <p>Выберите тип коммутационного аппарата для настройки параметров ячейки</p>
            </div>
          </div>
        );
    }
  };

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[],
    isLoading: boolean = false
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        disabled={isLoading}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  const renderCellConfig = (
    cell: RunnCell & {
      update: (field: keyof RunnCell, val: string | number) => void;
      remove: () => void;
    },
    title: string
  ) => {
    return (
      <div className="space-y-4">
        {/* Выбор коммутационного аппарата */}
        <div className="p-4 rounded bg-white border border-gray-100">
          <h4 className="text-sm font-medium text-gray-800 mb-3">Коммутационный аппарат:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {switchingDeviceOptions.map((option) => (
              <button
                key={option}
                onClick={() => cell.update('switchingDevice', option)}
                className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
                  cell.switchingDevice === option
                    ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Основные параметры ячейки */}
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          {renderSelectBlock(
            'Автомат выкатной',
            cell.breaker,
            (val) => cell.update('breaker', val),
            breakerOptions
          )}

          {renderSelectBlock(
            'ПУ',
            cell.meterType ?? '',
            (val) => cell.update('meterType', val),
            meterOptions,
            meterMaterialsLoading
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
      </div>
    );
  };

  return (
    <TogglerWithInput
      label="Ячейка: Отходящая"
      toggled={isOpen}
      onToggle={() => {
        if (!isOpen) {
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
          });
        }
      }}
    >
      {outgoingCells.map((cell, idx) => (
        <div key={cell.id} className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="block text-sm text-gray-500 font-medium">Отходящая {idx + 1}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">ID: {cell.id.slice(0, 8)}...</span>
            </div>
          </div>

          {renderCellConfig(
            {
              ...cell,
              update: (field: keyof RunnCell, val: string | number) =>
                updateCell(cell.id, field, val),
              remove: () => removeCell(cell.id),
            },
            `Отходящая ${idx + 1}`
          )}

          {renderSwitchingDeviceLogic({
            ...cell,
            update: (field: keyof RunnCell, val: string | number) =>
              updateCell(cell.id, field, val),
            remove: () => removeCell(cell.id),
          })}

          <MaterialSummaryTable cell={cell} />
        </div>
      ))}

      <button
        onClick={() =>
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
          })
        }
        className="mt-4 px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
      >
        + Добавить ещё отходящую
      </button>

      {outgoingCells.length > 0 && <OutgoingCellsTotalSummary />}
    </TogglerWithInput>
  );
}
