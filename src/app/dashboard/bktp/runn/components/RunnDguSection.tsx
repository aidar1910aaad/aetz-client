'use client';

import { useState, useEffect, useMemo } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import DguGeneralSummary from './summary/DguGeneralSummary';
import { useDguCellsSync } from './dgu/hooks/useDguCellsSync';
import { useDguAutoMaterial } from './dgu/hooks/useDguAutoMaterial';
import { SWITCHING_DEVICE_OPTIONS } from './dgu/constants';
import DguEnabledToggle from './dgu/components/DguEnabledToggle';
import DguGeneralSettings from './dgu/components/DguGeneralSettings';
import DguInputCell from './dgu/components/DguInputCell';
import DguOutgoingCells from './dgu/components/DguOutgoingCells';
import DguTorcevaiaSection from './dgu/components/DguTorcevaiaSection';
import DguCableNodeSection from './dgu/components/DguCableNodeSection';
import DguBusbarSystemContainer from './dgu/DguBusbarSystemContainer';
import { useDguStore } from '@/store/useDguStore';
import { useDguInputSummary } from './dgu/hooks/useDguInputSummary';
import { useDguOutgoingSummaries, isDguOutgoingCell } from './dgu/hooks/useDguOutgoingSummaries';
import { useDguSummaryCleanup } from './dgu/hooks/useDguSummaryCleanup';
import { useDguUiHydration } from './dgu/hooks/useDguUiHydration';
import { useCalculationResultsStore } from '@/store/useCalculationResultsStore';
import type { RunnMaterials } from '@/hooks/useRunnMaterials';

interface RunnDguSectionProps {
  categoryMaterials?: Material[];
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
  rpsLeftMaterials?: Material[];
  runnMaterials?: RunnMaterials;
}

export default function RunnDguSection({
  categoryMaterials = [],
  meterMaterials = [],
  meterMaterialsLoading = false,
  rpsLeftMaterials = [],
  runnMaterials,
}: RunnDguSectionProps) {
  const dgu = useDguStore();
  
  // Состояние для ячеек ДГУ
  const [runnDguCells, setRunnDguCells] = useState<RunnCell[]>([]);
  const [runnDguInputCell, setRunnDguInputCell] = useState<RunnCell>({
    id: 'runn-dgu-input',
    purpose: 'РУНН-ДГУ-Ввод',
    breaker: '',
    meterType: '',
    quantity: 1,
    nominalPower: 0,
    price: 0,
  });

  // Восстановление из persist/store при возврате на вкладку
  useDguUiHydration(setRunnDguCells, setRunnDguInputCell);

  // Синхронизация с store
  useDguCellsSync(runnDguCells, runnDguInputCell);

  const outgoingCellsForSummary = useMemo(
    () => runnDguCells.filter(isDguOutgoingCell),
    [runnDguCells]
  );

  const allDguCellsForCleanup = useMemo(
    () => [runnDguInputCell, ...runnDguCells],
    [runnDguInputCell, runnDguCells]
  );

  useDguInputSummary(
    runnDguInputCell,
    runnMaterials?.currentTransformer ?? []
  );
  useDguOutgoingSummaries(outgoingCellsForSummary);
  useDguSummaryCleanup(runnDguInputCell.id, allDguCellsForCleanup);

  const removeCellResult = useCalculationResultsStore((s) => s.removeCellResult);

  // Автоматический выбор материала
  const { autoSelectedMaterial, nominalCurrent } = useDguAutoMaterial(categoryMaterials);

  // Автоматически устанавливаем выбранный материал для ввода
  useEffect(() => {
    if (autoSelectedMaterial && runnDguInputCell.breaker !== autoSelectedMaterial.name) {
      setRunnDguInputCell(prev => ({
        ...prev,
        breaker: autoSelectedMaterial.name
      }));
    }
  }, [autoSelectedMaterial, runnDguInputCell.breaker]);

  // Находим специальные ячейки
  const torcevaiaCell = runnDguCells.find(c => c.purpose === 'РУНН-ДГУ-Торцевая панель');
  const dguCableNodeCell = runnDguCells.find(c => c.purpose === 'РУНН-ДГУ-Узел ДГУ кабель');

  // Создаем опции
  const breakerOptions = categoryMaterials.map((material) => material.name);
  const meterOptions = meterMaterials.map((material) => material.name);

  // Обработчики для ячеек
  const handleUpdateInputCell = (field: keyof RunnCell, val: string | number) => {
    setRunnDguInputCell((prev) => ({
      ...prev,
      [field]: val,
    }));
  };

  const handleUpdateCell = (id: string, field: keyof RunnCell, value: string | number | string[]) => {
    const updated = [...runnDguCells];
    const cellIndex = updated.findIndex(c => c.id === id);
    if (cellIndex !== -1) {
      const cell = updated[cellIndex];
      if (cell) {
        switch (field) {
          case 'breaker':
            cell.breaker = value as string;
            break;
          case 'meterType':
            cell.meterType = value as string;
            break;
          case 'quantity':
            cell.quantity = value as number;
            break;
          case 'nominalPower':
            cell.nominalPower = value as number;
            break;
          case 'price':
            cell.price = value as number;
            break;
          case 'rza':
            cell.rza = value as string;
            break;
          case 'ctRatio':
            cell.ctRatio = value as string;
            break;
          case 'switchingDevice':
            cell.switchingDevice = value as string;
            break;
          case 'rubilniki':
            cell.rubilniki = value as string[];
            break;
          case 'selectedCalculationName':
            cell.selectedCalculationName = value as string;
            break;
          case 'calculationName':
            cell.calculationName = value as string;
            break;
        }
      }
    }
    setRunnDguCells(updated);
  };

  const handleRemoveCell = (id: string) => {
    const updated = runnDguCells.filter(c => c.id !== id);
    setRunnDguCells(updated);
    removeCellResult(id);
    dgu.removeCell(id);
  };

  const handleAddOutgoingCell = () => {
    setRunnDguCells((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        purpose: 'РУНН-ДГУ-Отходящая',
        breaker: '',
        rza: '',
        ctRatio: '',
        meterType: '',
        switchingDevice: '',
        quantity: 1,
      },
    ]);
  };

  const handleAddTorcevaiaCell = () => {
    setRunnDguCells((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        purpose: 'РУНН-ДГУ-Торцевая панель',
        breaker: '',
        quantity: 1,
      },
    ]);
  };

  const handleUpdateTorcevaiaQuantity = (quantity: number) => {
    if (!torcevaiaCell) return;
    const updated = [...runnDguCells];
    const cellIndex = updated.findIndex(c => c.id === torcevaiaCell.id);
    if (cellIndex !== -1) {
      updated[cellIndex].quantity = quantity;
    }
    setRunnDguCells(updated);
  };

  const handleRemoveTorcevaiaCell = () => {
    if (!torcevaiaCell) return;
    const updated = runnDguCells.filter(c => c.id !== torcevaiaCell.id);
    setRunnDguCells(updated);
  };

  const handleAddCableNodeCell = () => {
    setRunnDguCells((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        purpose: 'РУНН-ДГУ-Узел ДГУ кабель',
        breaker: '',
        quantity: 1,
      },
    ]);
  };

  const handleUpdateCableNodeQuantity = (quantity: number) => {
    if (!dguCableNodeCell) return;
    const updated = [...runnDguCells];
    const cellIndex = updated.findIndex(c => c.id === dguCableNodeCell.id);
    if (cellIndex !== -1) {
      updated[cellIndex].quantity = quantity;
    }
    setRunnDguCells(updated);
  };

  const handleRemoveCableNodeCell = () => {
    if (!dguCableNodeCell) return;
    const updated = runnDguCells.filter(c => c.id !== dguCableNodeCell.id);
    setRunnDguCells(updated);
  };

  return (
    <div className="">
      <div className="pt-2">
        <h3 className="text-lg font-semibold mb-4">РУНН-ДГУ</h3>

        <DguEnabledToggle />

        {dgu.enabled && (
          <>
            <DguGeneralSettings nominalCurrent={nominalCurrent} />

            <DguInputCell
              cell={runnDguInputCell}
              onUpdate={handleUpdateInputCell}
              breakerOptions={breakerOptions}
              meterOptions={meterOptions}
              categoryMaterials={categoryMaterials}
              meterMaterials={meterMaterials}
              autoSelectedMaterial={autoSelectedMaterial}
              currentTransformerMaterials={runnMaterials?.currentTransformer}
            />

            <DguOutgoingCells
              runnDguCells={runnDguCells}
              onAddCell={handleAddOutgoingCell}
              onUpdateCell={handleUpdateCell}
              onRemoveCell={handleRemoveCell}
              categoryMaterials={categoryMaterials}
              meterMaterials={meterMaterials}
              meterMaterialsLoading={meterMaterialsLoading}
              breakerOptions={breakerOptions}
              meterOptions={meterOptions}
              switchingDeviceOptions={SWITCHING_DEVICE_OPTIONS}
              rpsLeftMaterials={rpsLeftMaterials}
              inputCell={runnDguInputCell}
              fusesPnMaterials={runnMaterials?.fusesPn}
              avtomatLityMaterials={runnMaterials?.avtomatLity}
              currentTransformerMaterials={runnMaterials?.currentTransformer}
            />

            <DguBusbarSystemContainer />

            <DguTorcevaiaSection
              torcevaiaCell={torcevaiaCell}
              runnDguCells={runnDguCells}
              onAddCell={handleAddTorcevaiaCell}
              onUpdateQuantity={handleUpdateTorcevaiaQuantity}
              onRemoveCell={handleRemoveTorcevaiaCell}
            />

            <DguCableNodeSection
              dguCableNodeCell={dguCableNodeCell}
              onAddCell={handleAddCableNodeCell}
              onUpdateQuantity={handleUpdateCableNodeQuantity}
              onRemoveCell={handleRemoveCableNodeCell}
            />
          </>
        )}
        
        {/* Сводка ДГУ */}
        <div className="mt-8">
          <DguGeneralSummary />
        </div>
      </div>
    </div>
  );
}
