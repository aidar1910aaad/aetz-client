'use client';

import { useRunnStore } from '@/store/useRunnStore';
import { Material } from '@/api/material';
import TogglerWithInput from '../TogglerWithInput';
import CellItem from './CellItem';
import RunnCellSummaryTable from './RunnCellSummaryTable';
import { RunnCell } from '@/store/useRunnStore';
import { useCalculationResultsStore } from '@/store/useCalculationResultsStore';
import { useMemo } from 'react';

interface OutgoingCellSectionProps {
  categoryMaterials?: Material[];
  autoSelectedMaterial?: Material | null;
  autoSelectedSvMaterial?: Material | null;
  meterMaterials?: Material[];
  meterMaterialsLoading?: boolean;
  rpsLeftMaterials?: Material[];
  fusesPnMaterials?: Material[];
  avtomatLityMaterials?: Material[];
  inputCell?: RunnCell; // Ячейка "Ввод" для получения информации о корпусе
  selectedCalculationName?: string; // Название выбранной калькуляции
  onCalculationResult?: (cellId: string, type: 'main' | 'meter', price: number) => void;
}

export default function OutgoingCellSection({
  categoryMaterials = [],
  meterMaterials = [],
  meterMaterialsLoading = false,
  rpsLeftMaterials = [],
  fusesPnMaterials = [],
  avtomatLityMaterials = [],
  inputCell,
  selectedCalculationName,
  onCalculationResult
}: OutgoingCellSectionProps) {
  const { cellConfigs, addCell, updateCell, removeCell } = useRunnStore();

  const breakerOptions = categoryMaterials.map((material) => material.name);
  const meterOptions = meterMaterials.map((material) => material.name);
  const switchingDeviceOptions = ['Воздушный', 'Литой корпус', 'Литой корпус + Рубильник', 'РПС'];

  const outgoingCells = cellConfigs.filter((c) => c.purpose === 'Отходящая');
  const isOpen = outgoingCells.length > 0;

  // Хук для сбора результатов калькуляций
  const { results: calculationResults, updateCellResult } = useCalculationResultsStore();

  // Функция для получения selectedMaterials для отходящей ячейки
  const getSelectedMaterialsForOutgoingCell = useMemo(() => (cell: RunnCell) => {
    const selectedMaterials = [];

    // Проверяем, есть ли выбранные материалы
    if (!cell.breaker && !cell.meterType && !cell.rza && (!cell.rubilniki || cell.rubilniki.length === 0)) {
      return selectedMaterials;
    }

    // Создаем описание ячейки
    const parts = [];
    // Используем название выбранной калькуляции из состояния ячейки или дефолтное
    const calculationName = cell.calculationName || cell.selectedCalculationName || selectedCalculationName || "Панель ЩО 70-75 У3 (отходящая)";
    parts.push(calculationName);
    
    const materialParts = [];
    
    if (cell.breaker) {
      materialParts.push(cell.breaker);
    }
    
    if (cell.meterType) {
      materialParts.push(cell.meterType);
    }
    
    if (cell.rza) {
      materialParts.push(cell.rza);
    }
    
    if (cell.rubilniki && cell.rubilniki.length > 0) {
      materialParts.push(cell.rubilniki.join(', '));
    }

    if (materialParts.length > 0) {
      parts.push(materialParts.join(', '));
    }

    const fullName = parts.join(' - ');

    // Рассчитываем реальную цену на основе результатов калькуляций
    let totalPrice = 0;
    
    // Получаем результаты калькуляций для этой ячейки
    const cellResults = calculationResults[cell.id];
    
    if (cellResults) {
      // Используем реальные цены из калькуляций
      totalPrice = cellResults.mainCalculation || 0;
      
      if (cell.meterType && cellResults.meterCalculation) {
        totalPrice += cellResults.meterCalculation;
      }
    } else {
      // Fallback: используем примерные цены если нет реальных данных
      totalPrice = 380000; // Базовая стоимость основной калькуляции
      
      if (cell.meterType) {
        totalPrice += 157000; // Добавляем стоимость калькуляции ПУ
      }
    }

    selectedMaterials.push({
      name: fullName,
      price: totalPrice,
      quantity: cell.quantity || 1,
      unit: 'шт',
      type: 'outgoing'
    });

    return selectedMaterials;
  }, [calculationResults, selectedCalculationName]);


  return (
    <TogglerWithInput
      label="Ячейка: Отходящая"
      toggled={isOpen}
      onToggle={() => {
        if (!isOpen) {
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
            selectedCalculationName: '',
          });
        }
      }}
    >
      {outgoingCells.map((cell, idx) => (
        <div key={cell.id} className="space-y-4">
          <CellItem
            cell={cell}
            idx={idx}
            updateCell={updateCell}
            removeCell={removeCell}
            categoryMaterials={categoryMaterials}
            meterMaterials={meterMaterials}
            meterMaterialsLoading={meterMaterialsLoading}
            breakerOptions={breakerOptions}
            meterOptions={meterOptions}
            switchingDeviceOptions={switchingDeviceOptions}
            rpsLeftMaterials={rpsLeftMaterials}
            fusesPnMaterials={fusesPnMaterials}
            avtomatLityMaterials={avtomatLityMaterials}
            inputCell={inputCell}
            onCalculationResult={updateCellResult}
          />
          
          
          {/* Сводка по материалам отходящей ячейки */}
          <RunnCellSummaryTable
            cell={cell}
            selectedMaterials={getSelectedMaterialsForOutgoingCell(cell)}
            materials={{
              avtomatVyk: categoryMaterials,
              avtomatLity: avtomatLityMaterials,
              counter: meterMaterials,
              rpsLeft: rpsLeftMaterials
            }}
          />
        </div>
      ))}

      <button
        onClick={() =>
          addCell({
            purpose: 'Отходящая',
            breaker: '',
            meterType: '',
            switchingDevice: '',
            quantity: 1,
            selectedCalculationName: '',
          })
        }
        className="mt-4 px-4 py-2 bg-[#3A55DF] hover:bg-[#2d48be] text-white rounded text-sm font-medium"
      >
        + Добавить ещё отходящую
      </button>
    </TogglerWithInput>
  );
}
