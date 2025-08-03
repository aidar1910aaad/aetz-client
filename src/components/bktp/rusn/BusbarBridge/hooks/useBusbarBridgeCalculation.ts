import { useState, useEffect } from 'react';
import { useRusnStore, BusbarBridge } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { calculateCost } from '@/utils/calculationUtils';

export const useBusbarBridgeCalculation = () => {
  const rusn = useRusnStore();
  const { busBridge } = rusn.global;
  const bridges = rusn.busBridges;
  const setBridges = rusn.setBusBridges;
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);

  // Получаем выбранную группу из localStorage
  const [selectedGroupSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupSlug') || '';
    }
    return '';
  });

  // Получаем все калькуляции по выбранной группе
  const { calculations, loading: calculationsLoading } = useRusnCalculation(selectedGroupSlug);

  // Находим калькуляцию с типом "busbridge"
  const busbarBridgeCalculation = calculations.cell.find(
    (calc) => calc.data?.cellConfig?.type === 'busbridge'
  );

  // Извлекаем ток из имени выключателя
  const getBreakerCurrent = (name: string) => {
    const match = name.match(/(\d+)[АA]/);
    return match ? parseInt(match[1]) : null;
  };

  // Находим вводной выключатель
  const inputCell = rusn.cellConfigs.find((cell) => cell.purpose === 'Ввод');
  const selectedBreaker = inputCell?.breaker;

  // Получаем цену за кг
  const getPricePerKg = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return 2800;
    }
    if (material === 'МТ' || material === 'МТ2') {
      return 5600;
    }
    return 0;
  };

  // Определяем группу на основе выбранного материала
  const getMaterialGroup = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return ['АД', 'АД2'];
    }
    if (material === 'МТ' || material === 'МТ2') {
      return ['МТ', 'МТ2'];
    }
    return [];
  };

  // Находим подходящую конфигурацию для выбранного выключателя и материала
  const matchingConfig =
    selectedBreaker && busBridge.material
      ? switchgearConfigs.find((config) => {
          const breakerCurrent = getBreakerCurrent(selectedBreaker.name);
          const configBreakerMatch = config.breaker.match(/(\d+)[АA]/);
          const configBreakerCurrent = configBreakerMatch ? parseInt(configBreakerMatch[1]) : null;
          const materialGroups = getMaterialGroup(busBridge.material);

          return (
            breakerCurrent &&
            configBreakerCurrent &&
            breakerCurrent === configBreakerCurrent &&
            materialGroups.includes(config.group)
          );
        })
      : null;

  // Находим расход для "Шинный мост"
  const bridgeCell = matchingConfig?.cells?.find((cell) => cell.name === 'Шинный мост');
  const weightPerMeter = bridgeCell?.quantity || 0;

  // Рассчитываем общую массу и стоимость для всех мостов
  const totalWeight = bridges.reduce((sum, bridge) => {
    return sum + weightPerMeter * bridge.length * bridge.quantity;
  }, 0);

  const pricePerKg = getPricePerKg(busBridge.material);
  const totalPrice = totalWeight * pricePerKg;

  // Рассчитываем стоимость по калькуляции шинного моста
  const busbarBridgeCalculationResult = busbarBridgeCalculation
    ? calculateCost(
        busbarBridgeCalculation.data.categories.reduce(
          (sum, category) =>
            sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
          0
        ) + totalPrice,
        {
          hourlyRate: busbarBridgeCalculation.data.calculation?.hourlyRate || 2000,
          manufacturingHours: busbarBridgeCalculation.data.calculation?.manufacturingHours || 1,
          overheadPercentage: busbarBridgeCalculation.data.calculation?.overheadPercentage || 10,
          adminPercentage: busbarBridgeCalculation.data.calculation?.adminPercentage || 15,
          plannedProfitPercentage:
            busbarBridgeCalculation.data.calculation?.plannedProfitPercentage || 10,
          ndsPercentage: busbarBridgeCalculation.data.calculation?.ndsPercentage || 12,
        }
      )
    : null;

  // Загружаем конфигурации выключателей
  useEffect(() => {
    const fetchSwitchgearConfigs = async () => {
      try {
        const configs = await switchgearApi.getAll({
          type: 'Камера КСО А12-10',
        });
        setSwitchgearConfigs(configs);
      } catch (error) {
        console.error('Error fetching switchgear configurations:', error);
      }
    };
    fetchSwitchgearConfigs();
  }, []);

  // Сохраняем summary данные в store
  useEffect(() => {
    console.log('useBusbarBridgeCalculation - Сохранение summary:', {
      matchingConfig: !!matchingConfig,
      bridgeCell: !!bridgeCell,
      totalPrice,
      bridges,
      busbarBridgeCalculationResult: !!busbarBridgeCalculationResult,
    });

    if (matchingConfig && bridgeCell && totalPrice > 0) {
      const materialName =
        busBridge.material === 'АД' || busBridge.material === 'АД2' ? 'Алюминий' : 'Медь';

      // Создаем отдельный summary для каждого моста
      const validBridges = bridges.filter((bridge) => bridge.length > 0);

      if (validBridges.length > 0) {
        // Создаем массив summary для каждого моста
        const bridgeSummaries = validBridges.map((bridge, index) => {
          const bridgeWeight = weightPerMeter * bridge.length;
          const bridgePrice = bridgeWeight * pricePerKg;

          // Рассчитываем стоимость дополнительных материалов
          const additionalMaterialsTotal =
            busbarBridgeCalculation?.data?.categories?.reduce((sum: number, category: any) => {
              return (
                sum +
                category.items.reduce((itemSum: number, item: any) => {
                  return itemSum + item.price * item.quantity;
                }, 0)
              );
            }, 0) || 0;

          // Общая стоимость материалов для одной единицы (шинный мост + дополнительные материалы)
          const totalMaterialsPricePerUnit = bridgePrice + additionalMaterialsTotal;

          // Базовая калькуляция для одной единицы
          const calculationResult = calculateCost(totalMaterialsPricePerUnit, {
            hourlyRate: busbarBridgeCalculation?.data?.calculation?.hourlyRate || 2000,
            manufacturingHours: busbarBridgeCalculation?.data?.calculation?.manufacturingHours || 1,
            overheadPercentage:
              busbarBridgeCalculation?.data?.calculation?.overheadPercentage || 10,
            adminPercentage: busbarBridgeCalculation?.data?.calculation?.adminPercentage || 15,
            plannedProfitPercentage:
              busbarBridgeCalculation?.data?.calculation?.plannedProfitPercentage || 10,
            ndsPercentage: busbarBridgeCalculation?.data?.calculation?.ndsPercentage || 12,
          });

          return {
            name: `№${index + 1} Шинный мост ${materialName} ${matchingConfig.busbar} (длина: ${
              bridge.length
            }м)`,
            quantity: bridge.quantity,
            pricePerUnit: calculationResult.finalPrice,
            totalPrice: calculationResult.finalPrice * bridge.quantity,
          };
        });

        // Сохраняем первый мост как основной (для обратной совместимости)
        rusn.setBusBridgeSummary(bridgeSummaries[0]);

        // Сохраняем все мосты в отдельном поле
        rusn.setBusBridgeSummaries(bridgeSummaries);

        console.log('useBusbarBridgeCalculation - Сохранены мосты:', bridgeSummaries);
      } else {
        rusn.setBusBridgeSummary(null);
        rusn.setBusBridgeSummaries([]);
      }
    } else {
      console.log('useBusbarBridgeCalculation - Очистка summary');
      rusn.setBusBridgeSummary(null);
      rusn.setBusBridgeSummaries([]);
    }
  }, [
    matchingConfig?.id,
    matchingConfig?.busbar,
    matchingConfig?.breaker,
    bridgeCell?.name,
    totalPrice,
    busBridge.material,
    bridges,
    busbarBridgeCalculationResult?.finalPrice,
    weightPerMeter,
    pricePerKg,
  ]);

  // Отображаем калькуляцию в консоли
  useEffect(() => {
    if (selectedGroupSlug && !calculationsLoading) {
      const busbarBridgeCalculation = calculations.cell.find(
        (calc) => calc.data?.cellConfig?.type === 'busbridge'
      );

      if (busbarBridgeCalculation) {
        console.log('Калькуляция для шинного моста:', busbarBridgeCalculation);
      } else {
        console.log('Калькуляция с типом "busbridge" не найдена');
      }
    }
  }, [selectedGroupSlug, calculations, calculationsLoading]);

  return {
    // Состояние
    switchgearConfigs,
    selectedGroupSlug,
    calculations,
    calculationsLoading,
    busbarBridgeCalculation,
    selectedBreaker,
    matchingConfig,
    bridgeCell,
    weightPerMeter,
    totalWeight,
    totalPrice,
    busbarBridgeCalculationResult,
    busBridgeMaterial: busBridge.material,
    bridges,

    // Методы
    getBreakerCurrent,
    getPricePerKg,
    getMaterialGroup,
    setBridges,
  };
};
