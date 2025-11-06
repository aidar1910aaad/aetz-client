import React from 'react';

interface DisconnectorTypeSelectorProps {
  onSelect: (type: 'kso-13' | 'kso-shmr') => void;
}

export default function DisconnectorTypeSelector({ onSelect }: DisconnectorTypeSelectorProps) {
  
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-semibold text-yellow-800 mb-3">
        Выберите тип секционного разъединителя:
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          onClick={() => onSelect('kso-13')}
          className="p-3 text-left border border-gray-200 rounded-lg hover:border-[#8eba1e] hover:bg-[#8eba1e]/5 transition-all duration-200 bg-white"
        >
          <div className="font-medium text-gray-900 text-sm">Камера КСО 366-13</div>
          <div className="text-xs text-gray-600 mt-1">
            Секционная с двумя РВЗ (850х800мм)
          </div>
        </button>
        <button
          onClick={() => onSelect('kso-shmr')}
          className="p-3 text-left border border-gray-200 rounded-lg hover:border-[#8eba1e] hover:bg-[#8eba1e]/5 transition-all duration-200 bg-white"
        >
          <div className="font-medium text-gray-900 text-sm">Камера КСО 366 ШМР 14, 15</div>
          <div className="text-xs text-gray-600 mt-1">
            Полуячейка без разъединителя (500х800мм) + Шинный мост
          </div>
        </button>
      </div>
    </div>
  );
}
