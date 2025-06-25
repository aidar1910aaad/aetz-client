import { useState, useEffect } from 'react';
import { useRusnStore } from '@/store/useRusnStore';
import { BusMaterial } from '@/types/rusn';
import { switchgearApi, Switchgear } from '@/api/switchgear';

function formatNumber(num: number) {
  return num.toLocaleString('ru-RU');
}

export const RusnBusBridge = () => {
  const rusn = useRusnStore();
  const { busBridge } = rusn.global;
  const [switchgearConfigs, setSwitchgearConfigs] = useState<Switchgear[]>([]);

  // Находим вводной выключатель
  const inputCell = rusn.cellConfigs.find((cell) => cell.purpose === 'Ввод');
  const selectedBreaker = inputCell?.breaker;

  // Извлекаем ток из имени выключателя
  const getBreakerCurrent = (name: string) => {
    const match = name.match(/(\d+)А/);
    return match ? parseInt(match[1]) : null;
  };

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

  const handleMaterialChange = (material: BusMaterial) => {
    rusn.setBusMaterial(material);
  };

  const getPricePerKg = (material: BusMaterial) => {
    if (material === 'АД' || material === 'АД2') {
      return 2800;
    }
    if (material === 'МТ' || material === 'МТ2') {
      return 5600;
    }
    return 0;
  };

  // Находим подходящую конфигурацию для выбранного выключателя
  const matchingConfig = selectedBreaker
    ? switchgearConfigs.find((config) => {
        const breakerCurrent = getBreakerCurrent(selectedBreaker.name);
        const configBreakerMatch = config.breaker.match(/(\d+)A/);
        const configBreakerCurrent = configBreakerMatch ? parseInt(configBreakerMatch[1]) : null;
        return breakerCurrent && configBreakerCurrent && breakerCurrent === configBreakerCurrent;
      })
    : null;

  // Суммируем quantity по всем ячейкам выбранного свитчгеара
  let totalWeight = 0;
  if (matchingConfig) {
    totalWeight = matchingConfig.cells.reduce((sum, cell) => sum + (cell.quantity || 0), 0);
  }
  const pricePerKg = getPricePerKg(busBridge.material);
  const totalPrice = totalWeight * pricePerKg;

  // DEBUG: Выводим настройки выбранного свитчгеара и веса по ячейкам
  if (matchingConfig) {
    console.log('DEBUG: matchingConfig (выбранный свитчгеар):', matchingConfig);
    console.log(
      'DEBUG: веса по ячейкам:',
      matchingConfig.cells.map((cell) => ({ name: cell.name, quantity: cell.quantity }))
    );
  }

  return (
    <div className="mt-8 p-4 border rounded-lg bg-white">
      <h3 className="text-lg font-semibold mb-4">Шинный мост (авторасчёт)</h3>

      <div className="space-y-4">
        {selectedBreaker && (
          <div className="flex items-center space-x-4">
            <label className="w-32">Выбранный выключатель:</label>
            <span className="font-medium">
              {selectedBreaker.name} ({getBreakerCurrent(selectedBreaker.name)}А)
            </span>
          </div>
        )}

        {matchingConfig && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <h4 className="font-medium text-gray-700">Настройки свитчгеара:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Тип:</span>
                <span className="ml-2 font-medium">{matchingConfig.type}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Группа:</span>
                <span className="ml-2 font-medium">{matchingConfig.group}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Шина:</span>
                <span className="ml-2 font-medium">{matchingConfig.busbar}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Ячейки:</span>
                <div className="ml-2">
                  {matchingConfig.cells.map((cell, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{cell.name}:</span>
                      <span>{formatNumber(cell.quantity || 0)} кг</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <label className="w-32">Материал шины:</label>
          <select
            value={busBridge.material}
            onChange={(e) => handleMaterialChange(e.target.value as BusMaterial)}
            className="border rounded px-2 py-1"
          >
            <option value="АД">Аллюминий</option>
            <option value="МТ">Медь</option>
          </select>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-32">Общая масса:</label>
          <span className="font-medium">{formatNumber(totalWeight)} кг</span>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-32">Цена за кг:</label>
          <span className="font-medium">{formatNumber(pricePerKg)} тг</span>
        </div>

        <div className="flex items-center space-x-4">
          <label className="w-32">Итого:</label>
          <span className="font-medium">{formatNumber(totalPrice)} тг</span>
        </div>

        {/* Итоговая строка с данными */}
        <div className="mt-6 text-sm">
          {[
            'Сборный шина',
            busBridge.material === 'АД' || busBridge.material === 'АД2' ? 'Аллюминий' : 'Медь',
            matchingConfig?.group || '',
            matchingConfig?.busbar || '',
            matchingConfig?.amperage ? `${matchingConfig.amperage}A` : '',
            formatNumber(totalPrice),
          ].join(' ')}
        </div>
      </div>
    </div>
  );
};
