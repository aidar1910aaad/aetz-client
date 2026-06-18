'use client';

import React from 'react';
import { Building2, Zap, X } from 'lucide-react';
import type { BmzBuildingType } from '@/store/useBmzStore';

interface BmzBuildingTypeProps {
  onChange: (type: 'bmz' | 'tp' | 'none') => void;
  selectedType?: BmzBuildingType;
}

const BmzBuildingType: React.FC<BmzBuildingTypeProps> = ({ onChange, selectedType }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Building2 className="w-5 h-5 text-[#8eba1e]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Тип здания</h3>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => onChange('bmz')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-200 ${
            selectedType === 'bmz'
              ? 'bg-[#8eba1e] border-[#8eba1e] text-white shadow-lg'
              : 'border-gray-200 text-gray-700 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
          } focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:ring-offset-2`}
        >
          <Building2 className="w-8 h-8 mb-2" />
          <span className="text-lg font-semibold">БМЗ</span>
          <span className="text-sm opacity-80">Блочная комплектная</span>
        </button>

        <button
          onClick={() => onChange('tp')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-200 ${
            selectedType === 'tp'
              ? 'bg-[#8eba1e] border-[#8eba1e] text-white shadow-lg'
              : 'border-gray-200 text-gray-700 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
          } focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:ring-offset-2`}
        >
          <Zap className="w-8 h-8 mb-2" />
          <span className="text-lg font-semibold">ТП</span>
          <span className="text-sm opacity-80">Трансформаторная подстанция</span>
        </button>

        <button
          onClick={() => onChange('none')}
          className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all duration-200 ${
            selectedType === 'none'
              ? 'bg-[#8eba1e] border-[#8eba1e] text-white shadow-lg'
              : 'border-gray-200 text-gray-700 hover:border-[#8eba1e] hover:bg-[#8eba1e]/5'
          } focus:outline-none focus:ring-2 focus:ring-[#8eba1e] focus:ring-offset-2`}
        >
          <X className="w-8 h-8 mb-2" />
          <span className="text-lg font-semibold">Нет</span>
          <span className="text-sm opacity-80">Здание не предусмотрено</span>
        </button>
      </div>
    </div>
  );
};

export default BmzBuildingType;
