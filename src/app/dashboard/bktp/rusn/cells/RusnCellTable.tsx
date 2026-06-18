'use client';

import React, { useState, useEffect } from 'react';
import { useCellManager } from '@/hooks/useCellManager';
import { useMaterialUpdaterWithManager } from '@/hooks/useMaterialUpdater';
import { getCellTypesForGroup } from '@/config/cellTypeConfigs';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import RusnCell from './RusnCell';
import { useRusnStore } from '@/store/useRusnStore';
import RusnMaterialsSummary from '@/components/bktp/rusn/RusnMaterialsSummary';
import CellSectionToggler from '@/components/bktp/shared/CellSectionToggler';
import { createCellByConfig } from '@/utils/autoCellUtils';
import { autoCellConfigs } from '@/config/autoCellConfigs';

const OUTGOING_CELL_PURPOSE = 'Отходящая';

export default function RusnCellTable() {
  const cellManager = useCellManager();
  const { cellConfigs, addCell, updateCell, materials, global } = cellManager;
  useMaterialUpdaterWithManager(cellManager); // Автоматически обновляет материалы
  
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`openCells_${global.bodyType}`);
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });
  const [deletedCells, setDeletedCells] = useState<Set<string>>(new Set());
  const [pendingCellType, setPendingCellType] = useState<string | null>(null);
  const { removeCellSummary, removeCell } = useRusnStore();
  
  // Получаем правильные параметры для калькуляций
  const [selectedGroupSlug, setSelectedGroupSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupSlug') || '';
    }
    return '';
  });
  const [selectedGroupName, setSelectedGroupName] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupName') || '';
    }
    return '';
  });
  const { calculations, calculateCellTotal } = useRusnCalculation(selectedGroupSlug);
  
  // Очищаем localStorage для открытых ячеек при смене типа камеры
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Очищаем все записи openCells_* кроме текущего типа камеры
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('openCells_') && key !== `openCells_${global.bodyType}`) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [global.bodyType]);
  
  

  // Обновляем параметры из localStorage при изменении global.bodyType
  useEffect(() => {
    if (global.bodyType) {
      const newSlug = localStorage.getItem('selectedGroupSlug') || '';
      const newName = localStorage.getItem('selectedGroupName') || '';
      setSelectedGroupSlug(newSlug);
      setSelectedGroupName(newName);
      
      // При смене типа камеры очищаем состояние открытых ячеек
      setOpenCellMap({});
      setDeletedCells(new Set());
    }
  }, [global.bodyType]);

  // Автоматически открываем ячейки для 8DJH
  useEffect(() => {
    if (global.bodyType === 'Камера 8DJH') {
      const newOpenCellMap: Record<string, string> = {};
      
      // Проверяем, какие ячейки существуют и автоматически открываем их
      cellConfigs.forEach(cell => {
        if (cell.purpose === 'Камера Siemens 8DJH' || 
            cell.purpose === 'Кабельная перемычка' || 
            cell.purpose === 'Изоляционный адаптер') {
          newOpenCellMap[cell.purpose] = cell.id;
        }
      });
      
      if (Object.keys(newOpenCellMap).length > 0) {
        setOpenCellMap(newOpenCellMap);
        // Сохраняем в localStorage
        localStorage.setItem(`openCells_${global.bodyType}`, JSON.stringify(newOpenCellMap));
      }
    }
  }, [global.bodyType, cellConfigs]);

  // Автоматически открываем ячейки для КСО А12-10 при наличии глобальных материалов
  useEffect(() => {
    if (global.bodyType === 'Камера КСО А12-10' && global.breaker && global.rza) {
      const newOpenCellMap: Record<string, string> = {};
      
      // Проверяем, какие ячейки существуют и автоматически открываем их
      cellConfigs.forEach(cell => {
        // Все ячейки КСО А12-10 раскрываются при наличии breaker и rza
        if (cell.purpose === 'Секционный выключатель' || 
            cell.purpose === 'Секционный разьединитель' ||
            cell.purpose === 'Ввод' || 
            cell.purpose === 'Трансформаторная' ||
            cell.purpose === OUTGOING_CELL_PURPOSE ||
            cell.purpose === 'Трансформатор напряжения' ||
            cell.purpose === 'Трансформатор собственных нужд') {
          if (cell.purpose === OUTGOING_CELL_PURPOSE) {
            newOpenCellMap[OUTGOING_CELL_PURPOSE] = 'open';
          } else {
            newOpenCellMap[cell.purpose] = cell.id;
          }
        }
      });
      
      if (Object.keys(newOpenCellMap).length > 0) {
        setOpenCellMap(newOpenCellMap);
        // Сохраняем в localStorage
        localStorage.setItem(`openCells_${global.bodyType}`, JSON.stringify(newOpenCellMap));
      }
    }
  }, [global.bodyType, global.breaker, global.rza, global.meterType, cellConfigs]);

  // Автоматически открываем ячейки для КСО 366
  useEffect(() => {
    if (global.bodyType === 'Камера КСО 366') {
      const newOpenCellMap: Record<string, string> = {};
      
      // Проверяем, какие ячейки существуют и автоматически открываем их
      cellConfigs.forEach(cell => {
        if (cell.purpose === 'Ввод' || 
            cell.purpose === 'Трансформаторная' || 
            cell.purpose === 'Отходящая' ||
            cell.purpose === 'Секционный разьединитель') {
          newOpenCellMap[cell.purpose] = cell.id;
        }
      });
      
      if (Object.keys(newOpenCellMap).length > 0) {
        setOpenCellMap(newOpenCellMap);
        // Сохраняем в localStorage
        localStorage.setItem(`openCells_${global.bodyType}`, JSON.stringify(newOpenCellMap));
      }
    }
  }, [global.bodyType, cellConfigs]);

  // Обрабатываем созданные ячейки
  useEffect(() => {
    if (pendingCellType) {
      const createdCell = cellConfigs.find(cell => cell.purpose === pendingCellType);
      if (createdCell) {
        setOpenCellMap(prev => ({ ...prev, [pendingCellType]: createdCell.id }));
        setDeletedCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(pendingCellType);
          return newSet;
        });
        setPendingCellType(null);
      }
    }
  }, [cellConfigs, pendingCellType]);


  // Сохраняем состояние открытых ячеек в localStorage (только при изменении openCellMap, не при смене типа камеры)
  useEffect(() => {
    if (typeof window !== 'undefined' && global.bodyType && Object.keys(openCellMap).length > 0) {
      localStorage.setItem(`openCells_${global.bodyType}`, JSON.stringify(openCellMap));
    }
  }, [openCellMap]);

  // Восстанавливаем состояние открытых ячеек при загрузке страницы
  useEffect(() => {
    if (typeof window !== 'undefined' && global.bodyType) {
      const savedOpenCells = localStorage.getItem(`openCells_${global.bodyType}`);
      if (savedOpenCells) {
        const parsedOpenCells = JSON.parse(savedOpenCells);
        // Проверяем, что ячейки все еще существуют
        const validOpenCells: Record<string, string> = {};
        Object.entries(parsedOpenCells).forEach(([cellType, cellId]) => {
          if (cellType === OUTGOING_CELL_PURPOSE) {
            const hasOutgoing = cellConfigs.some((cell) => cell.purpose === OUTGOING_CELL_PURPOSE);
            if (hasOutgoing) {
              validOpenCells[cellType] = 'open';
            }
            return;
          }

          const cellExists = cellConfigs.some(cell => cell.id === cellId && cell.purpose === cellType);
          if (cellExists && typeof cellId === 'string') {
            validOpenCells[cellType] = cellId;
          }
        });
        if (Object.keys(validOpenCells).length > 0) {
          setOpenCellMap(validOpenCells);
        }
      }
    }
  }, [cellConfigs, global.bodyType]);

  // Получаем типы ячеек для выбранной группы
  const cellTypes = getCellTypesForGroup(global.bodyType || 'Камера КСО А12-10');
  const staticCellTypes = cellTypes.filter((type) => type !== OUTGOING_CELL_PURPOSE);
  const outgoingCells = cellConfigs.filter((cell) => cell.purpose === OUTGOING_CELL_PURPOSE);

  const createOutgoingCell = () => {
    const config = autoCellConfigs[OUTGOING_CELL_PURPOSE];
    const count = outgoingCells.length === 0 ? config?.count ?? 2 : 1;

    if (config) {
      createCellByConfig(
        OUTGOING_CELL_PURPOSE,
        { ...config, count },
        materials,
        global,
        addCell
      );
      return;
    }

    addCell({
      purpose: OUTGOING_CELL_PURPOSE,
      cellType: global.bodyType || '',
      count,
      totalPrice: 0,
    });
  };

  const openOutgoingSection = () => {
    setOpenCellMap((prev) => ({ ...prev, [OUTGOING_CELL_PURPOSE]: 'open' }));
    setDeletedCells((prev) => {
      const next = new Set(prev);
      next.delete(OUTGOING_CELL_PURPOSE);
      return next;
    });
  };

  const handleToggle = (type: string) => {
    if (type === OUTGOING_CELL_PURPOSE) {
      const isOpen = !!openCellMap[OUTGOING_CELL_PURPOSE];

      if (isOpen) {
        outgoingCells.forEach((cell) => {
          removeCellSummary(cell.id);
          removeCell(cell.id);
        });
        setOpenCellMap((prev) => {
          const newMap = { ...prev };
          delete newMap[OUTGOING_CELL_PURPOSE];
          return newMap;
        });
        setDeletedCells((prev) => new Set([...prev, OUTGOING_CELL_PURPOSE]));
        return;
      }

      if (outgoingCells.length === 0) {
        createOutgoingCell();
      }
      openOutgoingSection();
      return;
    }

    const isOpen = !!openCellMap[type];
    const existingCell = cellConfigs.find(cell => cell.purpose === type);
    
    if (isOpen) {
      // Закрываем ячейку и удаляем из стора
      if (existingCell) {
        // Удаляем ячейку из стора
        removeCellSummary(existingCell.id);
        removeCell(existingCell.id);
        // Удаляем из openCellMap
        setOpenCellMap(prev => {
          const newMap = { ...prev };
          delete newMap[type];
          return newMap;
        });
        setDeletedCells(prev => new Set([...prev, type]));
      }
    } else {
      // Создаем ячейку, если ее нет, или открываем существующую
      if (!existingCell) {
        // Для КСО 366 и "Секционный разъединитель" создаем ячейку с выбором типа
        if (global.bodyType === 'Камера КСО 366' && type === 'Секционный разьединитель') {
          const newCell = {
            purpose: 'Секционный разьединитель',
            cellType: '', // Пустой тип, чтобы не вызывать расчеты
            count: 1,
            totalPrice: 0,
          };
          addCell(newCell);
          setPendingCellType(type);
          return;
        }
        
        // Создаем новую ячейку
        const newCell = {
          purpose: type,
          cellType: global.bodyType || '',
          count: 1,
          totalPrice: 0,
        };
        addCell(newCell);
        setPendingCellType(type);
      } else {
        // Открываем существующую ячейку
        setOpenCellMap(prev => ({ ...prev, [type]: existingCell.id }));
        setDeletedCells(prev => {
          const newSet = new Set(prev);
          newSet.delete(type);
          return newSet;
        });
      }
    }
  };

  const handleAddOutgoing = () => {
    createOutgoingCell();
    openOutgoingSection();
  };

  const handleRemove = (cellId: string) => {
    const removedCell = cellConfigs.find((cell) => cell.id === cellId);
    removeCellSummary(cellId);
    removeCell(cellId);

    if (removedCell?.purpose === OUTGOING_CELL_PURPOSE) {
      const remainingOutgoing = cellConfigs.filter(
        (cell) => cell.purpose === OUTGOING_CELL_PURPOSE && cell.id !== cellId
      );
      if (remainingOutgoing.length === 0) {
        setOpenCellMap((prev) => {
          const newMap = { ...prev };
          delete newMap[OUTGOING_CELL_PURPOSE];
          return newMap;
        });
      }
      return;
    }

    const cellType = removedCell?.purpose;
    if (cellType) {
      setOpenCellMap(prev => {
        const newMap = { ...prev };
        delete newMap[cellType];
        return newMap;
      });
    }
  };

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

      {staticCellTypes.map((cellType) => {
        const existingCell = cellConfigs.find(cell => cell.purpose === cellType);
        const isOpen = !!openCellMap[cellType];
        const isDeleted = deletedCells.has(cellType);

        // Отладочная информация для 8DJH
        if (global.bodyType === 'Камера 8DJH') {
          console.log(`[8DJH Table] Ячейка ${cellType}:`, {
            existingCell: !!existingCell,
            isOpen,
            isDeleted,
            openCellMap: openCellMap[cellType]
          });
        }

        return (
          <CellSectionToggler
            key={cellType}
            label={`Ячейка: ${cellType}`}
            toggled={isOpen && !isDeleted}
            onToggle={() => handleToggle(cellType)}
          >
            {existingCell && (
              <RusnCell
                cell={existingCell}
                materials={materials}
                onUpdate={updateCell}
                onRemove={handleRemove}
                groupSlug={selectedGroupSlug}
                selectedGroupName={selectedGroupName}
                selectedCalculationName={calculations.cell && calculations.cell.length > 0 ? calculations.cell[0].name : ''}
                calculations={calculations}
              />
            )}
          </CellSectionToggler>
        );
      })}

      {cellTypes.includes(OUTGOING_CELL_PURPOSE) && (
        <CellSectionToggler
          label={`Ячейка: ${OUTGOING_CELL_PURPOSE}`}
          toggled={!!openCellMap[OUTGOING_CELL_PURPOSE] && !deletedCells.has(OUTGOING_CELL_PURPOSE)}
          onToggle={() => handleToggle(OUTGOING_CELL_PURPOSE)}
        >
          <div className="space-y-4">
            {outgoingCells.map((cell, index) => (
              <div key={cell.id} className="space-y-4">
                {outgoingCells.length > 1 && (
                  <p className="text-xs font-medium text-gray-500">Отходящая {index + 1}</p>
                )}
                <RusnCell
                  cell={cell}
                  materials={materials}
                  onUpdate={updateCell}
                  onRemove={handleRemove}
                  groupSlug={selectedGroupSlug}
                  selectedGroupName={selectedGroupName}
                  selectedCalculationName={
                    calculations.cell && calculations.cell.length > 0
                      ? calculations.cell[0].name
                      : ''
                  }
                  calculations={calculations}
                />
              </div>
            ))}

            {outgoingCells.length > 0 && (
              <button
                type="button"
                onClick={handleAddOutgoing}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[#8eba1e]/35 bg-[#8eba1e]/5 px-4 py-3 text-sm font-medium text-[#5f7f14] transition-colors hover:border-[#8eba1e] hover:bg-[#8eba1e]/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Добавить ещё отходящую
              </button>
            )}
          </div>
        </CellSectionToggler>
      )}

      {/* Итоговая сводка */}
      <RusnMaterialsSummary title="Сводка по материалам" showClearButton={true} />
    </div>
  );
}
