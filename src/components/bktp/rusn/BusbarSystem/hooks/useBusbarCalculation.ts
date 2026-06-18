import { useState, useEffect } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { calculateCost } from '@/utils/calculationUtils';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { applyApiCalculationRates } from '@/utils/calculationSettings';

export const useBusbarCalculation = () => {
  const rusn = useRusnStore();
  const { busBridge } = rusn.global;
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();

  // Получаем выбранную группу из localStorage
  const [selectedGroupSlug] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedGroupSlug') || '';
    }
    return '';
  });

  // Получаем все калькуляции по выбранной группе
  const { calculations, loading: calculationsLoading, settingsRates } =
    useRusnCalculation(selectedGroupSlug);

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
  const inputCell = rusn.cellConfigs.find((cell) => cell.purpose === 'Ввод');
  const selectedBreaker = inputCell?.breaker;

  // Получаем цену за кг (динамически из API)
  const getPricePerKg = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return aluminumPrice;
    }
    if (material === 'МТ' || material === 'МТ2') {
      return copperPrice;
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

  // Рассчитываем общий вес и стоимость
  const totalWeight = matchingConfig
    ? matchingConfig.cells
        .filter((configCell) => configCell.name !== 'Шинный мост')
        .reduce((sum, configCell) => {
          let cellCount = 0;

          switch (configCell.name) {
            case 'Ввод':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Ввод')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'СВ':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Секционный выключатель')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'СР':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Секционный разьединитель')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'ТР':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Трансформаторная')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'ОТХ':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Отходящая')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'ТН':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Трансформатор напряжения')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'ТСН':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'Трансформатор собственных нужд')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            case 'ЗШН':
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === 'ЗШН')
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
            default:
              cellCount = rusn.cellConfigs
                .filter((c) => c.purpose === configCell.name)
                .reduce((total, cell) => total + (cell.count || 1), 0);
              break;
          }

          return sum + (configCell.quantity || 0) * cellCount;
        }, 0)
    : 0;

  const pricePerKg = getPricePerKg(busBridge.material);
  const totalPrice = totalWeight * pricePerKg;

  // Рассчитываем стоимость по калькуляции сборных шин
  const busbarCalculationResult = busbarCalculation
    ? calculateCost(
        busbarCalculation.data.categories.reduce(
          (sum, category) =>
            sum + category.items.reduce((itemSum, item) => itemSum + item.price * item.quantity, 0),
          0
        ) + totalPrice,
        applyApiCalculationRates(
          {
            manufacturingHours: busbarCalculation.data.calculation?.manufacturingHours || 1,
          },
          settingsRates
        )
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
    if (matchingConfig && busbarCalculation && busbarCalculationResult) {
      const materialName =
        busBridge.material === 'АД' || busBridge.material === 'АД2' ? 'Алюминий' : 'Медь';
      const summaryName = `Сборный шина ${materialName} ${matchingConfig.busbar} ${matchingConfig.breaker}`;

      const newSummary = {
        name: summaryName,
        quantity: 1,
        pricePerUnit: busbarCalculationResult.finalPrice,
        totalPrice: busbarCalculationResult.finalPrice,
      };

      rusn.setBusbarSummary(newSummary);
    } else {
      rusn.setBusbarSummary(null);
    }
  }, [
    matchingConfig?.id,
    matchingConfig?.busbar,
    matchingConfig?.breaker,
    busbarCalculation?.id,
    busbarCalculationResult?.finalPrice,
    busBridge.material,
  ]);

  // Отображаем калькуляцию в консоли
  useEffect(() => {
    if (selectedGroupSlug && !calculationsLoading) {
      const busbarCalculation = calculations.cell.find(
        (calc) => calc.data?.cellConfig?.type === 'busbar'
      );

      if (busbarCalculation) {
      } else {
      }
    }
  }, [selectedGroupSlug, calculations, calculationsLoading]);

  return {
    // Состояние
    switchgearConfigs,
    selectedGroupSlug,
    calculations,
    calculationsLoading,
    busbarCalculation,
    selectedBreaker,
    matchingConfig,
    totalWeight,
    totalPrice,
    busbarCalculationResult,
    busBridgeMaterial: busBridge.material,

    // Методы
    getBreakerCurrent,
    getPricePerKg,
    getMaterialGroup,
  };
};
