'use client';

import React from 'react';
import { useBmzStore } from '@/store/useBmzStore';
import { BmzSettings } from '@/api/bmz';
import { formatNumber } from '@/utils/formatNumber';
import { calculateArea, formatAreaQuantity, roundArea } from '@/utils/bmzCalculations';
import { Settings, Check, X } from 'lucide-react';

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
  const roundedArea = roundArea(calculateArea(width, length));
  const isDisabled = buildingType === 'none';

  if (!bmz.settings) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg relative z-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-[#8eba1e]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Дополнительное оборудование</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8 relative z-10">
        {/* Первая колонка */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Основное оборудование</h4>
          {bmz.settings.equipment.slice(0, Math.ceil(bmz.settings.equipment.length / 2)).map((equipment) => {
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
            quantity = roundArea(roundedArea / 2);
            unit = 'м²';
          } else if (equipment.priceType === 'fixed') {
            price = equipment.fixedPrice || 0;
            quantity = 1;
            unit = 'компл.';
          }

          const totalPrice = Math.round(price * quantity);
          const isSelected = state[stateKey] || false;

          return (
            <label
              key={equipment.name}
              className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all duration-200 cursor-pointer relative z-20 bg-white ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                  : isSelected
                  ? 'bg-[#8eba1e]/10 border-[#8eba1e] hover:bg-[#8eba1e]/20 shadow-lg'
                  : 'border-gray-200 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#8eba1e] border-[#8eba1e]' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-gray-900 text-lg">{equipment.name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {equipment.priceType === 'fixed' ? (
                      '1 компл.'
                    ) : (
                      <>
                        {formatNumber(price)} тг/м² × {formatAreaQuantity(quantity)} м²
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-[#8eba1e]">
                  {formatNumber(totalPrice)} тг
                </div>
                <div className="text-sm text-gray-500">
                  {isSelected ? 'Выбрано' : 'Не выбрано'}
                </div>
              </div>
              
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => setField(equipment.name, e.target.checked)}
                disabled={isDisabled || disabled}
                className="sr-only"
              />
            </label>
          );
        })}
        </div>
        
        {/* Вторая колонка */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Дополнительное оборудование</h4>
          {bmz.settings.equipment.slice(Math.ceil(bmz.settings.equipment.length / 2)).map((equipment) => {
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
            quantity = roundArea(roundedArea / 2);
            unit = 'м²';
          } else if (equipment.priceType === 'fixed') {
            price = equipment.fixedPrice || 0;
            quantity = 1;
            unit = 'компл.';
          }

          const totalPrice = Math.round(price * quantity);
          const isSelected = state[stateKey] || false;

          return (
            <label
              key={equipment.name}
              className={`flex items-center justify-between p-6 border-2 rounded-2xl transition-all duration-200 cursor-pointer relative z-20 bg-white ${
                isDisabled
                  ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                  : isSelected
                  ? 'bg-[#8eba1e]/10 border-[#8eba1e] hover:bg-[#8eba1e]/20 shadow-lg'
                  : 'border-gray-200 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                  isSelected 
                    ? 'bg-[#8eba1e] border-[#8eba1e]' 
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <span className="font-semibold text-gray-900 text-lg">{equipment.name}</span>
                  <div className="text-sm text-gray-600 mt-1">
                    {equipment.priceType === 'fixed' ? (
                      '1 компл.'
                    ) : (
                      <>
                        {formatNumber(price)} тг/м² × {formatAreaQuantity(quantity)} м²
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-[#8eba1e]">
                  {formatNumber(totalPrice)} тг
                </div>
                <div className="text-sm text-gray-500">
                  {isSelected ? 'Выбрано' : 'Не выбрано'}
                </div>
              </div>
              
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => setField(equipment.name, e.target.checked)}
                disabled={isDisabled || disabled}
                className="sr-only"
              />
            </label>
          );
        })}
        </div>
      </div>
    </div>
  );
};

export default BmzOptions;
