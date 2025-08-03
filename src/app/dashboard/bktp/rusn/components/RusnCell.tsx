import React from 'react';
import { RusnCell as RusnCellType } from '@/store/useRusnStore';
import { useRusnMaterials } from '@/hooks/useRusnMaterials';
import { getCellFieldConfig, RusnMaterials, formatCellDescription } from '@/utils/rusnMaterials';
import { useCellCalculation } from '@/hooks/useCellCalculation';
import MaterialSelect from './MaterialSelect';
import QuantityInput from './QuantityInput';
import CellActionButtons from './CellActionButtons';
import CellSummaryTable from './CellSummaryTable';
import CellCalculationDetails from './CellCalculationDetails';
import { useRusnStore } from '@/store/useRusnStore';

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
}

export default function RusnCell({
  cell,
  materials,
  onUpdate,
  onRemove,
  groupSlug,
  selectedGroupName,
  selectedCalculationName,
}: Props) {
  const { materials: rusnMaterials } = useRusnMaterials();

  const { total, currentCalculation, calculations, rzaCalculation, foundCalculations } =
    useCellCalculation({
      cell,
      materials,
      groupSlug,
      selectedGroupName,
      selectedCalculationName,
    });

  const { setCellSummary, removeCellSummary, cellSummaries } = useRusnStore();

  // Обновляем totalPrice ячейки при изменении total
  React.useEffect(() => {
    if (total !== cell.totalPrice) {
      onUpdate(cell.id, 'totalPrice', total);
    }
  }, [total, cell.totalPrice, cell.id, onUpdate]);

  // Сохраняем summary данные ячейки в store
  React.useEffect(() => {
    if (total > 0) {
      // Формируем описание ячейки через formatCellDescription
      const cellDescription = formatCellDescription(cell, materials);
      const pricePerUnit = total / (cell.count || 1);

      const newSummary = {
        cellId: cell.id,
        name: cellDescription,
        quantity: cell.count || 1,
        pricePerUnit: pricePerUnit,
        totalPrice: total,
      };

      setCellSummary(newSummary);
    } else {
      // Проверяем, есть ли summary для этой ячейки, чтобы не вызывать removeCellSummary бесконечно
      if (cellSummaries.some((s) => s.cellId === cell.id)) {
        removeCellSummary(cell.id);
      }
    }
  }, [
    cell.id,
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
    total,
    materials,
    cellSummaries,
  ]);

  const cellFields = getCellFieldConfig(cell.purpose, rusnMaterials);

  const handleRemove = () => {
    removeCellSummary(cell.id);
    onRemove(cell.id);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Основные поля ячейки */}
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
              onUpdate={onUpdate}
            />
          );
        })}

        {/* Поле количества */}
        <QuantityInput cell={cell} onUpdate={onUpdate} />

        {/* Кнопки действий */}
        <CellActionButtons cell={cell} onRemove={handleRemove} />
      </div>

      {/* Итоговая таблица */}
      <CellSummaryTable
        cell={cell}
        materials={rusnMaterials}
        selectedGroupName={selectedGroupName}
        currentCalculation={currentCalculation}
        total={total}
        cellType={foundCalculations.cellType}
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
