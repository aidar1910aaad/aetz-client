import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { BusMaterial } from '@/types/rusn';
import { Switchgear } from '@/api/switchgear';
import { SingleBusbarBridge } from './SingleBusbarBridge';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

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
    const newBridge: BusbarBridge = {
      id: crypto.randomUUID(),
      length: 0,
      quantity: 1,
    };
    onBridgesChange([...bridges, newBridge]);
  };

  const removeBridge = (id: string) => {
    onBridgesChange(bridges.filter((bridge) => bridge.id !== id));
  };

  const updateBridge = (id: string, field: keyof BusbarBridge, value: number) => {
    onBridgesChange(
      bridges.map((bridge) => (bridge.id === id ? { ...bridge, [field]: value } : bridge))
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-700">Шинные мосты:</label>
        <button
          onClick={addBridge}
          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить мост</span>
        </button>
      </div>

      {bridges.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          <p>Нет добавленных шинных мостов</p>
          <p className="text-sm">Нажмите "Добавить мост" для начала</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bridges.map((bridge, index) => (
            <SingleBusbarBridge
              key={bridge.id}
              bridge={bridge}
              busBridgeMaterial={busBridgeMaterial}
              matchingConfig={matchingConfig!}
              weightPerMeter={weightPerMeter}
              pricePerKg={pricePerKg}
              onUpdate={updateBridge}
              onRemove={removeBridge}
              canRemove={bridges.length > 1}
              index={index}
              busbarBridgeCalculation={busbarBridgeCalculation}
            />
          ))}
        </div>
      )}

      {bridges.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="text-sm text-blue-800">
            <strong>Итого:</strong> {bridges.length}{' '}
            {bridges.length === 1 ? 'шинный мост' : 'шинных моста'}(
            {bridges.reduce((sum, bridge) => sum + bridge.quantity, 0)}{' '}
            {bridges.reduce((sum, bridge) => sum + bridge.quantity, 0) === 1 ? 'штука' : 'штуки'})
          </div>
        </div>
      )}
    </div>
  );
};
