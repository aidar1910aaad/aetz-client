import { useState, useEffect } from 'react';
import { useRunnStore, BusMaterial, BusbarBridge } from '@/store/useRunnStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { calculateCost } from '@/utils/calculationUtils';

export const useRunnBusbarBridgeCalculation = () => {
  const runn = useRunnStore();
  const busBridge = runn.global.busBridge || { enabled: false, material: null, bridges: [] };
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

  // Находим калькуляцию с типом "bus-bridge"
  const busbarBridgeCalculation = calculations.cell.find(
    (calc) => calc.data?.cellConfig?.type === 'bus-bridge'
  );

  // Извлекаем ток из имени выключателя
  const getBreakerCurrent = (name: string) => {
    const match = name.match(/(\d+)[АA]/);
    return match ? parseInt(match[1]) : null;
  };

  // Находим ячейку шинного моста
  const bridgeCell = runn.cellConfigs.find((cell) => cell.purpose === 'Шинный мост');
  const selectedBreaker = bridgeCell?.breaker;

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
  const getGroupForMaterial = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return 'АД';
    }
    if (material === 'МТ' || material === 'МТ2') {
      return 'МТ';
    }
    return null;
  };

  // Получаем вес на метр для материала
  const getWeightPerMeter = (material: BusMaterial, width: number) => {
    // Плотность алюминия ~2.7 г/см³, меди ~8.9 г/см³
    // Толщина шины обычно 10мм = 1см
    const thickness = 1; // см
    
    if (material === 'АД' || material === 'АД2') {
      return (width * thickness * 2.7) / 1000; // кг/м
    }
    if (material === 'МТ' || material === 'МТ2') {
      return (width * thickness * 8.9) / 1000; // кг/м
    }
    return 0;
  };

  // Загружаем конфигурации коммутационных аппаратов
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

  // Находим подходящую конфигурацию
  const matchingConfig = selectedBreaker
    ? switchgearConfigs.find((config) => {
        const current = getBreakerCurrent(selectedBreaker);
        const materialGroup = busBridge.material ? getGroupForMaterial(busBridge.material) : null;
        
        return (
          config.amperage === current &&
          config.group === materialGroup
        );
      })
    : null;

  // Рассчитываем общий вес и стоимость шинных мостов
  const calculateBridgeWeight = (bridge: BusbarBridge) => {
    if (!busBridge.material) return 0;
    const weightPerMeter = getWeightPerMeter(busBridge.material, bridge.width);
    return bridge.length * bridge.quantity * weightPerMeter;
  };

  const totalBridgeWeight = busBridge.bridges.reduce(
    (sum, bridge) => sum + calculateBridgeWeight(bridge),
    0
  );

  const totalBridgePrice = busBridge.material 
    ? totalBridgeWeight * getPricePerKg(busBridge.material)
    : 0;

  // Рассчитываем данные для калькуляции шинного моста
  const busbarBridgeCalculationResult = busbarBridgeCalculation
    ? calculateCost(totalBridgePrice, {
        hourlyRate: busbarBridgeCalculation.data.calculation?.hourlyRate || 2000,
        manufacturingHours: busbarBridgeCalculation.data.calculation?.manufacturingHours || 1,
        overheadPercentage: busbarBridgeCalculation.data.calculation?.overheadPercentage || 10,
        adminPercentage: busbarBridgeCalculation.data.calculation?.adminPercentage || 15,
        plannedProfitPercentage: busbarBridgeCalculation.data.calculation?.plannedProfitPercentage || 10,
        ndsPercentage: busbarBridgeCalculation.data.calculation?.ndsPercentage || 12,
      })
    : null;

  return {
    selectedBreaker,
    matchingConfig,
    bridges: busBridge.bridges,
    setBridges: runn.setBusBridges,
    busBridgeMaterial: busBridge.material,
    totalBridgeWeight,
    totalBridgePrice,
    busbarBridgeCalculation,
    busbarBridgeCalculationResult,
    getBreakerCurrent,
    getPricePerKg,
    getWeightPerMeter: (material: BusMaterial, width: number) => getWeightPerMeter(material, width),
    calculateBridgeWeight,
    calculationsLoading,
    bridgeCell,
  };
};
