import React from 'react';

interface LengthInputProps {
  length: number;
  quantity: number;
  onLengthChange: (length: number) => void;
  onQuantityChange: (quantity: number) => void;
}

export const LengthInput: React.FC<LengthInputProps> = ({
  length,
  quantity,
  onLengthChange,
  onQuantityChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          Длина шинного моста (м):
        </label>
        <input
          type="number"
          value={length}
          onChange={(e) => onLengthChange(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="Введите длину в метрах"
          min="0"
          step="0.1"
        />
      </div>
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">Количество:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => onQuantityChange(Number(e.target.value))}
          className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          placeholder="Количество мостов"
          min="1"
          step="1"
        />
      </div>
    </div>
  );
}; 