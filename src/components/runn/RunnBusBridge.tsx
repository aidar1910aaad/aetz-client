import React from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useRunnBusbarBridgeCalculation } from '@/hooks/useRunnBusbarBridgeCalculation';
import {
  BusbarBridgeHeader,
  BreakerInfo,
  MaterialSelector,
  BusbarBridgesInput,
  ErrorMessages,
  CalculationResults,
  BusbarBridgeCalculation,
  Summary,
} from './BusbarBridge';

export const RunnBusBridge = () => {
  const runn = useRunnStore();

  const {
    selectedBreaker,
    matchingConfig,
    bridges,
    setBridges,
    busBridgeMaterial,
    totalBridgeWeight,
    totalBridgePrice,
    busbarBridgeCalculation,
    busbarBridgeCalculationResult,
    getBreakerCurrent,
    getPricePerKg,
    getWeightPerMeter,
    calculateBridgeWeight,
    bridgeCell,
  } = useRunnBusbarBridgeCalculation();

  const handleMaterialChange = (material: BusMaterial) => {
    runn.setBusBridgeMaterial(material);
  };

  const weightPerMeter = busBridgeMaterial && bridges.length > 0 
    ? getWeightPerMeter(busBridgeMaterial, bridges[0]?.width || 100)
    : 0;

  const pricePerKg = busBridgeMaterial ? getPricePerKg(busBridgeMaterial) : 0;

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
          pricePerKg={pricePerKg}
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
              bridges={bridges}
              totalBridgeWeight={totalBridgeWeight}
              totalBridgePrice={totalBridgePrice}
              getPricePerKg={getPricePerKg}
              busBridgeMaterial={busBridgeMaterial}
              cellConfigs={runn.cellConfigs}
              calculateBridgeWeight={calculateBridgeWeight}
            />

            {/* Калькуляция шинного моста */}
            <BusbarBridgeCalculation
              busbarBridgeCalculation={busbarBridgeCalculation}
              busbarBridgeCalculationResult={busbarBridgeCalculationResult}
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig}
              totalBridgePrice={totalBridgePrice}
              bridges={bridges}
              calculateBridgeWeight={calculateBridgeWeight}
              pricePerKg={pricePerKg}
            />

            {/* Итоговая сводка */}
            <Summary
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig}
              busbarBridgeCalculationResult={busbarBridgeCalculationResult}
              totalBridgePrice={totalBridgePrice}
              bridges={bridges}
              totalBridgeWeight={totalBridgeWeight}
            />
          </>
        )}
      </div>
    </div>
  );
};

