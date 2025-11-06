import React, { useState, useEffect } from 'react';
import { useTransformerStore } from '@/store/useTransformerStore';
import { switchgearApi, Switchgear } from '@/api/switchgear';
import { useRunnStore } from '@/store/useRunnStore';
import { useMaterialPrices } from '@/hooks/useMaterialPrices';

interface BusbarConfigurationProps {
  className?: string;
  transformerPower?: number;
  transformerBusbars?: string;
  onUstDataChange?: (data: {
    mainUstWeight: number;
    zeroUstWeight: number;
    material: string;
  }) => void;
}

export function BusbarConfiguration({ 
  className = '', 
  transformerPower, 
  transformerBusbars,
  onUstDataChange
}: BusbarConfigurationProps) {
  const { selectedTransformer } = useTransformerStore();
  const { aluminum: aluminumPrice, copper: copperPrice } = useMaterialPrices();
  
  // Используем переданные пропсы или данные из store
  const power = transformerPower || selectedTransformer?.power;
  const busbars = transformerBusbars || selectedTransformer?.busbars;
  const runn = useRunnStore();
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);
  const [loading, setLoading] = useState(true);

  // Загружаем конфигурации коммутационных аппаратов
  useEffect(() => {
    const fetchSwitchgearConfigs = async () => {
      try {
        setLoading(true);
        const configs = await switchgearApi.getAll();
        setSwitchgearConfigs(configs);
      } catch (error) {
        console.error('Error fetching switchgear configs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSwitchgearConfigs();
  }, []);

  // Получаем цену за кг материала (динамически из API)
  const getPricePerKg = (material: string) => {
    if (material === 'АД' || material === 'АД2') {
      return aluminumPrice;
    }
    if (material === 'МТ' || material === 'МТ2') {
      return copperPrice;
    }
    return 0;
  };

  // Находим подходящую конфигурацию для "Панель ЩО-70" по мощности трансформатора
  const matchingConfig = power && busbars
    ? switchgearConfigs.find((config) => {
        const possibleGroups = busbars === 'Алюминий' 
          ? ['АД', 'АД2', 'АД3'] 
          : ['МТ', 'МТ2', 'МТ3'];
        
        const isMatch = (
          config.type === 'Панель ЩО-70' &&
          config.breaker === power.toString() &&
          possibleGroups.includes(config.group)
        );
        
        console.log('🔍 Проверка конфигурации:', {
          type: config.type,
          breaker: config.breaker,
          group: config.group,
          power: power,
          busbars: busbars,
          possibleGroups,
          isMatch
        });
        
        if (isMatch) {
          console.log('✅ Найдена конфигурация для основной системы:', {
            type: config.type,
            breaker: config.breaker,
            group: config.group,
            power: power,
            busbars: busbars
          });
        }
        
        return isMatch;
      })
    : null;

  // Находим конфигурацию для нулевых шин
  const zeroConfig = power && busbars
    ? switchgearConfigs.find((config) => {
        const possibleGroups = busbars === 'Алюминий' 
          ? ['АД', 'АД2', 'АД3'] 
          : ['МТ', 'МТ2', 'МТ3'];
        
        const isMatch = (
          config.type === 'Панель ЩО-70N' &&
          config.breaker === power.toString() &&
          possibleGroups.includes(config.group)
        );
        
        console.log('🔍 Проверка конфигурации нулевых шин:', {
          type: config.type,
          breaker: config.breaker,
          group: config.group,
          power: power,
          busbars: busbars,
          possibleGroups,
          isMatch
        });
        
        if (isMatch) {
          console.log('✅ Найдена конфигурация для нулевых шин:', {
            type: config.type,
            breaker: config.breaker,
            group: config.group,
            power: power,
            busbars: busbars
          });
        }
        
        return isMatch;
      })
    : null;

  // Рассчитываем вес и стоимость для основной системы
  const calculateMainBusbar = () => {
    if (!matchingConfig || !matchingConfig.cells) return null;

    const cellDetails: Array<{name: string, quantity: number, weightPerCell: number, totalWeight: number}> = [];
    
    const totalWeight = matchingConfig.cells
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
            selectedCellCount = 0;
        }

        const weightPerCell = configCell.weight || 0;
        const totalWeight = selectedCellCount * weightPerCell;
        
        cellDetails.push({
          name: configCell.name,
          quantity: selectedCellCount,
          weightPerCell,
          totalWeight
        });

        return sum + totalWeight;
      }, 0);

    const material = matchingConfig.group || 'АД2';
    const pricePerKg = getPricePerKg(material);
    const totalCost = totalWeight * pricePerKg;

    return {
      config: matchingConfig,
      cellDetails,
      totalWeight,
      material,
      pricePerKg,
      totalCost
    };
  };

  // Рассчитываем вес и стоимость для нулевых шин
  const calculateZeroBusbar = () => {
    if (!zeroConfig || !zeroConfig.cells) return null;

    const cellDetails: Array<{name: string, quantity: number, weightPerCell: number, totalWeight: number}> = [];
    
    const totalWeight = zeroConfig.cells
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
            selectedCellCount = 0;
        }

        const weightPerCell = configCell.weight || 0;
        const totalWeight = selectedCellCount * weightPerCell;
        
        cellDetails.push({
          name: configCell.name,
          quantity: selectedCellCount,
          weightPerCell,
          totalWeight
        });

        return sum + totalWeight;
      }, 0);

    const material = zeroConfig.group || 'АД';
    const pricePerKg = getPricePerKg(material);
    const totalCost = totalWeight * pricePerKg;

    return {
      config: zeroConfig,
      cellDetails,
      totalWeight,
      material,
      pricePerKg,
      totalCost
    };
  };


  // Передаем данные о УСТ в родительский компонент
  useEffect(() => {
    if (matchingConfig && zeroConfig && onUstDataChange) {
      const mainUstWeight = matchingConfig.cells.find(cell => cell.name === 'УСТ')?.quantity || 0;
      const zeroUstWeight = zeroConfig.cells.find(cell => cell.name === 'УСТ')?.quantity || 0;
      
      // Определяем материал на основе группы конфигурации
      const getMaterialFromGroup = (group: string) => {
        if (group.includes('МТ')) return 'Медь';
        if (group.includes('АД')) return 'Алюминий';
        return busbars === 'Алюминий' ? 'Алюминий' : 'Медь';
      };
      
      const material = getMaterialFromGroup(matchingConfig.group) || getMaterialFromGroup(zeroConfig.group) || (busbars === 'Алюминий' ? 'Алюминий' : 'Медь');
      
      const ustData = {
        mainUstWeight,
        zeroUstWeight,
        material
      };
      
      onUstDataChange(ustData);
    }
  }, [matchingConfig, zeroConfig, busbars, onUstDataChange]);

  const mainBusbar = calculateMainBusbar();
  const zeroBusbar = calculateZeroBusbar();

  if (loading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!power || !busbars) {
    return null;
  }

  if (!mainBusbar) {
    return (
      <div className={`bg-white border border-gray-200 rounded-2xl p-6 shadow-lg ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Конфигурация сборных шин</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-2">
            Конфигурация не найдена для выбранных параметров:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-700">
              <strong>Мощность:</strong> {power} кВА<br/>
              <strong>Материал:</strong> {busbars}
            </p>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Попробуйте изменить параметры трансформатора
          </p>
        </div>
      </div>
    );
  }

  return null;
}