import { useState, useEffect, useMemo } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRusnCalculation } from '@/hooks/useRusnCalculation';
import { calculateCost } from '@/utils/calculationUtils';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';
import { applyApiCalculationRates } from '@/utils/calculationSettings';
import {
  getBusbarSectionWeightScale,
  getBusbarSectionsFromConfigs,
  normalizeBusbarSection,
} from '@/utils/busbarSectionUtils';
import { isVoltageTransformerCellPurpose } from '@/domain/rusn/rusnConstants';

function buildEffectiveConfig(
  baseConfig: Switchgear,
  section: string,
  matchingConfigs: Switchgear[],
  tableConfigs: Switchgear[],
  breakerCurrent: number | null,
  material: BusMaterial
): Switchgear {
  const sectionNorm = normalizeBusbarSection(section);
  const matchesSection = (c: Switchgear) =>
    normalizeBusbarSection(c.busbar) === sectionNorm;

  const pickBest = (configs: Switchgear[]) => {
    if (configs.length === 0) return undefined;
    if (configs.length === 1) return configs[0];
    if (breakerCurrent) {
      const suitable = configs
        .filter((c) => c.amperage >= breakerCurrent)
        .sort((a, b) => a.amperage - b.amperage);
      if (suitable.length > 0) return suitable[0];
    }
    return [...configs].sort((a, b) => a.amperage - b.amperage)[0];
  };

  const exactConfig =
    pickBest(matchingConfigs.filter(matchesSection)) ??
    pickBest(tableConfigs.filter(matchesSection));

  if (exactConfig) return exactConfig;

  const scale = getBusbarSectionWeightScale(baseConfig.busbar, section, material);
  return {
    ...baseConfig,
    busbar: section,
    cells: baseConfig.cells.map((cell) => ({
      ...cell,
      quantity: (cell.quantity || 0) * scale,
    })),
  };
}

export const useBusbarCalculation = () => {
  const rusn = useRusnStore();
  const setBusbarSection = useRusnStore((s) => s.setBusbarSection);
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
      return ['АД', 'АД2', 'АД3'];
    }
    if (material === 'МТ' || material === 'МТ2') {
      return ['МТ', 'МТ2', 'МТ3'];
    }
    return [];
  };

  // Находим все подходящие конфигурации для выбранного выключателя и материала
  const matchingConfigs = useMemo(() => {
    if (!selectedBreaker || !busBridge.material) return [];

    return switchgearConfigs.filter((config) => {
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
    });
  }, [switchgearConfigs, selectedBreaker, busBridge.material]);

  // Конфигурации из таблицы настроек БКТП (тип камеры + группа материала)
  const tableConfigs = useMemo(() => {
    if (!busBridge.material) return [];
    const materialGroups = getMaterialGroup(busBridge.material);
    return switchgearConfigs.filter((config) => materialGroups.includes(config.group));
  }, [switchgearConfigs, busBridge.material]);

  const availableBusbarSections = useMemo(
    () => getBusbarSectionsFromConfigs(tableConfigs),
    [tableConfigs]
  );

  const selectedBusbarSection = busBridge.selectedBusbarSection;

  const baseMatchingConfig = useMemo(() => {
    if (matchingConfigs.length === 0) return null;

    const breakerCurrent = selectedBreaker
      ? getBreakerCurrent(selectedBreaker.name)
      : null;

    if (breakerCurrent) {
      const suitable = matchingConfigs
        .filter((config) => config.amperage >= breakerCurrent)
        .sort((a, b) => a.amperage - b.amperage);
      if (suitable.length > 0) return suitable[0];
    }

    return [...matchingConfigs].sort((a, b) => a.amperage - b.amperage)[0];
  }, [matchingConfigs, selectedBreaker]);

  const matchingConfig = useMemo(() => {
    if (!baseMatchingConfig) return null;
    const section = selectedBusbarSection || baseMatchingConfig.busbar;
    const breakerCurrent = selectedBreaker
      ? getBreakerCurrent(selectedBreaker.name)
      : null;
    return buildEffectiveConfig(
      baseMatchingConfig,
      section,
      matchingConfigs,
      tableConfigs,
      breakerCurrent,
      busBridge.material
    );
  }, [
    baseMatchingConfig,
    matchingConfigs,
    tableConfigs,
    selectedBusbarSection,
    selectedBreaker,
    busBridge.material,
  ]);

  // Устанавливаем сечение по умолчанию из конфигурации
  useEffect(() => {
    if (!baseMatchingConfig) {
      if (busBridge.selectedBusbarSection) {
        setBusbarSection(null);
      }
      return;
    }

    const available = availableBusbarSections.map(normalizeBusbarSection);
    const selectedNorm = busBridge.selectedBusbarSection
      ? normalizeBusbarSection(busBridge.selectedBusbarSection)
      : null;

    if (!selectedNorm || !available.includes(selectedNorm)) {
      const nextSection = baseMatchingConfig.busbar;
      if (busBridge.selectedBusbarSection !== nextSection) {
        setBusbarSection(nextSection);
      }
    }
  }, [
    baseMatchingConfig,
    busBridge.selectedBusbarSection,
    availableBusbarSections,
    setBusbarSection,
  ]);

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
                .filter((c) => isVoltageTransformerCellPurpose(c.purpose))
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
      const summaryName = `Сборный шина ${materialName} ${matchingConfig.busbar}`;

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
    selectedBusbarSection,
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
    baseMatchingConfig,
    matchingConfigs,
    availableBusbarSections,
    selectedBusbarSection,
    totalWeight,
    totalPrice,
    busbarCalculationResult,
    busBridgeMaterial: busBridge.material,

    // Методы
    getBreakerCurrent,
    getPricePerKg,
    getMaterialGroup,
    setBusbarSection,
  };
};
