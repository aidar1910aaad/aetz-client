'use client';

import { useRunnStore } from '@/store/useRunnStore';
import TogglerWithInput from './TogglerWithInput';
import { useState } from 'react';

const breakerOptions = ['BA-47', 'ABB', 'Schneider', 'IEK'];
const rzaOptions = ['Нет', 'Реле защиты РН', 'Контактор', 'Пускатель'];
const meterOptions = ['Энергомера', 'Mercury', 'Нет прибора'];
const ctRatios = ['150/5', '300/5', '600/5'];

const cellTypes = ['Ввод', 'СВ', 'Отходящая'];

export default function RunnCellTable() {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const [showRunnDgu, setShowRunnDgu] = useState(false);
  const [runnDguCells, setRunnDguCells] = useState<any[]>([]);

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

  const renderCellConfig = (cell: any, title: string, isRunnDgu = false) => (
    <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
      {renderSelectBlock(
        'Выключатель',
        cell.breaker,
        (val) => cell.update('breaker', val),
        breakerOptions
      )}

      {isRunnDgu &&
        renderSelectBlock('РЗА', cell.rza ?? '', (val) => cell.update('rza', val), rzaOptions)}

      {isRunnDgu &&
        renderSelectBlock('ТТ', cell.ctRatio ?? '', (val) => cell.update('ctRatio', val), ctRatios)}

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
      addCell({ id: newId, purpose: type, breaker: 'BA-47', quantity: 1 });
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
                  addCell({ purpose: 'Отходящая', breaker: 'BA-47', meterType: '', quantity: 1 });
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
                    {renderCellConfig(
                      {
                        ...cell,
                        update: (field: string, val: any) => updateCell(cell.id, field, val),
                        remove: () => removeCell(cell.id),
                      },
                      `Отходящая ${idx + 1}`
                    )}
                  </div>
                ))}

              <button
                onClick={() =>
                  addCell({ purpose: 'Отходящая', breaker: 'BA-47', meterType: '', quantity: 1 })
                }
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
            {cell &&
              renderCellConfig(
                {
                  ...cell,
                  update: (field: string, val: any) => updateCell(cell.id, field, val),
                  remove: () => removeCell(cell.id),
                },
                type
              )}
          </TogglerWithInput>
        );
      })}

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

            <TogglerWithInput label="РУНН-ДГУ: Ввод" defaultEnabled>
              {renderCellConfig(
                {
                  id: 'runn-dgu-input',
                  purpose: 'РУНН-ДГУ-Ввод',
                  breaker: '',
                  meterType: '',
                  quantity: 1,
                  update: () => {},
                  remove: () => {},
                },
                'РУНН-ДГУ Ввод',
                false
              )}
            </TogglerWithInput>

            <TogglerWithInput label="РУНН-ДГУ: Отходящие">
              {runnDguCells.map((cell, idx) => (
                <div key={cell.id} className="mb-2">
                  <span className="block text-sm text-gray-500 font-medium mb-1">
                    РУНН-ДГУ Отходящая {idx + 1}
                  </span>
                  {renderCellConfig(
                    {
                      ...cell,
                      update: (field: string, val: any) => {
                        const updated = [...runnDguCells];
                        updated[idx][field] = val;
                        setRunnDguCells(updated);
                      },
                      remove: () => {
                        const updated = runnDguCells.filter((_, i) => i !== idx);
                        setRunnDguCells(updated);
                      },
                    },
                    `РУНН-ДГУ Отходящая ${idx + 1}`,
                    true
                  )}
                </div>
              ))}

              <button
                onClick={() =>
                  setRunnDguCells((prev) => [
                    ...prev,
                    {
                      id: crypto.randomUUID(),
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
          </div>
        )}
      </div>
    </div>
  );
}
