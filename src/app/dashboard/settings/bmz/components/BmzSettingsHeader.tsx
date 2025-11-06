'use client';

interface BmzSettingsHeaderProps {
  onSettingsClick: () => void;
  onAreaPriceClick: () => void;
  onEquipmentClick: () => void;
}

export default function BmzSettingsHeader({
  onSettingsClick,
  onAreaPriceClick,
  onEquipmentClick,
}: BmzSettingsHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-[#8eba1e] rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#8eba1e]">Настройки БМЗ</h1>
          <p className="text-sm text-gray-600 mt-1">Управление настройками БМЗ</p>
        </div>
      </div>
      <div className="space-x-4">
        <button
          onClick={onSettingsClick}
          className="px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors shadow-md hover:shadow-lg"
        >
          Основные настройки
        </button>
        <button
          onClick={onAreaPriceClick}
          className="px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors shadow-md hover:shadow-lg"
        >
          Добавить диапазон цен
        </button>
        <button
          onClick={onEquipmentClick}
          className="px-4 py-2 bg-[#8eba1e] text-white rounded-lg hover:bg-[#7aa31a] transition-colors shadow-md hover:shadow-lg"
        >
          Добавить оборудование
        </button>
      </div>
    </div>
  );
}
