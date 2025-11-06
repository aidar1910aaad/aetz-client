import { useState, useEffect } from 'react';
import { useRunnStore, BusMaterial } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { Material } from '@/api/material';
import { api } from '@/api/baseUrl';

export const useZeroBusbarCalculation = () => {
  const runn = useRunnStore();
  const { selectedTransformer } = useTransformerStore();
  const zeroBusbar = runn.global.zeroBusbar || { 
    enabled: false, 
    material: null, 
    configuration: '35', 
    weight: 311.00, 
    pricePerKg: 5600 
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
  const getPricePerKg = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return materialPrices.aluminum;
    }
    if (material === 'МТ' || material === 'МТ2') {
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

  // Получаем возможные группы на основе выбранного типа материала из трансформатора
  const getPossibleGroupsFromTransformer = (busbarsType: string) => {
    if (busbarsType === 'Алюминий') {
      return ['АД', 'АД2', 'АД3'];
    }
    if (busbarsType === 'Медь') {
      return ['МТ', 'МТ2', 'МТ3'];
    }
    return [];
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

  // Загружаем цены материалов из API
  useEffect(() => {
    const fetchMaterialPrices = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Загружаем алюминий (ID: 3489) и медь (ID: 3490)
        const [aluminumMaterial, copperMaterial] = await Promise.all([
          getMaterialById(3489, token),
          getMaterialById(3490, token)
        ]);

        setMaterialPrices({
          aluminum: typeof aluminumMaterial.price === 'string'
            ? parseFloat(aluminumMaterial.price)
            : aluminumMaterial.price,
          copper: typeof copperMaterial.price === 'string'
            ? parseFloat(copperMaterial.price)
            : copperMaterial.price
        });
      } catch (error) {
        console.error('Error fetching material prices:', error);
        // Оставляем значения по умолчанию при ошибке
      }
    };

    fetchMaterialPrices();
  }, []);

  // Загружаем калькуляцию сборных шин для нулевых шин
  useEffect(() => {
    fetchBusbarCalculation();
  }, []);

  // Находим подходящую конфигурацию для нулевых шин
  const matchingConfig = transformerPower
    ? switchgearConfigs.find((config) => {
        // Используем тип материала из трансформатора, если он выбран
        const possibleGroups = selectedTransformer?.busbars 
          ? getPossibleGroupsFromTransformer(selectedTransformer.busbars)
          : zeroBusbar.material 
            ? getPossibleGroupsForMaterial(zeroBusbar.material) 
            : [];
        
        // Ищем конфигурацию типа "Панель ЩО-70N" с подходящими параметрами
        return (
          config.type === 'Панель ЩО-70N' &&
          config.breaker === transformerPower.toString() &&
          possibleGroups.includes(config.group)
        );
      })
    : null;


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
    if (matchingConfig?.group === 'МТ' || matchingConfig?.group === 'МТ2') {
      return 'МТ';
    }
    if (matchingConfig?.group === 'АД' || matchingConfig?.group === 'АД2') {
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