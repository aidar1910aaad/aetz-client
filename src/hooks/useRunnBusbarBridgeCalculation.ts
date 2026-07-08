import { useEffect } from 'react';
import { useRunnStore } from '@/store/useRunnStore';
import { useTransformerStore } from '@/store/useTransformerStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { Material } from '@/api/material';
import { api } from '@/api/baseUrl';

export const useRunnBusbarBridgeCalculation = () => {
  const runn = useRunnStore();
  const { selectedTransformer } = useTransformerStore();
  const { busBridges } = runn;
  
  
  // Инициализируем busBridges если он undefined
  const safeBusBridges = busBridges || [];

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

  // Функция для загрузки калькуляции шинного моста
  const fetchBusbarCalculation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const response = await fetch(`${api}/calculations/panel-sho-70/для-шинного-моста-рунн`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при получении калькуляции');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching busbar bridge calculation:', error);
      return null;
    }
  };

  // Функция для загрузки цен материалов
  const fetchMaterialPrices = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { aluminum: 2800, copper: 5600 };

      const [aluminumMaterial, copperMaterial] = await Promise.all([
        getMaterialById(3489, token),
        getMaterialById(3490, token)
      ]);

      return {
        aluminum: typeof aluminumMaterial.price === 'string'
          ? parseFloat(aluminumMaterial.price)
          : aluminumMaterial.price,
        copper: typeof copperMaterial.price === 'string'
          ? parseFloat(copperMaterial.price)
          : copperMaterial.price
      };
    } catch (error) {
      console.error('Error fetching material prices:', error);
      return { aluminum: 2800, copper: 5600 };
    }
  };

  // Функция для расчета стоимости пары мостов как одной калькуляции
  const calculateBridgePairCost = async (primaryBridge: any, pairedBridge: any, materialPrices: any, busbarCalculation: any) => {
    if (!busbarCalculation) return 0;

    // Определяем материал
    const materialType = selectedTransformer?.busbars === 'Медь' ? 'copper' : 'aluminum';
    const pricePerKg = materialPrices[materialType];

    // Получаем конфигурации, где quantity для "Шинный мост" теперь трактуется как кг/шт
    const switchgearConfigs = await switchgearApi.getAll();
    const transformerPower = selectedTransformer?.power;
    const matchingConfig = transformerPower
      ? switchgearConfigs.find((config) => {
          const possibleGroups = selectedTransformer?.busbars === 'Медь' ? ['МТ', 'МТ2'] : ['АД', 'АД2'];
          return (
            config.type === 'Панель ЩО-70' &&
            config.breaker === transformerPower.toString() &&
            possibleGroups.includes(config.group)
          );
        })
      : null;

    // Получаем zero busbar configuration для мостов N
    const possibleZeroGroups = selectedTransformer?.busbars === 'Медь' 
      ? ['МТ', 'МТ1', 'МТ2', 'МТ3', 'МТ4'] 
      : ['АД', 'АД1', 'АД2', 'АД3', 'АД4'];
    
    const zeroBusbarConfig = switchgearConfigs.find((config: any) => 
      config.type === 'Панель ЩО-70N' && 
      config.breaker === transformerPower.toString() &&
      possibleZeroGroups.includes(config.group)
    );

    const bridgeCell = matchingConfig?.cells?.find((cell: any) => cell.name === 'Шинный мост');
    const primaryWeightPerPiece = bridgeCell?.quantity || 0;

    const zeroBridgeCell = zeroBusbarConfig?.cells?.find((cell: any) => cell.name === 'Шинный мост');
    const pairedWeightPerPiece = zeroBridgeCell?.quantity || 0;

    // Материалы для обоих мостов
    const primaryMaterialCost = primaryWeightPerPiece * primaryBridge.quantity * pricePerKg;
    const pairedMaterialCost = pairedWeightPerPiece * pairedBridge.quantity * pricePerKg;
    const totalBridgeMaterialCost = primaryMaterialCost + pairedMaterialCost;

    // Дополнительные материалы из калькуляции (только один раз!)
    const additionalMaterialsCost = busbarCalculation.data.categories.reduce(
      (total, category) => {
        return total + category.items.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.price) * item.quantity),
          0
        );
      },
      0
    );

    // Общая стоимость материалов (мосты + дополнительные материалы только один раз)
    const totalMaterialsCost = totalBridgeMaterialCost + (additionalMaterialsCost * primaryBridge.quantity);

    // Применяем калькуляцию
    const calculationData = busbarCalculation.data.calculation;
    const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate * primaryBridge.quantity;
    const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
    const productionCost = totalMaterialsCost + totalSalary + overheadCost;
    const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
    const fullCost = productionCost + adminCost;
    const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
    const wholesalePrice = fullCost + plannedProfit;
    const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
    const finalPrice = wholesalePrice + ndsAmount;

    return finalPrice;
  };

  // Функция для получения matchingConfig для формирования названия
  const getMatchingConfigForBridge = async () => {
    const switchgearConfigs = await switchgearApi.getAll();
    const transformerPower = selectedTransformer?.power;
    if (!transformerPower) return null;
    
    const possibleGroups = selectedTransformer?.busbars === 'Медь' 
      ? ['МТ', 'МТ2', 'МТ3'] 
      : ['АД', 'АД2', 'АД3'];
    
    return switchgearConfigs.find((config) => {
      return (
        config.type === 'Панель ЩО-70' &&
        config.breaker === transformerPower.toString() &&
        possibleGroups.includes(config.group)
      );
    }) || null;
  };

  // Функция для расчета стоимости моста с калькуляцией
  const calculateBridgeCost = async (bridge: any, materialPrices: any, busbarCalculation: any) => {
    if (!busbarCalculation) return 0;

    // Определяем материал
    const materialType = selectedTransformer?.busbars === 'Медь' ? 'copper' : 'aluminum';
    const pricePerKg = materialPrices[materialType];

    // Получаем конфигурации, где quantity для "Шинный мост" трактуется как кг/шт
    const switchgearConfigs = await switchgearApi.getAll();
    const transformerPower = selectedTransformer?.power;
    const matchingConfig = transformerPower
      ? switchgearConfigs.find((config) => {
          const possibleGroups = selectedTransformer?.busbars === 'Медь' ? ['МТ', 'МТ2'] : ['АД', 'АД2'];
          return (
            config.type === 'Панель ЩО-70' &&
            config.breaker === transformerPower.toString() &&
            possibleGroups.includes(config.group)
          );
        })
      : null;

    // Получаем zero busbar configuration для мостов N - ищем конфигурацию по всем вариантам группы
    const possibleZeroGroups = selectedTransformer?.busbars === 'Медь' 
      ? ['МТ', 'МТ1', 'МТ2', 'МТ3', 'МТ4'] 
      : ['АД', 'АД1', 'АД2', 'АД3', 'АД4'];
    
    const zeroBusbarConfig = switchgearConfigs.find((config: any) => 
      config.type === 'Панель ЩО-70N' && 
      config.breaker === transformerPower.toString() &&
      possibleZeroGroups.includes(config.group)
    );

    // Получаем расход в кг/шт из конфигурации
    const bridgeCell = matchingConfig?.cells?.find((cell: any) => cell.name === 'Шинный мост');
    const primaryWeightPerPiece = bridgeCell?.quantity || 0;

    const zeroBridgeCell = zeroBusbarConfig?.cells?.find((cell: any) => cell.name === 'Шинный мост');
    const calculatedWeight = bridge.name.includes('Шинный мост N')
      ? zeroBridgeCell?.quantity || 0
      : primaryWeightPerPiece;

    // Стоимость материалов моста
    const bridgeMaterialCost = calculatedWeight * bridge.quantity * pricePerKg;

    // Дополнительные материалы из калькуляции
    const additionalMaterialsCost = busbarCalculation.data.categories.reduce(
      (total, category) => {
        return total + category.items.reduce(
          (itemSum, item) => itemSum + (parseFloat(item.price) * item.quantity),
          0
        );
      },
      0
    );

    // Общая стоимость материалов
    const totalMaterialsCost = bridgeMaterialCost + (additionalMaterialsCost * bridge.quantity);

    // Применяем калькуляцию
    const calculationData = busbarCalculation.data.calculation;
    const totalSalary = calculationData.manufacturingHours * calculationData.hourlyRate * bridge.quantity;
    const overheadCost = (totalMaterialsCost * calculationData.overheadPercentage) / 100;
    const productionCost = totalMaterialsCost + totalSalary + overheadCost;
    const adminCost = (totalMaterialsCost * calculationData.adminPercentage) / 100;
    const fullCost = productionCost + adminCost;
    const plannedProfit = (fullCost * calculationData.plannedProfitPercentage) / 100;
    const wholesalePrice = fullCost + plannedProfit;
    const ndsAmount = (wholesalePrice * calculationData.ndsPercentage) / 100;
    const finalPrice = wholesalePrice + ndsAmount;

    return finalPrice;
  };

  // Основной эффект для расчета сводки
  useEffect(() => {
    const calculateSummaries = async () => {
      if (!safeBusBridges || safeBusBridges.length === 0) {
        // Очищаем только сводки шинных мостов, не трогая нулевые шины
        // Используем функциональное обновление, чтобы получить актуальное состояние
        runn.setBusBridgeSummaries((currentSummaries) => {
          return (currentSummaries || []).filter(summary => 
            !summary.name.includes('Шинный мост')
            // Сохраняем все записи, которые не являются шинными мостами (включая нулевые шины)
          );
        });
        return;
      }

      try {
        // Загружаем необходимые данные
        const [materialPrices, busbarCalculation] = await Promise.all([
          fetchMaterialPrices(),
          fetchBusbarCalculation()
        ]);

        if (!busbarCalculation) {
          // Очищаем только сводки шинных мостов
          // Используем функциональное обновление, чтобы получить актуальное состояние
          runn.setBusBridgeSummaries((currentSummaries) => {
            return (currentSummaries || []).filter(summary => 
              !summary.name.includes('Шинный мост')
            );
          });
          return;
        }

        // Получаем matchingConfig для формирования названия
        const matchingConfigForBridge = await getMatchingConfigForBridge();
        
        // Рассчитываем сводки для каждого моста
        const bridgeSummaries = [];
        const processedIds = new Set();
        
        for (const bridge of safeBusBridges) {
          // Пропускаем, если уже обработали
          if (processedIds.has(bridge.id)) continue;
          
          const totalPrice = await calculateBridgeCost(bridge, materialPrices, busbarCalculation);
          
          if (totalPrice > 0) {
            // Проверяем, есть ли парный мост
            if (bridge.pairedId) {
              const pairedBridge = safeBusBridges.find(b => b.id === bridge.pairedId);
              if (pairedBridge) {
                // Используем расчет пары как единого блока
                const combinedPrice = await calculateBridgePairCost(bridge, pairedBridge, materialPrices, busbarCalculation);
                
                // Формируем название в формате: "Шинный мост 0,4кВ (шина МТ (80x8мм) 1690A)"
                let bridgeName = 'Шинный мост 0,4кВ';
                if (matchingConfigForBridge) {
                  const busbarSize = matchingConfigForBridge.busbar ? `${matchingConfigForBridge.busbar}мм` : '';
                  const amperage = matchingConfigForBridge.amperage ? `${matchingConfigForBridge.amperage}A` : '';
                  const group = matchingConfigForBridge.group || '';
                  
                  const innerParts = [
                    `шина ${group}`,
                    busbarSize ? `(${busbarSize})` : '',
                    amperage
                  ].filter(Boolean);
                  
                  if (innerParts.length > 0) {
                    bridgeName = `Шинный мост 0,4кВ (${innerParts.join(' ')})`;
                  }
                }
                
                bridgeSummaries.push({
                  name: bridgeName,
                  quantity: bridge.quantity, // Количество одинаковое для пары
                  pricePerUnit: combinedPrice,
                  totalPrice: combinedPrice,
                });
                
                // Отмечаем парный мост как обработанный
                processedIds.add(pairedBridge.id);
                processedIds.add(bridge.id);
              }
            } else {
              // Обычный мост без пары
              // Для мостов 0.4 формируем название по конфигурации
              let bridgeName = bridge.name;
              if (matchingConfigForBridge && (bridge.name.includes('0.4') || bridge.name.includes('Шинный мост'))) {
                const busbarSize = matchingConfigForBridge.busbar ? `${matchingConfigForBridge.busbar}мм` : '';
                const amperage = matchingConfigForBridge.amperage ? `${matchingConfigForBridge.amperage}A` : '';
                const group = matchingConfigForBridge.group || '';
                
                const innerParts = [
                  `шина ${group}`,
                  busbarSize ? `(${busbarSize})` : '',
                  amperage
                ].filter(Boolean);
                
                if (innerParts.length > 0) {
                  bridgeName = `Шинный мост 0,4кВ (${innerParts.join(' ')})`;
                }
              }
              
              bridgeSummaries.push({
                name: bridgeName,
                quantity: bridge.quantity,
                pricePerUnit: totalPrice,
                totalPrice: totalPrice,
              });
              processedIds.add(bridge.id);
            }
          }
        }

        // Сохраняем только сводки шинных мостов, сохраняя нулевые шины (новый формат "Шина N")
        // Используем функциональное обновление, чтобы получить актуальное состояние
        runn.setBusBridgeSummaries((currentSummaries) => {
          const nonBridgeSummaries = (currentSummaries || []).filter(summary => 
            !summary.name.includes('Шинный мост')
            // Сохраняем все записи, которые не являются шинными мостами (включая нулевые шины)
          );
          return [...nonBridgeSummaries, ...bridgeSummaries];
        });

        // Сохраняем первый мост как основной (для обратной совместимости)
        if (bridgeSummaries.length > 0) {
          runn.setBusBridgeSummary(bridgeSummaries[0]);
        } else {
          runn.setBusBridgeSummary(null);
        }

      } catch (error) {
        console.error('Error calculating busbar bridge summaries:', error);
        // Очищаем только сводки шинных мостов
        // Используем функциональное обновление, чтобы получить актуальное состояние
        runn.setBusBridgeSummaries((currentSummaries) => {
          return (currentSummaries || []).filter(summary => 
            !summary.name.includes('Шинный мост')
          );
        });
        runn.setBusBridgeSummary(null);
      }
    };

    calculateSummaries();
  }, [safeBusBridges, selectedTransformer?.busbars]);

  return {
    busBridgeSummaries: runn.busBridgeSummaries,
    busBridgeSummary: runn.busBridgeSummary,
  };
};