import { useDguStore } from '@/store/useDguStore';

export default function DguEnabledToggle() {
  const dgu = useDguStore();

  return (
    <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Будет ли ДГУ</label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => dgu.setEnabled(true)}
            className={`px-4 py-2 rounded-md border transition-all duration-200 ${
              dgu.enabled
                ? 'bg-green-600 text-white border-green-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-green-400 hover:bg-green-50'
            }`}
          >
            Да
          </button>
          <button
            type="button"
            onClick={() => dgu.setEnabled(false)}
            className={`px-4 py-2 rounded-md border transition-all duration-200 ${
              !dgu.enabled
                ? 'bg-red-600 text-white border-red-600 shadow-sm'
                : 'bg-white text-gray-700 border-gray-300 hover:border-red-400 hover:bg-red-50'
            }`}
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
}

