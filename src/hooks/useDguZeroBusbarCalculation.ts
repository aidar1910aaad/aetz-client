import { useState, useEffect } from 'react';
import { useDguStore } from '@/store/useDguStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { Material } from '@/api/material';
import { api } from '@/api/baseUrl';
import { countBusbarCellsForConfig } from '@/domain/runn/busbarCellCount';
import type { BusMaterial } from '@/store/useRunnStore';

export const useDguZeroBusbarCalculation = () => {
  const dgu = useDguStore();
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [materialPrices, setMaterialPrices] = useState({
    aluminum: 2800,
    copper: 5600,
  });
  const [busbarCalculationFromApi, setBusbarCalculationFromApi] = useState<any>(null);

  const nominalPowerKva = dgu.settings.nominalPowerKva;

  const getMaterialById = async (id: number, token: string): Promise<Material> => {
    const response = await fetch(`${api}/materials/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Ошибка при получении материала');
    return await response.json();
  };

  const getPricePerKg = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') return materialPrices.aluminum;
    if (material === 'МТ' || material === 'МТ2') return materialPrices.copper;
    return 0;
  };

  const getPossibleGroupsFromMaterial = (busbarsType: string) => {
    if (busbarsType === 'Алюминий') return ['АД', 'АД2', 'АД3'];
    if (busbarsType === 'Медь') return ['МТ', 'МТ2', 'МТ3'];
    return [];
  };

  useEffect(() => {
    switchgearApi.getAll().then(setSwitchgearConfigs).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchMaterialPrices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const [aluminumMaterial, copperMaterial] = await Promise.all([
          getMaterialById(3489, token),
          getMaterialById(3490, token),
        ]);
        setMaterialPrices({
          aluminum:
            typeof aluminumMaterial.price === 'string'
              ? parseFloat(aluminumMaterial.price)
              : aluminumMaterial.price,
          copper:
            typeof copperMaterial.price === 'string'
              ? parseFloat(copperMaterial.price)
              : copperMaterial.price,
        });
      } catch (error) {
        console.error('Error fetching DGU zero busbar prices:', error);
      }
    };
    fetchMaterialPrices();
  }, []);

  useEffect(() => {
    const fetchBusbarCalculation = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const response = await fetch(
          `${api}/calculations/panel-sho-70/для-сборных-шин-рунн`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (response.ok) {
          setBusbarCalculationFromApi(await response.json());
        }
      } catch (error) {
        console.error('Error fetching DGU zero busbar calculation:', error);
      }
    };
    fetchBusbarCalculation();
  }, []);

  const matchingConfig = nominalPowerKva
    ? switchgearConfigs.find((config) => {
        const possibleGroups = getPossibleGroupsFromMaterial(dgu.settings.material);
        return (
          config.type === 'Панель ЩО-70N' &&
          config.breaker === nominalPowerKva.toString() &&
          possibleGroups.includes(config.group)
        );
      })
    : null;

  const cellDetails: Array<{
    name: string;
    quantity: number;
    weightPerCell: number;
    totalWeight: number;
  }> = [];

  const totalWeight =
    matchingConfig && matchingConfig.cells
      ? matchingConfig.cells
          .filter((configCell) => configCell.name !== 'Шинный мост')
          .reduce((sum, configCell) => {
            const selectedCellCount = countBusbarCellsForConfig(
              configCell.name,
              dgu.cells
            );
            const weightPerCell = configCell.quantity || 0;
            const cellTotalWeight = weightPerCell * selectedCellCount;
            if (selectedCellCount > 0) {
              cellDetails.push({
                name: configCell.name,
                quantity: selectedCellCount,
                weightPerCell,
                totalWeight: cellTotalWeight,
              });
            }
            return sum + cellTotalWeight;
          }, 0)
      : 0;

  const getMaterialFromConfig = (): BusMaterial | null => {
    if (matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2') return 'МТ';
    if (matchingConfig?.group === 'АД' || matchingConfig?.group === 'АД2') return 'АД';
    return null;
  };

  const materialFromConfig = getMaterialFromConfig();
  const pricePerKg = materialFromConfig ? getPricePerKg(materialFromConfig) : 0;
  const materialCost = totalWeight * pricePerKg;

  const busbarCalculationResult = busbarCalculationFromApi
    ? (() => {
        const calculationData = busbarCalculationFromApi.data.calculation;
        if (!calculationData) return { totalWithNds: materialCost };

        const additionalMaterialsCost = busbarCalculationFromApi.data.categories.reduce(
          (total: number, category: any) =>
            total +
            category.items.reduce(
              (itemSum: number, item: any) =>
                itemSum + parseFloat(item.price) * item.quantity,
              0
            ),
          0
        );

        const totalMaterialsCost = materialCost + additionalMaterialsCost;
        const totalSalary =
          calculationData.manufacturingHours * calculationData.hourlyRate;
        const overheadCost =
          (totalMaterialsCost * calculationData.overheadPercentage) / 100;
        const productionCost = totalMaterialsCost + totalSalary + overheadCost;
        const adminCost =
          (totalMaterialsCost * calculationData.adminPercentage) / 100;
        const fullCost = productionCost + adminCost;
        const plannedProfit =
          (fullCost * calculationData.plannedProfitPercentage) / 100;
        const wholesalePrice = fullCost + plannedProfit;
        const ndsAmount =
          (wholesalePrice * calculationData.ndsPercentage) / 100;
        const finalPrice = wholesalePrice + ndsAmount;

        return { totalWithNds: finalPrice };
      })()
    : null;

  const totalPrice = busbarCalculationResult
    ? busbarCalculationResult.totalWithNds || materialCost || 0
    : materialCost || 0;

  return {
    matchingConfig,
    totalWeight,
    totalPrice,
    materialCost,
    pricePerKg,
    cellDetails,
    hasMatchingConfig: !!matchingConfig,
    nominalPowerKva,
    busbarCalculationResult,
    busbarMaterial: dgu.settings.material,
  };
};
