import React, { useState } from 'react';
import { RusnCell as RusnCellType, useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { getCellFieldConfig, RusnMaterials, formatCellDescription } from '@/utils/rusnMaterials';
import { useCellCalculation } from '@/hooks/useCellCalculation';
import MaterialSelect from './MaterialSelect';
import DisconnectorTypeSelector from './DisconnectorTypeSelector';

// Компонент QuantityInput
interface QuantityInputProps {
  cell: RusnCellType;
  onUpdate: (id: string, field: keyof RusnCellType, value: RusnCellType[keyof RusnCellType]) => void;
}

function QuantityInput({ cell, onUpdate }: QuantityInputProps) {
  return (
    <div className="flex flex-col gap-1 min-w-[100px]">
      <span className="text-xs font-medium text-[#3A55DF]">Кол-во</span>
      <input
        type="number"
        min={1}
        value={cell.count || 1}
        onChange={(e) => onUpdate(cell.id, 'count', Number(e.target.value))}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
      />
    </div>
  );
}

// Компонент CellActionButtons
interface CellActionButtonsProps {
  cell: RusnCellType;
  onRemove: (id: string) => void;
}

function CellActionButtons({ cell, onRemove }: CellActionButtonsProps) {
  return (
    <div className="flex gap-2 ml-auto">
      {cell.purpose === 'Отходящая' && (
        <button
          onClick={() => onRemove(cell.id)}
          className="flex items-center justify-center w-10 h-10 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
          title="Удалить ячейку"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
import CellSummaryTable from '../calculations/CellSummaryTable';
import CellCalculationDetails from '../calculations/CellCalculationDetails';
import DebugPanel from '../debug/DebugPanel';

interface Props {
  cell: RusnCellType;
  materials: RusnMaterials;
  onUpdate: (
    id: string,
    field: keyof RusnCellType,
    value: RusnCellType[keyof RusnCellType]
  ) => void;
  onRemove: (id: string) => void;
  groupSlug: string;
  selectedGroupName: string;
  selectedCalculationName: string;
  calculations?: {
    cell: Array<{
      id: number;
      name: string;
      slug: string;
      data: {
        categories: Array<{
          name: string;
          items: Array<{
            id: number | null;
            name: string;
            unit: string;
            price: number;
            quantity: number;
          }>;
        }>;
        calculation?: {
          manufacturingHours?: number;
          hourlyRate?: number;
          overheadPercentage?: number;
          adminPercentage?: number;
          plannedProfitPercentage?: number;
          ndsPercentage?: number;
        };
        cellConfig?: {
          type?: string;
          materials?: Record<string, unknown>;
        };
      };
    }>;
  };
}

export default function RusnCell({
  cell,
  materials,
  onUpdate,
  onRemove,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
  calculations,
}: Props) {
  // Проверяем, что ячейка существует
  if (!cell) {
    return null;
  }

  const { materials: rusnMaterials, loading: materialsLoading } = useRusnMaterials();
  const { global } = useRusnStore();
  
  // Обертываем onUpdate для логирования
  const handleUpdate = (id: string, field: keyof RusnCellType, value: RusnCellType[keyof RusnCellType]) => {
    onUpdate(id, field, value);
  };
  
  // Проверяем, нужно ли показать селектор типа разъединителя
  // Показываем селектор для камеры КСО 366 когда cellType пустой или равен 'Камера КСО 366'
  const needsDisconnectorTypeSelection = 
    cell.purpose === 'Секционный разьединитель' && 
    global.bodyType === 'Камера КСО 366' &&
    (cell.cellType === '' || cell.cellType === 'Камера КСО 366');


  const handleDisconnectorTypeSelect = (type: 'kso-13' | 'kso-shmr') => {
    if (type === 'kso-13') {
      handleUpdate(cell.id, 'cellType', 'Камера КСО 366-13');
      // Принудительно обновляем расчеты
      handleUpdate(cell.id, 'totalPrice', 0);
    } else if (type === 'kso-shmr') {
      // Для КСО 366 ШМР обновляем тип ячейки и сбрасываем расчеты
      handleUpdate(cell.id, 'cellType', 'Камера КСО 366 ШМР 14, 15');
      // Принудительно обновляем расчеты
      handleUpdate(cell.id, 'totalPrice', 0);
    }
  };
  

  const { total, currentCalculation, calculations: cellCalculations, rzaCalculation, foundCalculations, dj8hLBreakdown } =
    useCellCalculation({
      cell,
      materials,
      groupSlug,
      selectedGroupName,
      selectedCalculationName,
      onUpdate: handleUpdate,
    });
    
  // Отладка для Siemens 8DJH
  if (cell.purpose === 'Камера Siemens 8DJH') {
    console.log('[RusnCell] Siemens 8DJH - total из useCellCalculation:', total);
  }



  const { setCellSummary, removeCellSummary, cellSummaries } = useRusnStore();

  // Обновляем totalPrice ячейки при изменении total
  React.useEffect(() => {
    
    if (total !== cell.totalPrice) {
      onUpdate(cell.id, 'totalPrice', total);
    }
  }, [total, cell.totalPrice, cell.id, onUpdate]);

  // Сохраняем summary данные ячейки в store
  React.useEffect(() => {
    // Для секционных разъединителей КСО 366 добавляем в сводку только если есть cellType
    const shouldAddToSummary = total > 0 && 
      (cell.purpose !== 'Секционный разьединитель' || 
       selectedGroupName !== 'Камера КСО 366' || 
       cell.cellType);
    
    if (shouldAddToSummary) {
      const cellDescription = formatCellDescription(cell, materials, global.bodyType);
      
      // Для КСО 366 ШМР создаем отдельные записи
      if (cell.cellType === 'Камера КСО 366 ШМР 14, 15' && cell.calculationBreakdown && Array.isArray(cellDescription)) {
        // Создаем отдельные записи для каждой части
        const mainSummary = {
          cellId: `${cell.id}_main`,
          name: cellDescription[0],
          quantity: 2, // Фиксированно 2 шт для основной части
          pricePerUnit: cell.calculationBreakdown.main.price,
          totalPrice: cell.calculationBreakdown.main.price * 2,
        };
        
        const additionalSummary = {
          cellId: `${cell.id}_additional`,
          name: cellDescription[1],
          quantity: cell.count || 1,
          pricePerUnit: cell.calculationBreakdown.additional.price,
          totalPrice: cell.calculationBreakdown.additional.price * (cell.count || 1),
        };
        
        // Удаляем старые записи и создаем новые
        removeCellSummary(cell.id);
        removeCellSummary(`${cell.id}_main`);
        removeCellSummary(`${cell.id}_additional`);
        
        setCellSummary(mainSummary);
        setCellSummary(additionalSummary);
      } else if (cell.cellType !== 'Камера КСО 366 ШМР 14, 15') {
        // Обычная логика для одной записи (кроме КСО 366 ШМР)
        const pricePerUnit = total / (cell.count || 1);
        const newSummary = {
          cellId: cell.id,
          name: Array.isArray(cellDescription) ? cellDescription.join('\n') : cellDescription,
          quantity: cell.count || 1,
          pricePerUnit: pricePerUnit,
          totalPrice: total,
        };
        
        // Удаляем записи _main и _additional если они есть (для случаев когда тип камеры изменился)
        removeCellSummary(`${cell.id}_main`);
        removeCellSummary(`${cell.id}_additional`);
        
        setCellSummary(newSummary);
      }
    } else {
      // Удаляем summary если total <= 0
      removeCellSummary(cell.id);
      removeCellSummary(`${cell.id}_main`);
      removeCellSummary(`${cell.id}_additional`);
    }
    
    
  }, [
    cell.id,
    cell.cellType,
    cell.purpose,
    cell.breaker?.id,
    cell.breaker?.name,
    cell.rza?.id,
    cell.rza?.name,
    cell.transformerCurrent?.id,
    cell.transformerCurrent?.name,
    cell.meterType?.id,
    cell.meterType?.name,
    cell.transformer?.id,
    cell.transformer?.name,
    cell.transformerVoltage?.id,
    cell.transformerVoltage?.name,
    cell.transformerPower?.id,
    cell.transformerPower?.name,
    cell.count,
    cell.calculationBreakdown,
    total,
    materials,
    selectedGroupName,
    setCellSummary,
    removeCellSummary,
  ]);

  // Отдельный useEffect для очистки старых записей при изменении cellType
  React.useEffect(() => {
    if (cell.purpose === 'Секционный разьединитель' && selectedGroupName === 'Камера КСО 366') {
      // Удаляем старые записи только если cellType изменился на пустой или дефолтный
      if (!cell.cellType || cell.cellType === 'Камера КСО А12-10') {
        // Удаляем записи по названию - это более надежный способ
        const { cellSummaries } = useRusnStore.getState();
        const kso366Summaries = cellSummaries.filter(summary => 
          summary.name.includes('Камера КСО 366-14, 15') ||
          summary.name.includes('Шинный мост с разъединителем')
        );
        
        kso366Summaries.forEach(summary => {
          removeCellSummary(summary.cellId);
        });
        
        // Также удаляем по cellId на всякий случай
        removeCellSummary(cell.id);
        removeCellSummary(`${cell.id}_main`);
        removeCellSummary(`${cell.id}_additional`);
        
        // Принудительно обновляем компонент через изменение состояния
        setTimeout(() => {
          const { cellSummaries } = useRusnStore.getState();
          // Принудительно обновляем store для перерендера
          useRusnStore.setState({ cellSummaries: [...cellSummaries] });
        }, 50);
      }
    }
  }, [cell.cellType, cell.purpose, selectedGroupName, cell.id, removeCellSummary]);

  const cellFields = getCellFieldConfig(cell.purpose, rusnMaterials, cell.cellType, selectedGroupName);
  

  const handleRemove = () => {
    // Удаляем summary и саму ячейку
    removeCellSummary(cell.id);
    onRemove(cell.id);
  };

  // Проверяем, нужно ли показывать предупреждение о трансформаторе тока
  const shouldShowTTWarning = () => {
    // Не показываем предупреждение для специальных ячеек, которые не требуют ТТ
    const specialCells = ['Кабельная перемычка', 'Изоляционный адаптер', 'Камера Siemens 8DJH'];
    if (specialCells.includes(cell.purpose)) {
      return false;
    }
    
    const ttField = cellFields.find(field => field.field === 'transformerCurrent');
    return ttField && !cell.transformerCurrent;
  };

  // Убираем экран загрузки - детали ячейки отображаются сразу


  return (
    <div className="flex flex-col gap-4 animate-fade-in">
      {/* Отладочная панель */}
      <DebugPanel
        cell={cell}
        materials={rusnMaterials}
        groupSlug={groupSlug}
        selectedGroupName={selectedGroupName}
        selectedCalculationName={selectedCalculationName}
        calculations={cellCalculations}
      />
      
      {/* Селектор типа разъединителя для КСО 366 */}
      {needsDisconnectorTypeSelection && (
        <DisconnectorTypeSelector onSelect={handleDisconnectorTypeSelect} />
      )}
      
      {/* Предупреждение о трансформаторе тока */}
      {shouldShowTTWarning() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm text-yellow-800">
              <strong>Внимание:</strong> Трансформатор тока не выбран. Рекомендуется выбрать ТТ для корректного измерения тока.
            </span>
          </div>
        </div>
      )}

      {/* Специальные поля для Камера Siemens 8DJH */}
      {cell.purpose === 'Камера Siemens 8DJH' ? (
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          {/* 8DJH (R) */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-medium text-[#3A55DF]">8DJH (R)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Кол-во:</span>
              <input
                type="number"
                min="0"
                value={(cell as any).siemens8DJH_R || 0}
                onChange={(e) => handleUpdate(cell.id, 'siemens8DJH_R' as any, Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              />
            </div>
          </div>

          {/* 8DJH (L) */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-medium text-[#3A55DF]">8DJH (L)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Кол-во:</span>
              <input
                type="number"
                min="0"
                value={(cell as any).siemens8DJH_L || 0}
                onChange={(e) => handleUpdate(cell.id, 'siemens8DJH_L' as any, Number(e.target.value))}
                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3A55DF]"
              />
            </div>
          </div>

          {/* Кнопки действий */}
          <CellActionButtons cell={cell} onRemove={handleRemove} />
        </div>
      ) : cell.purpose === 'Кабельная перемычка' ? (
        /* Специальные поля для Кабельная перемычка */
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          {/* Автоматический выбор типа перемычки на основе трансформатора */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-medium text-[#3A55DF]">Тип перемычки</span>
            <div className="text-sm text-gray-600">
              {(() => {
                // Получаем трансформатор из store
                const selectedTransformer = useTransformerStore.getState().selectedTransformer;
                
                if (selectedTransformer?.voltage === '10') {
                  return 'Кабельная перемычка 10кВ';
                } else if (selectedTransformer?.voltage === '20') {
                  return 'Кабельная перемычка 20кВ';
                } else {
                  return 'Выберите трансформатор';
                }
              })()}
            </div>
          </div>

          {/* Поле количества */}
          <QuantityInput cell={cell} onUpdate={handleUpdate} />

          {/* Кнопки действий */}
          <CellActionButtons cell={cell} onRemove={handleRemove} />
        </div>
      ) : cell.purpose === 'Изоляционный адаптер' ? (
        /* Специальные поля для Изоляционный адаптер */
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          {/* Автоматический выбор типа адаптера на основе трансформатора */}
          <div className="flex flex-col gap-1 min-w-[200px]">
            <span className="text-xs font-medium text-[#3A55DF]">Тип адаптера</span>
            <div className="text-sm text-gray-600">
              {(() => {
                // Получаем трансформатор из store
                const selectedTransformer = useTransformerStore.getState().selectedTransformer;
                
                if (selectedTransformer?.voltage === '10') {
                  return 'Изоляционный адаптер 10кВ';
                } else if (selectedTransformer?.voltage === '20') {
                  return 'Изоляционный адаптер 20кВ';
                } else {
                  return 'Выберите трансформатор';
                }
              })()}
            </div>
          </div>

          {/* Поле количества */}
          <QuantityInput cell={cell} onUpdate={handleUpdate} />

          {/* Кнопки действий */}
          <CellActionButtons cell={cell} onRemove={handleRemove} />
        </div>
      ) : (
        /* Обычные поля ячейки */
        <div className="flex flex-wrap gap-4 items-end p-4 rounded bg-white border border-gray-100">
          {/* Рендерим поля на основе конфигурации */}
          {cellFields.map(({ field, label }) => {
            const fieldValue = cell[field];
            const selectedId =
              typeof fieldValue === 'object' && fieldValue !== null ? fieldValue.id : undefined;

            return (
              <MaterialSelect
                key={field}
                field={field}
                label={label}
                materials={rusnMaterials}
                cell={cell}
                selectedId={selectedId}
                onUpdate={handleUpdate}
              />
            );
          })}

          {/* Поле количества */}
          <QuantityInput cell={cell} onUpdate={handleUpdate} />

          {/* Кнопки действий */}
          <CellActionButtons cell={cell} onRemove={handleRemove} />
        </div>
      )}

      {/* Итоговая таблица */}
      <CellSummaryTable
        cell={cell}
        materials={rusnMaterials}
        selectedGroupName={selectedGroupName}
        currentCalculation={currentCalculation}
        total={total}
        isCalculating={false}
        cellType={foundCalculations.cellType}
        dj8hLBreakdown={dj8hLBreakdown}
        onClearCell={() => {
          handleUpdate(cell.id, 'cellType', '');
          handleUpdate(cell.id, 'totalPrice', 0);
        }}
      />

      {/* Детальная информация о расчетах */}
      <CellCalculationDetails
        cell={cell}
        materials={rusnMaterials}
        currentCalculation={currentCalculation}
        calculations={calculations}
        rzaCalculation={rzaCalculation}
        foundCalculations={foundCalculations}
      />
    </div>
  );
}
