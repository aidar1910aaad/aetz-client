'use client';

import { useRusnStore } from '@/store/useRusnStore';
import TogglerWithInput from './TogglerWithInput';
import { useState } from 'react';

const breakerOptions = ['AV-12', 'Siemens', 'Astels', 'ВНА-10/630', 'AETZ', 'Metasol', 'Sosul'];
const rzaOptions = ['РС83-А2.0', 'Миком Р112', 'Алтей', 'Сименс', 'РЗА системз', 'Шнайдер'];
const meterOptions = ['Сайман', 'Mercury', 'Меркурий', 'Нет прибора'];
const ctRatios = ['300/5', '600/5', '1000/5'];

const cellTypes = ['Ввод', 'СВ', 'СР', 'ТР', 'Отходящая', 'ТН', 'ТСН'];

export default function RusnCellTable() {
  const { cellConfigs, addCell, updateCell, removeCell } = useRusnStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});

  const renderSelectBlock = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    options: string[]
  ) => (
    <div className="flex flex-col gap-1 min-w-[120px]">
      <span className="text-xs font-medium text-[#3A55DF]">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
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

  const renderCellConfig = (cell: any, title: string) => (
    <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
      {renderSelectBlock(
        'Выключатель',
        cell.breaker,
        (val) => updateCell(cell.id, 'breaker', val),
        breakerOptions
      )}

      {cell.purpose !== 'СР' &&
        renderSelectBlock(
          'РЗА',
          cell.rza ?? '',
          (val) => updateCell(cell.id, 'rza', val),
          rzaOptions
        )}

      {cell.purpose !== 'СР' &&
        cell.purpose !== 'ТСН' &&
        cell.purpose !== 'ТН' &&
        renderSelectBlock(
          'ТТ',
          cell.ctRatio ?? '',
          (val) => updateCell(cell.id, 'ctRatio', val),
          ctRatios
        )}

      {cell.purpose !== 'СР' &&
        cell.purpose !== 'ТСН' &&
        cell.purpose !== 'ТН' &&
        cell.purpose !== 'СВ' &&
        renderSelectBlock(
          'ПУ',
          cell.meterType ?? '',
          (val) => updateCell(cell.id, 'meterType', val),
          meterOptions
        )}

      <div className="flex flex-col gap-1 min-w-[100px]">
        <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
        <input
          type="number"
          min={1}
          value={cell.quantity || 1}
          onChange={(e) => updateCell(cell.id, 'quantity', Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        />
      </div>

      <button
        onClick={() => removeCell(cell.id)}
        className="text-red-600 hover:text-red-800 text-sm font-bold ml-auto"
        title="Удалить ячейку"
      >
        ✕
      </button>
    </div>
  );

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      removeCell(id);
      setOpenCellMap((prev) => {
        const copy = { ...prev };
        delete copy[type];
        return copy;
      });
    } else {
      const newId = crypto.randomUUID();
      setOpenCellMap((prev) => ({ ...prev, [type]: newId }));
      addCell({ id: newId, purpose: type, breaker: 'AV-12', quantity: 1 });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {cellTypes.map((type) => {
        if (type === 'Отходящая') {
          const isOpen = cellConfigs.some((c) => c.purpose === 'Отходящая');

          return (
            <TogglerWithInput
              key="Отходящая"
              label="Ячейка: Отходящая"
              toggled={isOpen}
              onToggle={() => {
                if (!isOpen) {
                  addCell({ purpose: 'Отходящая', breaker: 'AV-12', quantity: 1 });
                }
              }}
            >
              {cellConfigs
                .filter((c) => c.purpose === 'Отходящая')
                .map((cell, idx) => (
                  <div key={cell.id} className="mb-2">
                    <span className="block text-sm text-gray-500 font-medium mb-1">
                      Отходящая {idx + 1}
                    </span>
                    {renderCellConfig(cell, `Отходящая ${idx + 1}`)}
                  </div>
                ))}

              <button
                onClick={() => addCell({ purpose: 'Отходящая', breaker: 'AV-12', quantity: 1 })}
                className="mt-2 px-3 py-1 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm"
              >
                + Добавить ещё
              </button>
            </TogglerWithInput>
          );
        }

        const id = openCellMap[type];
        const cell = cellConfigs.find((c) => c.id === id);

        return (
          <TogglerWithInput
            key={type}
            label={`Ячейка: ${type}`}
            toggled={!!id}
            onToggle={() => handleToggle(type)}
          >
            {cell && renderCellConfig(cell, type)}
          </TogglerWithInput>
        );
      })}
    </div>
  );
}
