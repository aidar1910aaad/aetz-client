'use client';

import React from 'react';
import { useBmzStore } from '@/store/useBmzStore';
import { BmzSettings } from '@/api/bmz';
import { formatNumber } from '@/utils/formatNumber';

interface BmzOptionsProps {
  state: Record<string, boolean>;
  setField: (field: string, value: boolean) => void;
  disabled: boolean;
  buildingType: 'bmz' | 'tp' | 'none';
  length: number;
  width: number;
}

const BmzOptions = ({
  state,
  setField,
  disabled,
  buildingType,
  length,
  width,
}: BmzOptionsProps) => {
  const bmz = useBmzStore();
  const area = (length / 1000) * (width / 1000);
  const roundedArea = Math.round(area * 100) / 100;
  const isDisabled = buildingType === 'none';

  if (!bmz.settings) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Дополнительное оборудование</h3>
      <div className="grid grid-cols-2 gap-4">
        {bmz.settings.equipment.map((equipment) => {
         

          const stateKey = equipment.name.toLowerCase().replace(/\s+/g, '');
          let price = 0;
          let quantity = 0;
          let unit = '';

          if (equipment.priceType === 'perSquareMeter') {
            price = equipment.pricePerSquareMeter || 0;
            quantity = roundedArea;
            unit = 'м²';
          } else if (equipment.priceType === 'perHalfSquareMeter') {
            price = equipment.pricePerSquareMeter || 0;
            quantity = roundedArea / 2;
            unit = 'м²';
          } else if (equipment.priceType === 'fixed') {
            price = equipment.fixedPrice || 0;
            quantity = 1;
            unit = 'компл.';
          }

          const totalPrice = price * quantity;

          return (
            <label
              key={equipment.name}
              className={`flex flex-col p-4 border rounded-lg transition-colors ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-50'
                  : state[stateKey]
                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={state[stateKey] || false}
                    onChange={(e) => setField(equipment.name, e.target.checked)}
                    disabled={isDisabled || disabled}
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-gray-900">{equipment.name}</span>
                </div>
                {state[stateKey] && (
                  <div className="text-right">
                    <div className="text-sm font-semibold text-blue-600">
                      {formatNumber(totalPrice)} тг
                    </div>
                    <div className="text-xs text-gray-500">
                      {equipment.priceType === 'fixed' ? (
                        '1 компл.'
                      ) : (
                        <>
                          {formatNumber(price)} тг/м² ×{' '}
                          {equipment.priceType === 'perHalfSquareMeter'
                            ? `${(roundedArea / 2).toFixed(2)}`
                            : `${roundedArea}`}{' '}
                          м²
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default BmzOptions;
