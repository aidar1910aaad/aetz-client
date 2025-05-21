'use client';

import { useRusnStore } from '@/store/useRusnStore';
import TogglerWithInput from './TogglerWithInput';
import { useState, useEffect } from 'react';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import RusnCell from './components/RusnCell';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import RusnSummaryTable from './components/RusnSummaryTable';

const cellTypes = ['Ввод', 'СВ', 'СР', 'ТР', 'Отходящая', 'ТН', 'ТСН'];

export default function RusnCellTable() {
  const { cellConfigs, addCell, updateCell, removeCell } = useRusnStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const { materials, loading, error: materialsError } = useRusnMaterials();
  const { groups, loading: groupsLoading, error: groupsError } = useCalculationGroups();
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>('');
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [selectedCalculationName, setSelectedCalculationName] = useState<string>('');
  const { calculations, loading: calculationsLoading, error: calculationsError, calculateCellTotal } = useRusnCalculation(selectedGroupSlug);

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      removeCell(id);
      setOpenCellMap(prev => {
        const newMap = { ...prev };
        delete newMap[type];
        return newMap;
      });
    } else {
      addCell({ purpose: type, breaker: '', count: 1 });
      const newCell = cellConfigs.find(cell => cell.purpose === type);
      if (newCell) {
        setOpenCellMap(prev => ({
          ...prev,
          [type]: newCell.id
        }));
      }
    }
  };

  // Синхронизируем openCellMap с cellConfigs
  useEffect(() => {
    const newOpenCellMap: Record<string, string> = {};
    cellConfigs.forEach(cell => {
      if (cell.purpose !== 'Отходящая') {
        newOpenCellMap[cell.purpose] = cell.id;
      }
    });
    setOpenCellMap(newOpenCellMap);
  }, [cellConfigs]);

  if (loading || groupsLoading || calculationsLoading) {
    return <div>Загрузка...</div>;
  }

  if (materialsError || groupsError || calculationsError) {
    return (
      <div className="text-red-600 p-4 rounded bg-red-50">
        <h3 className="font-medium mb-2">Произошла ошибка:</h3>
        {materialsError && <p>{materialsError}</p>}
        {groupsError && <p>{groupsError}</p>}
        {calculationsError && <p>{calculationsError}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Тип ячейки
        </label>
        <select
          value={selectedGroupSlug}
          onChange={(e) => {
            setSelectedGroupSlug(e.target.value);
            const group = groups.find(g => g.slug === e.target.value);
            setSelectedGroupName(group?.name || '');
          }}
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
        >
          <option value="">Выберите тип ячейки</option>
          {groups.map((group) => (
            <option key={group.id} value={group.slug}>
              {group.name}
            </option>
          ))}
        </select>
      </div>

      {selectedGroupSlug && calculations.cell.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Калькуляция ячейки
          </label>
          <select
            value={cellConfigs[0]?.calculationId || ''}
            onChange={(e) => {
              const calculationId = Number(e.target.value);
              const calculation = calculations.cell.find(c => c.id === calculationId);
              setSelectedCalculationName(calculation?.name || '');
              cellConfigs.forEach(cell => {
                updateCell(cell.id, 'calculationId', calculationId);
              });
            }}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
          >
            <option value="">Выберите калькуляцию</option>
            {calculations.cell.map((calc) => (
              <option key={calc.id} value={calc.id}>
                {calc.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {cellTypes.map((type) => {
        if (type === 'Отходящая') {
          const outgoingCells = cellConfigs.filter((c) => c.purpose === 'Отходящая');

          return (
            <TogglerWithInput
              key="Отходящая"
              label="Ячейка: Отходящая"
              toggled={outgoingCells.length > 0}
              onToggle={() => {
                if (outgoingCells.length === 0) {
                  addCell({ purpose: 'Отходящая', breaker: '', count: 1 });
                  const newCell = cellConfigs.find(cell => cell.purpose === 'Отходящая');
                  if (newCell) {
                    setOpenCellMap(prev => ({
                      ...prev,
                      ['Отходящая']: newCell.id
                    }));
                  }
                } else {
                  outgoingCells.forEach(cell => {
                    removeCell(cell.id);
                  });
                  setOpenCellMap(prev => {
                    const newMap = { ...prev };
                    delete newMap['Отходящая'];
                    return newMap;
                  });
                }
              }}
            >
              {outgoingCells.map((cell, idx) => (
                <div key={cell.id} className="mb-2">
                  <span className="block text-sm text-gray-500 font-medium mb-1">
                    Отходящая {idx + 1}
                  </span>
                  <RusnCell
                    cell={cell}
                    materials={materials}
                    onUpdate={updateCell}
                    onRemove={removeCell}
                    groupSlug={selectedGroupSlug}
                    selectedGroupName={selectedGroupName}
                    selectedCalculationName={selectedCalculationName}
                  />
                </div>
              ))}

              <button
                onClick={() => addCell({ purpose: 'Отходящая', breaker: '', count: 1 })}
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
            {cell && (
              <RusnCell
                cell={cell}
                materials={materials}
                onUpdate={updateCell}
                onRemove={removeCell}
                groupSlug={selectedGroupSlug}
                selectedGroupName={selectedGroupName}
                selectedCalculationName={selectedCalculationName}
              />
            )}
          </TogglerWithInput>
        );
      })}

      {cellConfigs.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Общая сумма</h3>
          <div className="space-y-2">
            {cellConfigs.map((cell, index) => {
              const cellCalculation = calculations.cell.find(c => c.name === selectedCalculationName);
              if (!cellCalculation) return null;
              
              const rows = [];
              
              if (cell.breaker) {
                const breaker = materials.breaker.find(m => m.id.toString() === cell.breaker);
                if (breaker) {
                  const price = Number(breaker.price) * (cell.count || 1);
                  rows.push({
                    name: `${cell.purpose} ${cellCalculation.name} Выключатель: ${breaker.name}`,
                    price: price
                  });
                }
              }
              
              if (cell.rza) {
                const rza = materials.rza.find(m => m.id.toString() === cell.rza);
                if (rza) {
                  const price = Number(rza.price) * (cell.count || 1);
                  rows.push({
                    name: `${cell.purpose} ${cellCalculation.name} РЗА: ${rza.name}`,
                    price: price
                  });
                }
              }
              
              if (cell.meterType) {
                const meter = materials.meter.find(m => m.id.toString() === cell.meterType);
                if (meter) {
                  const price = Number(meter.price) * (cell.count || 1);
                  rows.push({
                    name: `${cell.purpose} ${cellCalculation.name} Счетчик: ${meter.name}`,
                    price: price
                  });
                }
              }

              return rows.map((row, rowIndex) => (
                <div key={`${cell.id}-${rowIndex}`} className="flex justify-between items-center">
                  <div className="text-gray-600">
                    {row.name}
                  </div>
                  <div className="text-lg font-semibold text-[#3A55DF]">
                    {row.price.toLocaleString('ru-RU')} ₸
                  </div>
                </div>
              ));
            })}
            
            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <div className="text-lg font-medium text-gray-900">Итого:</div>
              <div className="text-2xl font-bold text-[#3A55DF]">
                {cellConfigs.reduce((total, cell) => {
                  const cellCalculation = calculations.cell.find(c => c.name === selectedCalculationName);
                  if (!cellCalculation) return total;
                  
                  let cellTotal = 0;
                  
                  if (cell.breaker) {
                    const breaker = materials.breaker.find(m => m.id.toString() === cell.breaker);
                    if (breaker) {
                      cellTotal += Number(breaker.price) * (cell.count || 1);
                    }
                  }
                  
                  if (cell.rza) {
                    const rza = materials.rza.find(m => m.id.toString() === cell.rza);
                    if (rza) {
                      cellTotal += Number(rza.price) * (cell.count || 1);
                    }
                  }
                  
                  if (cell.meterType) {
                    const meter = materials.meter.find(m => m.id.toString() === cell.meterType);
                    if (meter) {
                      cellTotal += Number(meter.price) * (cell.count || 1);
                    }
                  }
                  
                  return total + cellTotal;
                }, 0).toLocaleString('ru-RU')} ₸
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
