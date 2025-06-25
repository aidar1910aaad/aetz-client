'use client';

import React from 'react';

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
  const labelClasses = 'block text-sm font-medium text-gray-700';
  const inputClasses =
    'block w-full rounded-md border-gray-300 shadow-sm focus:border-[#3A55DF] focus:ring-[#3A55DF] disabled:bg-gray-100 disabled:text-gray-500';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Размеры здания</h3>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className={labelClasses}>Длина (мм)</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={length || ''}
              onChange={(e) => onLengthChange(Number(e.target.value))}
              disabled={isDisabled}
              className={inputClasses}
              placeholder="Введите длину"
            />
          </div>
        </div>
        <div>
          <label className={labelClasses}>Ширина (мм)</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={width || ''}
              onChange={(e) => onWidthChange(Number(e.target.value))}
              disabled={isDisabled}
              className={inputClasses}
              placeholder="Введите ширину"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {buildingType !== 'tp' && (
          <div>
            <label className={labelClasses}>Высота (мм)</label>
            <div className="relative mt-1">
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
            </div>
          </div>
        )}
        {buildingType === 'bmz' && (
          <div>
            <label className={labelClasses}>Толщина стен (мм)</label>
            <div className="relative mt-1">
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
            </div>
          </div>
        )}
      </div>

      {buildingType === 'bmz' && (
        <div>
          <label className={labelClasses}>Количество блоков</label>
          <div className="relative mt-1">
            <input
              type="number"
              value={blockCount || ''}
              onChange={(e) => onBlockCountChange(Number(e.target.value))}
              disabled={isDisabled}
              className={inputClasses}
              placeholder="Введите количество блоков"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BmzDimensions;
