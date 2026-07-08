import { useState, useEffect, useMemo } from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { Material } from '@/api/material';
import { api } from '@/api/baseUrl';
import { normalizeBusbarSection } from '@/utils/busbarSectionUtils';
import {
  getPossibleGroupsFromTransformer,
  resolveRunnBusbarConfig,
} from '@/utils/runnBusbarOptions';

export const useZeroBusbarCalculation = () => {
  const runn = useRunnStore();
  const setZeroBusbarVariant = useRunnStore((s) => s.setZeroBusbarVariant);
  const { selectedTransformer } = useTransformerStore();
  const zeroBusbar = runn.global.zeroBusbar || { 
    enabled: false, 
    material: null, 
    configuration: '35', 
    weight: 311.00, 
    pricePerKg: 5600,
    selectedBusbarGroup: null,
    selectedBusbarSection: null,
  };
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [materialPrices, setMaterialPrices] = useState<{
    aluminum: number;
    copper: number;
  }>({ aluminum: 2800, copper: 5600 }); // Значения по умолчанию
  const [busbarCalculationFromApi, setBusbarCalculationFromApi] = useState<any>(null);

  // Получаем мощность трансформатора
  const transformerPower = selectedTransformer?.power;

  // Функция для получения материала по ID
  const getMaterialById = async (id: number, token: string): Promise<Material> => {
    const response = await fetch(`${api}/materials/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Ошибка при получении материала');
    }

    return await response.json();
  };

  // Функция для загрузки калькуляции сборных шин
  const fetchBusbarCalculation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Используем ту же калькуляцию для нулевых шин
      const response = await fetch(`${api}/calculations/panel-sho-70/для-сборных-шин-рунн`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении калькуляции');
      }

      const calculation = await response.json();
      setBusbarCalculationFromApi(calculation);
    } catch (error) {
      console.error('Error fetching zero busbar calculation:', error);
    }
  };

  // Получаем цену за кг для материала
  const getPricePerKg = (material: BusMaterial | string | null | undefined) => {
    if (material === 'АД' || material === 'АД2' || material === 'АД3') {
      return materialPrices.aluminum;
    }
    if (material === 'МТ' || material === 'МТ2' || material === 'МТ3') {
      return materialPrices.copper;
    }
    return 0;
  };

  // Определяем группу на основе выбранного материала
  const getGroupForMaterial = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return 'АД';
    }
    if (material === 'МТ' || material === 'МТ2') {
      return 'МТ';
    }
    return null;
  };

  // Получаем все возможные группы для материала
  const getPossibleGroupsForMaterial = (material: BusMaterial) => {
    if (material === 'АД') {
      return ['АД'];
    }
    if (material === 'АД2') {
      return ['АД2', 'АД'];
    }
    if (material === 'МТ') {
      return ['МТ'];
    }
    if (material === 'МТ2') {
      return ['МТ2', 'МТ'];
    }
    return [];
  };

  useEffect(() => {
    const fetchSwitchgearConfigs = async () => {
      try {
        const configs = await switchgearApi.getAll();
        setSwitchgearConfigs(configs);
      } catch (error) {
        console.error('Error fetching switchgear configs:', error);
      }
    };

    fetchSwitchgearConfigs();
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
        console.error('Error fetching material prices:', error);
      }
    };

    fetchMaterialPrices();
  }, []);

  // Загружаем калькуляцию сборных шин для нулевых шин
  useEffect(() => {
    fetchBusbarCalculation();
  }, []);

  const possibleGroups = useMemo(() => {
    if (selectedTransformer?.busbars) {
      return getPossibleGroupsFromTransformer(selectedTransformer.busbars);
    }
    if (zeroBusbar.material) {
      return getPossibleGroupsForMaterial(zeroBusbar.material);
    }
    return [];
  }, [selectedTransformer?.busbars, zeroBusbar.material]);

  const selectedGroup = zeroBusbar.selectedBusbarGroup ?? null;
  const selectedSection = zeroBusbar.selectedBusbarSection ?? null;

  const {
    matchingConfig,
    recommendedConfig,
    availableOptions: availableBusbarOptions,
  } = useMemo(
    () =>
      resolveRunnBusbarConfig(
        switchgearConfigs,
        'Панель ЩО-70N',
        transformerPower,
        possibleGroups,
        selectedGroup,
        selectedSection
      ),
    [switchgearConfigs, transformerPower, possibleGroups, selectedGroup, selectedSection]
  );

  useEffect(() => {
    if (!recommendedConfig) return;

    const recommendedGroup = recommendedConfig.group;
    const recommendedSection = recommendedConfig.busbar;
    if (!recommendedGroup || !recommendedSection) return;

    const availableKeys = new Set(
      availableBusbarOptions.map(
        (option) => `${option.group}:${normalizeBusbarSection(option.section)}`
      )
    );
    const recommendedKey = `${recommendedGroup}:${normalizeBusbarSection(recommendedSection)}`;
    const selectedKey =
      selectedGroup && selectedSection
        ? `${selectedGroup}:${normalizeBusbarSection(selectedSection)}`
        : null;

    if (selectedKey && availableKeys.has(selectedKey)) return;

    if (
      selectedGroup === recommendedGroup &&
      selectedSection === recommendedSection
    ) {
      return;
    }

    if (availableKeys.size > 0 && !availableKeys.has(recommendedKey)) return;

    setZeroBusbarVariant(recommendedGroup, recommendedSection);
  }, [
    recommendedConfig?.id,
    recommendedConfig?.group,
    recommendedConfig?.busbar,
    availableBusbarOptions,
    selectedGroup,
    selectedSection,
    setZeroBusbarVariant,
  ]);


  // Рассчитываем общий вес и стоимость для нулевых шин с детализацией
  const cellDetails: Array<{name: string, quantity: number, weightPerCell: number, totalWeight: number}> = [];
  
  const totalWeight = matchingConfig && matchingConfig.cells
    ? matchingConfig.cells
        .filter((configCell) => configCell.name !== 'Шинный мост')
        .reduce((sum, configCell) => {
          let selectedCellCount = 0;

          switch (configCell.name) {
            case 'Ввод':
              selectedCellCount = runn.cellConfigs
                .filter((c) => c.purpose === 'Ввод')
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
            case 'СВ':
              selectedCellCount = runn.cellConfigs
                .filter((c) => c.purpose === 'Секционный выключатель')
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
            case 'ОТХ':
              selectedCellCount = runn.cellConfigs
                .filter((c) => c.purpose === 'Отходящая')
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
            case 'УСТ':
              // УСТ не считаем отдельно, так как это отходящие ячейки
              selectedCellCount = 0;
              break;
            default:
              selectedCellCount = runn.cellConfigs
                .filter((c) => c.purpose === configCell.name)
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
          }

          // configCell.quantity - это вес в кг на одну ячейку данного типа
          const weightPerCell = configCell.quantity || 0;
          const cellTotalWeight = weightPerCell * selectedCellCount;
          
          // Добавляем детализацию только для ячеек с количеством > 0
          if (selectedCellCount > 0) {
            cellDetails.push({
              name: configCell.name,
              quantity: selectedCellCount,
              weightPerCell: weightPerCell,
              totalWeight: cellTotalWeight
            });
          }
          
          // Расчет: вес на ячейку × количество выбранных ячеек
          return sum + cellTotalWeight;
        }, 0)
    : 0;

  // Определяем материал на основе конфигурации
  const getMaterialFromConfig = () => {
    if (
      matchingConfig?.group === 'МТ' ||
      matchingConfig?.group === 'МТ2' ||
      matchingConfig?.group === 'МТ3'
    ) {
      return 'МТ';
    }
    if (
      matchingConfig?.group === 'АД' ||
      matchingConfig?.group === 'АД2' ||
      matchingConfig?.group === 'АД3'
    ) {
      return 'АД';
    }
    return null;
  };

  const materialFromConfig = getMaterialFromConfig();
  const pricePerKg = materialFromConfig 
    ? getPricePerKg(materialFromConfig)
    : 0;
  const materialCost = totalWeight * pricePerKg;

  // Рассчитываем данные для калькуляции сборных шин (как в useRunnBusbarCalculation)
  const busbarCalculationResult = busbarCalculationFromApi
    ? (() => {
        const calculationData = busbarCalculationFromApi.data.calculation;
        if (!calculationData) return { totalWithNds: materialCost };

        // Рассчитываем стоимость дополнительных материалов из калькуляции
        const additionalMaterialsCost = busbarCalculationFromApi.data.categories.reduce(
          (total, category) => {
            return total + category.items.reduce(
              (itemSum, item) => itemSum + (parseFloat(item.price) * item.quantity),
              0
            );
          },
          0
        );

        // Общая стоимость материалов = стоимость нулевых шин + дополнительные материалы
        const totalMaterialsCost = materialCost + additionalMaterialsCost;

        // Используем ту же логику, что и в useRusnCalculation
        const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate;
        const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
        const productionCost = totalMaterialsCost + totalSalary + overheadCost;
        const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
        const fullCost = productionCost + adminCost;
        const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
        const wholesalePrice = fullCost + plannedProfit;
        const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
        const finalPrice = wholesalePrice + ndsAmount;

        // Детальная отладочная информация

        return {
          materialsTotal: materialCost,
          additionalMaterialsCost,
          totalMaterialsCost,
          salary: totalSalary,
          overheadCost,
          productionCost,
          adminCost,
          fullCost,
          plannedProfit,
          wholesalePrice,
          ndsAmount,
          totalWithNds: finalPrice
        };
      })()
    : null;

  // Итоговая стоимость с учетом работ
  const totalPrice = busbarCalculationResult 
    ? (busbarCalculationResult.totalWithNds || materialCost || 0)
    : (materialCost || 0);

  return {
    selectedTransformer,
    matchingConfig,
    recommendedConfig,
    availableBusbarOptions,
    selectedBusbarGroup: zeroBusbar.selectedBusbarGroup,
    selectedBusbarSection: zeroBusbar.selectedBusbarSection,
    setZeroBusbarVariant,
    totalWeight,
    totalPrice,
    materialCost,
    pricePerKg,
    cellDetails,
    zeroBusbar,
    getPricePerKg,
    transformerPower,
    switchgearConfigs,
    hasMatchingConfig: !!matchingConfig,
    busbarCalculationResult
  };
};