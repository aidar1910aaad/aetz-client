import React from 'react';
import { BusMaterial } from '@/types/rusn';
import { Switchgear } from '@/api/switchgear';
import { SingleBusbarBridgeCalculation } from './SingleBusbarBridgeCalculation';

interface BusbarBridge {
  id: string;
  length: number;
  quantity: number;
}

interface SingleBusbarBridgeProps {
  bridge: BusbarBridge;
  busBridgeMaterial: BusMaterial | null;
  matchingConfig: Switchgear;
  weightPerMeter: number;
  pricePerKg: number;
  onUpdate: (id: string, field: keyof BusbarBridge, value: number) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
  index: number;
  busbarBridgeCalculation: any;
}

export const SingleBusbarBridge: React.FC<SingleBusbarBridgeProps> = ({
  bridge,
  busBridgeMaterial,
  matchingConfig,
  weightPerMeter,
  pricePerKg,
  onUpdate,
  onRemove,
  canRemove,
  index,
  busbarBridgeCalculation,
}) => {
  const formatNumber = (num: number | null | undefined) => {
    return Number(num ?? 0).toLocaleString('ru-RU');
  };

  // Рассчитываем стоимость для этого моста
  const calculateBridgePrice = () => {
    const weight = weightPerMeter;
    return weight * pricePerKg;
  };

  const bridgePrice = calculateBridgePrice();
  const totalPrice = bridgePrice * bridge.quantity;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">Мост №{index + 1}</h4>
        {canRemove && (
          <button
            onClick={() => onRemove(bridge.id)}
            className="text-red-600 hover:text-red-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Расход из таблицы:</label>
          <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900">
            {formatNumber(weightPerMeter)} кг/шт
          </div>
        </div>
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">Количество:</label>
          <input
            type="number"
            value={bridge.quantity}
            onChange={(e) => onUpdate(bridge.id, 'quantity', Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-[#8eba1e] focus:ring-2 focus:ring-[#8eba1e]/20"
            placeholder="Количество"
            min="1"
            step="1"
          />
        </div>
      </div>

      {/* Расчет для этого моста */}
      {bridge.quantity > 0 && (
        <div className="bg-white border border-gray-200 rounded-md p-4 mb-4">
          <h5 className="text-sm font-semibold text-gray-900 mb-3">№{index + 1} Расчет моста</h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Масса</div>
              <div className="text-lg font-bold text-gray-900">
                {formatNumber(weightPerMeter)} кг/шт
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Цена за единицу</div>
              <div className="text-lg font-bold text-blue-600">{formatNumber(bridgePrice)} ₸</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-1">Итого</div>
              <div className="text-lg font-bold text-green-600">{formatNumber(totalPrice)} ₸</div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <strong>Формула:</strong> {formatNumber(weightPerMeter)} кг/шт ×{' '}
            {formatNumber(pricePerKg)} ₸/кг × {bridge.quantity} шт
            = {formatNumber(totalPrice)} ₸
          </div>
        </div>
      )}

      {/* Отдельная калькуляция для этого моста */}
      {bridge.quantity > 0 && (
        <SingleBusbarBridgeCalculation
          bridge={bridge}
          busBridgeMaterial={busBridgeMaterial}
          matchingConfig={matchingConfig}
          weightPerMeter={weightPerMeter}
          pricePerKg={pricePerKg}
          index={index}
          busbarBridgeCalculation={busbarBridgeCalculation}
        />
      )}
    </div>
  );
};
