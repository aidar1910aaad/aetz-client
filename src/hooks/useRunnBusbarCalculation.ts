import { useState, useEffect } from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { calculateCost } from '@/utils/calculationUtils';

export const useRunnBusbarCalculation = () => {
  const runn = useRunnStore();
  const busbar = runn.global.busbar || { enabled: false, material: null };
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

  // Находим калькуляцию с типом "busbar"
  const busbarCalculation = calculations.cell.find(
    (calc) => calc.data?.cellConfig?.type === 'busbar'
  );

  // Извлекаем ток из имени выключателя
  const getBreakerCurrent = (name: string) => {
    const match = name.match(/(\d+)[АA]/);
    return match ? parseInt(match[1]) : null;
  };

  // Находим вводной выключатель
  const inputCell = runn.cellConfigs.find((cell) => cell.purpose === 'Ввод');
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
  const getGroupForMaterial = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return 'АД';
    }
    if (material === 'МТ' || material === 'МТ2') {
      return 'МТ';
    }
    return null;
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
        const materialGroup = busbar.material ? getGroupForMaterial(busbar.material) : null;
        
        return (
          config.amperage === current &&
          config.group === materialGroup
        );
      })
    : null;

  // Рассчитываем общий вес и стоимость
  const totalWeight = matchingConfig && matchingConfig.cells
    ? matchingConfig.cells
        .filter((configCell) => configCell.name !== 'Шинный мост')
        .reduce((sum, configCell) => {
          let cellCount = 0;

          switch (configCell.name) {
            case 'Ввод':
              cellCount = runn.cellConfigs
                .filter((c) => c.purpose === 'Ввод')
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
            case 'СВ':
              cellCount = runn.cellConfigs
                .filter((c) => c.purpose === 'Секционный выключатель')
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
            default:
              cellCount = runn.cellConfigs
                .filter((c) => c.purpose === configCell.name)
                .reduce((total, cell) => total + (cell.quantity || 1), 0);
              break;
          }

          const weightPerCell = configCell.quantity || 0;
          return sum + (weightPerCell * cellCount);
        }, 0)
    : 0;

  const totalPrice = busbar.material 
    ? totalWeight * getPricePerKg(busbar.material)
    : 0;

  // Рассчитываем данные для калькуляции сборных шин
  const busbarCalculationResult = busbarCalculation
    ? calculateCost(totalPrice, {
        hourlyRate: busbarCalculation.data.calculation?.hourlyRate || 2000,
        manufacturingHours: busbarCalculation.data.calculation?.manufacturingHours || 4,
        overheadPercentage: busbarCalculation.data.calculation?.overheadPercentage || 10,
        adminPercentage: busbarCalculation.data.calculation?.adminPercentage || 15,
        plannedProfitPercentage: busbarCalculation.data.calculation?.plannedProfitPercentage || 10,
        ndsPercentage: busbarCalculation.data.calculation?.ndsPercentage || 12,
      })
    : null;

  return {
    selectedBreaker,
    matchingConfig,
    totalWeight,
    totalPrice,
    busbarCalculation,
    busbarCalculationResult,
    busMaterial: busbar.material,
    getBreakerCurrent,
    getPricePerKg,
    calculationsLoading,
  };
};
