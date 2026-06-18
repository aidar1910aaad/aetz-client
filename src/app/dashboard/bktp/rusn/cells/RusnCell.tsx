import React, { useState } from 'react';
import { RusnCell as RusnCellType, useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { getCellFieldConfig, RusnMaterials } from '@/utils/rusnMaterials';
import { useCellCalculation } from '@/hooks/useCellCalculation';
import MaterialSelect from './MaterialSelect';
import DisconnectorTypeSelector from './DisconnectorTypeSelector';
import CellFormGrid from '@/components/bktp/shared/CellFormGrid';
import { CellFormField, inputClassName } from '@/components/bktp/shared/CellFormField';
import { buildRusnCellSummaries, getRusnCellSummaryIds } from '@/domain/rusn/cellSummary';
import { isKsoA12BhaEligible } from '@/domain/rusn/rusnConstants';
import { getKsoA12BhaCellDescription } from '@/domain/calculation/bhaPresets';
import { useDebugPanelsEnabled } from '@/components/common/DebugToggle';

// Компонент QuantityInput
interface QuantityInputProps {
  cell: RusnCellType;
  onUpdate: (id: string, field: keyof RusnCellType, value: RusnCellType[keyof RusnCellType]) => void;
}

function QuantityInput({ cell, onUpdate }: QuantityInputProps) {
  return (
    <CellFormField label="Кол-во" className="sm:max-w-[120px]">
      <input
        type="number"
        min={1}
        value={cell.count || 1}
        onChange={(e) => onUpdate(cell.id, 'count', Math.max(1, Number(e.target.value) || 1))}
        className={inputClassName}
      />
    </CellFormField>
  );
}

// Компонент CellActionButtons
interface CellActionButtonsProps {
  cell: RusnCellType;
  onRemove: (id: string) => void;
}

function CellActionButtons({ cell, onRemove }: CellActionButtonsProps) {
  if (cell.purpose !== 'Отходящая') return null;
  return (
    <button
      type="button"
      onClick={() => onRemove(cell.id)}
      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
      title="Удалить ячейку"
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      Удалить
    </button>
  );
}

interface BhaModeToggleProps {
  cell: RusnCellType;
  bodyType: string;
  onUpdate: (id: string, field: keyof RusnCellType, value: RusnCellType[keyof RusnCellType]) => void;
}

function BhaModeToggle({ cell, bodyType, onUpdate }: BhaModeToggleProps) {
  if (!isKsoA12BhaEligible(bodyType, cell.purpose)) {
    return null;
  }

  const isActive = Boolean(cell.bhaMode);

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-indigo-900">Режим BHA</p>
        <p className="text-xs text-indigo-700 mt-0.5">
          {isActive
            ? 'Используется фиксированная BHA-калькуляция для этой ячейки'
            : 'Стандартный расчёт по выбранным материалам'}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onUpdate(cell.id, 'bhaMode', !isActive)}
        className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
            : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
        }`}
      >
        {isActive ? 'Выключить BHA' : 'Режим BHA'}
      </button>
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

  const { global } = useRusnStore();
  const selectedTransformer = useTransformerStore((state) => state.selectedTransformer);
  const { enabled: debugPanelsEnabled } = useDebugPanelsEnabled();
  
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



  const { setCellSummary, removeCellSummary } = useRusnStore();

  // Обновляем totalPrice ячейки при изменении total
  React.useEffect(() => {
    
    if (total !== cell.totalPrice) {
      onUpdate(cell.id, 'totalPrice', total);
    }
  }, [total, cell.totalPrice, cell.id, onUpdate]);

  // Сохраняем summary данные ячейки в store
  React.useEffect(() => {
    const summaries = buildRusnCellSummaries(
      cell,
      materials,
      global.bodyType,
      total,
      selectedTransformer?.voltage
    );
    getRusnCellSummaryIds(cell.id).forEach(removeCellSummary);
    summaries.forEach(setCellSummary);
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
    cell.bhaMode,
    cell.calculationBreakdown,
    total,
    materials,
    selectedTransformer?.voltage,
    setCellSummary,
    removeCellSummary,
  ]);

  const isBhaActive =
    Boolean(cell.bhaMode) && isKsoA12BhaEligible(global.bodyType, cell.purpose);

  const cellFields = getCellFieldConfig(cell.purpose, materials, cell.cellType, selectedGroupName);
  

  const handleRemove = () => {
    // Удаляем summary и саму ячейку
    removeCellSummary(cell.id);
    onRemove(cell.id);
  };

  // Проверяем, нужно ли показывать предупреждение о трансформаторе тока
  const shouldShowTTWarning = () => {
    if (cell.bhaMode) {
      return false;
    }

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
      {debugPanelsEnabled && (
        <DebugPanel
          cell={cell}
          materials={materials}
          groupSlug={groupSlug}
          selectedGroupName={selectedGroupName}
          selectedCalculationName={selectedCalculationName}
          calculations={cellCalculations}
        />
      )}
      
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

      <BhaModeToggle cell={cell} bodyType={global.bodyType} onUpdate={handleUpdate} />

      {/* Специальные поля для Камера Siemens 8DJH */}
      {cell.purpose === 'Камера Siemens 8DJH' ? (
        <CellFormGrid footer={<CellActionButtons cell={cell} onRemove={handleRemove} />}>
          <CellFormField label="8DJH (R)">
            <input
              type="number"
              min={0}
              value={(cell as any).siemens8DJH_R || 0}
              onChange={(e) => handleUpdate(cell.id, 'siemens8DJH_R' as any, Number(e.target.value))}
              className={inputClassName}
            />
          </CellFormField>
          <CellFormField label="8DJH (L)">
            <input
              type="number"
              min={0}
              value={(cell as any).siemens8DJH_L || 0}
              onChange={(e) => handleUpdate(cell.id, 'siemens8DJH_L' as any, Number(e.target.value))}
              className={inputClassName}
            />
          </CellFormField>
          <QuantityInput cell={cell} onUpdate={handleUpdate} />
        </CellFormGrid>
      ) : cell.purpose === 'Кабельная перемычка' ? (
        <CellFormGrid footer={<CellActionButtons cell={cell} onRemove={handleRemove} />}>
          <CellFormField label="Тип перемычки" className="sm:col-span-2">
            <div className={`${inputClassName} flex items-center text-gray-700 bg-gray-50`}>
              {(() => {
                if (selectedTransformer?.voltage === '10') {
                  return 'Кабельная перемычка 10кВ';
                } else if (selectedTransformer?.voltage === '20') {
                  return 'Кабельная перемычка 20кВ';
                } else {
                  return 'Выберите трансформатор';
                }
              })()}
            </div>
          </CellFormField>
          <QuantityInput cell={cell} onUpdate={handleUpdate} />
        </CellFormGrid>
      ) : cell.purpose === 'Изоляционный адаптер' ? (
        <CellFormGrid footer={<CellActionButtons cell={cell} onRemove={handleRemove} />}>
          <CellFormField label="Тип адаптера" className="sm:col-span-2">
            <div className={`${inputClassName} flex items-center text-gray-700 bg-gray-50`}>
              {(() => {
                if (selectedTransformer?.voltage === '10') {
                  return 'Изоляционный адаптер 10кВ';
                } else if (selectedTransformer?.voltage === '20') {
                  return 'Изоляционный адаптер 20кВ';
                } else {
                  return 'Выберите трансформатор';
                }
              })()}
            </div>
          </CellFormField>
          <QuantityInput cell={cell} onUpdate={handleUpdate} />
        </CellFormGrid>
      ) : isBhaActive ? (
        <CellFormGrid footer={<CellActionButtons cell={cell} onRemove={handleRemove} />}>
          <CellFormField label="Наименование" className="sm:col-span-2 lg:col-span-3">
            <div className={`${inputClassName} flex items-center text-gray-700 bg-gray-50 min-h-[42px]`}>
              {getKsoA12BhaCellDescription(cell.purpose)}
            </div>
          </CellFormField>
          <QuantityInput cell={cell} onUpdate={handleUpdate} />
        </CellFormGrid>
      ) : (
        <CellFormGrid footer={<CellActionButtons cell={cell} onRemove={handleRemove} />}>
          {cellFields.map(({ field, label }) => {
              const fieldValue = cell[field];
              const selectedId =
                typeof fieldValue === 'object' && fieldValue !== null ? fieldValue.id : undefined;

              return (
                <MaterialSelect
                  key={field}
                  field={field}
                  label={label}
                  materials={materials}
                  cell={cell}
                  selectedId={selectedId}
                  onUpdate={handleUpdate}
                />
              );
            })}
          <QuantityInput cell={cell} onUpdate={handleUpdate} />
        </CellFormGrid>
      )}

      {/* Итоговая таблица */}
      <CellSummaryTable
        cell={cell}
        materials={materials}
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
      {!isBhaActive && (
        <CellCalculationDetails
          cell={cell}
          materials={materials}
          currentCalculation={currentCalculation}
          calculations={calculations}
          rzaCalculation={rzaCalculation}
          foundCalculations={foundCalculations}
        />
      )}
    </div>
  );
}
