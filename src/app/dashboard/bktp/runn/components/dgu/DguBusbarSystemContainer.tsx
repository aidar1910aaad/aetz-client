'use client';

import React, { useEffect } from 'react';
import { useDguStore } from '@/store/useDguStore';
import { useDguBusbarCalculation } from '@/hooks/useDguBusbarCalculation';
import { useDguZeroBusbarCalculation } from '@/hooks/useDguZeroBusbarCalculation';
import { BusbarResults } from '@/components/runn/BusbarSystem/BusbarResults';
import { BusSectionHeader } from '@/components/shared/busUi';

function BusbarBlock({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <BusSectionHeader title={title} subtitle={subtitle} />
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function DguBusbarSystemContainer() {
  const dgu = useDguStore();

  const {
    matchingConfig,
    totalWeight,
    totalPrice,
    materialCost,
    cellDetails,
    busbarCalculationResult,
    busMaterial,
    getPricePerKg,
    calculationsLoading,
    nominalPowerKva,
    busbarMaterial,
  } = useDguBusbarCalculation();

  const {
    matchingConfig: zeroMatchingConfig,
    totalWeight: zeroTotalWeight,
    totalPrice: zeroTotalPrice,
    materialCost: zeroMaterialCost,
    pricePerKg: zeroPricePerKg,
    cellDetails: zeroCellDetails,
    hasMatchingConfig: zeroHasMatchingConfig,
    nominalPowerKva: zeroNominalPower,
    busbarCalculationResult: zeroBusbarCalculationResult,
  } = useDguZeroBusbarCalculation();

  useEffect(() => {
    if (totalPrice > 0 && matchingConfig) {
      const panelName = matchingConfig.type.replace('Панель ', '').replace('-', ' ');
      const busbarSize = matchingConfig.busbar ? `${matchingConfig.busbar}мм` : '';
      const amperage = matchingConfig.amperage ? `${matchingConfig.amperage}A` : '';
      const group = matchingConfig.group || '';
      const innerParts = [`шина ${group}`, busbarSize ? `(${busbarSize})` : '', amperage].filter(
        Boolean
      );
      const busbarName = `Сборные шины ДГУ ${panelName} (${innerParts.join(' ')})`;

      dgu.setBusbarSummary({
        name: busbarName,
        quantity: 1,
        pricePerUnit: totalPrice,
        totalPrice: totalPrice,
      });
    } else if (!matchingConfig || totalPrice === 0) {
      dgu.setBusbarSummary(null);
    }
  }, [totalPrice, matchingConfig, busMaterial]);

  useEffect(() => {
    if (zeroTotalPrice > 0 && zeroMatchingConfig) {
      const panelName = zeroMatchingConfig.type
        ? zeroMatchingConfig.type
            .replace('Панель ', '')
            .replace('-70N', ' 70')
            .replace('-70', ' 70')
        : 'ЩО 70';
      const busbarSize = zeroMatchingConfig.busbar
        ? `${zeroMatchingConfig.busbar}мм`
        : '';
      const amperage = zeroMatchingConfig.amperage
        ? `${zeroMatchingConfig.amperage}A`
        : '';
      const group = zeroMatchingConfig.group || '';
      const innerParts = [`шина ${group}`, busbarSize ? `(${busbarSize})` : '', amperage].filter(
        Boolean
      );
      const zeroBusbarName = `Шина N ДГУ ${panelName} (${innerParts.join(' ')})`;

      const zeroBusbarSummary = {
        name: zeroBusbarName,
        quantity: 1,
        pricePerUnit: zeroTotalPrice,
        totalPrice: zeroTotalPrice,
      };

      dgu.setBusBridgeSummaries((existingSummaries) => {
        const summaries = existingSummaries || [];
        const nonZeroSummaries = summaries.filter(
          (summary) =>
            !summary.name.includes('Шина N') && !summary.name.includes('Сборные шины N')
        );
        return [...nonZeroSummaries, zeroBusbarSummary];
      });
    } else if (!zeroMatchingConfig || zeroTotalPrice === 0) {
      dgu.setBusBridgeSummaries((existingSummaries) => {
        const summaries = existingSummaries || [];
        return summaries.filter(
          (summary) =>
            !summary.name.includes('Шина N') && !summary.name.includes('Сборные шины N')
        );
      });
    }
  }, [zeroTotalPrice, zeroMatchingConfig, busbarMaterial]);

  if (!dgu.enabled) return null;

  if (calculationsLoading) {
    return (
      <BusbarBlock title="Сборные шины ДГУ" subtitle="Загрузка конфигурации…">
        <div className="flex items-center justify-center gap-3 py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#8eba1e] border-t-transparent" />
          <span className="text-sm font-medium text-gray-600">Подбор конфигурации…</span>
        </div>
      </BusbarBlock>
    );
  }

  const transformerStub = {
    power: nominalPowerKva,
    busbars: busbarMaterial,
  };

  return (
    <div className="space-y-5">
      <BusbarBlock
        title="Сборные шины (фазные) ДГУ"
        subtitle="Расчёт по номинальной мощности ДГУ и ячейкам"
      >
        <BusbarResults
          title="сборным шинам ДГУ"
          matchingConfig={matchingConfig}
          totalWeight={totalWeight}
          totalPrice={totalPrice}
          materialCost={materialCost}
          pricePerKg={busMaterial ? getPricePerKg(busMaterial) : 0}
          hasMatchingConfig={!!matchingConfig}
          transformerPower={nominalPowerKva}
          selectedTransformer={transformerStub as any}
          cellDetails={cellDetails}
          busbarCalculationResult={busbarCalculationResult}
        />
      </BusbarBlock>

      <BusbarBlock title="Сборные шины N (нулевые) ДГУ" subtitle="Нулевая шина по конфигурации ЩО">
        <BusbarResults
          title="сборным шинам N ДГУ"
          matchingConfig={zeroMatchingConfig}
          totalWeight={zeroTotalWeight}
          totalPrice={zeroTotalPrice}
          materialCost={zeroMaterialCost}
          pricePerKg={zeroPricePerKg}
          hasMatchingConfig={zeroHasMatchingConfig}
          transformerPower={zeroNominalPower}
          selectedTransformer={transformerStub as any}
          cellDetails={zeroCellDetails}
          busbarCalculationResult={zeroBusbarCalculationResult}
        />
      </BusbarBlock>
    </div>
  );
}
