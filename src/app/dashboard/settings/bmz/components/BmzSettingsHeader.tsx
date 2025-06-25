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
      <h1 className="text-2xl font-semibold">Настройки БМЗ</h1>
      <div className="space-x-4">
        <button
          onClick={onSettingsClick}
          className="px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-[#2e46c5] transition-colors"
        >
          Основные настройки
        </button>
        <button
          onClick={onAreaPriceClick}
          className="px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-[#2e46c5] transition-colors"
        >
          Добавить диапазон цен
        </button>
        <button
          onClick={onEquipmentClick}
          className="px-4 py-2 bg-[#3A55DF] text-white rounded hover:bg-[#2e46c5] transition-colors"
        >
          Добавить оборудование
        </button>
      </div>
    </div>
  );
}
