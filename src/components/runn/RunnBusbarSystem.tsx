import React from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useRunnBusbarCalculation } from '@/hooks/useRunnBusbarCalculation';
import {
  BusbarHeader,
  BreakerInfo,
  MaterialSelector,
  ErrorMessages,
  CalculationResults,
  BusbarCalculation,
  Summary,
} from './BusbarSystem';

export const RunnBusbarSystem = () => {
  const runn = useRunnStore();

  const {
    selectedBreaker,
    matchingConfig,
    totalWeight,
    totalPrice,
    busbarCalculation,
    busbarCalculationResult,
    busMaterial,
    getBreakerCurrent,
    getPricePerKg,
  } = useRunnBusbarCalculation();

  const handleMaterialChange = (material: BusMaterial) => {
    runn.setBusMaterial(material);
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
          selectedMaterial={busMaterial}
          onMaterialChange={handleMaterialChange}
        />

        {/* Сообщения об ошибках */}
        <ErrorMessages selectedMaterial={busMaterial} hasMatchingConfig={!!matchingConfig} />

        {/* Результаты расчета */}
        {matchingConfig && (
          <>
            <CalculationResults
              matchingConfig={matchingConfig}
              totalWeight={totalWeight}
              totalPrice={totalPrice}
              getPricePerKg={getPricePerKg}
              busMaterial={busMaterial}
              cellConfigs={runn.cellConfigs}
            />

            {/* Калькуляция сборных шин */}
            <BusbarCalculation
              busbarCalculation={busbarCalculation}
              busbarCalculationResult={busbarCalculationResult}
              busMaterial={busMaterial}
              matchingConfig={matchingConfig}
              totalPrice={totalPrice}
            />

            {/* Итоговая сводка */}
            <Summary
              busMaterial={busMaterial}
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

