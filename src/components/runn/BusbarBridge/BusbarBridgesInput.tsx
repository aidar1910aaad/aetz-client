import React from 'react';
import { BusbarBridge, BusMaterial } from '@/store/useRunnStore';
import { Switchgear } from '@/api/switchgear';

interface BusbarBridgesInputProps {
  bridges: BusbarBridge[];
  onBridgesChange: (bridges: BusbarBridge[]) => void;
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: Switchgear | null;
  weightPerMeter: number;
  pricePerKg: number;
  busbarBridgeCalculation: any;
}

export const BusbarBridgesInput: React.FC<BusbarBridgesInputProps> = ({
  bridges,
  onBridgesChange,
  busBridgeMaterial,
  matchingConfig,
  weightPerMeter,
  pricePerKg,
  busbarBridgeCalculation,
}) => {
  const addBridge = () => {
    onBridgesChange([...bridges, { length: 0, width: 100, quantity: 1 }]);
  };

  const removeBridge = (index: number) => {
    onBridgesChange(bridges.filter((_, i) => i !== index));
  };

  const updateBridge = (index: number, field: keyof BusbarBridge, value: number) => {
    const newBridges = bridges.map((bridge, i) =>
      i === index ? { ...bridge, [field]: value } : bridge
    );
    onBridgesChange(newBridges);
  };

  const calculateBridgeWeight = (bridge: BusbarBridge) => {
    return bridge.length * bridge.quantity * weightPerMeter;
  };

  const calculateBridgePrice = (bridge: BusbarBridge) => {
    return calculateBridgeWeight(bridge) * pricePerKg;
  };

  if (!busBridgeMaterial || !matchingConfig) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Шинные мосты</h4>
        <button
          onClick={addBridge}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
        >
          Добавить мост
        </button>
      </div>

      {bridges.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Нажмите "Добавить мост" для добавления шинного моста</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bridges.map((bridge, index) => (
            <div key={index} className="border border-gray-200 rounded p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-800">Мост #{index + 1}</h5>
                <button
                  onClick={() => removeBridge(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Удалить
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Длина (м)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={bridge.length}
                    onChange={(e) => updateBridge(index, 'length', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ширина (мм)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={bridge.width}
                    onChange={(e) => updateBridge(index, 'width', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Количество
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={bridge.quantity}
                    onChange={(e) => updateBridge(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  />
                </div>
              </div>

              {bridge.length > 0 && (
                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <span>Вес на метр:</span>
                    <span className="ml-1 font-medium">{weightPerMeter.toFixed(3)} кг/м</span>
                  </div>
                  <div>
                    <span>Общий вес:</span>
                    <span className="ml-1 font-medium">{calculateBridgeWeight(bridge).toFixed(2)} кг</span>
                  </div>
                  <div>
                    <span>Стоимость:</span>
                    <span className="ml-1 font-medium text-green-600">
                      {calculateBridgePrice(bridge).toLocaleString()} тг
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {bridges.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded">
          <h5 className="font-medium text-blue-900 mb-2">Общие итоги</h5>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Общий вес мостов:</span>
              <span className="ml-2 font-medium">
                {bridges.reduce((sum, bridge) => sum + calculateBridgeWeight(bridge), 0).toFixed(2)} кг
              </span>
            </div>
            <div>
              <span className="text-gray-600">Общая стоимость:</span>
              <span className="ml-2 font-medium text-blue-700">
                {bridges.reduce((sum, bridge) => sum + calculateBridgePrice(bridge), 0).toLocaleString()} тг
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

