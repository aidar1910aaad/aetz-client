'use client';

import { useRusnStore } from '@/store/useRusnStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import RusnCell from './components/RusnCell';
import RusnSummaryTable from './components/RusnSummaryTable';
import TogglerWithInput from './TogglerWithInput';
import { useState, useEffect } from 'react';
import { useCalculationGroups } from '@/hooks/useCalculationGroups';
import { switchgearApi } from '@/api/switchgear';

const cellTypes = [
  'Ввод',
  'Секционный выключатель',
  'Секционный разьединитель',
  'Трансформаторная',
  'Отходящая',
  'Трансформатор напряжения',
  'Трансформатор собственных нужд',
];

export default function RusnCellTable() {
  const { cellConfigs, addCell, updateCell, removeCell, global } = useRusnStore();
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const { materials, loading, error: materialsError } = useRusnMaterials();
  const { loading: groupsLoading, error: groupsError } = useCalculationGroups();
  const [selectedGroupSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupSlug') || '';
    }
    return '';
  });
  const [selectedGroupName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupName') || '';
    }
    return '';
  });
  const { calculations } = useRusnCalculation(selectedGroupSlug);

  // Фильтруем материалы по выбранным категориям
  const filteredMaterials = {
    breaker: materials.breaker,
    rza: materials.rza,
    meter: materials.meter,
    transformer: materials.transformer,
    sr: materials.sr,
    tsn: materials.tsn,
    tn: materials.tn,
    tt: materials.tt,
  };

  // Сохраняем выбранные значения в localStorage
  useEffect(() => {
    if (selectedGroupSlug) {
      localStorage.setItem('selectedGroupSlug', selectedGroupSlug);
    }
    if (selectedGroupName) {
      localStorage.setItem('selectedGroupName', selectedGroupName);
    }
  }, [selectedGroupSlug, selectedGroupName]);

  // Выводим калькуляции и настройки свитчгеар в консоль при изменении типа ячейки
  useEffect(() => {
    const fetchSwitchgearConfig = async () => {
      try {
        const configs = await switchgearApi.getAll();
        const filteredConfigs = configs.filter((config) => config.type === selectedGroupName);
        console.log('Настройки свитчгеар для типа', selectedGroupName, ':', filteredConfigs);
      } catch (error) {
        console.error('Ошибка при получении настроек:', error);
      }
    };

    if (selectedGroupName) {
      console.log('Калькуляции для типа ячейки:', selectedGroupName);
      console.log(calculations.cell);
      fetchSwitchgearConfig();
    }
  }, [selectedGroupName, calculations.cell]);

  useEffect(() => {
    const handleAddCell = (event: CustomEvent) => {
      const newCell = event.detail;
      addCell(newCell);
    };

    window.addEventListener('addCell', handleAddCell as EventListener);
    return () => {
      window.removeEventListener('addCell', handleAddCell as EventListener);
    };
  }, [addCell]);

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];

    if (isOpen) {
      const id = openCellMap[type];
      removeCell(id);
      setOpenCellMap((prev) => {
        const newMap = { ...prev };
        delete newMap[type];
        return newMap;
      });
    } else {
      addCell({
        purpose: type,
        cellType: global.bodyType || '',
        count: 1,
        totalPrice: 0,
      });
      const newCell = cellConfigs.find((cell) => cell.purpose === type);
      if (newCell) {
        setOpenCellMap((prev) => ({
          ...prev,
          [type]: newCell.id,
        }));
      }
    }
  };

  // Синхронизируем openCellMap с cellConfigs
  useEffect(() => {
    const newOpenCellMap: Record<string, string> = {};
    cellConfigs.forEach((cell) => {
      if (cell.purpose !== 'Отходящая') {
        newOpenCellMap[cell.purpose] = cell.id;
      }
    });
    setOpenCellMap(newOpenCellMap);
  }, [cellConfigs]);

  if (loading || groupsLoading) {
    return <div>Загрузка...</div>;
  }

  if (materialsError || groupsError) {
    return (
      <div className="text-red-600 p-4 rounded bg-red-50">
        <h3 className="font-medium mb-2">Произошла ошибка:</h3>
        {materialsError && <p>{materialsError}</p>}
        {groupsError && <p>{groupsError}</p>}
      </div>
    );
  }

  // Проверяем, выбран ли тип ячеек в общих настройках
  if (!global.bodyType) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-yellow-900">Сначала выберите тип ячеек</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Перейдите в раздел &quot;Общие настройки&quot; и выберите тип ячеек для продолжения
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Информация о выбранном типе ячеек */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-blue-900">Тип ячеек: {global.bodyType}</h3>
            <p className="text-sm text-blue-700 mt-1">Все ячейки будут созданы с выбранным типом</p>
          </div>
        </div>
      </div>

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
                  addCell({
                    purpose: 'Отходящая',
                    cellType: global.bodyType || '',
                    count: 1,
                    totalPrice: 0,
                  });
                  const newCell = cellConfigs.find((cell) => cell.purpose === 'Отходящая');
                  if (newCell) {
                    setOpenCellMap((prev) => ({
                      ...prev,
                      ['Отходящая']: newCell.id,
                    }));
                  }
                } else {
                  outgoingCells.forEach((cell) => {
                    removeCell(cell.id);
                  });
                  setOpenCellMap((prev) => {
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
                    materials={filteredMaterials}
                    onUpdate={(id, field, value) => {
                      updateCell(id, field, value);
                    }}
                    onRemove={removeCell}
                    groupSlug={selectedGroupSlug}
                    selectedGroupName={selectedGroupName}
                    selectedCalculationName={calculations.cell[0]?.name || ''}
                  />
                </div>
              ))}
            </TogglerWithInput>
          );
        }

        return (
          <TogglerWithInput
            key={type}
            label={`Ячейка: ${type}`}
            toggled={!!openCellMap[type]}
            onToggle={() => handleToggle(type)}
          >
            {openCellMap[type] && (
              <RusnCell
                cell={cellConfigs.find((c) => c.id === openCellMap[type])!}
                materials={filteredMaterials}
                onUpdate={(id, field, value) => {
                  updateCell(id, field, value);
                }}
                onRemove={removeCell}
                groupSlug={selectedGroupSlug}
                selectedGroupName={selectedGroupName}
                selectedCalculationName={calculations.cell[0]?.name || ''}
              />
            )}
          </TogglerWithInput>
        );
      })}

      <RusnSummaryTable
        cells={cellConfigs}
        materials={materials}
        groupSlug={selectedGroupSlug}
        selectedGroupName={selectedGroupName}
        selectedCalculationName={calculations.cell[0]?.name || ''}
      />
    </div>
  );
}
