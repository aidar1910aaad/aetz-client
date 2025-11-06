'use client';

import React from 'react';
import { useBmzStore } from '@/store/useBmzStore';
import { useRusnStore } from '@/store/useRusnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { useWorksStore } from '@/store/useWorksStore';

export default function AutoCalculationInfo() {
  const bmzStore = useBmzStore();
  const rusnStore = useRusnStore();
  const { selectedTransformer } = useTransformerStore();
  const { isEnabled } = useWorksStore();

  const hasBmz = bmzStore.buildingType === 'bmz' && bmzStore.blockCount > 0;
  const hasRusn = rusnStore.cellConfigs && rusnStore.cellConfigs.length > 0;
  const hasTransformer = !!selectedTransformer;
  
  // Подсчитываем общее количество ячеек РУСН с учетом поля count
  const totalRusnCellCount = hasRusn 
    ? rusnStore.cellConfigs.reduce((total, cell) => total + (cell.count || 1), 0)
    : 0;

  if (!isEnabled || (!hasBmz && !hasRusn && !hasTransformer)) {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-blue-900 mb-2">
        Автоматический расчет работ:
      </h4>
      <ul className="text-xs text-blue-800 space-y-1">
        {hasBmz && (
          <li>• Количество блоков БМЗ ({bmzStore.blockCount}) взято из проекта БМЗ</li>
        )}
        {hasRusn && (
          <li>• Количество ячеек РУСН ({totalRusnCellCount}) взято из проекта РУСН</li>
        )}
        {hasTransformer && (
          <li>• Количество трансформаторов (2 шт.) и мощность ({selectedTransformer.power} кВА) взяты из выбранного трансформатора</li>
        )}
      </ul>
    </div>
  );
}