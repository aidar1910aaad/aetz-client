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
    <div className="p-4 rounded bg-white border border-gray-100">
      <h4 className="text-sm font-medium text-gray-800 mb-3">Коммутационный аппарат:</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {switchingDeviceOptions.map((option) => (
          <button
            key={option}
            onClick={() => cell.update('switchingDevice', option)}
            className={`px-3 py-2 text-xs font-medium rounded border transition-colors ${
              cell.switchingDevice === option
                ? 'bg-[#3A55DF] text-white border-[#3A55DF]'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
} 