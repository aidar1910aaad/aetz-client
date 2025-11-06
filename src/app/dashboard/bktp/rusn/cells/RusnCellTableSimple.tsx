import React, { useState } from 'react';
import { useCellManager } from '@/hooks/useCellManager';
import { useMaterialUpdater } from '@/hooks/useMaterialUpdater';
import { getCellTypesForGroup } from '@/config/cellTypeConfigs';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import RusnCell from './RusnCell';
import { useRusnStore } from '@/store/useRusnStore';

function TogglerWithInput({
  label,
  children,
  defaultEnabled = false,
  toggled,
  onToggle,
}: {
  label: string;
  children: React.ReactNode;
  defaultEnabled?: boolean;
  toggled?: boolean;
  onToggle?: () => void;
}) {
  const isEnabled = toggled !== undefined ? toggled : defaultEnabled;

  return (
    <div className="border rounded-lg">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <span className="font-medium text-gray-900">{label}</span>
        <div className="flex items-center space-x-2">
          <span className={`text-sm px-2 py-1 rounded ${isEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
            {isEnabled ? 'Да' : 'Нет'}
          </span>
        </div>
      </div>
      {isEnabled && <div className="px-4 py-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function RusnCellTableSimple() {
  const { cellConfigs, addCell, updateCell, materials, global } = useCellManager();
  useMaterialUpdater(); // Автоматически обновляет материалы
  
  const [openCellMap, setOpenCellMap] = useState<Record<string, string>>({});
  const [deletedCells, setDeletedCells] = useState<Set<string>>(new Set());
  const { removeCellSummary } = useRusnStore();
  const { calculations } = useRusnCalculation();

  // Получаем типы ячеек для выбранной группы
  const cellTypes = getCellTypesForGroup(global.bodyType || 'Камера КСО А12-10');

  const handleToggle = (type: string) => {
    const isOpen = !!openCellMap[type];
    
    if (isOpen) {
      // Закрываем ячейку
      setOpenCellMap(prev => {
        const newMap = { ...prev };
        delete newMap[type];
        return newMap;
      });
      setDeletedCells(prev => new Set([...prev, type]));
    } else {
      // Открываем ячейку
      const existingCell = cellConfigs.find(cell => cell.purpose === type);
      if (existingCell) {
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
    const outgoingCell = {
      purpose: 'Отходящая',
      cellType: global.bodyType || '',
      count: 2,
      totalPrice: 0,
    };
    addCell(outgoingCell);
  };

  const handleRemove = (cellId: string) => {
    removeCellSummary(cellId);
    // Удаляем из openCellMap
    const cellType = cellConfigs.find(cell => cell.id === cellId)?.purpose;
    if (cellType) {
      setOpenCellMap(prev => {
        const newMap = { ...prev };
        delete newMap[cellType];
        return newMap;
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-lg font-semibold text-gray-900">
        Ячейки
      </div>
      
      <div className="text-sm text-gray-600 mb-4">
        Тип ячеек: {global.bodyType}
        <br />
        Все ячейки будут созданы с выбранным типом
      </div>

      <div className="space-y-4">
        {cellTypes.map((cellType) => {
          const existingCell = cellConfigs.find(cell => cell.purpose === cellType);
          const isOpen = !!openCellMap[cellType];
          const isDeleted = deletedCells.has(cellType);

          return (
            <TogglerWithInput
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
                  groupSlug=""
                  selectedGroupName=""
                  selectedCalculationName=""
                />
              )}
            </TogglerWithInput>
          );
        })}

        {/* Кнопка добавления отходящей ячейки */}
        <div className="flex justify-center">
          <button
            onClick={handleAddOutgoing}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Добавить отходящую
          </button>
        </div>
      </div>
    </div>
  );
}
