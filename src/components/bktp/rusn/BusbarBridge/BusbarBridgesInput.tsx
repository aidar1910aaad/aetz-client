import React from 'react';
import { Trash2, Plus } from 'lucide-react';
import { BusMaterial } from '@/types/rusn';
import { Switchgear } from '@/api/switchgear';
import { SingleBusbarBridge } from './SingleBusbarBridge';
import { BusAccentButton, BusEmptyState } from '@/components/shared/busUi';

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

  const totalQty = bridges.reduce((sum, bridge) => sum + bridge.quantity, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700">Список мостов</span>
        <BusAccentButton onClick={addBridge}>
          <Plus className="h-4 w-4" />
          Добавить мост
        </BusAccentButton>
      </div>

      {bridges.length === 0 ? (
        <BusEmptyState
          title="Нет добавленных шинных мостов"
          description='Нажмите «Добавить мост», чтобы задать длину и количество'
          action={
            <BusAccentButton onClick={addBridge}>
              <Plus className="h-4 w-4" />
              Добавить мост
            </BusAccentButton>
          }
        />
      ) : (
        <div className="space-y-3">
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
        <div className="rounded-xl border border-[#8eba1e]/25 bg-[#8eba1e]/5 px-4 py-3 text-sm text-gray-700">
          <span className="font-medium text-gray-900">Итого:</span>{' '}
          {bridges.length} {bridges.length === 1 ? 'мост' : 'моста'} · {totalQty}{' '}
          {totalQty === 1 ? 'шт.' : 'шт.'}
        </div>
      )}
    </div>
  );
};
