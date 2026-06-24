import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import {
  BusbarHeader,
  BreakerInfo,
  MaterialSelector,
  BusbarSectionSelector,
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
    baseMatchingConfig,
    totalWeight,
    totalPrice,
    busbarCalculation,
    busbarCalculationResult,
    busBridgeMaterial,
    availableBusbarSections,
    selectedBusbarSection,
    getBreakerCurrent,
    getPricePerKg,
    setBusbarSection,
  } = useBusbarCalculation();

  const handleMaterialChange = (material: BusMaterial) => {
    rusn.setBusMaterial(material);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <BusbarHeader matchingConfigId={matchingConfig?.id?.toString()} />

      <div className="space-y-5 p-5">
        {/* Информация о выключателе */}
        <BreakerInfo selectedBreaker={selectedBreaker} getBreakerCurrent={getBreakerCurrent} />

        {/* Выбор материала */}
        <MaterialSelector
          selectedMaterial={busBridgeMaterial}
          onMaterialChange={handleMaterialChange}
        />

        {/* Выбор сечения */}
        {busBridgeMaterial && baseMatchingConfig && (
          <BusbarSectionSelector
            availableSections={availableBusbarSections}
            selectedSection={selectedBusbarSection ?? baseMatchingConfig.busbar}
            recommendedSection={baseMatchingConfig.busbar}
            onSectionChange={setBusbarSection}
          />
        )}

        {/* Сообщения об ошибках */}
        <ErrorMessages selectedMaterial={busBridgeMaterial} hasMatchingConfig={!!baseMatchingConfig} />

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
