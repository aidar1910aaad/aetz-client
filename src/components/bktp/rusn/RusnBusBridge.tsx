import React from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import {
  BusbarBridgeHeader,
  BreakerInfo,
  MaterialSelector,
  ErrorMessages,
  CalculationResults,
  Summary,
} from './BusbarBridge';
import { BusbarBridgesInput } from './BusbarBridge/BusbarBridgesInput';
import { useBusbarBridgeCalculation } from './BusbarBridge/hooks/useBusbarBridgeCalculation';

export const RusnBusBridge = () => {
  const rusn = useRusnStore();

  const {
    selectedBreaker,
    matchingConfig,
    bridgeCell,
    weightPerMeter,
    totalWeight,
    totalPrice,
    busbarBridgeCalculation,
    busBridgeMaterial,
    bridges,
    getBreakerCurrent,
    getPricePerKg,
    setBridges,
  } = useBusbarBridgeCalculation();

  const handleMaterialChange = (material: BusMaterial) => {
    rusn.setBusMaterial(material);
  };

  // Проверяем, есть ли мосты с длиной больше 0
  const hasValidBridges = bridges.some((bridge) => bridge.length > 0);

  return (
    <div className="bg-white border border-gray-300 shadow-sm">
      {/* Заголовок секции */}
      <BusbarBridgeHeader matchingConfigId={matchingConfig?.id?.toString()} />

      <div className="p-6 space-y-6">
        {/* Информация о выключателе */}
        <BreakerInfo selectedBreaker={selectedBreaker} getBreakerCurrent={getBreakerCurrent} />

        {/* Выбор материала */}
        <MaterialSelector
          selectedMaterial={busBridgeMaterial}
          onMaterialChange={handleMaterialChange}
        />

        {/* Ввод шинных мостов */}
        <BusbarBridgesInput
          bridges={bridges}
          onBridgesChange={setBridges}
          busBridgeMaterial={busBridgeMaterial}
          matchingConfig={matchingConfig}
          weightPerMeter={weightPerMeter}
          pricePerKg={getPricePerKg(busBridgeMaterial!)}
          busbarBridgeCalculation={busbarBridgeCalculation}
        />

        {/* Сообщения об ошибках */}
        <ErrorMessages
          selectedMaterial={busBridgeMaterial}
          hasMatchingConfig={!!matchingConfig}
          length={bridges[0]?.length || 0}
        />

        {/* Результаты расчета */}
        {matchingConfig && bridgeCell && hasValidBridges && (
          <>
            <CalculationResults
              matchingConfig={matchingConfig}
              weightPerMeter={weightPerMeter}
              totalWeight={totalWeight}
              totalPrice={totalPrice}
              bridges={bridges}
              getPricePerKg={getPricePerKg}
              busBridgeMaterial={busBridgeMaterial}
            />

            {/* Итоговая сводка */}
            <Summary
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig}
              totalPrice={totalPrice}
              bridges={bridges}
              weightPerMeter={weightPerMeter}
              pricePerKg={getPricePerKg(busBridgeMaterial!)}
              busbarBridgeCalculation={busbarBridgeCalculation}
            />
          </>
        )}
      </div>
    </div>
  );
};
