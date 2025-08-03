import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import {
  BusbarHeader,
  BreakerInfo,
  MaterialSelector,
  ErrorMessages,
  CalculationResults,
  BusbarCalculation,
  Summary,
} from './BusbarSystem';
import { useBusbarCalculation } from './BusbarSystem/hooks/useBusbarCalculation';

export const RusnBusbarSystem = () => {
  const rusn = useRusnStore();

  const {
    selectedBreaker,
    matchingConfig,
    totalWeight,
    totalPrice,
    busbarCalculation,
    busbarCalculationResult,
    busBridgeMaterial,
    getBreakerCurrent,
    getPricePerKg,
  } = useBusbarCalculation();

  const handleMaterialChange = (material: BusMaterial) => {
    rusn.setBusMaterial(material);
  };

  return (
    <div className="bg-white border border-gray-300 shadow-sm">
      {/* Заголовок секции */}
      <BusbarHeader matchingConfigId={matchingConfig?.id?.toString()} />

      <div className="p-6 space-y-6">
        {/* Информация о выключателе */}
        <BreakerInfo selectedBreaker={selectedBreaker} getBreakerCurrent={getBreakerCurrent} />

        {/* Выбор материала */}
        <MaterialSelector
          selectedMaterial={busBridgeMaterial}
          onMaterialChange={handleMaterialChange}
        />

        {/* Сообщения об ошибках */}
        <ErrorMessages selectedMaterial={busBridgeMaterial} hasMatchingConfig={!!matchingConfig} />

        {/* Результаты расчета */}
        {matchingConfig && (
          <>
            <CalculationResults
              matchingConfig={matchingConfig}
              totalWeight={totalWeight}
              totalPrice={totalPrice}
              getPricePerKg={getPricePerKg}
              busBridgeMaterial={busBridgeMaterial}
              cellConfigs={rusn.cellConfigs}
            />

            {/* Калькуляция сборных шин */}
            <BusbarCalculation
              busbarCalculation={busbarCalculation}
              busbarCalculationResult={busbarCalculationResult}
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig}
              totalPrice={totalPrice}
            />

            {/* Итоговая сводка */}
            <Summary
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig}
              busbarCalculationResult={busbarCalculationResult}
              totalPrice={totalPrice}
            />
          </>
        )}
      </div>
    </div>
  );
};
