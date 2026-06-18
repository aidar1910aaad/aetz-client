import { useEffect } from 'react';
import type { RunnCell } from '@/store/useRunnStore';
import { useDguStore } from '@/store/useDguStore';
import {
  useRunnBreakerCalculation,
  useRunnCounterCalculation,
} from '@/hooks/useRunnInputCalculation';
import { calculateCost } from '@/utils/calculationUtils';
import { getPanelNameForBreaker } from '@/utils/panelNameUtils';
import { extractCurrentFromBreakerName } from '@/utils/panelNameUtils';
import { Material } from '@/api/material';

function extractCurrentFromTransformerName(name: string): number | null {
  const match = name.match(/(\d+)\/5\b/i);
  return match ? parseInt(match[1], 10) : null;
}

function findMatchingCurrentTransformer(
  requiredCurrent: number,
  materials: Material[]
): Material | null {
  for (const material of materials) {
    const materialCurrent = extractCurrentFromTransformerName(material.name);
    if (materialCurrent && materialCurrent >= requiredCurrent) return material;
  }
  let maxCurrent = 0;
  let bestMatch: Material | null = null;
  for (const material of materials) {
    const materialCurrent = extractCurrentFromTransformerName(material.name);
    if (materialCurrent && materialCurrent > maxCurrent) {
      maxCurrent = materialCurrent;
      bestMatch = material;
    }
  }
  return bestMatch;
}

export function useDguInputSummary(
  inputCell: RunnCell,
  currentTransformerMaterials: Material[] = []
) {
  const dgu = useDguStore();
  const { calculation: breakerCalculation } = useRunnBreakerCalculation(inputCell);
  const { calculation: counterCalculation } = useRunnCounterCalculation(inputCell);

  useEffect(() => {
    if (!inputCell.breaker && !inputCell.meterType) {
      dgu.removeCellSummary(inputCell.id);
      return;
    }

    let breakerPrice = 0;
    if (breakerCalculation && inputCell.breaker) {
      const materialsTotal = breakerCalculation.data.categories.reduce(
        (sum: number, category: any) =>
          sum +
          category.items.reduce(
            (itemSum: number, item: any) => itemSum + item.price * item.quantity,
            0
          ),
        0
      );

      let selectedBreaker = breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.find(
        (material: any) => material.name === inputCell.breaker
      );

      if (!selectedBreaker && inputCell.breaker.includes('CHINT')) {
        const cellCurrent = extractCurrentFromBreakerName(inputCell.breaker);
        if (cellCurrent) {
          selectedBreaker =
            breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.find(
              (material: any) =>
                extractCurrentFromBreakerName(material.name) === cellCurrent
            );
        }
      }

      if (!selectedBreaker) {
        selectedBreaker =
          breakerCalculation.data.cellConfig?.materials?.withdrawable_breaker?.[0];
      }

      let selectedMaterialsTotal = selectedBreaker?.price || 0;

      if (currentTransformerMaterials.length > 0) {
        const breakerCurrent = extractCurrentFromBreakerName(inputCell.breaker);
        if (breakerCurrent) {
          const matchingTransformer = findMatchingCurrentTransformer(
            breakerCurrent,
            currentTransformerMaterials
          );
          if (matchingTransformer) {
            const transformerQuantity = inputCell.meterType ? 6 : 3;
            selectedMaterialsTotal +=
              parseFloat(matchingTransformer.price.toString()) * transformerQuantity;
          }
        }
      }

      const calculationResult = calculateCost(
        materialsTotal,
        breakerCalculation.data.calculation,
        selectedMaterialsTotal
      );
      breakerPrice = calculationResult.finalPrice || 0;
    }

    let counterPrice = 0;
    if (counterCalculation && inputCell.meterType) {
      const materialsTotal = counterCalculation.data.categories.reduce(
        (sum: number, category: any) =>
          sum +
          category.items.reduce(
            (itemSum: number, item: any) => itemSum + item.price * item.quantity,
            0
          ),
        0
      );

      const selectedCounter =
        counterCalculation.data.cellConfig?.materials?.counter?.find(
          (material: any) => material.name === inputCell.meterType
        ) || counterCalculation.data.cellConfig?.materials?.counter?.[0];

      const calculationResult = calculateCost(
        materialsTotal,
        counterCalculation.data.calculation,
        selectedCounter?.price || 0
      );
      counterPrice = calculationResult.finalPrice || 0;
    }

    const cellQuantity = inputCell.quantity || 1;
    const pricePerUnit = breakerPrice + counterPrice;
    const totalPrice = pricePerUnit * cellQuantity;

    if (totalPrice <= 0) {
      dgu.removeCellSummary(inputCell.id);
      return;
    }

    const materialName =
      breakerCalculation?.data?.cellConfig?.materials?.withdrawable_breaker?.find(
        (m: any) => m.name === inputCell.breaker
      )?.name || inputCell.breaker;

    const counterName =
      counterCalculation?.data?.cellConfig?.materials?.counter?.find(
        (m: any) => m.name === inputCell.meterType
      )?.name || inputCell.meterType;

    const panelName = inputCell.breaker
      ? getPanelNameForBreaker(inputCell.breaker, inputCell.purpose, breakerCalculation?.name)
      : breakerCalculation?.name;

    let fullName = `${panelName} - ${materialName}`;
    if (counterName && counterName !== 'undefined') {
      fullName += `, учет эл.эн. (${counterName})`;
    }

    const existing = dgu.cellSummaries.find((s) => s.cellId === inputCell.id);
    if (
      existing &&
      existing.name === fullName &&
      existing.quantity === cellQuantity &&
      existing.pricePerUnit === pricePerUnit &&
      existing.totalPrice === totalPrice
    ) {
      return;
    }

    dgu.setCellSummary({
      cellId: inputCell.id,
      name: fullName,
      quantity: cellQuantity,
      pricePerUnit,
      totalPrice,
    });
  }, [
    inputCell.id,
    inputCell.breaker,
    inputCell.meterType,
    inputCell.quantity,
    breakerCalculation,
    counterCalculation,
    currentTransformerMaterials,
  ]);
}
