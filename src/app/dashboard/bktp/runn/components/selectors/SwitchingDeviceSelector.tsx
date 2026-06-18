import { RunnCell } from '@/store/useRunnStore';

interface SwitchingDeviceSelectorProps {
  cell: RunnCell & { update: (field: keyof RunnCell, val: string | number) => void; remove: () => void; };
  switchingDeviceOptions: string[];
}

export default function SwitchingDeviceSelector({ 
  cell, 
  switchingDeviceOptions 
}: SwitchingDeviceSelectorProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-gray-900">Коммутационный аппарат</h4>
        {cell.switchingDevice && (
          <span className="rounded-full bg-[#8eba1e]/10 px-3 py-1 text-xs font-medium text-[#5f7f14]">
            {cell.switchingDevice}
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {switchingDeviceOptions.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => cell.update('switchingDevice', option)}
            className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
              cell.switchingDevice === option
                ? 'border-[#8eba1e] bg-[#8eba1e] text-white shadow-sm'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-[#8eba1e]/60 hover:bg-[#8eba1e]/5'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
} 