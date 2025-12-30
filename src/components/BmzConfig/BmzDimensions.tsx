'use client';

import React from 'react';
import { Ruler } from 'lucide-react';

interface BmzDimensionsProps {
  width: number;
  length: number;
  height: number;
  thickness: number;
  blockCount: number;
  onWidthChange: (value: number) => void;
  onLengthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  onThicknessChange: (value: number) => void;
  onBlockCountChange: (value: number) => void;
  buildingType: 'bmz' | 'tp' | 'none';
}

const BmzDimensions = ({
  width,
  length,
  height,
  thickness,
  blockCount,
  onWidthChange,
  onLengthChange,
  onHeightChange,
  onThicknessChange,
  onBlockCountChange,
  buildingType,
}: BmzDimensionsProps) => {
  const isDisabled = buildingType === 'none';
  const labelClasses = 'block text-sm font-semibold text-gray-700 mb-2';
  const inputClasses =
    'block w-full rounded-xl border-gray-300 shadow-sm focus:border-[#8eba1e] focus:ring-[#8eba1e] disabled:bg-gray-100 disabled:text-gray-500 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all duration-200';
  
  const standardSizes = [3000, 4000, 5000, 6000];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg space-y-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Ruler className="w-5 h-5 text-[#8eba1e]" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Размеры здания</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className={labelClasses}>Длина (мм)</label>
          <input
            type="number"
            value={length || ''}
            onChange={(e) => onLengthChange(Number(e.target.value))}
            disabled={isDisabled}
            className={inputClasses}
            placeholder="Введите длину"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {standardSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onLengthChange(size)}
                disabled={isDisabled}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                  length === size
                    ? 'bg-[#8eba1e] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-[#8eba1e] hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className={labelClasses}>Ширина (мм)</label>
          <input
            type="number"
            value={width || ''}
            onChange={(e) => onWidthChange(Number(e.target.value))}
            disabled={isDisabled}
            className={inputClasses}
            placeholder="Введите ширину"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {standardSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onWidthChange(size)}
                disabled={isDisabled}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                  width === size
                    ? 'bg-[#8eba1e] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-[#8eba1e] hover:text-white'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildingType !== 'tp' && (
          <div className="space-y-2">
            <label className={labelClasses}>Высота (мм)</label>
            <select
              value={height}
              onChange={(e) => onHeightChange(Number(e.target.value))}
              disabled={isDisabled}
              className={inputClasses}
            >
              <option value={0}>Выберите</option>
              <option value={2700}>2700</option>
              <option value={3000}>3000</option>
              <option value={3150}>3150</option>
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {[2700, 3000, 3150].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onHeightChange(size)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                    height === size
                      ? 'bg-[#8eba1e] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#8eba1e] hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {buildingType === 'bmz' && (
          <div className="space-y-2">
            <label className={labelClasses}>Толщина стен (мм)</label>
            <select
              value={thickness}
              onChange={(e) => onThicknessChange(Number(e.target.value))}
              disabled={isDisabled}
              className={inputClasses}
            >
              <option value={0}>Выберите</option>
              <option value={50}>50</option>
              <option value={80}>80</option>
              <option value={100}>100</option>
            </select>
            <div className="flex flex-wrap gap-2 mt-2">
              {[50, 80, 100].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => onThicknessChange(size)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all duration-200 ${
                    thickness === size
                      ? 'bg-[#8eba1e] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-[#8eba1e] hover:text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {buildingType === 'bmz' && (
        <div className="space-y-2">
          <label className={labelClasses}>Количество блоков</label>
          <input
            type="number"
            value={blockCount || ''}
            onChange={(e) => onBlockCountChange(Number(e.target.value))}
            disabled={isDisabled}
            className={inputClasses}
            placeholder="Введите количество блоков"
          />
        </div>
      )}
    </div>
  );
};

export default BmzDimensions;
